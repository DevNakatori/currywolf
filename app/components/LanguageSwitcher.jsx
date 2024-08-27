import {useNavigate, useLocation} from '@remix-run/react';
import React, {useRef, useState, useEffect} from 'react';

const LanguageSwitcher = () => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownMenu = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    setSelectedValue(path.startsWith('/en') ? 'en-de' : 'de-de');
  }, [location.pathname]); // Update when the path changes

  const handleLanguageChange = (event) => {
    const newValue = event.currentTarget.getAttribute('data-value');
    setSelectedValue(newValue);
    setIsDropdownOpen(false);

    let newPath;
    if (newValue === 'en-de' && !location.pathname.startsWith('/en')) {
      newPath = `/en${location.pathname}`;
    } else if (newValue === 'de-de' && location.pathname.startsWith('/en')) {
      newPath = location.pathname.replace('/en', '');
    } else {
      newPath = location.pathname;
    }
    window.location.href = newPath || '/';
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const flagSrc =
    selectedValue === 'de-de'
      ? 'https://cdn.shopify.com/s/files/1/0661/7595/9260/files/Flag-of-Germany-01.svg?v=1721643447'
      : 'https://cdn.shopify.com/s/files/1/0661/7595/9260/files/united-kingdom-flag-icon.svg?v=1721643633';

  return (
    // <div className="language-switcher">
    <>
      <div className="dropdown-wrap" onClick={toggleDropdown}>
        <img src={flagSrc} alt="Selected Language" />
      </div>
      <div className="dropdown">
        <ul
          className={`dropdown-menu ${isDropdownOpen ? 'active' : ''}`}
          ref={dropdownMenu}
          id="dropdownMenu"
        >
          <li
            className="dropdown-item"
            data-value="de-de"
            onClick={handleLanguageChange}
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/Flag-of-Germany-01.svg?v=1721643447"
              alt="German Flag"
            />
          </li>
          <li
            className="dropdown-item"
            data-value="en-de"
            onClick={handleLanguageChange}
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0661/7595/9260/files/united-kingdom-flag-icon.svg?v=1721643633"
              alt="UK Flag"
            />
          </li>
        </ul>
      </div>
    </>
    // </div>
  );
};

export default LanguageSwitcher;
