import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import '../styles/location-page.css';
import {useEffect, useRef, useState} from 'react';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Curry Wolf | ${data?.page.title ?? ''}`},
    {name: 'description', content: data.page.seo.description},
    {
      tagName: 'link',
      rel: 'canonical',
      href: data.canonicalUrl,
    },
  ];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, request, context}) {
  const canonicalUrl = request.url;
  const handle = params.handle || 'locations';
  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: handle,
    },
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return json({page, canonicalUrl});
}

export default function Page() {
  /* @type {LoaderReturnData} */
  const {page} = useLoaderData();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    }
  }, [isPlaying]);

  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoRef.current = videoElement;
      setIsPlaying(true);
    }

    return () => {
      if (videoElement) {
        setIsPlaying(false);
      }
    };
  }, []);

  useEffect(() => {
    const video1 = document.getElementById('video1');
    const video2 = document.getElementById('video2');
    const videocontainer = document.getElementById('video-container');
    const overlayImages = document.querySelectorAll('.overlayImage');
    const isMobile = window.innerWidth < 768;
    const positions = isMobile
      ? [
          {
            x: 25,
            y: 22,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Steglitz',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 22,
            y: 30,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Potsdam',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 33.5,
            y: 13,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Brandenburger Tor',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 32,
            y: 27,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Kudamm',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 40,
            y: 25,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Lichtenrade',
            additionalLabel2: 'Mehr Info',
          },
        ]
      : [
          {
            x: 15,
            y: 22,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Steglitz',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 9,
            y: 35,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Potsdam',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 24,
            y: 17.5,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Brandenburger Tor',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 22,
            y: 28,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Kudamm',
            additionalLabel2: 'Mehr Info',
          },
          {
            x: 31,
            y: 29,
            label:
              '<img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/725053/assets/CurryWolf_Logo_footer-BNigDRwe.svg" />',
            additionalLabel: 'Lichtenrade',
            additionalLabel2: 'Mehr Info',
          },
        ];

    const overlayLabels = [];

    function positionOverlayImages() {
      const rect = videocontainer.getBoundingClientRect();

      if (window.innerWidth <= 767) {
        overlayImages.forEach((image, index) => {
          const xPercentage = positions[index].x;
          const yPercentage = positions[index].y;
          const xPos =
            rect.left + (rect.width * xPercentage) / 100 - image.width / 2;
          const yPos =
            rect.top + (rect.height * yPercentage) / 100 - image.height / 2;

          const xPoss = rect.left + (rect.width * xPercentage) / 100 - 60;
          const yPoss = rect.top + (rect.height * yPercentage) / 100 - 70;

          // const xPoss = rect.left + (rect.width * xPercentage / 100) - (isMobile ? 100 : 50);
          // const yPoss = rect.top + (rect.height * yPercentage / 100) - (isMobile ? 140 : 70);

          image.style.left = `${xPercentage}%`;
          image.style.top = `${yPercentage}%`;
          image.style.transform = `translate(${xPos}px, ${yPos}px)`;

          const label = document.createElement('div');
          label.classList.add('overlayLabel');
          label.innerHTML = `
            <span class="mainLabel">${positions[index].label}</span>
            <span class="additionalLabel">${positions[index].additionalLabel}</span>
            <span class="additionalLabel2">${positions[index].additionalLabel2}</span>
          `;
          label.style.opacity = 0;
          videocontainer.appendChild(label);
          overlayLabels.push(label);

          label.style.position = 'absolute';
          label.style.left = `${xPercentage}%`;
          label.style.top = `${yPercentage}%`;
          label.style.transform = `translate(${xPoss}px, ${yPoss}px)`;

          image.addEventListener('mouseenter', () => {
            image.style.transform = `translate(${xPos}px, ${yPos}px) translateY(-10px)`;
          });

          image.addEventListener('mouseleave', () => {
            image.style.transform = `translate(${xPos}px, ${yPos}px) translateY(0px)`;
          });
        });
      } else {
        overlayImages.forEach((image, index) => {
          const xPercentage = positions[index].x;
          const yPercentage = positions[index].y;
          const xPos =
            rect.left + (rect.width * xPercentage) / 100 - image.width / 2;
          const yPos =
            rect.top + (rect.height * yPercentage) / 100 - image.height / 2;

          const xPoss = rect.left + (rect.width * xPercentage) / 100 - 100;
          const yPoss = rect.top + (rect.height * yPercentage) / 100 - 140;

          // const xPoss = rect.left + (rect.width * xPercentage / 100) - (isMobile ? 100 : 50);
          // const yPoss = rect.top + (rect.height * yPercentage / 100) - (isMobile ? 140 : 70);

          image.style.left = `${xPercentage}%`;
          image.style.top = `${yPercentage}%`;
          image.style.transform = `translate(${xPos}px, ${yPos}px)`;

          const label = document.createElement('div');
          label.classList.add('overlayLabel');
          label.innerHTML = `
            <span class="mainLabel">${positions[index].label}</span>
            <span class="additionalLabel">${positions[index].additionalLabel}</span>
            <span class="additionalLabel2">${positions[index].additionalLabel2}</span>
          `;
          label.style.opacity = 0;
          videocontainer.appendChild(label);
          overlayLabels.push(label);

          label.style.position = 'absolute';
          label.style.left = `${xPercentage}%`;
          label.style.top = `${yPercentage}%`;
          label.style.transform = `translate(${xPoss}px, ${yPoss}px)`;

          image.addEventListener('mouseenter', () => {
            image.style.transform = `translate(${xPos}px, ${yPos}px) translateY(-10px)`;
          });

          image.addEventListener('mouseleave', () => {
            image.style.transform = `translate(${xPos}px, ${yPos}px) translateY(0px)`;
          });
        });
      }
    }

    function showImagesSequentially() {
      overlayImages.forEach((image, index) => {
        setTimeout(() => {
          image.style.opacity = 1;
          overlayLabels[index].style.opacity = 1;
        }, index * 500);
      });
    }

    video1.addEventListener('ended', () => {
      video1.style.display = 'none';
      video2.style.display = 'block';
      video2.play();
      // positionOverlayImages();
      //showImagesSequentially();
    });

    //  window.addEventListener('resize', () => {
    //     positionOverlayImages();
    //     showImagesSequentially();
    // });

    function detectMobile() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent)) {
        return true;
      }
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return true;
      }
      return false;
    }

    if (detectMobile()) {
      const parent = document.querySelector('.thereedmainsection');
      const child = document.querySelector('.video-container');
      let isDown = false;
      let startX;
      let scrollLeft;
      const centerChild = () => {
        const parentWidth = parent.offsetWidth;
        const childWidth = child.offsetWidth;
        const scrollPosition = (childWidth - parentWidth) / 2;
        parent.scrollLeft = scrollPosition;
      };
      centerChild();
      window.addEventListener('resize', centerChild);
      parent.addEventListener('touchstart', (e) => {
        isDown = true;
        child.style.cursor = 'grabbing';
        startX = e.touches[0].pageX - child.offsetLeft;
        scrollLeft = parent.scrollLeft;
      });
      parent.addEventListener('touchend', () => {
        isDown = false;
        child.style.cursor = 'grab';
      });
      parent.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX - child.offsetLeft;
        const walk = (x - startX) * 2;
        parent.scrollLeft = scrollLeft - walk;
      });

      console.log('This is a mobile device.');
      setTimeout(function () {
        showImagesSequentially();
        positionOverlayImages();
      }, 2000);
    } else {
      console.log('This is not a mobile device.');
      // positionOverlayImages();
      setTimeout(function () {
        showImagesSequentially();
        positionOverlayImages();
      }, 2000);
    }
  }, []);

  return (
    <div className="page location-main">
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

/**  @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/**  @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/**  @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
