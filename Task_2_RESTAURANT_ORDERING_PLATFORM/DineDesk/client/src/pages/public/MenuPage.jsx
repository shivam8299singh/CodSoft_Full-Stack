import { UtensilsCrossed } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FoodCard from '../../components/menu/FoodCard';
import FoodDetailModal from '../../components/menu/FoodDetailModal';
import FoodFilter from '../../components/menu/FoodFilter';
import { menuService } from '../../services/menuService';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await menuService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch menu items whenever filters change
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory,
          search: searchQuery,
          vegetarian: isVegOnly ? 'true' : undefined,
          sortBy,
        };
        const data = await menuService.getMenuItems(params);
        setMenuItems(data);
      } catch (err) {
        console.error('Failed to load menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory, searchQuery, isVegOnly, sortBy]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-600">
          Chef Crafted Gastronomy
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 mt-2">
          Our Digital Menu
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Discover a curated symphony of authentic starters, wood-fired pizzas, hearty mains, and artisanal desserts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <FoodFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isVegOnly={isVegOnly}
        onToggleVeg={() => setIsVegOnly((v) => !v)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Food Items Grid */}
      {loading ? (
        <LoadingSpinner text="Loading delicious dishes..." />
      ) : menuItems.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No culinary matches found"
          description="Try adjusting your search terms, resetting filters, or choosing another category."
          actionText="Reset Filters"
          onAction={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            setIsVegOnly(false);
            setSortBy('newest');
            searchParams.delete('category');
            setSearchParams(searchParams);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onSelect={(selected) => setSelectedItem(selected)}
            />
          ))}
        </div>
      )}

      {/* Dish Customization & Detail Modal */}
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

export default MenuPage;
