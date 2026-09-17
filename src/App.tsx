import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { ProductCatalog } from './components/ProductCatalog';
import { AdBanner } from './components/AdBanner';
import { WhyUs } from './components/WhyUs';
import { QuoteSection } from './components/QuoteSection';
import { Footer } from './components/Footer';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { CookieConsent } from './components/CookieConsent';
import { AdcashReportingModal } from './components/AdcashReportingModal';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<string>('Cabro Paving Blocks');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('privacy');
  const [isAdcashReportingOpen, setIsAdcashReportingOpen] = useState<boolean>(false);

  // Private shortcut / URL hash listener so only you can access the dashboard
  useEffect(() => {
    // Check if URL ends with #adcash-stats or ?admin=adcash
    if (
      window.location.hash === '#adcash-stats' ||
      window.location.search.includes('admin=adcash')
    ) {
      setIsAdcashReportingOpen(true);
    }

    const handleHashChange = () => {
      if (window.location.hash === '#adcash-stats') {
        setIsAdcashReportingOpen(true);
      }
    };

    // Secret shortcut: Press Ctrl + Shift + A (or Cmd + Shift + A on Mac)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdcashReportingOpen((prev) => !prev);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectForQuote = (productName: string) => {
    setSelectedProduct(productName);
    handleScrollTo('quote');
  };

  const handleOpenLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setIsLegalModalOpen(true);
  };

  const handleOpenCookiePreferences = () => {
    window.dispatchEvent(new CustomEvent('open-panelpro-cookie-settings'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Navigation Header in Blue & Slate Grey */}
      <Navbar
        onScrollTo={handleScrollTo}
      />

      {/* Hero Section */}
      <Hero onScrollTo={handleScrollTo} />

      {/* Trust & Certifications Bar */}
      <TrustBar />

      {/* Product Catalog Grid (featuring all uploaded images with blue & grey styling) */}
      <ProductCatalog onSelectForQuote={handleSelectForQuote} />

      {/* Google AdSense Responsive Ad Unit */}
      <AdBanner />

      {/* Why Us / Kenyatta Road Advantage Section */}
      <WhyUs />

      {/* Custom Quote Request Form */}
      <QuoteSection
        selectedProduct={selectedProduct}
        onProductChange={setSelectedProduct}
      />

      {/* Footer with Legal & Cookie Links */}
      <Footer
        onScrollTo={handleScrollTo}
        onOpenLegal={handleOpenLegal}
        onOpenCookieSettings={handleOpenCookiePreferences}
      />

      {/* Adcash Publisher Reporting Analytics Tool */}
      <AdcashReportingModal
        isOpen={isAdcashReportingOpen}
        onClose={() => setIsAdcashReportingOpen(false)}
      />

      {/* Google AdSense Compliant Legal Modal (Privacy, Terms, Cookies) */}
      <LegalModal
        isOpen={isLegalModalOpen}
        activeDoc={activeLegalDoc}
        onClose={() => setIsLegalModalOpen(false)}
        onSelectDoc={setActiveLegalDoc}
        onOpenCookieSettings={handleOpenCookiePreferences}
      />

      {/* Cookie Consent & Preferences Management Banner */}
      <CookieConsent onOpenLegal={handleOpenLegal} />
    </div>
  );
}

