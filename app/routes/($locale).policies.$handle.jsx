import React, {useEffect} from 'react';
import {json} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import '../styles/policies.css';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Curry Wolf | ${data?.policy.title ?? ''}`},
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
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(/-([a-z])/g, (_, m1) =>
    m1.toUpperCase(),
  );

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  // Replace the policy title with the German name
  switch (policy.handle) {
    case 'terms-of-service':
      policy.title = 'Allgemeine Geschäftsbedingungen';
      break;
    case 'refund-policy':
      policy.title = 'Widerrufsrecht';
      break;
    case 'shipping-policy':
      policy.title = 'Zahlung und Versand';
      break;
    case 'privacy-policy':
      policy.title = 'Datenschutz';
      break;
    default:
      break;
  }

  return json({policy, canonicalUrl});
}

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy} = useLoaderData();

  useEffect(() => {
    if (policy.handle === 'privacyPolicy') {
      const tabContent = document.getElementsByClassName('tabContent');
      const tab = document.getElementsByClassName('tab');

      function hideTabsContent(a) {
        for (let i = a; i < tabContent.length; i++) {
          tabContent[i].classList.remove('show');
          tabContent[i].classList.add('hide');
          tab[i].classList.remove('whiteborder');
        }
      }

      function showTabsContent(b) {
        if (tabContent[b].classList.contains('hide')) {
          hideTabsContent(0);
          tab[b].classList.add('whiteborder');
          tabContent[b].classList.remove('hide');
          tabContent[b].classList.add('show');
        }
      }

      hideTabsContent(1);

      document.getElementById('tabs').onclick = function (event) {
        const target = event.target;
        if (target.className === 'tab') {
          for (let i = 0; i < tab.length; i++) {
            if (target === tab[i]) {
              showTabsContent(i);
              break;
            }
          }
        }
      };
    }
  }, [policy.handle]);

  return (
    <div className="policy">
      <div className="container">
        <div>
          <Link className="yellow-border-btn" to="/policies">
            ← Zu allen Richtlinien
          </Link>
        </div>
        <div className="top-title">
          <h1>{policy.title}</h1>
        </div>
        <div dangerouslySetInnerHTML={{__html: policy.body}} />
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;

/**
 * @typedef {keyof Pick<
 *   Shop,
 *   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
 * >} SelectedPolicies
 */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
