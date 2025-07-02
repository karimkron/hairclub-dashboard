import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useProductsStore } from "../../../store/productsStore";
import { toast } from "react-toastify";
import { useCartStore } from "../../../store/cartStore";
import CartAnimation from "../../cart/components/CartAnimation"; 

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: string[];
  mainImage: string;
  images: string[];
  brand: string;
}

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products } = useProductsStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [sameCategoryProducts, setSameCategoryProducts] = useState<Product[]>([]);
  const [otherCategoriesProducts, setOtherCategoriesProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStartPosition, setAnimationStartPosition] = useState({ x: 0, y: 0 });
  const [animationEndPosition, setAnimationEndPosition] = useState({ x: 0, y: 0 });
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  const { addToCart } = useCartStore();

  useEffect(() => {
    const loadData = async () => {
      window.scrollTo(0, 0);
      setCurrentImageIndex(0); // Resetear índice al cargar nuevo producto

      const storedProducts = localStorage.getItem("products");
      const productsData = storedProducts ? JSON.parse(storedProducts) : products;

      const selectedProduct = productsData.find(
        (p: Product) => p._id === productId
      );

      if (selectedProduct) {
        // Crear array unificado con mainImage primero
        const unifiedImages = [
          selectedProduct.mainImage,
          ...selectedProduct.images.filter((img: any) => img !== selectedProduct.mainImage)
        ];
        
        setProduct({
          ...selectedProduct,
          images: unifiedImages
        });

        const mainCategory = selectedProduct.categories[0];
        const allProducts = products.length > 0 ? products : productsData;

        const sameCategory = allProducts.filter(
          (p: Product) =>
            p.categories.includes(mainCategory) && p._id !== selectedProduct._id
        );

        const otherCategories = allProducts.filter(
          (p: Product) => !p.categories.includes(mainCategory)
        );

        setSameCategoryProducts(sameCategory);
        setOtherCategoriesProducts(otherCategories);
      }
    };

    loadData();
  }, [productId, products]);

  useEffect(() => {
    const updateCartPosition = () => {
      const cartIcon = document.querySelector('[aria-label="Cart"]');
      if (cartIcon) {
        const rect = cartIcon.getBoundingClientRect();
        setAnimationEndPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }
    };
    
    updateCartPosition();
    window.addEventListener('resize', updateCartPosition);
    
    return () => {
      window.removeEventListener('resize', updateCartPosition);
    };
  }, []);

  const handleAddToCart = async () => {
    if (!product || isAnimating) return;
    
    try {
      if (addToCartButtonRef.current) {
        const btnRect = addToCartButtonRef.current.getBoundingClientRect();
        const imgElement = document.querySelector(`img[src="${product.images[currentImageIndex]}"]`);
        let startX, startY;
        
        if (imgElement) {
          const imgRect = imgElement.getBoundingClientRect();
          startX = imgRect.left + imgRect.width / 2;
          startY = imgRect.top + imgRect.height / 2;
        } else {
          startX = btnRect.left + btnRect.width / 2;
          startY = btnRect.top - 40;
        }
        
        setAnimationStartPosition({ x: startX, y: startY });
      }
      
      const cartIcon = document.querySelector('[aria-label="Cart"]');
      if (cartIcon) {
        const rect = cartIcon.getBoundingClientRect();
        setAnimationEndPosition({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      }
      
      setIsAnimating(true);
      
      setTimeout(async () => {
        try {
          await addToCart(product._id);
        } catch (error) {
          console.error('Error during addToCart:', error);
          toast.error('Error al agregar al carrito', {
            autoClose: 1000,
            position: "top-right"
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
      setIsAnimating(false);
      toast.error('Error al preparar animación', {
        autoClose: 1000,
        position: "top-right"
      });
    }
  };
  
  const handleAnimationComplete = () => {
    setIsAnimating(false);
    toast.success('¡Producto agregado al carrito!', {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      className: "bg-green-500"
    });
  };

  const handleBack = () => navigate(-1);
  const handleNextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % product!.images.length);
  const handlePrevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + product!.images.length) % product!.images.length);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const allRelatedProducts = [...sameCategoryProducts, ...otherCategoriesProducts];

  return (
    <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50">
      <CartAnimation 
        isActive={isAnimating}
        productImageSrc={product.images[currentImageIndex]}
        startPosition={animationStartPosition}
        endPosition={animationEndPosition}
        onComplete={handleAnimationComplete}
      />

      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 md:hidden"
      >
        <ChevronLeft className="h-6 w-6 text-gray-600" />
      </button>

      {/* Mobile View */}
      <div className="md:hidden p-4">
        <div className="relative mb-4">
          <div className="relative pt-[100%] overflow-hidden rounded-lg cursor-pointer" 
            onClick={() => setIsImageModalOpen(true)}>
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full shadow"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-1 rounded-full shadow"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white text-3xl"
            >
              &times;
            </button>
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="max-w-full max-h-full"
            />
          </div>
        )}

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-amber-600">
              {product.price.toFixed(2)} €
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-sm text-red-500">
                Quedan solo {product.stock} unidades
              </span>
            )}
          </div>

          <button
            ref={addToCartButtonRef}
            onClick={handleAddToCart}
            className="w-full bg-amber-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-700"
          >
            <ShoppingCart className="h-5 w-5" />
            Agregar al carrito
          </button>
        </div>

        {sameCategoryProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Productos similares</h2>
            <div className="flex overflow-x-auto pb-4 space-x-3 hide-scrollbar">
              {sameCategoryProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/dashboard/products/${product._id}`)}
                >
                  <div className="relative pt-[100%]">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-amber-600">
                      {product.price.toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.from(new Set(products.flatMap((p) => p.categories))).map(
          (category) => {
            const categoryProducts = products.filter((p) =>
              p.categories.includes(category)
            );
            return (
              <div key={category} className="mt-6">
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                <div className="flex overflow-x-auto pb-4 space-x-3 hide-scrollbar">
                  {categoryProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/dashboard/products/${product._id}`)}
                    >
                      <div className="relative pt-[100%]">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800 truncate">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-amber-600">
                          {product.price.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block p-4">
        <div className="flex gap-8">
          <div className="w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <div className="relative pt-[100%]">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={product.name}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>

              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-8 rounded-full ${
                        index === currentImageIndex
                          ? "bg-amber-600"
                          : "bg-zinc-700/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{product.description}</p>

              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-amber-600">
                  {product.price.toFixed(2)} €
                </span>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-lg text-red-500">
                    Quedan solo {product.stock} unidades
                  </span>
                )}
              </div>
            </div>

            <button
              ref={addToCartButtonRef}
              onClick={handleAddToCart}
              className="mt-auto w-full bg-amber-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-lg hover:bg-amber-700"
            >
              <ShoppingCart className="h-6 w-6" />
              Agregar al carrito
            </button>
          </div>
        </div>

        {allRelatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-4 gap-4">
              {allRelatedProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md"
                >
                  <div className="relative pt-[100%]">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-amber-600 mt-2">
                      {product.price.toFixed(2)} €
                    </p>
                    <button
                      onClick={() => navigate(`/dashboard/products/${product._id}`)}
                      className="mt-2 w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes cartBounce {
          0% { transform: scale(1); }
          20% { transform: scale(1.1); }
          40% { transform: scale(0.9); }
          60% { transform: scale(1.1); }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        .animate-cartBounce {
          animation: cartBounce 0.5s ease-in-out;
        }
        
        .toast-success {
          background-color: #10B981 !important;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;