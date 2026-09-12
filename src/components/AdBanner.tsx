import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdBannerProps {
  slot?: string;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '2553207762',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    if (!isPushed.current && adRef.current) {
      if (adRef.current.getAttribute('data-adsbygoogle-status') !== 'done') {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isPushed.current = true;
        } catch (e) {
          // Gracefully handle ad blocker or dev environment suppression
          console.debug('AdSense unit init:', e);
        }
      }
    }
  }, []);

  return (
    <div className={`w-full py-6 px-4 bg-slate-100/80 border-y border-slate-200 my-4 ${className}`} id="ad-banner-container">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 select-none">
          Sponsored / Advertisement
        </span>
        <div className="w-full flex items-center justify-center overflow-hidden min-h-[90px] bg-white rounded-xl border border-slate-200/90 p-2 shadow-xs">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '90px' }}
            data-ad-client="ca-pub-6452660186482325"
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
};
