import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {useEffect} from 'react';
import '../styles/catering-page.css';

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
  const handle = params.handle || 'catering';
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
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setTimeout(function () {
        const sliderContainer = document.querySelector('.ref-wrap');
        const slides = document.querySelectorAll('.ref-box');
        let currentIndex = 0;
        let slidesToShow = 1;

        function updateSlider() {
          if (window.innerWidth < 768) {
            slidesToShow = 2;
          } else {
            slidesToShow = 1;
          }

          const width = sliderContainer.clientWidth / slidesToShow;
          slides.forEach((slide) => {
            slide.style.minWidth = `${width}px`;
          });
          sliderContainer.style.transform = `translateX(${
            -width * currentIndex
          }px)`;
        }

        function nextSlide() {
          if (currentIndex < slides.length - slidesToShow) {
            currentIndex += 1;
          } else {
            currentIndex = 0;
          }
          updateSlider();
        }

        function startAutoplay() {
          setInterval(nextSlide, 3000);
        }

        function resetAutoplay() {
          clearInterval(autoplayInterval);
          startAutoplay();
        }

        window.addEventListener('resize', function () {
          updateSlider();
          currentIndex = 0;
        });

        updateSlider();
        startAutoplay();
      }, 2000);
    }
  }, []);

  return (
    <div className="page catering-main">
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
