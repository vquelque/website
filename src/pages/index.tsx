import React from 'react';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faTwitter,
  faMedium,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Layout from '../components/layout';

// Header
export const Head = () => (
  <>
    {/* <!-- Primary Meta Tags --> */}
    <title>Valentin Quelquejay</title>
    <meta name="title" content="Valentin Quelquejay" />
    <meta name="description" content="Valentin Quelquejay's website" />

    {/* <!-- Open Graph / Facebook --> */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://valentinquelquejay.me/" />
    <meta property="og:title" content="Valentin Quelquejay" />
    <meta property="og:description" content="Valentin Quelquejay's website" />
    <meta property="og:image" content="social.png" />

    {/* <!-- Twitter --> */}
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://valentinquelquejay.me/" />
    <meta property="twitter:title" content="Valentin Quelquejay" />
    <meta
      property="twitter:description"
      content="Valentin Quelquejay's website"
    />
    <meta property="twitter:image" content="social.png" />
  </>
)

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
        <div className="lg:flex-basis md:w-1/2 xl:pl-24 md:pl-12 flex flex-col md:items-start md:text-left items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
            Hey ! I am{' '}
            <img
              src="logo.png"
              alt="valentin quelquejay"
              className="xlg:w-1/2 inline-block pb-4 w-7/12"
            />
            .
          </h1>
          <p className="mb-8 leading-relaxed">
            I am passionate about <strong>Blockchain</strong> technologies.
            <br />I am currently working as a{' '}
            <strong>Blockchain Security Engineer</strong> at Consensys
            Diligence.
            <br />I graduated with <strong>Cybersecurity</strong> degree from
            EPFL & ETHZ (in 2022).
            <br />
            I love to build stuff. <br />I am a{' '}
            <strong>passionate entrepreneur</strong>.<br />
            I build cool projects with incredible people. <br />
            I'm a music and audio fan. <br />I seek{' '}
            <strong>perfectionism in simplicity</strong>.<br />
            Everything outdoor makes me smile.
          </p>
          <br />
          <h2 className="text-2xl mb-1">Get in touch with me:</h2>
          <div className="flex space-x-5 text-gray-400 text-md">
            <a
              href="https://www.linkedin.com/in/valentin-quelquejay-194b68144/"
              target="_blank"
              className="transform hover:scale-110"
            >
              {' '}
              <FontAwesomeIcon icon={faLinkedin} size="2x" />{' '}
            </a>
            <a
              href="https://twitter.com/vquelque"
              target="_blank"
              className="transform hover:scale-110"
            >
              {' '}
              <FontAwesomeIcon icon={faTwitter} size="2x" />{' '}
            </a>
            <a
              href="https://vquelque.medium.com"
              target="_blank"
              className="transform hover:scale-110"
            >
              {' '}
              <FontAwesomeIcon icon={faMedium} size="2x" />
            </a>
            <a
              href="https://www.github.com/vquelque"
              target="_blank"
              className="transform hover:scale-110"
            >
              {' '}
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
