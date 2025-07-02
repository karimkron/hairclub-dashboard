import { create } from 'zustand';
import api from '../services/api';
import Swal from 'sweetalert2';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    mainImage: string;
    brand?: string;
    description?: string;
  };
  quantity: number;
  status: 'pending' | 'confirmed';
}

interface CartStore {
  cartItems: CartItem[];
  cartItemsCount: number; // New property to track total items in cart
  fetchCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  confirmPickup: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  fetchPickups: () => Promise<any>;
  cancelPickup: (pickupId: string) => Promise<void>;
  cancelAllPickups: () => Promise<void>;
  confirmAllItems: () => Promise<any>; // Added missing type for this function
}

const saveCartToLocalStorage = (cartItems: CartItem[]) => {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

const loadCartFromLocalStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem('cartItems');
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
};

// Helper function to calculate total items count
const calculateCartItemsCount = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

export const useCartStore = create<CartStore>((set) => {
  const initialCartItems = loadCartFromLocalStorage();
  
  return {
    cartItems: initialCartItems,
    cartItemsCount: calculateCartItemsCount(initialCartItems),

    fetchCart: async () => {
      try {
        const response = await api.get<CartItem[]>('/api/cart');
        
        // Validar y limpiar datos
        const validatedData = response.data 
          .filter(item => item?.product?._id && item?.product?.price)
          .map(item => ({
            ...item,
            product: {
              _id: item.product._id,
              name: item.product.name || 'Producto sin nombre',
              price: item.product.price,
              stock: item.product.stock,
              mainImage: item.product.mainImage || '/default-product.png',
              brand: item.product.brand,
              description: item.product.description
            }
          }));

        set({ 
          cartItems: validatedData,
          cartItemsCount: calculateCartItemsCount(validatedData)
        });
        saveCartToLocalStorage(validatedData);
      } catch (error) {
        console.error('Error fetching cart:', error);
        const localCart = loadCartFromLocalStorage();
        set({ 
          cartItems: localCart,
          cartItemsCount: calculateCartItemsCount(localCart)
        });
      }
    },

    addToCart: async (productId) => {
      try {
        const response = await api.post<CartItem[]>('/api/cart/add', { productId });
        set({ 
          cartItems: response.data,
          cartItemsCount: calculateCartItemsCount(response.data)
        });
        saveCartToLocalStorage(response.data);
      } catch (error) {
        await Swal.fire('Error', 'No se pudo agregar el producto', 'error');
      }
    },

    removeFromCart: async (itemId) => {
      try {
        const response = await api.delete(`/api/cart/remove/${itemId}`);
        set((state) => {
          const updatedCart = state.cartItems.filter(item => item._id !== itemId);
          saveCartToLocalStorage(updatedCart);
          return { 
            cartItems: updatedCart,
            cartItemsCount: calculateCartItemsCount(updatedCart)
          };
        });
        
        // Si quieres mostrar un mensaje informativo cuando se elimina un producto pendiente de recoger
        const responseData = response.data as { wasPickupPending: boolean };
        if (responseData.wasPickupPending) {
          await Swal.fire({
            title: 'Pedido cancelado',
            text: 'Tu pedido pendiente de recogida ha sido cancelado',
            icon: 'info',
            confirmButtonColor: '#f59e0b'
          });
        }
      } catch (error) {
        console.error('Error removing item:', error);
        await Swal.fire('Error', 'No se pudo eliminar el producto del carrito', 'error');
      }
    },

    updateQuantity: async (itemId, quantity) => {
      try {
        await api.put(`/api/cart/update/${itemId}`, { quantity });
        await useCartStore.getState().fetchCart();
      } catch (error) {
        console.error('Error updating quantity:', error);
        if ((error as any).response?.data?.message === 'Stock insuficiente') {
          await Swal.fire('Stock insuficiente', 'No hay suficientes unidades disponibles', 'warning');
        }
      }
    },

    confirmPickup: async (itemId) => {
      try {
        const response = await api.put(`/api/cart/confirm/${itemId}`);
        
        // Mostrar mensaje de éxito con el mensaje recibido del servidor
        await Swal.fire({
          title: '¡Pedido confirmado!',
          text: (response.data as { message: string }).message || 'Recoge tu pedido en el local en tu próxima visita',
          icon: 'success',
          confirmButtonColor: '#f59e0b'
        });
        
        await useCartStore.getState().fetchCart();
      } catch (error) {
        console.error('Error confirming pickup:', error);
        await Swal.fire('Error', 'No se pudo confirmar la recogida', 'error');
      }
    },

    confirmAllItems: async () => {
      try {
        const response = await api.post<{ success: boolean }>('/api/cart/confirm-all');
        if (response.data.success) {
          set((state) => {
            const updatedCart = state.cartItems.filter(item => item.status !== 'confirmed');
            return {
              cartItems: updatedCart,
              cartItemsCount: calculateCartItemsCount(updatedCart)
            };
          });
        }
        return response.data;
      } catch (error) {
        console.error('Error confirming all items:', error);
        throw error;
      }
    },

    fetchPickups: async () => {
      try {
        const response = await api.get('/api/cart/pickups');
        return response.data;
      } catch (error) {
        console.error('Error fetching pickups:', error);
        throw error;
      }
    },

    cancelPickup: async (pickupId: string) => {
      try {
        await api.delete(`/api/cart/pickups/${pickupId}`);
      } catch (error) {
        console.error('Error canceling pickup:', error);
        throw error;
      }
    },

    cancelAllPickups: async () => {
      try {
        await api.delete('/api/cart/pickups');
      } catch (error) {
        console.error('Error canceling all pickups:', error);
        throw error;
      }
    }
  };
});