import React, { useState } from 'react';
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

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<string>('Cabro Paving Blocks');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('privacy');

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

