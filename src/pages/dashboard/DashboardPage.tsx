import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  ShoppingBag, 
  BookOpen, 
  ChevronRight,
  ChevronLeft,
  Heart,
  Droplets,
  Zap,
  Brush
} from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import { useServiceStore } from '../../store/serviceStore';
import { useProductsStore } from '../../store/productsStore';
import { useCartStore } from '../../store/cartStore';
import bookingService from '../../services/booking.service';

// Definición de tipos
interface Appointment {
  _id: string;
  date: string;
  time: string;
  services: any[];
  status: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  mainImage: string;
  description: string;
}

interface AvailableDay {
  date: Date;
  availableSlots: number;
  dayName: string;
}

// Componente de Skeleton Loader para carga
const SkeletonLoader = ({ variant }: { variant: 'card' | 'appointment' | 'product' }) => {
  if (variant === 'card') {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse flex flex-col h-40">
        <div className="w-10 h-10 rounded-full bg-gray-200 mb-3"></div>
        <div className="h-5 bg-gray-200 w-1/2 mb-2 rounded"></div>
        <div className="h-4 bg-gray-200 w-3/4 mb-4 rounded"></div>
        <div className="h-8 bg-gray-200 w-1/3 mt-auto rounded"></div>
      </div>
    );
  } else if (variant === 'appointment') {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
        <div className="flex justify-between mb-3">
          <div className="h-5 bg-gray-200 w-1/2 rounded"></div>
          <div className="h-5 bg-gray-200 w-1/4 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/2 mb-4 rounded"></div>
        <div className="flex justify-end">
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex-shrink-0 w-36 md:w-44 bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="h-36 md:h-44 bg-gray-200"></div>
        <div className="p-3">
          <div className="h-5 bg-gray-200 w-3/4 mb-2 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/2 mb-3 rounded"></div>
          <div className="h-8 bg-gray-200 w-full rounded"></div>
        </div>
      </div>
    );
  }
};

// Consejos de cuidado capilar profesionales
const hairCareTips = [
  {
    id: '1',
    title: 'El impacto del agua dura en tu cabello',
    content: 'El agua dura (rica en minerales) puede debilitar el cabello. Un filtro de ducha o un tratamiento clarificante mensual puede eliminar estos depósitos minerales y restaurar el brillo natural del cabello.',
    icon: Droplets
  },
  {
    id: '2',
    title: 'La importancia del pH en tus productos',
    content: 'El cuero cabelludo sano tiene un pH de 4.5-5.5. Utiliza productos con pH equilibrado para mantener la barrera protectora del cuero cabelludo y prevenir la deshidratación y la irritación.',
    icon: Zap
  },
  {
    id: '3',
    title: 'Técnica correcta del cepillado',
    content: 'Cepillar desde las puntas hacia arriba, no desde la raíz, reduce la rotura. Usa un cepillo de cerdas naturales o un peine de madera para distribuir los aceites naturales y minimizar la electricidad estática.',
    icon: Brush
  }
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, fetchProfile } = useUserStore();
  const { services, fetchServices } = useServiceStore();
  const { products, fetchProducts } = useProductsStore();
  const { addToCart } = useCartStore();
  
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  
  // Product carousel controls
  const productContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Cargar datos del perfil si no existen
        if (!profile) {
          await fetchProfile();
        }
        
        // Cargar servicios y productos si no existen
        if (services.length === 0) {
          await fetchServices();
        }
        
        if (products.length === 0) {
          await fetchProducts();
        }
        
        // Obtener citas del usuario
        const appointmentsResponse = await bookingService.getAppointments('pending,confirmed') as Appointment[];
        setAppointments(appointmentsResponse);
        
        // Productos recomendados (simulación basada en productos disponibles)
        if (products.length > 0) {
          // En un caso real, esto se basaría en preferencias del usuario o historial
          const recommended = [...products]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);
          setRecommendedProducts(recommended);
        }
        
        // Disponibilidad de los próximos días (simulación)
        const nextDays: AvailableDay[] = [];
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        for (let i = 0; i < 3; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          // El domingo y el último día tendrían menos slots disponibles en este ejemplo
          const availableSlots = 
            date.getDay() === 0 ? 2 : 
            i === 2 ? 3 : 
            Math.floor(5 + Math.random() * 6);
          
          nextDays.push({
            date,
            availableSlots,
            dayName: dayNames[date.getDay()]
          });
        }
        setAvailableDays(nextDays);
        
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [fetchProfile, fetchServices, fetchProducts, profile, services.length, products.length]);
  
  // Controles para el carrusel de productos
  const scrollProducts = (direction: 'left' | 'right') => {
    if (productContainerRef.current) {
      const container = productContainerRef.current;
      const scrollAmount = direction === 'left' ? -250 : 250;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Manejar la adición de un producto al carrito
  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Próxima cita (primera en la lista)
  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="pt-14 overflow-x-hidden">
      {/* Banner de bienvenida */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-white">
              <h1 className="text-xl sm:text-2xl font-bold">¡Bienvenido, {profile?.name || 'Cliente'}!</h1>
              {nextAppointment ? (
                <p className="text-amber-100 text-sm sm:text-base">
                  Tu próxima cita es el {formatDate(nextAppointment.date)} a las {nextAppointment.time}
                </p>
              ) : (
                <p className="text-amber-100 text-sm sm:text-base">No tienes citas programadas</p>
              )}
            </div>
            <button 
              onClick={() => navigate('/dashboard/services')}
              className="px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm sm:text-base w-full md:w-auto"
            >
              Reservar Cita
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-4">
        {/* Enlaces rápidos */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {loading ? (
            // Skeleton loaders durante la carga
            Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} variant="card" />)
          ) : (
            <>
              <div 
                className="bg-white p-5 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/dashboard/appointments')}
              >
                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg w-fit mb-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">Reservar Cita</h3>
                <p className="text-gray-600 mb-4 text-sm">Programa tus próximos servicios</p>
                <div className="text-amber-600 flex items-center text-sm font-medium hover:underline">
                  Reservar ahora <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              <div 
                className="bg-white p-5 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/dashboard/my-appointments')}
              >
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg w-fit mb-3">
                  <Scissors className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">Mis Citas</h3>
                <p className="text-gray-600 mb-4 text-sm">Revisa y gestiona tus reservas</p>
                <div className="text-blue-600 flex items-center text-sm font-medium hover:underline">
                  Ver mis citas <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              <div 
                className="bg-white p-5 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/dashboard/products')}
              >
                <div className="p-3 bg-green-100 text-green-600 rounded-lg w-fit mb-3">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">Productos</h3>
                <p className="text-gray-600 mb-4 text-sm">Explora nuestra gama de productos</p>
                <div className="text-green-600 flex items-center text-sm font-medium hover:underline">
                  Ver productos <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg w-fit mb-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">Blog de Belleza</h3>
                <p className="text-gray-600 mb-4 text-sm">Consejos y tendencias actuales</p>
                <div className="text-purple-600 flex items-center text-sm font-medium hover:underline">
                  Leer artículos <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Próxima cita y disponibilidad (lado a lado en desktop, apiladas en móvil) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Próxima cita */}
          <div className="md:h-full">
            {loading ? (
              <SkeletonLoader variant="appointment" />
            ) : nextAppointment ? (
              <div className="bg-white p-5 rounded-lg border h-full">
                <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                  Próxima Cita
                </h2>
                <div className="border-l-4 border-amber-500 pl-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-1">
                    <h3 className="font-medium">{formatDate(nextAppointment.date)}</h3>
                    <span className="text-amber-600 font-medium">{nextAppointment.time}</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm">
                      Servicios: {nextAppointment.services.map((service: any) => 
                        typeof service === 'object' ? service.name : 'Servicio'
                      ).join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">Con: Carlos M.</p>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={() => navigate(`/dashboard/my-appointments`)}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      Modificar cita
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-lg border h-full">
                <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-amber-600" />
                  Sin Citas Programadas
                </h2>
                <p className="text-gray-600 mb-4 text-sm">No tienes citas programadas en este momento.</p>
                <button
                  onClick={() => navigate('/dashboard/services')}
                  className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm"
                >
                  Reservar Ahora
                </button>
              </div>
            )}
          </div>

          {/* Horarios disponibles */}
          <div className="md:h-full">
            <div className="bg-white p-5 rounded-lg border h-full">
              <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-600" />
                Disponibilidad Próximos Días
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-100 p-3 rounded-lg animate-pulse h-24"></div>
                  ))
                ) : (
                  availableDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg text-center ${
                        day.availableSlots > 0 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <p className="font-medium text-sm">{day.dayName}</p>
                      <p className="text-xs text-gray-600">
                        {day.date.getDate()}/{day.date.getMonth() + 1}
                      </p>
                      <p className={`mt-2 text-xs font-medium ${
                        day.availableSlots > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {day.availableSlots > 0 
                          ? `${day.availableSlots} horas libres` 
                          : 'Completo'}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/dashboard/appointments')}
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                >
                  Ver disponibilidad completa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Productos recomendados - Carrusel */}
        <div className="bg-white p-5 rounded-lg border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center">
              <Heart className="h-5 w-5 mr-2 text-amber-600" />
              Recomendados 
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => scrollProducts('left')}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                aria-label="Desplazar a la izquierda"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => scrollProducts('right')}
                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                aria-label="Desplazar a la derecha"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div 
            ref={productContainerRef}
            className="flex overflow-x-auto pb-4 -mx-2 px-2 gap-3 hide-scrollbar"
          >
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <SkeletonLoader key={i} variant="product" />
              ))
            ) : recommendedProducts.length > 0 ? (
              recommendedProducts.map(product => (
                <div 
                  key={product._id}
                  className="flex-shrink-0 w-36 md:w-44 bg-white rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div 
                    className="h-36 md:h-44 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/dashboard/products/${product._id}`)}
                  >
                    <img 
                      src={product.mainImage || "https://placehold.co/200x200?text=Producto"} 
                      alt={product.name}
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate text-sm">{product.name}</h3>
                    <p className="text-amber-600 font-bold mt-1 mb-2 text-sm">{product.price.toFixed(2)} €</p>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="w-full bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors text-xs flex items-center justify-center"
                    >
                      <ShoppingBag className="h-3 w-3 mr-1" />
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 py-4 text-sm">No hay productos recomendados disponibles</p>
            )}
          </div>
          
          <div className="text-center mt-3">
            <button
              onClick={() => navigate('/dashboard/products')}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm"
            >
              Ver todos los productos
            </button>
          </div>
        </div>

        {/* Consejos de cuidado capilar */}
        <div className="bg-white p-5 rounded-lg border">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-amber-600" />
            Consejos de Cuidado Capilar
          </h2>
          <div className="space-y-4">
            {hairCareTips.map((tip) => (
              <div key={tip.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-full flex-shrink-0 mt-1">
                    <tip.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{tip.title}</h3>
                    <p className="text-gray-600 text-xs mt-1">{tip.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm">
              Visitar nuestro blog
            </button>
          </div>
        </div>
      </div>

      {/* CSS personalizado para ocultar scrollbars */}
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

export default DashboardPage;