export const pageview = (url, trackingId) => {
    if (!window.gtag) {
      console.warn(
        "window.gtag is not defined. This could mean your google analytics script has not loaded on the page yet.",
      );
      return;
    }
    window.gtag("config", trackingId, {
      page_path: url,
    });
  };