import { ArrowLeft, Home, UtensilsCrossed } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 shadow-inner ring-8 ring-amber-50/50">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
        404 Page Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-2 mb-3">
        Dish or Page Not On The Menu
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8">
        We couldn't find the page or dining resource you were looking for. Let's guide you back to our main dining selections.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button icon={Home}>Return Home</Button>
        </Link>
        <Link to="/menu">
          <Button variant="outline">Browse Digital Menu</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
