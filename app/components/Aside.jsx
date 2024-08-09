/**
 * A side bar component with Overlay that works without JavaScript.
 * @example
 * ```jsx
 * <Aside id="search-aside" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   heading: React.ReactNode;
 *   id?: string;
 * }}
 */
export function Aside({children, heading, id = 'aside', toggle, setToggle}) {
  return (
    <div
      aria-modal
      className={`${toggle ? 'active' : ''} overlay`}
      id={id}
      role="dialog"
    >
      <button
        className="close-outside"
        onClick={() => {
          history.go(-1);
          window.location.hash = '';
        }}
      />
      <aside>
        <header>
          <h3>{heading}</h3>
          <CloseAside toggle={toggle} setToggle={setToggle} heading={heading} />
        </header>
        <main>{children}</main>
      </aside>
    </div>
  );
}

function CloseAside({toggle, setToggle, heading}) {
  return (
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    <div
      className="close-popup"
      id="closeBtn"
      onClick={
        heading === 'CART' ? () => history.go(-1) : () => setToggle(!toggle)
      }
    >
      <div className="outer">
        <div className="inner">
          {heading === 'CART' ? (
            <a className="close" href="#">
              <span>Back</span>
            </a>
          ) : (
            <a className="close" href="#">
              <span>Back</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
