import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.debug('AdSense init:', e);
    }
  }, []);

  return (
    <div className="w-full my-6 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* panelpro-test */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6452660186482325"
        data-ad-slot="2553207762"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
