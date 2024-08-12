import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import React, {useEffect, useRef} from 'react';
import '../styles/contact-page.css';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Curry Wolf | ${data?.page.title ?? ''}`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  const handle = params.handle || 'contact';
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: handle,
    },
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return json({page});
}

export default function Page() {
  const {page} = useLoaderData();

  useEffect(() => {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
      const handleInput = (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      };
      phoneInput.addEventListener('input', handleInput);
      return () => {
        phoneInput.removeEventListener('input', handleInput);
      };
    }
  }, [page]);

  return (
    <div className="page contact-page">
      <div dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
