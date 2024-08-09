import React, { useEffect, useRef } from 'react';
import { Image } from '@shopify/hydrogen';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

function ProductMedia({ media }) {
  const videoRef = useRef(null);

  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {
      // FancyBox options
    });

    return () => {
      Fancybox.destroy();
    };
  }, []);

  return (
    <div className="product-media">
      {media?.map((item) => {
        if (item.__typename === 'MediaImage') {
          return (
            <div className="product-image" data-aos="fade-up" data-aos-duration="1500" key={item.id}>
              <a data-fancybox="gallery" href={item.image.url}>
                <Image
                  alt={item.image.altText || 'Product Image'}
                  aspectRatio="1/1"
                  data={item.image}
                  key={item.image.id}
                  sizes="(min-width: 45em) 50vw, 100vw"
                />
              </a>
            </div>
          );
        } else if (item.__typename === 'Video') {
          const videoSource = item.sources.find(
            (source) => source.mimeType === 'video/mp4'
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

export default ProductMedia;
