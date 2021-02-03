import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/layout";

const Index = () => (
  <Layout>
    <div className="text-gray-600 body-font flex items-center h-screen">
      <div className="container m-auto flex px-5 py-16 md:flex-row flex-col items-center">
        <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
          <img
            className="rounded-lg h-96 object-cover mx-auto"
            alt="hero"
            src="/val_cover.jpg"
          />
        </div>
        <div className="lg:flex-grow md:w-1/2 xl:pl-24 md:pl-12 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
            Hey ! I am Valentin Quelquejay.
          </h1>
          <p className="mb-8 leading-relaxed">
            I study <strong>Cybersecurity</strong> at EPFL and ETHZ in Switzerland.<br />
            I love to build stuff. <br />
            I build a lot of stuff. <br />
            I am a <strong>passionate entrepreneur</strong>.<br />
            I build cool companies with incredible people. <br />
            I'm a music and audio fan. <br />
            I seek <strong>perfectionism in simplicity</strong>.<br />
            Everything outdoor makes me smile.
          </p>
          <br />
          <h2 className="text-2xl mb-1">
            Get in touch with me:
          </h2>
          <div className="flex space-x-5 text-gray-400 text-md">
            <a
              href="https://www.linkedin.com/in/valentin-quelquejay-194b68144/"
              target="_blank"
              className="transform hover:scale-110"
            >
              {" "}
              <FontAwesomeIcon icon={faLinkedin} size="2x" />{" "}
            </a>
            <a
              href="https://twitter.com/vquelque"
              target="_blank"
              className="transform hover:scale-110"
            >
              {" "}
              <FontAwesomeIcon icon={faTwitter} size="2x" />{" "}
            </a>
            <a
              href="https://www.github.com/vquelque"
              target="_blank"
              className="transform hover:scale-110"
            >
              {" "}
              <FontAwesomeIcon icon={faGithub} size="2x" />
            </a>
            <a
              href="#mailgo"
              data-address="hi"
              data-domain="valentinquelquejay.me"
              className="transform hover:scale-110"
            >
              <FontAwesomeIcon icon={faEnvelope} size="2x" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default Index;
