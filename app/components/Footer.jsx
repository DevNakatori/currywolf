import {NavLink} from '@remix-run/react';
import {useRootLoaderData} from '~/lib/root-data';
import {KeepInTouch} from '~/routes/footerData';
import footerLogo from '../assets/CurryWolf_Logo_footer.svg';
/**
 * @param {FooterQuery & {shop: HeaderQuery['shop']}}
 */

export function Footer({menu, shop}) {
  return (
    <footer className="footer">
      <div className='container'>
       <div className='footer-inner'>
      {menu && shop?.primaryDomain?.url && (
        <>
         <div className='footer-child'>
            <FooterMenu menu={menu} primaryDomainUrl={shop.primaryDomain.url} />
            <KeepInTouch />
         </div>
        </>
      )}
    </div>
      </div>
    </footer>
  
  );
}




/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
 * }}
 */


function FooterMenu({menu, primaryDomainUrl}) {
  const {publicStoreDomain} = useRootLoaderData();

  return (
    <div className='left-block-wrap'>
      <div className='logo'>
        <a href='/'>
      <img className="footer-bg-img" data-aos="zoom-in" data-aos-duration="1500" data-aos-once="true" src={footerLogo} alt='footer-logo' />
        </a>
      </div>
    <nav className="footer-menu" role="navigation">
      <span className='yellow-head' data-aos="fade-up" data-aos-duration="1500" data-aos-once="true">Links</span>
        <ul data-aos="fade-up" data-aos-duration="1500" data-aos-once="true">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
              {item.title}
            </a>
        ) : (
          <li key={item.url}>
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
          {item.title}
          </NavLink>
          </li>
        );
      })}
       </ul>
    </nav>
    </div>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
