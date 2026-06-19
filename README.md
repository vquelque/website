# Valentin's personal website

A single static page — no build step. Just `index.html`, `styles.css`, and
`main.js`, deployed to Netlify (serves the repo root, see `netlify.toml`).

The hero name is the real handwritten signature, traced from
`static/logo.png` by `tools/trace_signature.py` into `static/signature.js`
and drawn on load with the laser effect. To regenerate the trace:

```
python3 tools/trace_signature.py   # needs numpy + scikit-image + pillow
```

## Netlify status

[![Netlify Status](https://api.netlify.com/api/v1/badges/d9da43c9-f39d-43cd-ae0d-04f110e7a343/deploy-status)](https://app.netlify.com/sites/condescending-chandrasekhar-170192/deploys)
