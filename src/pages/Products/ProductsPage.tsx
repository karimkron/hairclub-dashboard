import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { useProductsStore } from '../../store/productsStore';
import { useNavigate } from 'react-router-dom';


const ProductsPage = () => {
  const { products, categories, loading, error, fetchProducts } = useProductsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  const navigate = useNavigate()
 

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
      const descMatch = product.description.toLowerCase().includes(normalizedQuery);
      const categoryMatch = product.categories.some(category => 
        category.toLowerCase().includes(normalizedQuery)
      );
      
      return nameMatch || descMatch || categoryMatch;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Group products by category for mobile view
  const productsByCategory = categories.reduce((acc, category) => {
    if (category.id === 'all') return acc;
    
    const categoryProducts = filteredProducts.filter(product => 
      product.categories.includes(category.id)
    );
    
    if (categoryProducts.length > 0) {
      acc[category.id] = {
        name: category.name,
        products: categoryProducts
      };
    }
    
    return acc;
  }, {} as Record<string, { name: string, products: any[] }>);

  // Create a "Featured Products" category
  const featuredProducts = {
    name: 'Los más deseados',
    products: filteredProducts.slice(0, 10)
  };

  // Create a "New Arrivals" category
  const newArrivals = {
    name: 'Novedades',
    products: [...filteredProducts].sort(() => 0.5 - Math.random()).slice(0, 8)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium mb-2">Error al cargar productos</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => fetchProducts()}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50">
      {/* Search bar */}
      <div className="sticky top-16 bg-white z-30 px-4 py-3 shadow-sm mb-2">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar en Belleza"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50"
          />
        </div>
      </div>

      {/* Desktop View Actualizada */}
      <div className="hidden md:block px-4">
        <h1 className="text-2xl font-bold my-6">Nuestros Productos</h1>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
        <p className="text-gray-600">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product._id} 
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="relative pt-[100%]">
          <img 
            src={product.mainImage || '/placeholder-product.png'} 
            alt={product.name}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
            </div>
            <div className="p-3 flex flex-col flex-grow">
          <h3 className="font-medium text-gray-800 truncate">{product.name}</h3>
          <p className="text-gray-500 text-sm line-clamp-2 h-10">{product.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">{product.price.toFixed(2)} €</span>
            {product.stock > 0 ? (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Disponible</span>
            ) : (
              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Agotado</span>
            )}
          </div>
          <div className="mt-2">
            {product.categories.slice(0, 2).map((category: string, idx: number) => (
              <span 
            key={idx} 
            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 mr-1 mb-1 rounded-full"
              >
            {category}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate(`/dashboard/products/${product._id}`)}
            className="mt-auto w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            Ver producto
          </button>
            </div>
          </div>
        ))}
          </div>
        )}
      </div>

      {/* Mobile View Actualizada */}
      <div className="md:hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-600">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* New Arrivals Section */}
            <div className="bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="font-bold text-lg">{newArrivals.name}</h2>
                <button className="text-amber-500 text-sm flex items-center">
                  Ver más <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex overflow-x-auto pb-4 px-4 space-x-3 hide-scrollbar">
                {newArrivals.products.map((product) => (
                  <div 
                    key={product._id} 
                    className="flex-shrink-0 w-32 cursor-pointer"
                    onClick={() => navigate(`/dashboard/products/${product._id}`)}
                  >
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="relative pt-[100%]">
                        <img 
                          src={product.mainImage || '/placeholder-product.png'} 
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm text-gray-800 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        <p className="mt-1 text-base font-bold">{product.price.toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Products Section */}
            <div className="bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="font-bold text-lg">{featuredProducts.name}</h2>
                <button className="text-amber-500 text-sm flex items-center">
                  Ver más <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex overflow-x-auto pb-4 px-4 space-x-3 hide-scrollbar">
                {featuredProducts.products.map((product) => (
                  <div 
                    key={product._id} 
                    className="flex-shrink-0 w-32 cursor-pointer"
                    onClick={() => navigate(`/dashboard/products/${product._id}`)}
                  >
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="relative pt-[100%]">
                        <img 
                          src={product.mainImage || '/placeholder-product.png'} 
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm text-gray-800 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        <p className="mt-1 text-base font-bold">{product.price.toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Sections */}
            {Object.entries(productsByCategory).map(([categoryId, category]) => (
              <div key={categoryId} className="bg-white">
                <div className="flex items-center justify-between px-4 py-3">
                  <h2 className="font-bold text-lg">{category.name}</h2>
                  <button className="text-amber-500 text-sm flex items-center">
                    Ver más <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex overflow-x-auto pb-4 px-4 space-x-3 hide-scrollbar">
                  {category.products.map((product) => (
                    <div 
                      key={product._id} 
                      className="flex-shrink-0 w-32 cursor-pointer"
                      onClick={() => navigate(`/dashboard/products/${product._id}`)}
                    >
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative pt-[100%]">
                          <img 
                            src={product.mainImage || '/placeholder-product.png'} 
                            alt={product.name}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="font-medium text-sm text-gray-800 truncate">{product.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                          <p className="mt-1 text-base font-bold">{product.price.toFixed(2)} €</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for hiding scrollbars while keeping scroll functionality */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;