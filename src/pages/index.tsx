import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPen } from '@fortawesome/free-solid-svg-icons';
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

    {/* <!-- Twitter --> */}
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://valentinquelquejay.me/" />
    <meta property="twitter:title" content="Valentin Quelquejay" />
    <meta
      property="twitter:description"
      content="Valentin Quelquejay's website"
    />
  </>
);

const Index = () => (
  <Layout>
    <div className="text-gray-600 body-font flex items-center h-screen">
      <div className="container m-auto flex px-5 py-16 md:flex-row flex-col items-center h-full">
        <div className="md:w-1/2 h-4/5">
          <img
            className="rounded-lg max-h-full object-cover mx-auto"
            alt="hero"
            src="/val.jpg"
          />
        </div>
        <div className="py-16 lg:flex-basis md:w-1/2 xl:pl-24 md:pl-12 flex flex-col md:items-start md:text-left items-center text-center">
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
            I am passionate about <strong>Cybersecurity</strong> and{' '}
            <strong>Blockchain</strong>.
            <br />I am currently building <strong><a href='https://thecreed.xyz' target='_blank' className='text-red-700'>Creed</a></strong>
            <br />
            I love thinking and building stuff. <br />I am a{' '}
            <strong>passionate entrepreneur</strong>.<br />
            I build cool projects with amazing people. <br />
            I'm a a <strong>serial optimizor</strong>. <br />I seek{' '}
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
              href="https://vquelque.substack.com"
              target="_blank"
              className="transform hover:scale-110"
            >
              {' '}
              <FontAwesomeIcon icon={faPen} size="2x" />
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
