import {useNavigate} from '@remix-run/react';
import React, {useRef, useState, useEffect} from 'react';
const LanguageSwitcher = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownMenu = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      setCurrentPath(path);
      setSelectedValue(path.startsWith('/en') ? 'en-de' : 'de-de');
    }
  }, []);
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const handleLanguageChange = (event) => {
    const newValue = event.currentTarget.getAttribute('data-value');
    setSelectedValue(newValue);
    setIsDropdownOpen(false);
    const isEnglishPath = currentPath.startsWith('/en');
    let newPath;
    if (newValue === 'en-de' && !isEnglishPath) {
      newPath = `/en${currentPath}`;
    } else if (newValue === 'de-de' && isEnglishPath) {
      newPath = currentPath.replace('/en', '');
    } else {
      newPath = currentPath;
    }
    if (typeof window !== 'undefined') {
      window.location.href = newPath;
    }
  };
  const flagSrc =
    selectedValue === 'de-de'
      ? 'https://cdn.shopify.com/s/files/1/0661/7595/9260/files/Flag-of-Germany-01.svg?v=1721643447'
      : 'https://cdn.shopify.com/s/files/1/0661/7595/9260/files/united-kingdom-flag-icon.svg?v=1721643633';

  return (
    <div className="language-switcher">
      <div className="dropdown-wrap" onClick={toggleDropdown}>
        <img src={flagSrc} alt="Selected Language" onClick={toggleDropdown} />
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
    </div>
  );
};
export default LanguageSwitcher;
