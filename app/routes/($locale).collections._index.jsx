import {useLoaderData, Link} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {Pagination, getPaginationVariables, Image} from '@shopify/hydrogen';
import '../styles/collection-list.css';
/**
 * @param {LoaderFunctionArgs}
 */

export const meta = ({data}) => {
  return [
    {title: `Curry Wolf | ${data?.page?.title ?? 'Collections'}`},
    // {name: 'description', content: data.page.seo.description},
    {
      tagName: 'link',
      rel: 'canonical',
      href: data.canonicalUrl,
    },
  ];
};
export async function loader({context, request}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 9,
  });
  const canonicalUrl = request.url;
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: paginationVariables,
  });

  return json({collections, canonicalUrl});
}

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <div className="collections collection-list-page">
      <div className="container">
        <h1>Collections</h1>
        <Pagination connection={collections}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <div>
              <PreviousLink className="yellow-btn bottom-spacing">
                {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
              </PreviousLink>
              <CollectionsGrid collections={nodes} />
              <div className="load-more">
                <NextLink className="yellow-btn">
                  {isLoading ? 'Loading...' : <span>Load more ↓</span>}
                </NextLink>
              </div>
            </div>
          )}
        </Pagination>
      </div>
    </div>
  );
}

/**
 * @param {{collections: CollectionFragment[]}}
 */
function CollectionsGrid({collections}) {
  return (
    <div className="collections-grid">
      {collections.map((collection, index) => (
        <CollectionItem
          key={collection.id}
          collection={collection}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
function CollectionItem({collection, index}) {
  return (
    <Link
      className="collection-item"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      <div className="col-block">
        {collection?.image && (
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 3 ? 'eager' : undefined}
          />
        )}
      </div>
      <h5>{collection.title}</h5>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
