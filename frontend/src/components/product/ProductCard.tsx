import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showFeaturedBadge?: boolean;
}

const ProductCard = ({ product, showFeaturedBadge = false }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  // Get product ID - handle both _id and id fields
  let productId = product._id || (product as any).id;
  
  // Ensure productId is a string
  if (productId && typeof productId !== 'string') {
    productId = String(productId);
  }
  
  // Validate productId - only reject clearly temporary or invalid IDs
  // Accept any non-empty string ID that doesn't start with 'temp_' or 'temp_featured_'
  const isValidId = productId && 
                   typeof productId === 'string' && 
                   productId.trim() !== '' && 
                   !productId.startsWith('temp_') && 
                   !productId.startsWith('temp_featured_');
  
  if (!isValidId) {
    console.error('Product missing valid ID, cannot render card:', {
      product: product,
      productId: productId,
      productIdType: typeof productId,
      _id: product._id,
      id: (product as any).id
    });
    // Still render but with a warning - don't break the entire page
    return (
      <div className="card p-4 text-center text-red-400">
        <p>Product data error: Invalid ID</p>
        <p className="text-sm text-gray-400 mt-2">{product.title || 'Unknown product'}</p>
      </div>
    );
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigation when clicking cart button
    addItem({
      productId: productId,
      title: product.title,
      price: product.price * (1 - product.discount / 100),
      quantity: 1,
      image: product.images[0],
      platform: product.platform,
    });
    toast.success('Added to cart!');
  };

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <Link to={`/products/${productId}`} className="block h-full">
      <div className="card group cursor-pointer h-full flex flex-col">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={product.images[0] || '/placeholder-game.jpg'}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-neon-green text-gray-900 font-bold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}
          {showFeaturedBadge && (
            <div className="absolute top-2 left-2 bg-neon-purple text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-neon-green transition-colors">
            {product.title}
          </h3>

          <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div>
              {product.discount > 0 ? (
                <div>
                  <span className="text-2xl font-bold text-neon-green">
                    {discountedPrice.toFixed(2)} TND
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {product.price.toFixed(2)} TND
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold">{product.price.toFixed(2)} TND</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {product.stock === 0 && (
            <p className="text-red-400 text-sm mt-2">Out of Stock</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;



