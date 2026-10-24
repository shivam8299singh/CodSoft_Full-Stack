import { Award, ChefHat, Heart, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import React from 'react';

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
          Our Heritage & Passion
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold font-serif text-slate-900 mt-2">
          The Story of DineDesk
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
          Crafting memorable dining moments by uniting artisanal cooking traditions with smart tableside digital experiences.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          <h2 className="text-2xl font-bold font-serif text-slate-900">
            A Vision for Modern Restaurant Hospitality
          </h2>
          <p>
            DineDesk began with a simple belief: dining out should be an uninterrupted celebration of flavor, ambiance, and warmth. In traditional dining, ordering delays and reservations guesswork often distract from the culinary joy.
          </p>
          <p>
            We set out to build an all-in-one ecosystem that empowers guests with seamless digital menus, direct kitchen ticketing, and real-time table reservations, while giving our culinary chefs and service staff powerful tools to deliver flawless hospitality.
          </p>
          <p>
            From our slow-simmered Makhani curries and certified Angus tenderloins to wood-fired Neapolitan sourdough crusts, each recipe is treated as an art form.
          </p>
        </div>

        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
              alt="DineDesk dining hall"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-serif">Artisanal Mastery</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Recipes developed by master culinary chefs using only the freshest seasonal produce and authentic spices.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-serif">Digital Precision</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Instant kitchen order routing, real-time table floor mapping, and zero order mix-ups.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 font-serif">Uncompromised Quality</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rigorous hygiene protocols, contactless digital payments, and prompt guest hospitality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
