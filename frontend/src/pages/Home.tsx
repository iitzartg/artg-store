import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slideshow data
  const heroSlides = [
    {
      title: 'Gaming',
      subtitle: 'Paradise',
      description: 'Discover the latest games and digital gift cards. Instant delivery, secure transactions.',
      gradient: 'from-purple-600 via-blue-600 to-cyan-600',
    },
    {
      title: 'Digital',
      subtitle: 'Gift Cards',
      description: 'Perfect gifts for gamers. Instant delivery, worldwide availability, and secure transactions.',
      gradient: 'from-green-600 via-emerald-600 to-teal-600',
    },
    {
      title: 'Exclusive',
      subtitle: 'Deals',
      description: 'Special discounts on featured games. Limited time offers you don\'t want to miss!',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products/featured/all');
        console.log('Featured products API response:', response.data);
        console.log('Response structure:', {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasProducts: !!response.data?.data?.products,
          productsCount: response.data?.data?.products?.length || 0,
          firstProduct: response.data?.data?.products?.[0]
        });
        
        // Check if response has the expected structure
        if (!response.data) {
          console.error('Invalid API response structure:', response);
          setFeaturedProducts([]);
          return;
        }
        
        // Handle both possible response structures
        const products = response.data?.data?.products || response.data?.products || [];
        
        if (!Array.isArray(products) || products.length === 0) {
          console.log('No featured products found in database');
          setFeaturedProducts([]);
          return;
        }
        
        console.log(`Received ${products.length} products from API`);
        
        // Normalize products to ensure _id field exists
        // Filter out products without valid IDs instead of generating fake ones
        const normalizedProducts = products
          .map((product: any, index: number) => {
            // Debug: log first product to see its structure
            if (index === 0) {
              console.log('Sample featured product from API:', {
                product: product,
                keys: Object.keys(product),
                _id: product._id,
                id: product.id,
                _idType: typeof product._id,
                idType: typeof product.id
              });
            }
            
            // Handle different ID formats (ObjectId object, string, number)
            // Try multiple possible ID field names in order of preference
            let productId = product._id || product.id || product.pk || product.productId;
            
            // Handle null/undefined explicitly
            if (productId === null || productId === undefined) {
              productId = null;
            } else {
              // If _id is an object (MongoDB ObjectId), convert to string
              if (typeof productId === 'object') {
                try {
                  productId = productId.toString ? productId.toString() : String(productId);
                } catch (e) {
                  console.error('Error converting ObjectId to string:', e, product);
                  productId = null;
                }
              }
              
              // Convert to string if it's a number
              if (typeof productId === 'number') {
                productId = String(productId);
              }
              
              // Ensure it's a string at this point
              if (typeof productId !== 'string') {
                productId = String(productId);
              }
            }
            
            // Only include products with valid IDs (non-empty, non-temporary)
            // Accept numbers too (they'll be converted to string)
            const isValidId = productId !== null && 
                             productId !== undefined &&
                             (typeof productId === 'string' || typeof productId === 'number') &&
                             String(productId).trim() !== '' && 
                             !String(productId).startsWith('temp_') && 
                             !String(productId).startsWith('temp_featured_');
            
            if (!isValidId) {
              console.warn('Featured product missing valid ID, skipping:', {
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
          .filter((product: any) => product !== null && product._id);
        
        console.log(`Featured products: ${normalizedProducts.length} out of ${products.length} have valid IDs`);
        setFeaturedProducts(normalizedProducts);
      } catch (error: any) {
        console.error('Error fetching featured products:', error);
        console.error('Error details:', error.response?.data || error.message);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Auto-rotate slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section with Slideshow */}
      <section className="relative overflow-hidden rounded-2xl">
        <div className="relative h-[500px] md:h-[600px]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`}></div>
              <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-2xl">
                  <span className="text-white">{slide.title}</span>{' '}
                  <span className="text-white">{slide.subtitle}</span>
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow-lg">
                  {slide.description}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/products" className="btn-primary text-lg px-8 py-3 bg-white text-gray-900 hover:bg-gray-100">
                    Shop Now
                    <ArrowRight className="inline ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/products?productType=GAME" className="btn-secondary text-lg px-8 py-3 bg-white/10 text-white border-white/30 hover:bg-white/20">
                    <Gamepad2 className="inline mr-2 w-5 h-5" />
                    Browse Games
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all backdrop-blur-sm z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link
            to="/products?featured=true"
            className="text-neon-green hover:text-neon-blue transition-colors flex items-center"
          >
            View All
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} showFeaturedBadge={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No featured products available</p>
            <p className="text-gray-500 text-sm mb-6">Check back later for new products!</p>
            <Link to="/products" className="btn-primary inline-flex items-center">
              Browse All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
          <p className="text-gray-400">
            Get your digital keys instantly after purchase. No waiting, no shipping.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Gift Cards</h3>
          <p className="text-gray-400">
            Perfect gifts for gamers. Steam, PlayStation, Xbox, and more.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
          <p className="text-gray-400">
            Encrypted keys, secure payments, and guaranteed authenticity.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;



