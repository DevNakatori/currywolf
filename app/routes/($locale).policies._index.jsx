import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import '../styles/policies.css';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const data = await context.storefront.query(POLICIES_QUERY);
  const policies = Object.values(data.shop || {}).filter(Boolean);

  const legalNoticePolicy = {
    id: 'legal-notice-id',
    title: 'Legal Notice',
    handle: 'legal-notice',
  };
  policies.push(legalNoticePolicy);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return json({policies});
}

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();

  return (
    <div className="policies">
      <div className='policies-box'>
        <div className='p-title'>
          <h1>Policies</h1>
        </div>
        <div className='policies-inner'>
          {policies.map((policy) => (
            <fieldset key={policy.id}>
              <Link to={policy.handle === 'legal-notice' ? `/pages/${policy.handle}` : `/policies/${policy.handle}`}>
                {policy.title}
              </Link>
            </fieldset>
          ))}
        </div>
      </div>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
