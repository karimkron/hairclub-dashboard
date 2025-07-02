import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, X } from 'lucide-react';
import { useServiceStore } from '../../../store/serviceStore';
import { useAppointmentStore } from '../../../store/appointment.store';

// Loading Skeleton Component
const ServiceDetailSkeleton = () => (
  <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50 animate-pulse">
    <div className="p-4 md:flex md:gap-8">
      <div className="md:w-1/3">
        <div className="relative pt-[80%] bg-gray-300 rounded-xl"></div>
      </div>
      
      <div className="md:w-2/3 mt-4 md:mt-0">
        <div className="h-10 bg-gray-300 mb-4 rounded w-3/4"></div>
        <div className="h-6 bg-gray-300 mb-6 rounded w-full"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        </div>
        
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
        
        <div className="h-12 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  </div>
);

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { services, categories, fetchServices } = useServiceStore();
  const { addService } = useAppointmentStore();
  
  const [service, setService] = useState<any>(null);
  const [sameCategoryServices, setSameCategoryServices] = useState<any[]>([]);
  const [otherCategoriesServices, setOtherCategoriesServices] = useState<{ [key: string]: any[] }>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        window.scrollTo(0, 0);
        setIsLoading(true);
        
        // Attempt to fetch services if not loaded
        if (services.length === 0) {
          await fetchServices();
        }

        // Check local storage first
        const storedServiceData = localStorage.getItem('serviceDetailPageData');
        let parsedStoredData = null;
        
        try {
          parsedStoredData = storedServiceData ? JSON.parse(storedServiceData) : null;
        } catch (parseError) {
          console.error('Error parsing stored service data:', parseError);
        }

        // Find current service
        let currentService = services.find(s => s._id === serviceId);

        // If not found in current services, try stored data
        if (!currentService && parsedStoredData) {
          currentService = parsedStoredData.service;
        }

        // If still no service, throw error
        if (!currentService) {
          throw new Error('Service not found');
        }

        // Get service category or categories (handling both array and string)
        const serviceCategories = Array.isArray(currentService.categories) 
          ? currentService.categories 
          : [currentService.category || 'Sin categoría'];

        // Prepare related services
        const sameCategory = services.length > 0 
          ? services.filter(s => {
              // Check if the service shares any category with current service
              const sCategories = Array.isArray(s.categories) 
                ? s.categories 
                : [s.category || 'Sin categoría'];
              return serviceCategories.some(cat => sCategories.includes(cat)) && s._id !== currentService._id;
            })
          : (parsedStoredData?.sameCategoryServices || []);

        // Create an object with services grouped by all available categories
        const allCategoriesServices: { [key: string]: any[] } = {};
        categories
          .filter(cat => cat.id !== 'all')
          .forEach(category => {
            // Get services for this category
            const categoryServices = services.filter(s => {
              if (Array.isArray(s.categories)) {
                return s.categories.includes(category.id) && s._id !== currentService._id;
              } else {
                return s.category === category.id && s._id !== currentService._id;
              }
            });
            
            if (categoryServices.length > 0) {
              allCategoriesServices[category.id] = categoryServices;
            }
          });

        // Update state
        setService(currentService);
        setSameCategoryServices(sameCategory);
        setOtherCategoriesServices(allCategoriesServices);

        // Store data for page reload
        localStorage.setItem('serviceDetailPageData', JSON.stringify({
          service: currentService,
          sameCategoryServices: sameCategory,
          otherCategoriesServices: allCategoriesServices
        }));
        
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setIsLoading(false);
      }
    };

    // If services are not loaded, fetch them first
    if (services.length === 0) {
      fetchServices().then(loadData);
    } else {
      loadData();
    }
  }, [serviceId, services, navigate, fetchServices, categories]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookService = () => {
    if (service) {
      addService(service);
      navigate('/dashboard/appointments');
    }
  };

  const handleServiceClick = (id: string) => {
    navigate(`/dashboard/services/${id}`);
    window.scrollTo(0, 0);
  };

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/dashboard/services')}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700"
          >
            Volver a Servicios
          </button>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  // Get service categories
  const serviceCategories = Array.isArray(service.categories) 
    ? service.categories 
    : [service.category || 'Sin categoría'];

  return (
    <div className="pt-16 pb-20 md:pt-20 lg:pb-0 bg-gray-50">
      {/* Show full image modal */}
      {showFullImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 left-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={service.image || 'https://placehold.co/300x200'} 
            alt={service.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      <button 
        onClick={handleBack}
        className="fixed top-3 left-4 z-40 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 md:hidden"
      >
        <ChevronLeft className="h-6 w-6 text-gray-600" />
      </button>

      {/* Mobile View */}
      <div className="md:hidden p-4">
        {/* Encabezado */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{service.name}</h1>
          <p className="text-gray-600">{service.description}</p>
        </div>

        {/* Imagen del servicio (clickable) */}
        <div 
          className="relative pt-[70%] mb-4 cursor-pointer"
          onClick={() => setShowFullImage(true)}
        >
          <img 
            src={service.image || 'https://placehold.co/300x200'} 
            alt={service.name}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-300">
            <span className="opacity-0 hover:opacity-100 text-white font-medium">Ver imagen</span>
          </div>
        </div>
        
        {/* Detalles del servicio */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold text-gray-900">{service.price.toFixed(2)} €</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-600">{service.duration} min</span>
            </div>
          </div>
          
          {/* Categorías del servicio */}
          <div className="mb-3 flex flex-wrap gap-2">
            {serviceCategories.map((category: string, index: number) => (
              <span key={index} className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                {category}
              </span>
            ))}
            <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
              Puntos: {service.points}
            </span>
          </div>
          
          <button 
            onClick={handleBookService}
            className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            Reservar cita
          </button>
        </div>

        {/* Servicios de la misma categoría */}
        {sameCategoryServices.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Misma categoría</h2>
            <div className="flex overflow-x-auto pb-4 space-x-3 hide-scrollbar">
              {sameCategoryServices.map(service => (
                <div 
                  key={service._id}
                  className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => handleServiceClick(service._id)}
                >
                  <div className="relative pt-[100%]">
                    <img
                      src={service.image || 'https://placehold.co/300x200'}
                      alt={service.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">{service.name}</h3>
                    <p className="text-sm text-gray-500 truncate mb-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{service.price.toFixed(2)} €</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs">{service.duration}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todas las categorías de servicios */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Todas las categorías</h2>
          <div className="flex overflow-x-auto pb-4 space-x-3 hide-scrollbar">
            {categories
              .filter(cat => cat.id !== 'all')
              .map(category => (
                <div 
                  key={category.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                    serviceCategories.includes(category.id) 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => navigate(`/dashboard/services?category=${category.id}`)}
                >
                  {category.name}
                </div>
              ))}
          </div>
        </div>

        {/* Servicios por categoría */}
        {Object.entries(otherCategoriesServices).map(([category, services]) => (
          <div key={category} className="mt-6">
            <h2 className="text-xl font-bold mb-4">{category}</h2>
            <div className="flex overflow-x-auto pb-4 space-x-3 hide-scrollbar">
              {services.map(service => (
                <div
                  key={service._id}
                  className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                  onClick={() => handleServiceClick(service._id)}
                >
                  <div className="relative pt-[100%]">
                    <img
                      src={service.image || 'https://placehold.co/300x200'}
                      alt={service.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">{service.name}</h3>
                    <p className="text-sm text-gray-500 truncate mb-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{service.price.toFixed(2)} €</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs">{service.duration}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block p-4">
        <div className="flex gap-8">
          <div className="w-1/3">
            <div 
              className="relative pt-[80%] rounded-xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setShowFullImage(true)}
            >
              <img 
                src={service.image || 'https://placehold.co/300x200'} 
                alt={service.name}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-300">
                <span className="opacity-0 hover:opacity-100 text-white font-medium">Ver imagen completa</span>
              </div>
            </div>
          </div>
          
          <div className="w-2/3">
            <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{service.description}</p>
            
            {/* Categorías del servicio */}
            <div className="mb-4 flex flex-wrap gap-2">
              {serviceCategories.map((category: string, index: number) => (
                <span key={index} className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-gray-900">{service.price.toFixed(2)} €</span>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{service.duration} minutos</span>
              </div>
            </div>
            
            <div className="mb-6">
              <span className="inline-block bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                Puntos: {service.points}
              </span>
            </div>
            
            <button 
              onClick={handleBookService}
              className="w-full bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition-colors text-lg"
            >
              Reservar cita
            </button>
          </div>
        </div>

        {/* Todas las categorías */}
        <div className="mt-8 bg-white p-4 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Categorías disponibles</h2>
          <div className="flex flex-wrap gap-3">
            {categories
              .filter(cat => cat.id !== 'all')
              .map(category => (
                <div 
                  key={category.id}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    serviceCategories.includes(category.id) 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => navigate(`/dashboard/services?category=${category.id}`)}
                >
                  {category.name}
                </div>
              ))}
          </div>
        </div>

        {/* Servicios relacionados */}
        <div className="mt-12">
          {sameCategoryServices.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Servicios de la misma categoría</h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {sameCategoryServices.map(service => (
                  <div
                    key={service._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md"
                  >
                    <div 
                      className="relative pt-[70%] cursor-pointer"
                      onClick={() => handleServiceClick(service._id)}
                    >
                      <img
                        src={service.image || 'https://placehold.co/300x200'}
                        alt={service.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate">{service.name}</h3>
                      <p className="text-gray-500 text-sm truncate mb-3">{service.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold">{service.price.toFixed(2)} €</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm">{service.duration}m</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleServiceClick(service._id)}
                        className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Servicios por categoría */}
          {Object.entries(otherCategoriesServices).map(([category, services]) => (
            <div key={category} className="mt-8">
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <div className="grid grid-cols-3 gap-4">
                {services.map(service => (
                  <div
                    key={service._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md"
                  >
                    <div 
                      className="relative pt-[70%] cursor-pointer"
                      onClick={() => handleServiceClick(service._id)}
                    >
                      <img
                        src={service.image || 'https://placehold.co/300x200'}
                        alt={service.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate">{service.name}</h3>
                      <p className="text-gray-500 text-sm truncate mb-3">{service.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold">{service.price.toFixed(2)} €</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm">{service.duration}m</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleServiceClick(service._id)}
                        className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                      >
                        Reservar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar styles */}
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

export default ServiceDetailPage;