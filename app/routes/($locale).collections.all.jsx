import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link, useLocation} from '@remix-run/react';
import {
  Pagination,
  getPaginationVariables,
  Image,
  Money,
} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import '../styles/collection-all.css';
import earthLogo from '../assets/earth.png';
import securePay from '../assets/secure-pay.png';
import quickDelivery from '../assets/quick-delivery.png';
import faceSmile from '../assets/face-smile.png';
import decorativegarland from '../assets/decorativegarland.png';
import '../styles/collection.css';
import {useEffect, useState} from 'react';
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Curry Wolf | All Products`}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 55,
  });

  const {products} = await storefront.query(CATALOG_QUERY, {
    variables: {...paginationVariables},
  });

  const customMenuPromise = storefront.query(CUSTOM_MENU_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      customMenuHandle: 'collection-menu', // Adjust to your custom menu handle
    },
  });

  return json({
    products,
    customMenu: await customMenuPromise,
  });
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products, customMenu} = useLoaderData();

  return (
    <div className="collection collection-all-page">
      <div className="food-decorative-garland">
        <img
          src={decorativegarland}
          className="decorative-image"
          alt={decorativegarland}
        />
      </div>
      <CustomMenu data={customMenu} />
      <div className="container">
        <h1>Products</h1>
        <div
          className="benifits"
          data-aos="fade-up"
          data-aos-duration="1500"
          data-aos-once="true"
        >
          <div className="container">
            <div className="benifits-inner-wrap">
              {/* <h4>Vorteile von Curry Wolf</h4> */}
              <div className="banifits-wrap">
                <div className="benifits-content">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_bestseller.svg?v=1721633600"
                    alt="face smile icon"
                  />
                  <div className="">
                    <h4>Besondere Auswahl</h4>
                    <p>Familienmanufaktur mit eigener Rezeptur</p>
                  </div>
                </div>
                <div className="benifits-content">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_expressdelivery.svg?v=1721633600"
                    alt="quick delivery icon"
                  />
                  <div className="">
                    <h4>Schnelle Lieferung</h4>
                    <p>Wir liefern innerhalb von 2-4 Tagen*</p>
                  </div>
                </div>
                <div className="benifits-content">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_highquality.svg?v=1721633600"
                    alt="secure pay icon"
                  />
                  <div className="">
                    <h4>Sichere Bezahlung</h4>
                    <p>Sicher bezahlen per Paypal und Sofort.com</p>
                  </div>
                </div>
                <div className="benifits-content">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_worldwideshipping.svg?v=1721633600"
                    alt="earth icon"
                  />
                  <div className="">
                    <h4>CO₂ neutraler Versand</h4>
                    <p>Der Versand erfolgt mit DHL GoGreen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Pagination connection={products}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="load-pre">
                <PreviousLink className="yellow-border-btn bottom-spacing">
                  {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                </PreviousLink>
              </div>
              <ProductsGrid products={nodes} />
              <br />
              <div className="load-more">
                <NextLink className="yellow-border-btn">
                  {isLoading ? 'Loading...' : <span>Load more ↓</span>}
                </NextLink>
              </div>
            </>
          )}
        </Pagination>
      </div>
    </div>
  );
}

function CustomMenu({data}) {
  const location = useLocation();
  return (
    <nav
      className="collection-menu"
      data-aos="fade-up"
      data-aos-duration="1500"
      data-aos-once="true"
    >
      <ul>
        {data.menu.items.map((item, index) => (
          <li key={item.id}>
            <Link
              to={new URL(item.url).pathname}
              className={
                index === 0 || item.url.includes(location.pathname)
                  ? 'active'
                  : ''
              }
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * @param {{products: ProductItemFragment[]}}
 */
function ProductsGrid({products}) {
  return (
    <div className="products-grid">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 15 ? 'eager' : undefined}
          />
        );
      })}
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading}) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
  const titleParts = product.title.split('(');
  const titleMain = titleParts[0];
  const titleSub = titleParts[1] ? `(${titleParts[1]}` : '';

  const [path, setPath] = useState('');
  const location = useLocation();
  useEffect(() => {
    setPath(location.pathname);
  }, [location.pathname]);
  const getPath = () => {
    if (location.pathname.startsWith('/en')) {
      return `/en${variantUrl}`;
    } else {
      return variantUrl;
    }
  };
  const policePath = () => {
    if (location.pathname.startsWith('/en')) {
      return `en/policies/shipping-policy`;
    } else {
      return '/policies/shipping-policy';
    }
  };
  // Assuming weight is in kilograms
  const weight = variant.weight
    ? `Versandgewicht: ${variant.weight} kg`
    : 'Gewicht nicht verfügbar';

  const unitPrice = variant.unitPrice ? (
    <div>
      <FormattedMoney money={variant.unitPrice} /> /{' '}
      {variant.unitPriceMeasurement.referenceUnit}
    </div>
  ) : null;

  const deliveryTime = product.tags.includes('app:expresshint')
    ? 'Lieferzeit: 1 Tag (*)'
    : 'Lieferzeit: 2-4 Tage (*)';
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={getPath()}
    >
      <div className="pro-block">
        {product.featuredImage && (
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
      </div>
      <div className="collection-title">
        <h4>
          {titleMain}
          <br />
        </h4>
        <span>{titleSub}</span>
      </div>
      <div className="c-all-wrap">
        <small>
          <FormattedMoney money={product.priceRange.minVariantPrice} />
          <div className="tax-hint">
            <div className="same-height">
              <small>
                inkl. MwSt. /
                <a className="shipping_policy" href={policePath()}>
                  zzgl. Versandkosten
                </a>
              </small>

              <div className="c-weight">{weight}</div>

              <span>{deliveryTime}</span>

              {unitPrice && (
                <div className="pro-wrap-c unit-price">{unitPrice}</div>
              )}
            </div>
            <div className="cart-btn">
              <span className="yellow-btn">In den Warenkorb</span>
            </div>
          </div>
        </small>
      </div>
    </Link>
  );
}

/**
 * @param {{money: {amount: string, currencyCode: string}}}
 */
function FormattedMoney({money}) {
  const currencySymbols = {
    EUR: '€',
    USD: '$',
  };
  const symbol = currencySymbols[money.currencyCode] || money.currencyCode;
  const formattedAmount = parseFloat(money.amount).toFixed(2);
  return (
    <span>
      {symbol} {formattedAmount}
    </span>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CatalogProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    tags
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
        weight
        unitPrice {
          ...MoneyProductItem
        }
        unitPriceMeasurement {
          measuredType
          quantityUnit
          quantityValue
          referenceUnit
          referenceValue
        }
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CatalogProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
`;
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
const CUSTOM_MENU_QUERY = `#graphql
    query CustomMenu(
      $country: CountryCode
      $customMenuHandle: String!
      $language: LanguageCode
    ) @inContext(language: $language, country: $country) {
      menu(handle: $customMenuHandle) {
        ...Menu
      }
    }
    ${MENU_FRAGMENT}
  `;
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
