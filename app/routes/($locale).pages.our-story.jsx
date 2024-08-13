import React, { useEffect } from 'react';
import { json } from '@shopify/remix-oxygen';
import { useLoaderData } from '@remix-run/react';
import '../styles/our-story.css';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({ data }) => {
  return [{title: `Curry Wolf | ${data?.page.title ?? ''}`},
    {name :"description","content": data.page.seo.description }
  ];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({ params, context }) {
  const handle = params.handle || 'our-story';
  const { page } = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: handle,
    },
  });

  if (!page) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ page });
}

export default function Page() {
  const { page } = useLoaderData();

  useEffect(() => {
    if (document.querySelectorAll('.path-vert').length > 0) {
      const path = document.querySelector('.path-vert');
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;

      const updateDashOffset = () => {
        const scrollPosition = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const dashOffset = Math.max(0, pathLength - (scrollPosition / maxScroll * pathLength));
        path.style.strokeDashoffset = dashOffset;
      };

      window.addEventListener('scroll', updateDashOffset);
      updateDashOffset();
      path.style.display = 'block';

      return () => {
        window.removeEventListener('scroll', updateDashOffset);
      };
    }

    if (document.querySelectorAll('.our-story-box').length) {
      document.querySelectorAll('.our-story-box').forEach((box) => {
        const img = box.querySelector('.img-one');
        const line = box.querySelector('.line');

        img.addEventListener('mouseenter', () => {
          line.style.opacity = '0';
        });

        img.addEventListener('mouseleave', () => {
          line.style.opacity = '1';
        });
      });
    }

    if (document.querySelectorAll('#line-path').length) {
      const path = document.querySelector('#line-path');
      const pathLength = path.getTotalLength();
      path.style.strokeDasharray = `${pathLength} ${pathLength}`;
      path.style.strokeDashoffset = pathLength;
      path.getBoundingClientRect();

      const handleScroll = () => {
        const scrollPercentage = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight);
        const drawLength = pathLength * scrollPercentage;
        path.style.strokeDashoffset = pathLength - drawLength;
        if (scrollPercentage >= 0.99) {
          path.style.strokeDasharray = 'none';
        } else {
          path.style.strokeDasharray = `${pathLength} ${pathLength}`;
        }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div className="page our-story">
      <main dangerouslySetInnerHTML={{ __html: page.body }} />
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
