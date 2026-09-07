import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { ProductCatalog } from './components/ProductCatalog';
import { WhyUs } from './components/WhyUs';
import { QuoteSection } from './components/QuoteSection';
import { Footer } from './components/Footer';
import { HtmlModal } from './components/HtmlModal';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<string>('Cabro Paving Blocks');
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Navigation Header in Blue & Slate Grey */}
      <Navbar
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
        onScrollTo={handleScrollTo}
      />

      {/* Hero Section */}
      <Hero onScrollTo={handleScrollTo} />

      {/* Trust & Certifications Bar */}
      <TrustBar />

      {/* Product Catalog Grid (featuring all uploaded images with blue & grey styling) */}
      <ProductCatalog onSelectForQuote={handleSelectForQuote} />

      {/* Why Us / Kenyatta Road Advantage Section */}
      <WhyUs />

      {/* Custom Quote Request Form */}
      <QuoteSection
        selectedProduct={selectedProduct}
        onProductChange={setSelectedProduct}
      />

      {/* Footer */}
      <Footer
        onScrollTo={handleScrollTo}
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
      />

      {/* Updated Standalone HTML Code Modal */}
      <HtmlModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
      />
    </div>
  );
}
