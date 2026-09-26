import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLModElement>(null);
  const [isProduction, setIsProduction] = useState<boolean>(false);

  useEffect(() => {
    // Only fire live ad requests on verified production domain to prevent inaccurate URL declarations
    const isProd =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'panelproprecast.co.ke' ||
        window.location.hostname === 'www.panelproprecast.co.ke');

    setIsProduction(isProd);

    if (isProd) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.debug('AdSense init:', e);
      }
    }
  }, []);

  return (
    <div className="w-full my-6 flex flex-col items-center justify-center text-center overflow-hidden">
      {isProduction ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-6452660186482325"
          data-ad-slot="2553207762"
          data-ad-format="auto"
          data-full-width-responsive="true"
          data-page-url="https://panelproprecast.co.ke/"
        />
      ) : (
        <div className="w-full max-w-4xl py-3 px-4 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Google AdSense Slot (Active on panelproprecast.co.ke &bull; ca-pub-6452660186482325)</span>
        </div>
      )}
    </div>
  );
};
