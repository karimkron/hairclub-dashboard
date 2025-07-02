import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore'; // Make sure path is correct
import { useUserStore } from '../../store/user.store'; // Import UserStore

const Header = () => {
  const navigate = useNavigate();
  const { cartItemsCount } = useCartStore();
  const { profile, fetchProfile } = useUserStore(); // Get user profile and fetchProfile function
  
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  
  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  // Listen for cart updates
  useEffect(() => {
    if (cartItemsCount > 0) {
      setIsCartBouncing(true);
      
      // Reset animation after it completes
      const timeout = setTimeout(() => {
        setIsCartBouncing(false);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [cartItemsCount]);

  // Get first letter of user's name for avatar
  const getInitial = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-white px-4 md:px-6 shadow-sm z-40">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center">
          {/* Logo and other elements */}
        </div>

        <div className="flex items-center gap-4">

          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            aria-label="Profile"
          >
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-medium">
              {getInitial()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{profile?.name || 'Usuario'}</p>
              <p className="text-xs text-gray-500">{profile?.email || 'correo@ejemplo.com'}</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/dashboard/cart')}
            className={`relative text-gray-600 hover:text-gray-800 ${isCartBouncing ? 'animate-cartBounce' : ''}`}
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-xs text-white">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;