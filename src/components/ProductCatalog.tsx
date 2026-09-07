import React, { useState, useMemo } from 'react';
import { Search, Filter, CheckCircle2 } from 'lucide-react';
import { PRECAST_PRODUCTS } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  onSelectForQuote: (productName: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onSelectForQuote }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return PRECAST_PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.specs.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.image.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="products" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Industrial Precast Catalogue</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 tracking-tight mb-4">
            Our Product Portfolio
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Engineered for maximum compressive strength, exact tolerances, and long service life. Direct supply from our Kenyatta Road manufacturing yard.
          </p>
        </div>

        {/* Filter and Search Bar in Blue & Grey */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1 hidden sm:inline-flex">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Filter:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Items ({PRECAST_PRODUCTS.length})
            </button>
            <button
              onClick={() => setSelectedCategory('drainage')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'drainage'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Drainage, Kerbs &amp; Channels
            </button>
            <button
              onClick={() => setSelectedCategory('paving')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'paving'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Paving &amp; Slabs
            </button>
            <button
              onClick={() => setSelectedCategory('boundary')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'boundary'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Boundary &amp; Fencing
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectForQuote={onSelectForQuote}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
            <p className="text-sm font-medium">No precast items matched your search query.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
