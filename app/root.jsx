import {useNonce, getShopAnalytics, Analytics} from '@shopify/hydrogen';
import {useShopifyCookies} from '@shopify/hydrogen-react';
import {defer} from '@shopify/remix-oxygen';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  useRouteError,
  useLoaderData,
  ScrollRestoration,
  isRouteErrorResponse,
} from '@remix-run/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import favicon from './assets/favicon.png';
import resetStyles from './styles/reset.css?url';
import appStyles from './styles/app.css?url';
import {Layout} from '~/components/Layout';
import fontStyles from './styles/font.css?url';
import React, {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import Popup from './components/Popup';
import * as gtag from './util/gtag';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  if (currentUrl.toString() === nextUrl.toString()) {
    return true;
  }

  return false;
};

export function ScrollToTop() {
  const {pathname} = useLocation();

  useEffect(() => {
    if (!pathname.includes('catering')) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!pathname.includes('catering')) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}

export function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
    AOS.refresh();
  }, []);
}

export function links() {
  return [
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {rel: 'stylesheet', href: fontStyles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
  ];
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {storefront, customerAccount, cart, env} = context;
  const publicStoreDomain = context.env.PUBLIC_STORE_DOMAIN;

  const isLoggedInPromise = customerAccount.isLoggedIn();
  const cartPromise = cart.get();

  const footerPromise = storefront.query(FOOTER_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer-1',
    },
  });

  const headerPromise = storefront.query(HEADER_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      headerMenuHandle: 'new-menu',
    },
  });

  return defer(
    {
      cart: cartPromise,
      footer: footerPromise,
      header: await headerPromise,
      isLoggedIn: isLoggedInPromise,
      publicStoreDomain,
      shop: getShopAnalytics({
        storefront,
        publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
      }),
      consent: {
        checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
        storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      },
    },
    {
      // headers: {
      //   'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.web3forms.com; script-src 'self'; style-src 'self';",
      //     'Set-Cookie': await context.session.commit(),
      // },
    },
  );
}

export default function App() {
  useShopifyCookies({hasUserConsent: true, domain: 'curry-wolf.de'});
  const nonce = useNonce();
  const data = useLoaderData();
  const location = useLocation();
  const gaTrackingId = 'G-RMTF34SVQM';

  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location, gaTrackingId]);

  useEffect(() => {
    function setEqualHeight() {
      const boxes = document.querySelectorAll('.same-height');
      if (boxes.length === 0) {
        return;
      }

      let maxHeight = 0;
      boxes.forEach((box) => {
        box.style.height = 'auto';
      });

      boxes.forEach((box) => {
        const boxHeight = box.clientHeight;
        if (boxHeight > maxHeight) {
          maxHeight = boxHeight;
        }
      });

      boxes.forEach((box) => {
        box.style.height = `${maxHeight}px`;
      });
    }

    setEqualHeight();
    window.addEventListener('resize', setEqualHeight);

    return () => {
      window.removeEventListener('resize', setEqualHeight);
    };
  }, [location]);

  const isProductOrCollectionPage =
    location.pathname.includes('/products/') ||
    location.pathname.includes('/collections/') ||
    location.pathname.includes('/collections') ||
    location.pathname.includes('/collections/all');

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {!gaTrackingId ? null : (
          <>
            <script
              async
              nonce={nonce}
              src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
            />
            <script
              async
              id="gtag-init"
              nonce={nonce}
              dangerouslySetInnerHTML={{
                __html: `
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());

                          gtag('config', '${gaTrackingId}', {
                            page_path: window.location.pathname,
                          });
                        `,
              }}
            />
          </>
        )}
        <Meta />
        <Links />
        <script
          async
          id="hotjar"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
                    (function(h,o,t,j,a,r){
                        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                        h._hjSettings={hjid:5081562,hjsv:6};
                        a=o.getElementsByTagName('head')[0];
                        r=o.createElement('script');r.async=1;
                        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                        a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
          }}
        />
      </head>
      <body>
        <Analytics.Provider
          cart={data.cart}
          shop={data.shop}
          consent={data.consent}
          customData={{foo: 'bar'}}
        >
          <ScrollToTop />
          <AosInit />
          {isProductOrCollectionPage && <Popup />}
          <Layout {...data}>
            <Outlet />
          </Layout>
          {/* <etrusted-widget data-etrusted-widget-id="wdg-2e85f348-ed56-48db-89c0-58c5d7fbc6b8"></etrusted-widget> */}
          <script
            async
            data-desktop-y-offset="0"
            data-mobile-y-offset="0"
            data-desktop-disable-reviews="false"
            data-desktop-enable-custom="false"
            data-desktop-position="left"
            data-desktop-custom-width="156"
            data-desktop-enable-fadeout="false"
            data-disable-mobile="false"
            data-disable-trustbadge="false"
            data-mobile-custom-width="156"
            data-mobile-disable-reviews="false"
            data-mobile-enable-custom="false"
            data-mobile-position="left"
            data-mobile-enable-topbar="false"
            data-mobile-enable-fadeout="true"
            data-color-scheme="light"
            charSet="UTF-8"
            nonce={nonce}
            src={`https://widgets.trustedshops.com/js/X7C31CAC2688E2716F5D2E3220C01EE91.js`}
          />
          <ScrollRestoration nonce={nonce} />
          <Scripts nonce={nonce} />
        </Analytics.Provider>
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const rootData = useLoaderData();
  const nonce = useNonce();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="error-oops">
        <Layout {...rootData}>
          <div className="route-error">
            <h1>Oops!</h1>
            <h2>{errorStatus}</h2>
            {errorMessage && (
              <fieldset>
                <pre>{errorMessage}</pre>
              </fieldset>
            )}
            <div className="thank-you-btn">
              <a href="/" className="yellow-btn">
                Zurück zur Startseite
              </a>
            </div>
          </div>
        </Layout>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
`;

const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;

const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;
