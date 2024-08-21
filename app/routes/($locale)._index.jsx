import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import React, {useEffect, useRef, useState} from 'react';
import '../styles/home-video.css';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Curry Wolf | ${data?.page.title ?? ''}`},
    {name: 'description', content: data.page.seo.description},
  ];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  const handle = params.handle || 'index';

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

  const videoRef = useRef(null);
  const indicatorRef = useRef(null);
  const videoOverlayRef = useRef(null);
  const sliderWrapperRef = useRef(null);
  const dotsContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle video playback
  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoRef.current = videoElement;
      setIsPlaying(true);
    }

    return () => {
      setIsPlaying(false);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    }
  }, [isPlaying]);

  // Handle scroll for indicator
  useEffect(() => {
    let lastScrollTop = 0;
    const indicatorDiv = document.getElementById('indicator');

    const handleScroll = () => {
      if (!indicatorDiv) return;

      let currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll === 0) {
        indicatorDiv.style.bottom = '0';
        indicatorDiv.style.opacity = '1';
      } else if (currentScroll > lastScrollTop) {
        indicatorDiv.style.bottom = '-100px';
        indicatorDiv.style.opacity = '0';
      }

      lastScrollTop = Math.max(0, currentScroll);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle video overlay on scroll
  useEffect(() => {
    const handleOverlayScroll = () => {
      const videoOverlay = document.getElementById('videoOverlay');
      if (videoOverlay) {
        let scrollPosition = window.scrollY;

        if (scrollPosition > 180) {
          videoOverlay.style.opacity = 1;
        } else {
          videoOverlay.style.opacity = 0;
        }
      }
    };

    window.addEventListener('scroll', handleOverlayScroll);

    return () => {
      window.removeEventListener('scroll', handleOverlayScroll);
    };
  }, []);

  // Initialize and manage slider functionality
  useEffect(() => {
    if (window.innerWidth < 768) {
      const initializeSlider = () => {
        const sliderWrapper = document.getElementById('slider-wrapper');
        const slides = document.querySelectorAll('.slide');
        const dotsContainer = document.getElementById('dots-container');
        const totalSlides = slides.length;
        let currentIndex = 1;
        let startX = 0;
        let endX = 0;

        if (dotsContainer.children.length === 0) {
          // Clear any existing clones
          sliderWrapper.innerHTML = '';
          slides.forEach((slide) => sliderWrapper.appendChild(slide));

          // Clone the first and last slides
          const firstSlideClone = slides[0].cloneNode(true);
          const lastSlideClone = slides[totalSlides - 1].cloneNode(true);

          sliderWrapper.appendChild(firstSlideClone);
          sliderWrapper.insertBefore(lastSlideClone, sliderWrapper.firstChild);
        }

        const allSlides = document.querySelectorAll('.slide');

        // Clear existing dots
        dotsContainer.innerHTML = '';

        for (let i = 0; i < Math.min(totalSlides, 3); i++) {
          const dot = document.createElement('span');
          dot.classList.add('dot');
          if (i === 0) {
            dot.classList.add('active');
          }
          dot.addEventListener('click', () => {
            currentIndex = i + 1;
            sliderWrapper.style.transition = 'transform 0.5s ease';
            updateSlider();
          });
          dotsContainer.appendChild(dot);
        }

        function updateDots() {
          const dots = dotsContainer.children;
          Array.from(dots).forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === currentIndex - 1) {
              dot.classList.add('active');
            }
          });
        }

        function updateSlider() {
          const newTransform = -(currentIndex * 33.33) + 33.33;
          sliderWrapper.style.transform = `translateX(${newTransform}%)`;
          Array.from(allSlides).forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentIndex) {
              slide.classList.add('active');
            }
          });
          updateDots();
        }

        sliderWrapper.addEventListener('transitionend', () => {
          if (currentIndex >= totalSlides + 1) {
            sliderWrapper.style.transition = 'none';
            currentIndex = 1;
            updateSlider();
            setTimeout(() => {
              sliderWrapper.style.transition = 'transform 0.5s ease';
            }, 50);
          } else if (currentIndex <= 0) {
            sliderWrapper.style.transition = 'none';
            currentIndex = totalSlides;
            updateSlider();
            setTimeout(() => {
              sliderWrapper.style.transition = 'transform 0.5s ease';
            }, 50);
          }
        });

        // Touch events for swipe functionality
        sliderWrapper.addEventListener('touchstart', (e) => {
          startX = e.touches[0].clientX;
        });

        sliderWrapper.addEventListener('touchmove', (e) => {
          endX = e.touches[0].clientX;
        });

        sliderWrapper.addEventListener('touchend', () => {
          const diffX = startX - endX;
          if (diffX > 50) {
            // Swipe left (next slide)
            currentIndex++;
            sliderWrapper.style.transition = 'transform 0.5s ease';
            updateSlider();
          } else if (diffX < -50) {
            // Swipe right (previous slide)
            currentIndex--;
            sliderWrapper.style.transition = 'transform 0.5s ease';
            updateSlider();
          }
        });

        updateSlider();
      };

      setTimeout(initializeSlider, 2000);
    }
  }, []);

  return (
    <div
      className="index-wrapper"
      dangerouslySetInnerHTML={{__html: page.body}}
    />
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
