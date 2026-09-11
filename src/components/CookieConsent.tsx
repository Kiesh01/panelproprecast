import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, Settings, X, ChevronRight } from 'lucide-react';
import { LegalDocType } from './LegalModal';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'panelpro_cookie_consent_v1';

interface CookieConsentProps {
  onOpenLegal: (doc: LegalDocType) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenLegal }) => {
  const [hasDecided, setHasDecided] = useState<boolean>(true); // start true to avoid flash on mount
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [advertisingEnabled, setAdvertisingEnabled] = useState<boolean>(true);

  // Read saved preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: CookiePreferences = JSON.parse(saved);
        setAnalyticsEnabled(parsed.analytics);
        setAdvertisingEnabled(parsed.advertising);
        setHasDecided(true);
      } else {
        setHasDecided(false);
      }
    } catch {
      setHasDecided(false);
    }

    // Listen for custom event to open preferences from anywhere (e.g. Footer link)
    const handleOpenSettings = () => {
      setShowPreferencesModal(true);
    };

    window.addEventListener('open-panelpro-cookie-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('open-panelpro-cookie-settings', handleOpenSettings);
    };
  }, []);

  const savePreferences = (analytics: boolean, advertising: boolean) => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics,
      advertising,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Could not save cookie consent:', e);
    }
    setAnalyticsEnabled(analytics);
    setAdvertisingEnabled(advertising);
    setHasDecided(true);
    setShowPreferencesModal(false);

    // Apply or signal consent state to Google AdSense / Analytics
    if (typeof window !== 'undefined') {
      // Custom event for analytics / ad tags
      window.dispatchEvent(
        new CustomEvent('panelpro-consent-updated', { detail: prefs })
      );
    }
  };

  const handleAcceptAll = () => {
    savePreferences(true, true);
  };

  const handleRejectNonEssential = () => {
    savePreferences(false, false);
  };

  const handleSaveCustom = () => {
    savePreferences(analyticsEnabled, advertisingEnabled);
  };

  return (
    <>
      {/* Floating Bottom Cookie Consent Banner */}
      {!hasDecided && (
        <aside
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-6 bg-slate-950/95 text-white border-t border-slate-800 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 shrink-0 border border-blue-500/30 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    We Value Your Privacy
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-blue-900/60 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-700/50">
                    <ShieldCheck className="w-3 h-3" /> GDPR / Kenya DPA
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PanelPro Precast Ltd and trusted third-party partners (including <strong>Google AdSense</strong>) use cookies, web beacons, and unique identifiers to ensure safe operation, measure website traffic, and serve tailored advertisements. You can accept all cookies, decline non-essential cookies, or customize your preferences at any time.
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-0.5">
                  <button
                    onClick={() => onOpenLegal('privacy')}
                    className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                  >
                    Privacy Policy &amp; AdSense Terms
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => onOpenLegal('cookies')}
                    className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                  >
                    Cookie Policy
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
              <button
                onClick={() => setShowPreferencesModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Customize</span>
              </button>

              <button
                onClick={handleRejectNonEssential}
                className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md transition-colors cursor-pointer"
              >
                Reject Non-Essential
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept All Cookies</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Detailed Cookie Preferences Manager Modal */}
      {showPreferencesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 id="cookie-settings-title" className="text-base font-bold text-white">
                    Cookie &amp; Advertising Preferences
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Control which cookies and advertising tags are active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close cookie preferences modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <p className="text-slate-600 leading-relaxed">
                When you visit PanelPro Precast Ltd, we store cookies on your browser to collect information. Below you can choose which categories of cookies to permit. For complete information, please read our{' '}
                <button
                  onClick={() => {
                    setShowPreferencesModal(false);
                    onOpenLegal('privacy');
                  }}
                  className="text-blue-700 font-semibold underline cursor-pointer"
                >
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button
                  onClick={() => {
                    setShowPreferencesModal(false);
                    onOpenLegal('cookies');
                  }}
                  className="text-blue-700 font-semibold underline cursor-pointer"
                >
                  Cookie Policy
                </button>
                .
              </p>

              {/* 1. Strictly Necessary */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    1. Strictly Necessary Cookies
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                    Always Enabled
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Required for site navigation, form security, quotation calculations, and remembering your consent state. These cookies do not store any personally identifiable data and cannot be disabled.
                </p>
              </div>

              {/* 2. Analytics & Performance */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">
                    2. Analytics &amp; Performance
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Allow us to measure traffic, popular product categories, and bounce rates so we can optimize loading speeds and content for Kenyan contractors and developers.
                </p>
              </div>

              {/* 3. Advertising & Google AdSense */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      3. Google AdSense &amp; Marketing
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium">Personalized Advertising Cookies</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advertisingEnabled}
                      onChange={(e) => setAdvertisingEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Permits Google and partner ad networks to serve personalized ads based on your visits to our site and other websites. If disabled, you will still see contextual advertisements, but they will not be personalized.
                </p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  setAnalyticsEnabled(false);
                  setAdvertisingEnabled(false);
                  savePreferences(false, false);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Reject All Non-Essential
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
