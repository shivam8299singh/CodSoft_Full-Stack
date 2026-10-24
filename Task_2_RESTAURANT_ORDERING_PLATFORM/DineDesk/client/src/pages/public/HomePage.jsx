import {
  ArrowRight,
  Award,
  CalendarCheck,
  ChefHat,
  Clock,
  Flame,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FoodCard from '../../components/menu/FoodCard';
import FoodDetailModal from '../../components/menu/FoodDetailModal';
import { menuService } from '../../services/menuService';

const HomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catsRes] = await Promise.all([
          menuService.getMenuItems({ sortBy: 'rating' }),
          menuService.getCategories(),
        ]);
        setFeaturedItems(itemsRes.slice(0, 6));
        setCategories(catsRes);
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white rounded-b-[3rem] lg:rounded-b-[4rem] px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:py-32">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gourmet Dining & Smart Digital Hospitality</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight leading-[1.1]">
              Savor Artful Flavors, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Crafted to Perfection.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Experience the harmony of traditional culinary craftsmanship and modern tableside digital ordering. From sizzled artisan steaks to wood-fired pizzas, DineDesk redefines fine dining.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/menu" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 shadow-xl shadow-amber-600/30">
                  <span>Explore Menu</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/reservations" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  <span>Reserve a Table</span>
                </Button>
              </Link>
            </div>

            {/* Quick Stats Pill */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-serif">
                  32+
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Chef Specials
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-serif">
                  4.9★
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Dining Rating
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-serif">
                  12
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Luxury Tables
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80"
                  alt="DineDesk Prime Steak"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                        Chef's Masterpiece
                      </span>
                      <h4 className="text-lg font-bold font-serif text-white">
                        Grilled Tenderloin Steak
                      </h4>
                    </div>
                    <span className="text-xl font-bold text-amber-400 font-sans">
                      ₹849.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Floating Pill */}
              <div className="absolute -top-6 -left-6 bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 animate-bounce duration-1000">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Wood-Fired & Fresh</p>
                  <p className="text-[11px] text-slate-500">Prepared to order</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
            Artisanal Selection
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-2">
            Explore by Culinary Category
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Every dish is thoughtfully crafted using locally sourced farm ingredients and timeless techniques.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/menu?category=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
              Signature Entrees
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-2">
              Most Loved Creations
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Hand-picked bestsellers rated highest by our dining guests.
            </p>
          </div>
          <Link to="/menu">
            <Button variant="outline" size="sm">
              <span>View All 32+ Dishes</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching culinary creations..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedItem(selected)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOSPITALITY & AMBIANCE STORY */}
      <section className="bg-amber-50/60 border-y border-amber-100/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-700">
                The DineDesk Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 leading-tight">
                Where Culinary Artistry Meets Seamless Hospitality
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Founded with a passion for soulful gastronomy, DineDesk harmonizes classic European bistro warmth with the fiery vibrancy of Asian woks and royal Indian tandoor ovens.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you are joining us for an intimate rooftop anniversary dinner, a vibrant family gathering, or enjoying prompt home delivery, our dedicated kitchen chefs and floor staff ensure every moment is memorable.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Master Chefs</h4>
                    <p className="text-xs text-slate-500">Internationally trained culinary artisans</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Live Kitchen Ticketing</h4>
                    <p className="text-xs text-slate-500">Prompt preparation & zero delays</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80"
                  alt="Restaurant interior"
                  className="rounded-3xl object-cover h-64 w-full shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
                  alt="Dining table setting"
                  className="rounded-3xl object-cover h-64 w-full shadow-lg mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              Reserve Your Table Today
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-serif leading-tight">
              Ready for an Unforgettable Dining Experience?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Book your preferred seating across our Indoor dining hall, outdoor Garden Patio, or scenic Rooftop.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link to="/reservations" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 shadow-xl shadow-amber-600/30">
                  Book Table Now
                </Button>
              </Link>
              <Link to="/menu" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Order Takeaway / Delivery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Food Detail Modal */}
      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
