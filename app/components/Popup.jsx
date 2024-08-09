import React, { useEffect, useState } from 'react';

const Popup = () => {
  const [isVisible, setIsVisible] = useState(false);

  const closePopup = () => {
    setIsVisible(false);
    document.body.classList.remove('no-scroll');
  };

  useEffect(() => {
    const showPopupTimer = setTimeout(() => {
      setIsVisible(true);
      document.body.classList.add('no-scroll');
    }, 3000);


    return () => {
      clearTimeout(showPopupTimer);
      document.body.classList.remove('no-scroll');
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="popup">
        <div className="shop-popup-inner">
          <div className="shop-popup" id="popup">
            <div className="shop-close-btn" onClick={closePopup}>✕</div>
            <div className="logo">
              <img src="https://cdn.shopify.com/oxygen-v2/32730/22017/45614/726148/assets/CurryWolf_Logo_footer-BNigDRwe.svg" alt="Logo" />
            </div>
            <div className="shop-inner-content">
              <h2>Sommerpause</h2>
              <p>Vom 18.07. bis 31.08.2024 macht unser Online Shop Pause. Wir wünschen euch einen tollen Sommer.</p>
            </div>
            <div className="shop-popup-footer">
              <p>Freut euch wieder auf Currywurst im Glas uvm. ab September 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
