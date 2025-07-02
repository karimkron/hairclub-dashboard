// Crear archivo: src/pages/pickups/PickupsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import Swal from "sweetalert2";

interface Pickup {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    mainImage?: string;
    brand?: string;
  };
  quantity: number;
}

const PickupsPage = () => {
  const { fetchPickups, cancelPickup, cancelAllPickups } = useCartStore();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPickups = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPickups();
        setPickups(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPickups();
  }, [fetchPickups]);

  const handleCancelPickup = async (pickupId: string, productName: string) => {
    const result = await Swal.fire({
      title: "¿Cancelar pedido?",
      html: `¿Seguro que quieres cancelar el pedido de <strong>${productName}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No, mantener"
    });

    if (result.isConfirmed) {
      try {
        await cancelPickup(pickupId);
        const updatedPickups = pickups.filter(pickup => pickup._id !== pickupId);
        setPickups(updatedPickups);
        await Swal.fire("Cancelado", "El pedido ha sido cancelado", "success");
      } catch (error) {
        console.error(error);
        await Swal.fire("Error", "No se pudo cancelar el pedido", "error");
      }
    }
  };

  const handleCancelAllPickups = async () => {
    if (pickups.length === 0) {
      await Swal.fire("Info", "No hay pedidos para cancelar", "info");
      return;
    }

    const result = await Swal.fire({
      title: "¿Cancelar todos los pedidos?",
      text: "Esta acción devolverá todos los productos a tu carrito",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar todos",
      cancelButtonText: "No, mantener"
    });

    if (result.isConfirmed) {
      try {
        await cancelAllPickups();
        setPickups([]);
        await Swal.fire("Cancelados", "Todos los pedidos han sido cancelados", "success");
      } catch (error) {
        console.error(error);
        await Swal.fire("Error", "No se pudieron cancelar todos los pedidos", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50 p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50 p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos Confirmados</h1>
        <Link
          to="/dashboard/cart"
          className="flex items-center text-amber-600 hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al carrito
        </Link>
      </div>

      {pickups.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No tienes pedidos confirmados</p>
          <Link
            to="/dashboard/cart"
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-full inline-block"
          >
            Ir al carrito
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="font-medium">
                Pedidos pendientes de recoger ({pickups.length})
              </h2>
              <button
                onClick={handleCancelAllPickups}
                className="text-red-600 hover:text-red-700 font-medium flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Cancelar todos
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {pickups.map((pickup) => (
              <div
                key={pickup._id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="md:flex items-center">
                  <div className="w-24 h-24 flex-shrink-0 mx-auto md:mx-0 mb-3 md:mb-0">
                    <img
                      src={pickup.product.mainImage || "/default-product.png"}
                      alt={pickup.product.name || "Producto sin nombre"}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 md:ml-4">
                    <div className="mb-2">
                      <h3 className="font-medium text-lg">
                        {pickup.product.name}
                      </h3>
                      {pickup.product.brand && (
                        <p className="text-sm text-gray-500">
                          Marca: {pickup.product.brand}
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">
                      Cantidad: {pickup.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: {(pickup.product.price * pickup.quantity).toFixed(2)} €
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Listo para recoger
                    </p>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={() => handleCancelPickup(pickup._id, pickup.product.name)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Cancelar pedido</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PickupsPage;