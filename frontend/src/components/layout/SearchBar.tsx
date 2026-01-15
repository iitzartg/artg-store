import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../../utils/api';
import { Product } from '../../types';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ onSearch, placeholder = 'Search products...', className = '' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
        // Normalize products to ensure _id field exists
        const normalizedProducts = (response.data.data.products || [])
          .map((product: any) => {
            // Handle different ID formats (ObjectId object, string, number)
            let productId = product._id || product.id;
            
            // If _id is an object (MongoDB ObjectId), convert to string
            if (productId && typeof productId === 'object') {
              productId = productId.toString ? productId.toString() : String(productId);
            }
            
            // Convert to string if it's a number
            if (productId && typeof productId === 'number') {
              productId = String(productId);
            }
            
            if (!productId) {
              return null;
            }
            
            return {
              ...product,
              _id: productId
            };
          })
          .filter((product: any) => product !== null);
        setSuggestions(normalizedProducts);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.title);
    setShowSuggestions(false);
    navigate(`/products/${product._id}`);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={`relative flex-1 max-w-2xl ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-purple-600 focus:border-transparent transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 flex items-center gap-3"
                >
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{product.title}</p>
                    <p className="text-sm text-gray-400 truncate">{product.platform} • {product.category}</p>
                    <p className="text-sm text-purple-400 font-semibold mt-1">
                      {product.discount > 0 ? (
                        <>
                          <span className="line-through text-gray-500 mr-2">{product.price} TND</span>
                          <span>{(product.price * (1 - product.discount / 100)).toFixed(2)} TND</span>
                        </>
                      ) : (
                        <span>{product.price} TND</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                className="w-full px-4 py-3 text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                View all results for "{query}"
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
