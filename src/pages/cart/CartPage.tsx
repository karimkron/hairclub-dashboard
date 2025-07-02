import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import Swal from "sweetalert2";

const CartPage = () => {
  const {
    cartItems,
    fetchCart,
    removeFromCart,
    confirmPickup,
    updateQuantity,
  } = useCartStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      await fetchCart();
      setIsLoading(false);
    };
    loadCart();
  }, [fetchCart]);

  const handleRemoveItem = async (itemId: string, productName: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      html: `¿Seguro que quieres eliminar <strong>${productName}</strong> del carrito?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "text-sm md:text-base",
        confirmButton: "px-4 py-2 text-sm md:text-base",
        cancelButton: "px-4 py-2 text-sm md:text-base",
      },
    });

    if (result.isConfirmed) {
      await removeFromCart(itemId);
    }
  };

  const handleConfirmAllItems = async () => {
    try {
      const pendingItems = cartItems.filter(item => item.status !== "confirmed");
      if (pendingItems.length === 0) {
        await Swal.fire("Info", "No hay productos pendientes para confirmar", "info");
        return;
      }

      const result = await Swal.fire({
        title: "¿Confirmar todos los pedidos?",
        text: "Estos artículos estarán listos para recoger en tu próxima visita",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, confirmar todos",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        // Confirmar cada artículo pendiente
        for (const item of pendingItems) {
          if (item.product && typeof item.product !== 'string' && item.product.stock >= item.quantity) {
            await confirmPickup(item._id);
          }
        }
        await Swal.fire("¡Éxito!", "Todos los pedidos disponibles han sido confirmados", "success");
        await fetchCart(); // Recargar el carrito
      }
    } catch (error) {
      console.error(error);
      await Swal.fire("Error", "No se pudieron confirmar todos los pedidos", "error");
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity);
      await fetchCart();
    } catch (error) {
      await Swal.fire("Error", "No se pudo actualizar la cantidad", "error");
    }
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (isLoading) {
    return (
      <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50 p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50 p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <Link
            to="/dashboard/products"
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-full inline-block"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="font-medium">
                Subtotal ({cartItems.length}{" "}
                {cartItems.length === 1 ? "producto" : "productos"})
              </h2>
              <span className="text-xl font-bold">{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleConfirmAllItems}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-full mr-2"
              >
                Confirmar pedidos
              </button>
              <Link
                to="/dashboard/pickups"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-full"
              >
                Ver pedidos confirmados
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {cartItems.filter(item => item.status !== "confirmed").map((item) => {
              if (!item.product || typeof item.product === "string")
                return null;

              return (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="w-24 h-24 flex-shrink-0 mx-auto md:mx-0">
                    <img
                      src={item.product.mainImage || "/default-product.png"}
                      alt={item.product.name || "Producto sin nombre"}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="font-medium text-lg">
                        {item.product.name}
                      </h3>
                      {item.product.brand && (
                        <p className="text-sm text-gray-500">
                          Marca: {item.product.brand}
                        </p>
                      )}
                    </div>

                    <div className="mb-2">
                      {item.product.stock > 0 ? (
                      item.product.stock < 6 ? (
                        <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        Solo quedan {item.product.stock} unidades
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        En stock
                        </span>
                      )
                      ) : (
                      <span className="flex items-center gap-1 text-sm font-bold text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        Sin stock
                      </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                        <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                          handleUpdateQuantity(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="p-2"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="px-4 py-2 border-x">
                          {item.quantity}
                        </span>
                        <button
                          onClick={async () => {
                          if (item.product.stock <= item.quantity) {
                            await Swal.fire("Info", "No queda más stock", "info");
                          } else {
                            handleUpdateQuantity(item._id, item.quantity + 1);
                          }
                          }}
                          className="p-2"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        </div>

                        <button
                        onClick={() =>
                          handleRemoveItem(item._id, item.product.name)
                        }
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 text-base"
                        >
                        <Trash2 className="h-5 w-5" />
                        <span>Eliminar</span>
                        </button>

                        {item.status !== "confirmed" ? (
                        <button
                          onClick={() => confirmPickup(item._id)}
                          className="flex items-center gap-1 text-base text-amber-600 hover:text-amber-700"
                          disabled={item.product.stock < item.quantity}
                        >
                          <CheckCircle className="h-5 w-5" />
                          <span className="hidden md:inline">
                          Confirmar pedido
                          </span>
                        </button>
                        ) : (
                        <span className="flex items-center gap-1 text-base text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="hidden md:inline">
                          Pendiente de recoger
                          </span>
                        </span>
                        )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-bold">
                      {(item.product.price || 0).toFixed(2)} €
                    </span>
                    <p className="text-sm text-gray-500">
                      ({item.quantity}{" "}
                      {item.quantity === 1 ? "unidad" : "unidades"}:{" "}
                      {((item.product.price || 0) * item.quantity).toFixed(2)}{" "}
                      €)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/dashboard/products"
              className="text-amber-600 hover:text-amber-700 hover:underline inline-block"
            >
              Ver más productos
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
