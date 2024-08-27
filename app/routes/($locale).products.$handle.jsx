import {Suspense, useState, useRef, useEffect} from 'react';
import {defer, redirect} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData} from '@remix-run/react';
import {useNavigate} from 'react-router-dom';
import {
  Image,
  Money,
  VariantSelector,
  getSelectedProductOptions,
  CartForm,
  Analytics,
  useAnalytics,
} from '@shopify/hydrogen';
import {getVariantUrl} from '~/lib/variants';
import '../styles/product.css';
import dhlLogo from '../assets/dhl.png';
import certifiedBadge from '../assets/trustedlogo.png';
import decorativegarland from '../assets/decorativegarland.png';
import {Fancybox} from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

export const meta = ({data}) => {
  return [{title: `Curry Wolf | ${data?.product.title ?? ''}`}];
};

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;

  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v') &&
      !option.name.startsWith('fbclid'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option) => option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  } else {
    if (!product.selectedVariant) {
      throw redirectToFirstVariant({product, request});
    }
  }

  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  return defer({
    product,
    variants,
  });
}

function ProductMedia({media}) {
  const [mainImage, setMainImage] = useState(
    media.find((item) => item.__typename === 'MediaImage'),
  );
  const videoRef = useRef(null);

  useEffect(() => {
    Fancybox.bind('[data-fancybox="main-image"]', {});

    return () => {
      Fancybox.destroy();
    };
  }, [mainImage]);

  const handleImageClick = (event) => {
    event.preventDefault();
  };
  if (!media || media.length === 0) {
    return null;
  }
  const restImages = media.filter(
    (item) => item.__typename === 'MediaImage' && item !== mainImage,
  );
  return (
    <div
      className="product-media"
      data-aos="fade-up"
      data-aos-duration="1500"
      data-aos-once="true"
    >
      {mainImage && (
        <div className="product-image" key={mainImage.id}>
          <a
            data-fancybox="main-image"
            href={mainImage.image.url}
            onClick={handleImageClick}
          >
            <Image
              alt={mainImage.image.altText || 'Product Image'}
              aspectRatio="1/1"
              data={mainImage.image}
              key={mainImage.image.id}
              sizes="(min-width: 45em) 50vw, 100vw"
            />
          </a>
        </div>
      )}

      {restImages.length > 0 && (
        <div className="product-images-wrap">
          {restImages.map((item) => (
            <div
              className="product-image"
              key={item.id}
              onClick={() => setMainImage(item)}
            >
              <Image
                alt={item.image.altText || 'Product Image'}
                aspectRatio="1/1"
                data={item.image}
                key={item.image.id}
                sizes="(min-width: 45em) 50vw, 100vw"
              />
            </div>
          ))}
        </div>
      )}

      {media.map((item) => {
        if (item.__typename === 'Video') {
          const videoSource = item.sources.find(
            (source) => source.mimeType === 'video/mp4',
          );
          return (
            <div className="product-video" key={item.id}>
              <video ref={videoRef} muted loop>
                <source src={videoSource.url} type={videoSource.mimeType} />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
export default function Product() {
  const {product, variants} = useLoaderData();
  const {selectedVariant} = product;
  const getMetafieldText = (metafield) => {
    if (!metafield) return '';

    try {
      const parsedValue = JSON.parse(metafield);
      function renderJSONToHTML(json) {
        if (json.type === 'root') {
          return json.children.map(renderJSONToHTML).join('');
        }
        console.log(json.value);
        if (json.type === 'list') {
          const tag = json.listType === 'unordered' ? 'ul' : 'ol';
          const childrenHTML = json.children.map(renderJSONToHTML).join('');
          return `<${tag}>${childrenHTML}</${tag}>`;
        }

        if (json.type === 'list-item') {
          const childrenHTML = json.children.map(renderJSONToHTML).join('');
          return `<li>${childrenHTML}</li>`;
        }

        if (json.type === 'text') {
          return json.value;
        }
        if (json.type === 'paragraph') {
          const childrenHTML = json.children.map(renderJSONToHTML).join('');
          return `<p>${childrenHTML}</p>`;
        }

        if (json.bold === true) {
          const textValue = json.value;
          const boldText = json.bold
            ? `<strong>${textValue}</strong>`
            : textValue;
          return boldText;
        }

        return '';
      }

      const renderedHTML = renderJSONToHTML(parsedValue);
      return <div>{renderedHTML}</div>;
    } catch (error) {
      console.error('Error parsing metafield:', error);
      return '';
    }
  };

  const preparationText = getMetafieldText(
    product.metafields?.find(
      (metafield) =>
        metafield?.namespace === 'custom' && metafield?.key === 'preparation',
    )?.value,
  );

  const additionalInformationText = getMetafieldText(
    product.metafields?.find(
      (metafield) =>
        metafield?.namespace === 'custom' &&
        metafield?.key === 'additional_information',
    )?.value,
  );

  const ingredientsText = getMetafieldText(
    product.metafields?.find(
      (metafield) =>
        metafield?.namespace === 'custom' && metafield?.key === 'ingredients',
    )?.value,
  );

  const nutritionalValuesText = getMetafieldText(
    product.metafields?.find(
      (metafield) =>
        metafield?.namespace === 'custom' &&
        metafield?.key === 'nutritional_values',
    )?.value,
  );

  const navigate = useNavigate();

  const renderProductTitle = (title) => {
    const regex = /(.*?)(\((.*?)\))/;
    const match = title.match(regex);
    if (match) {
      return (
        <>
          {match[1]}
          <br />
          <span>{match[2]}</span>
        </>
      );
    }
    return title;
  };

  return (
    <div className="main-product-sec">
      <div className="food-decorative-garland">
        <img src={decorativegarland} alt="food-decorative-garland" />
      </div>
      <div className="container">
        <div className="go-back-pro-btn">
          <a
            href="javascript:;"
            className="yellow-border-btn"
            onClick={() => navigate(-1)}
          >
            Zurück zu allen Produkten
          </a>
        </div>
        <div className="product-container">
          <div className="left-content">
            <div className="product-title mobile-hide">
              <h1
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-once="true"
              >
                {renderProductTitle(product.title)}
              </h1>
            </div>
            <div className="left-bottom-content">
              <div className="left-inner-c">
                {preparationText && (
                  <div
                    className="info-box"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-once="true"
                  >
                    <h2>Zubereitung</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: preparationText.props.children,
                      }}
                    />
                  </div>
                )}

                {nutritionalValuesText && (
                  <div
                    className="info-box"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-once="true"
                  >
                    <h2>Nährwerte</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: nutritionalValuesText.props.children,
                      }}
                    />
                  </div>
                )}
              </div>
              <div
                className="smile-block"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-once="true"
              >
                <div className="special-block">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_bestseller.svg?v=1721633600"
                    alt="face smile icon"
                  />
                  <h4>Besondere Auswahl</h4>
                  <p>Familienmanufaktur mit eigener Rezeptur</p>
                </div>
                <div className="special-block">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_expressdelivery.svg?v=1721633600"
                    alt="quick delivery icon"
                  />
                  <h4>Schnelle Lieferung</h4>
                  <p>Wir liefern innerhalb von 2-4 Tagen*</p>
                </div>
                <div className="special-block">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_highquality.svg?v=1721633600"
                    alt="secure pay icon"
                  />
                  <h4>Sichere Bezahlung</h4>
                  <p>Sicher bezahlen per Paypal und Sofort.com</p>
                </div>
                <div className="special-block">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/icon_worldwideshipping.svg?v=1721633600"
                    alt="earth icon"
                  />
                  <h4>CO₂ neutraler Versand</h4>
                  <p>Der Versand erfolgt mit DHL GoGreen</p>
                </div>
              </div>
              <div
                className="right-bottom-content desktop-hide"
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-once="true"
              >
                <div className="cerified-box">
                  <h4>Zertifizierter Online-shop</h4>
                  <img
                    className="certified-logo"
                    src={certifiedBadge}
                    alt="certified logo"
                  />
                </div>
                <div className="certified-logo">
                  <h4>Schneller Versand</h4>
                  <img className="dhl-logo" src={dhlLogo} alt="dhl logo" />
                </div>
              </div>
            </div>
          </div>
          <div className="center-content">
            {product.media && <ProductMedia media={product.media.nodes} />}
          </div>
          <div className="right-content">
            <div className="product-title desktop-hide">
              <h1
                data-aos="fade-up"
                data-aos-duration="1500"
                className="aos-init aos-animate"
                data-aos-once="true"
              >
                {renderProductTitle(product.title)}
              </h1>
            </div>
            <div className="product-content">
              <div
                data-aos="fade-up"
                data-aos-duration="1500"
                data-aos-once="true"
              >
                <ProductPrice selectedVariant={selectedVariant} />
                <div
                  dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
                />
                <Suspense
                  fallback={
                    <ProductForm
                      product={product}
                      selectedVariant={selectedVariant}
                      variants={[]}
                    />
                  }
                >
                  <Await
                    errorElement="There was a problem loading product variants"
                    resolve={variants}
                  >
                    {(data) => (
                      <ProductForm
                        product={product}
                        selectedVariant={selectedVariant}
                        variants={data.product?.variants.nodes || []}
                      />
                    )}
                  </Await>
                  {/* Display Metafield */}
                  <div
                    className="metafield"
                    data-aos="fade-up"
                    data-aos-duration="1500"
                    data-aos-once="true"
                  >
                    {ingredientsText && (
                      <div className="ingridiant-box">
                        <h2>Zutaten</h2>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: ingredientsText.props.children,
                          }}
                        />
                      </div>
                    )}

                    {additionalInformationText && (
                      <div className="ingridiant-box">
                        <h2>Weitere Informationen</h2>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: additionalInformationText.props.children,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </Suspense>

                <div
                  className="right-bottom-content mobile-hide"
                  data-aos="fade-up"
                  data-aos-duration="1500"
                  data-aos-once="true"
                >
                  <div className="cerified-box">
                    <h4>Zertifizierter Online-shop</h4>
                    <img
                      className="certified-logo"
                      src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/png-clipart-trusted-shops-gmbh-e-commerce-logo-organization-certification-trust-no-one-text-trademark_copy.webp?v=1721658737"
                      alt="certified logo"
                    />
                  </div>
                  <div className="certified-logo">
                    <h4>Schneller Versand</h4>
                    <img className="dhl-logo" src={dhlLogo} alt="dhl logo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function ProductPrice({selectedVariant}) {
  return (
    <div className="product-price">
      {selectedVariant?.compareAtPrice ? (
        <>
          <p>Sale</p>
          <br />
          <div className="product-price-on-sale">
            {selectedVariant ? <Money data={selectedVariant.price} /> : null}
            <s>
              <Money data={selectedVariant.compareAtPrice} />
            </s>
          </div>
        </>
      ) : (
        selectedVariant?.price && (
          <Money className="p-price" data={selectedVariant?.price} />
        )
      )}
    </div>
  );
}

function ProductForm({product, selectedVariant, variants}) {
  const [quantity, setQuantity] = useState(1);
  const {publish, shop, cart, prevCart} = useAnalytics();
  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  return (
    <div className="product-form-main">
      <div className="product-form">
        {/* <VariantSelector
          handle={product.handle}
          options={product.options}
          variants={variants}
        >
          {({option}) => <ProductOptions key={option.name} option={option} />}
        </VariantSelector> */}
        <br />
        <ProductQuantity
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
        />
        <br />
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            publish('cart_viewed', {
              cart,
              prevCart,
              shop,
              url: window.location.href || '',
            });
            setTimeout(() => {
              window.location.href = window.location.href + '#cart-aside';
            }, 1500);
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale
            ? 'In den Warenkorb'
            : 'Ausverkauft'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptions({option}) {
  return (
    <div className="product-options" key={option.name}>
      {/* <h5>{option.name}</h5> */}
      <div className="product-options-grid">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <Link
              className="product-options-item"
              key={option.name + value}
              prefetch="intent"
              preventScrollReset
              replace
              to={to}
              style={{
                border: isActive ? '1px solid black' : '1px solid transparent',
                opacity: isAvailable ? 1 : 0.3,
              }}
            >
              {/* {value} */}
            </Link>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function AddToCartButton({analytics, children, disabled, lines, onClick}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            className="yellow-btn"
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

function ProductQuantity({quantity, onQuantityChange}) {
  const handleQuantityChange = (event) => {
    const value = Math.max(1, parseInt(event.target.value, 10) || 1);
    onQuantityChange(value);
  };

  const incrementQuantity = () => {
    onQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    onQuantityChange(Math.max(1, quantity - 1));
  };

  return (
    <div className="product-quantity">
      <label htmlFor="quantity">Quantity:</label>
      <div className="quantity-controls">
        <button type="button" onClick={decrementQuantity}>
          -
        </button>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
          step="1"
        />
        <button type="button" onClick={incrementQuantity}>
          +
        </button>
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
      title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    metafields(identifiers: [{namespace: "custom", key: "nutritional_values"}, {namespace: "custom", key: "additional_information"}, {namespace: "custom", key: "ingredients"}, {namespace: "custom", key: "preparation"}]) {
      namespace
      key
      value
    }
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
    media(first: 10) {
      nodes {
        __typename
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
        ... on Video {
          id
          sources {
            url
            mimeType
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
`;
