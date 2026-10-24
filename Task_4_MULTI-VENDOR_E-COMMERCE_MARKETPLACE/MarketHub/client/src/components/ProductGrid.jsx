import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

export const ProductGrid = ({
  products = [],
  loading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try clearing some filters or searching for something else.',
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4"
          >
            <div className="aspect-square bg-slate-100 rounded-xl" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-100 rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
