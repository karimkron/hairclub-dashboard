// src/store/productsStore.ts
import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './auth.store';

export interface Product {
  _id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  images: string[];
  mainImage: string;
  categories: string[];
}

interface ProductsStore {
  products: Product[];
  categories: { id: string; name: string }[];
  loading: boolean;
  error: string;
  fetchProducts: () => Promise<void>;
}

export const useProductsStore = create<ProductsStore>((set, _get) => ({
  products: [],
  categories: [],
  loading: true,
  error: '',
  fetchProducts: async () => {
    try {
      const token = useAuthStore.getState().token;
      const response = await api.get<Product[]>('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const productsData = response.data;

      // Guardar productos en localStorage con clave "products"
      localStorage.setItem('products', JSON.stringify(productsData));

      // Extraer categorías únicas a partir de los productos
      const uniqueCategories = Array.from(
        new Set(productsData.flatMap((product) => product.categories))
      ).map((category) => ({ id: category, name: category }));

      // Armar el array final de categorías (incluyendo la opción "Todos")
      const finalCategories = [{ id: 'all', name: 'Todos' }, ...uniqueCategories];
      // Guardar categorías en localStorage con clave "productCategoria"
      localStorage.setItem('productCategoria', JSON.stringify(finalCategories));

      set({
        products: productsData,
        categories: finalCategories,
        loading: false,
        error: '',
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({
        error: 'Error al cargar los productos. Inténtalo de nuevo más tarde.',
        loading: false,
      });
    }
  },
}));
