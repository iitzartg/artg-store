import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import api from '../utils/api';
import { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [pagination, setPagination] = useState({
    page: currentPage,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Get filters from URL params
  const filters = {
    productType: searchParams.get('category') || '', // Using 'category' param for productType filter
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  };

  // Scroll to top when page or filters change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    searchParams.get('page'),
    searchParams.get('category'),
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
  ]);

  // Fetch products when URL params change
  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Read filters directly from URL params to ensure they're current
      const categoryFilter = searchParams.get('category');
      const minPriceFilter = searchParams.get('minPrice');
      const maxPriceFilter = searchParams.get('maxPrice');
      
      // Add filter params - backend expects product_type (underscore), not productType
      if (categoryFilter) {
        params.append('product_type', categoryFilter);
      }
      if (minPriceFilter) {
        params.append('minPrice', minPriceFilter);
      }
      if (maxPriceFilter) {
        params.append('maxPrice', maxPriceFilter);
      }
      
      // Get page from URL params, default to 1
      const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
      params.append('page', pageFromUrl.toString());
      params.append('limit', pagination.limit.toString());
      
      const apiUrl = `/products?${params.toString()}`;
      console.log('Fetching products from:', apiUrl);
      console.log('Filters being sent:', {
        product_type: categoryFilter,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
        page: pageFromUrl
      });

      const response = await api.get(apiUrl);
      console.log('Products API response:', response.data);
      
      if (!response.data?.data?.products) {
        console.error('No products in response:', response.data);
        setProducts([]);
        return;
      }
      
      // Normalize products to ensure _id field exists
      // Filter out products without valid IDs instead of generating fake ones
      const normalizedProducts = response.data.data.products
        .map((product: any, index: number) => {
          // Handle different ID formats (ObjectId object, string, number)
          let productId = product._id || product.id;
          
          // Debug: log first product to see what we're getting
          if (index === 0) {
            console.log('Sample product from API:', {
              _id: product._id,
              id: product.id,
              title: product.title,
              productIdType: typeof productId,
              productIdValue: productId
            });
          }
          
          // If _id is an object (MongoDB ObjectId), convert to string
          if (productId && typeof productId === 'object') {
            productId = productId.toString ? productId.toString() : String(productId);
          }
          
          // Convert to string if it's a number
          if (productId && typeof productId === 'number') {
            productId = String(productId);
          }
          
          // Only include products with valid IDs (non-empty, non-temporary)
          // Accept any ID that exists and doesn't start with 'temp_' or 'temp_featured_'
          // Also accept numbers (they'll be converted to string below)
          const isValidId = productId !== null && 
                           productId !== undefined &&
                           (typeof productId === 'string' || typeof productId === 'number') &&
                           String(productId).trim() !== '' && 
                           !String(productId).startsWith('temp_') && 
                           !String(productId).startsWith('temp_featured_');
          
          if (!isValidId) {
            console.warn('Product missing valid ID, skipping:', {
              title: product.title || 'Unknown product',
              _id: product._id,
              id: product.id,
              productId: productId,
              productIdType: typeof productId,
              allKeys: Object.keys(product)
            });
            return null;
          }
          
          // Ensure productId is a string
          if (typeof productId !== 'string') {
            productId = String(productId);
          }
          
          return {
            ...product,
            _id: productId
          };
        })
        .filter((product: any) => product !== null && product._id); // Remove null entries and products without IDs
      
      console.log(`Filtered products: ${normalizedProducts.length} out of ${response.data.data.products.length} have valid IDs`);
      
      console.log('Normalized products count:', normalizedProducts.length);
      if (normalizedProducts.length === 0 && response.data.data.products.length > 0) {
        console.error('All products were filtered out. Sample product:', response.data.data.products[0]);
      }
      setProducts(normalizedProducts);
      
      // Update pagination state from response
      const paginationData = response.data.data.pagination;
      setPagination({
        page: paginationData.page,
        limit: paginationData.limit,
        total: paginationData.total,
        pages: paginationData.pages,
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      
      // Show user-friendly error message
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || !error.response) {
        console.error('Backend server is not running or not accessible');
        // Keep loading state to show error UI
      } else if (error.response?.status === 404) {
        console.error('API endpoint not found');
      } else if (error.response?.status >= 500) {
        console.error('Server error:', error.response?.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    // Update URL params - preserve existing params and reset page to 1 when filters change
    const params = new URLSearchParams(searchParams);
    
    // Map category to URL param (category param will be used for productType)
    if (key === 'category') {
      if (value && value.trim() !== '') {
        params.set('category', value);
      } else {
        params.delete('category');
      }
    } else if (key === 'minPrice' || key === 'maxPrice') {
      // Only set the param if value is a valid number, otherwise remove it
      if (value && value.trim() !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          // Validate minPrice <= maxPrice
          if (key === 'minPrice') {
            const currentMax = parseFloat(params.get('maxPrice') || '0');
            if (currentMax > 0 && numValue > currentMax) {
              console.warn('Min price cannot be greater than max price');
              return; // Don't update if invalid
            }
          } else if (key === 'maxPrice') {
            const currentMin = parseFloat(params.get('minPrice') || '0');
            if (currentMin > 0 && numValue < currentMin) {
              console.warn('Max price cannot be less than min price');
              return; // Don't update if invalid
            }
          }
          params.set(key, value);
        } else {
          params.delete(key);
        }
      } else {
        params.delete(key);
      }
    }
    
    params.set('page', '1'); // Reset to page 1 when filters change
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const categories = ['GAME', 'GIFTCARD']; // Games and Gift Cards

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Filters Sidebar */}
      <div
        className={`${
          showFilters ? 'block' : 'hidden'
        } md:block w-full md:w-64 space-y-4`}
      >
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.productType}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All</option>
                <option value="GAME">Games</option>
                <option value="GIFTCARD">Gift Cards</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price Range (TND)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="0.01"
                  value={filters.minPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('minPrice', value === '' ? '' : value);
                  }}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('maxPrice', value === '' ? '' : value);
                  }}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-secondary"
          >
            {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">No products found</p>
            <p className="text-gray-500 text-sm mb-4">
              {loading ? 'Loading...' : 'Make sure the backend server is running on http://localhost:8000'}
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 btn-secondary"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    const newPage = pagination.page - 1;
                    const params = new URLSearchParams(searchParams);
                    params.set('page', newPage.toString());
                    setSearchParams(params);
                  }}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="flex items-center px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => {
                    const newPage = pagination.page + 1;
                    const params = new URLSearchParams(searchParams);
                    params.set('page', newPage.toString());
                    setSearchParams(params);
                  }}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;



