"""Trace the handwritten signature (static/logo.png) into ordered centerline
strokes and emit JSON the site can animate with the laser.

Output: static/signature.json
  { "width": W, "height": H, "strokes": [ [[x,y],[x,y],...], ... ] }
Coordinates are in the original image pixel space; the browser scales them.
"""
import json
import math

import numpy as np
from PIL import Image
from skimage.morphology import skeletonize
from skimage.filters import threshold_otsu

SRC = "static/logo.png"
OUT = "static/signature.json"

# ---- load + binarize (ink = True) ----
img = Image.open(SRC).convert("L")
arr = np.asarray(img, dtype=np.uint8)
# handle transparency: composite onto white if there was alpha
src = Image.open(SRC)
if src.mode in ("RGBA", "LA") or (src.mode == "P" and "transparency" in src.info):
    bg = Image.new("RGB", src.size, (255, 255, 255))
    bg.paste(src.convert("RGBA"), mask=src.convert("RGBA").split()[-1])
    arr = np.asarray(bg.convert("L"), dtype=np.uint8)

thr = threshold_otsu(arr)
ink = arr < thr  # dark pixels are ink

skel = skeletonize(ink)
H, W = skel.shape

# ---- build pixel graph ----
ys, xs = np.where(skel)
pts = set(zip(map(int, xs), map(int, ys)))  # (x, y)

NEI = [(-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1)]


def neighbors_in(p, S):
    x, y = p
    return [(x + dx, y + dy) for dx, dy in NEI if (x + dx, y + dy) in S]


def prune_spurs(S, spur=16, iters=8):
    """Iteratively remove short dead-end branches (skeleton barbs) so each
    letter traces as a clean line instead of fragmenting."""
    S = set(S)
    for _ in range(iters):
        deg = {p: len(neighbors_in(p, S)) for p in S}
        remove = set()
        for ep in [p for p in S if deg[p] == 1]:
            branch = [ep]
            prev, cur = None, ep
            while True:
                nb = [q for q in neighbors_in(cur, S) if q != prev]
                if len(nb) != 1 or deg.get(cur, 0) >= 3:
                    break
                prev, cur = cur, nb[0]
                branch.append(cur)
                if deg.get(cur, 0) >= 3 or len(branch) > spur:
                    break
            if deg.get(cur, 0) >= 3 and len(branch) <= spur:
                remove.update(branch[:-1])  # keep the junction pixel
        if not remove:
            break
        S -= remove
    return S


pts = prune_spurs(pts)


def neighbors(p):
    return neighbors_in(p, pts)


degree = {p: len(neighbors(p)) for p in pts}

# ---- trace strokes ----
# Walk from endpoints/junctions along edges, consuming each edge once.
visited_edges = set()


def edge_key(a, b):
    return (a, b) if a <= b else (b, a)


def walk(start, nxt):
    """Walk start->nxt, flowing THROUGH junctions along the straightest
    continuation (smallest turn) so cursive crossings don't fragment the
    stroke. Each edge is consumed once."""
    path = [start, nxt]
    visited_edges.add(edge_key(start, nxt))
    prev, cur = start, nxt
    while True:
        cand = [
            q for q in neighbors(cur)
            if q != prev and edge_key(cur, q) not in visited_edges
        ]
        if not cand:
            break
        hx, hy = cur[0] - prev[0], cur[1] - prev[1]
        hn = math.hypot(hx, hy) or 1.0

        def turn(q):
            vx, vy = q[0] - cur[0], q[1] - cur[1]
            vn = math.hypot(vx, vy) or 1.0
            cos = max(-1.0, min(1.0, (hx * vx + hy * vy) / (hn * vn)))
            return math.acos(cos)

        nb = min(cand, key=turn)
        # a near-reversal means the pen really would have lifted; stop
        if turn(nb) > math.radians(115):
            break
        visited_edges.add(edge_key(cur, nb))
        path.append(nb)
        prev, cur = cur, nb
    return path


strokes = []

# 1) strokes anchored at endpoints (deg==1) and junctions (deg>=3)
anchors = [p for p in pts if degree[p] != 2]
for a in anchors:
    for nb in neighbors(a):
        if edge_key(a, nb) not in visited_edges:
            strokes.append(walk(a, nb))

# 2) leftover pure loops (all deg==2, never touched)
for p in pts:
    if degree[p] == 2:
        for nb in neighbors(p):
            if edge_key(p, nb) not in visited_edges:
                strokes.append(walk(p, nb))

# ---- clean: drop tiny specks, simplify ----
def path_len(path):
    return sum(
        ((path[i][0] - path[i - 1][0]) ** 2 + (path[i][1] - path[i - 1][1]) ** 2) ** 0.5
        for i in range(1, len(path))
    )


def rdp(points, eps=1.2):
    """Ramer-Douglas-Peucker simplification."""
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    norm = (dx * dx + dy * dy) ** 0.5 or 1.0
    dmax, idx = 0.0, 0
    for i in range(1, len(points) - 1):
        px, py = points[i]
        d = abs((px - ax) * dy - (py - ay) * dx) / norm
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        left = rdp(points[: idx + 1], eps)
        right = rdp(points[idx:], eps)
        return left[:-1] + right
    return [a, b]


clean = []
for s in strokes:
    if path_len(s) < 8:  # drop specks
        continue
    clean.append(rdp(s, eps=1.0))

# ---- merge connected pieces into continuous strokes (one per letter/word) ----
def dist(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def merge_chains(segs, gap=24):
    """Greedy left-to-right chaining: join pieces whose endpoints are within
    `gap` px (small in-word pen lifts) while leaving big word gaps separate."""
    segs = [list(s) for s in segs]
    used = [False] * len(segs)
    chains = []
    while True:
        idx, best = -1, float("inf")
        for i, s in enumerate(segs):
            if used[i]:
                continue
            mx = min(s[0][0], s[-1][0])
            if mx < best:
                best, idx = mx, i
        if idx == -1:
            break
        used[idx] = True
        chain = segs[idx][:]
        if chain[0][0] > chain[-1][0]:
            chain.reverse()
        extended = True
        while extended:
            extended = False
            end = chain[-1]
            cand, cbest, flip = -1, gap, False
            for i, s in enumerate(segs):
                if used[i]:
                    continue
                d0, d1 = dist(end, s[0]), dist(end, s[-1])
                if d0 <= cbest:
                    cand, cbest, flip = i, d0, False
                if d1 <= cbest:
                    cand, cbest, flip = i, d1, True
            if cand != -1:
                used[cand] = True
                seg = segs[cand][:]
                if flip:
                    seg.reverse()
                chain += seg
                extended = True
        chains.append(chain)
    return chains


chains = merge_chains(clean, gap=24)


def splice_detours(chains, attach_gap=12, spur_max=120):
    """Letters like l/t leave a short ascender/crossbar that connects to the
    main stroke at a junction. Trace splits these off, so the laser draws them
    later ("half drawn then completed"). Splice each short connecting spur into
    its backbone as an out-and-back detour so the pen goes up the stem and back
    down in place — continuous, like real writing. Isolated marks (i/j dots)
    stay separate."""
    lens = [path_len(c) for c in chains]
    order = sorted(range(len(chains)), key=lambda i: lens[i], reverse=True)
    backbones = []          # (points, length) kept as splice targets
    result_idx = {}         # id -> position marker (unused, simple list build)
    out = []
    consumed = set()

    # longest chains are backbones; short ones are spur candidates
    for i in order:
        if lens[i] >= spur_max:
            backbones.append(chains[i])
            out.append(chains[i])

    for i in order:
        if lens[i] >= spur_max:
            continue
        sp = chains[i]
        best = None  # (dist, backbone_ref, vertex_index, spur_oriented)
        for bb in out:
            for end_pts in (sp, sp[::-1]):
                e = end_pts[0]
                for vi, v in enumerate(bb):
                    dd = dist(e, v)
                    if best is None or dd < best[0]:
                        best = (dd, bb, vi, end_pts)
        if best and best[0] <= attach_gap:
            _, bb, vi, seg = best
            # out along the spur, then back to the junction vertex
            detour = seg[1:] + seg[-2::-1]
            idx = out.index(bb)
            out[idx] = bb[: vi + 1] + detour + bb[vi + 1:]
        else:
            out.append(sp)  # isolated mark — keep as its own stroke
    return out


ordered = splice_detours(chains)
# keep writing order left-to-right by where each stroke begins
ordered.sort(key=lambda s: min(p[0] for p in s))

data = {
    "width": W,
    "height": H,
    "strokes": [[[int(x), int(y)] for (x, y) in s] for s in ordered],
}
with open(OUT, "w") as f:
    json.dump(data, f)

# also emit a JS file so the site can load it without fetch() (works on file://)
with open("static/signature.js", "w") as f:
    f.write("window.SIGNATURE = " + json.dumps(data) + ";\n")

tot = sum(len(s) for s in ordered)
print(f"{len(ordered)} strokes, {tot} points, image {W}x{H} -> {OUT} + static/signature.js")
