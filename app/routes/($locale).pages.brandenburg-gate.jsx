import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import '../styles/location-inner.css';
import {useEffect, useRef, useState} from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [{title: `Curry Wolf | ${data?.page.title ?? ''}`},
    {name :"description","content": data.page.seo.description }
  ];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  const handle = params.handle || 'brandenburg-gate';
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {handle},
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return json({page});
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoRef.current = videoElement;
      setIsPlaying(true);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="page location-inner-main">
      <main dangerouslySetInnerHTML={{__html: page.body}} />
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
