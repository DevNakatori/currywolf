import {useCallback, useState} from 'react';
import {Await, NavLink, useNavigate} from '@remix-run/react';
import {Suspense} from 'react';
import {useRootLoaderData} from '~/lib/root-data';
import shopLogo from '../assets/CurryWolf_Logo_footer.svg';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, toggle, setToggle}) {
  const {shop, menu} = header;
  return (
    <header className="header">
      <div className="container">
        <div className="inner-header">
          <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
            <img
              className="desktop-logo"
              src={shopLogo}
              alt="logo"
              data-aos="zoom-in"
              data-aos-duration="1500"
              data-aos-once="true"
            />
          </NavLink>
          <HeaderMenu
            menu={menu}
            viewport="desktop"
            primaryDomainUrl={header.shop.primaryDomain.url}
            toggle={toggle}
            setToggle={setToggle}
          />
          <HeaderCtas
            isLoggedIn={isLoggedIn}
            cart={cart}
            toggle={toggle}
            setToggle={setToggle}
          />
        </div>
      </div>
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  toggle,
  setToggle,
}) {
  const {publicStoreDomain} = useRootLoaderData();
  const className = `header-menu-${viewport}`;
  const [openSubmenus, setOpenSubmenus] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  function getUrl(itemUrl) {
    return itemUrl.includes('myshopify.com') ||
      itemUrl.includes(publicStoreDomain) ||
      itemUrl.includes(primaryDomainUrl)
      ? new URL(itemUrl).pathname
      : itemUrl;
  }

  const handleClick = useCallback(
    (event, url) => {
      if (viewport === 'mobile') {
        event.preventDefault();
        navigate(url);
        setToggle((prevToggle) => !prevToggle);
        setOpenSubmenus(false);
      }
    },
    [viewport, navigate, setToggle, setOpenSubmenus],
  );

  return (
    <>
      {/* <button className="menu-drawer-toggle" onClick={toggleDrawer}>
        {isDrawerOpen ? 'Close' : 'Menu'}
      </button> */}
      <nav
        className={`${className} ${isDrawerOpen ? 'open' : ''}`}
        role="navigation"
      >
        {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
          if (!item.url) return null;

          const url = getUrl(item.url);

          return (
            <div key={item.id} className="header-menu-item">
              <div className="menu-item-wrapper">
                <NavLink
                  end
                  prefetch="intent"
                  className={({isActive}) => (isActive ? 'active' : '')}
                  to={new URL(item.url).pathname}
                  onClick={(e) => handleClick(e, url)}
                >
                  {item.title}
                </NavLink>
                {item.items && item.items.length > 0 && (
                  <svg
                    onClick={() => setOpenSubmenus(!openSubmenus)}
                    className={`submenu-arrow ${openSubmenus ? 'open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </div>
              {item.items && item.items.length > 0 && (
                <ul
                  className={`submenu ${viewport} ${
                    openSubmenus ? 'open' : ''
                  }`}
                >
                  {item.items.map((subItem) => {
                    const subUrl = getUrl(subItem.url);
                    return (
                      <li key={subItem.id}>
                        <NavLink
                          end
                          prefetch="intent"
                          className={({isActive}) => (isActive ? 'active' : '')}
                          to={subUrl}
                          onClick={(e) => handleClick(e, subUrl)}
                        >
                          {subItem.title}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart, toggle, setToggle}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle toggle={toggle} setToggle={setToggle} />
      <NavLink
        prefetch="intent"
        className="mobile-hide"
        to="/account"
        style={activeLinkStyle}
      >
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.54163 34.1667V32.4583C8.54163 29.2868 9.80152 26.2451 12.0441 24.0025C14.2868 21.7599 17.3284 20.5 20.5 20.5M20.5 20.5C23.6715 20.5 26.7132 21.7599 28.9558 24.0025C31.1984 26.2451 32.4583 29.2868 32.4583 32.4583V34.1667M20.5 20.5C22.3123 20.5 24.0504 19.7801 25.3319 18.4986C26.6134 17.2171 27.3333 15.479 27.3333 13.6667C27.3333 11.8544 26.6134 10.1163 25.3319 8.83478C24.0504 7.55328 22.3123 6.83334 20.5 6.83334C18.6876 6.83334 16.9496 7.55328 15.6681 8.83478C14.3866 10.1163 13.6666 11.8544 13.6666 13.6667C13.6666 15.479 14.3866 17.2171 15.6681 18.4986C16.9496 19.7801 18.6876 20.5 20.5 20.5Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Await>
        </Suspense>
      </NavLink>
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <img className="mobile-logo" src={shopLogo} alt="logo" />
      </NavLink>
      <CartToggle cart={cart} />
      <LanguageSwitcher />
    </nav>
  );
}

function HeaderMenuMobileToggle({toggle, setToggle}) {
  return (
    <a className="header-menu-mobile-toggle" onClick={() => setToggle(!toggle)}>
      <h3>
        <svg
          width="24"
          height="14"
          viewBox="0 0 24 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0.0610352 1H23.1196" stroke="white" />
          <path d="M0.0610352 7H23.1196" stroke="white" />
          <path d="M0.0610352 13H23.1196" stroke="white" />
        </svg>
      </h3>
    </a>
  );
}

/**
 * @param {{ count: number }}
 */
function CartBadge({count}) {
  return (
    <a className="header-cart" href="#cart-aside">
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5625 4.75H5.757C6.5645 4.75 7.26908 5.29308 7.47808 6.07208L8.0845 8.34733M8.0845 8.34733C16.9047 8.09987 25.7164 9.08037 34.2665 11.2607C32.9618 15.1462 31.4118 18.9208 29.6368 22.5625H11.875M8.0845 8.34733L11.875 22.5625M11.875 22.5625C10.6152 22.5625 9.40704 23.0629 8.51624 23.9537C7.62545 24.8445 7.125 26.0527 7.125 27.3125H32.0625M9.5 32.0625C9.5 32.3774 9.37489 32.6795 9.15219 32.9022C8.92949 33.1249 8.62744 33.25 8.3125 33.25C7.99756 33.25 7.69551 33.1249 7.47281 32.9022C7.25011 32.6795 7.125 32.3774 7.125 32.0625C7.125 31.7476 7.25011 31.4455 7.47281 31.2228C7.69551 31.0001 7.99756 30.875 8.3125 30.875C8.62744 30.875 8.92949 31.0001 9.15219 31.2228C9.37489 31.4455 9.5 31.7476 9.5 32.0625ZM29.6875 32.0625C29.6875 32.3774 29.5624 32.6795 29.3397 32.9022C29.117 33.1249 28.8149 33.25 28.5 33.25C28.1851 33.25 27.883 33.1249 27.6603 32.9022C27.4376 32.6795 27.3125 32.3774 27.3125 32.0625C27.3125 31.7476 27.4376 31.4455 27.6603 31.2228C27.883 31.0001 28.1851 30.875 28.5 30.875C28.8149 30.875 29.117 31.0001 29.3397 31.2228C29.5624 31.4455 29.6875 31.7476 29.6875 32.0625Z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [
        {
          id: 'gid://shopify/MenuItem/461609500729',
          resourceId: null,
          tags: [],
          title: 'Sub Collections',
          type: 'HTTP',
          url: '/sub-collections',
          items: [],
        },
      ],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
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
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>} HeaderProps */
/** @typedef {'desktop' | 'mobile'} Viewport */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('./Layout').LayoutProps} LayoutProps */
