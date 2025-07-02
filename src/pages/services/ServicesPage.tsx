import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { Search, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useServiceStore } from "../../store/serviceStore";

const ServicesPage = () => {
  const { services, categories, loading, error, fetchServices } =
    useServiceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const filtered = services.filter((service) => {
      const nameMatch = service.name.toLowerCase().includes(normalizedQuery);
      const descMatch = service.description.toLowerCase().includes(normalizedQuery);
      const categoryMatch = Array.isArray(service.categories) 
        ? service.categories.some(category => category.toLowerCase().includes(normalizedQuery))
        : String(service.categories || '').toLowerCase().includes(normalizedQuery);
      
      return nameMatch || descMatch || categoryMatch;
    });
    setFilteredServices(filtered);
  }, [searchQuery, services]);

  // Group services by category for mobile view (adaptado para categorías múltiples)
  const servicesByCategory = categories.reduce((acc, category) => {
    if (category.id === "all") return acc;

    const categoryServices = filteredServices.filter(service => 
      Array.isArray(service.categories)
        ? service.categories.includes(category.id)
        : service.categories === category.id
    );

    if (categoryServices.length > 0) {
      acc[category.id] = {
        name: category.name,
        services: categoryServices,
      };
    }

    return acc;
  }, {} as Record<string, { name: string; services: any[] }>);

  // Create a "Featured Services" category
  const featuredServices = {
    name: "Servicios Destacados",
    services: filteredServices.slice(0, 10),
  };

  // Create a "New Services" category
  const newServices = {
    name: "Nuevos Servicios",
    services: [...filteredServices].sort(() => 0.5 - Math.random()).slice(0, 8),
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/dashboard/services/${serviceId}`);
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
          <p className="text-red-600 font-medium mb-2">
            Error al cargar servicios
          </p>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchServices()}
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
            placeholder="Buscar servicios"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50"
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block px-4">
        <h1 className="text-2xl font-bold my-6">Nuestros Servicios</h1>

        {filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No se encontraron servicios que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredServices.map((service) => (
              <div
                key={service._id}
                onClick={() => handleServiceClick(service._id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
              >
                <div className="relative pt-[100%]">
                  <img
                    src={service.image || "https://placehold.co/300x200"}
                    alt={service.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-grow">
                  <h3 className="font-medium text-gray-800 truncate">
                    {service.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 h-10">
                    {service.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {service.price.toFixed(2)} €
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    {/* Mostrar las categorías como etiquetas, manejando tanto string como array */}
                    {Array.isArray(service.categories) 
                      ? service.categories.slice(0, 2).map((category: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, idx: Key | null | undefined) => (
                          <span 
                            key={idx} 
                            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 mr-1 mb-1 rounded-full"
                          >
                            {category}
                          </span>
                        ))
                      : service.categories && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 mr-1 mb-1 rounded-full">
                            {service.categories}
                          </span>
                        )
                    }
                    <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-1 mr-1 mb-1 rounded-full">
                      Puntos: {service.points}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceClick(service._id);
                  }}
                  className="mt-auto w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Reservar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile View Actualizado */}
      <div className="md:hidden">
        {filteredServices.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-600">
              No se encontraron servicios que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* New Services Section */}
            <div className="bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="font-bold text-lg">{newServices.name}</h2>
                <button className="text-amber-500 text-sm flex items-center hover:text-amber-600 transition-colors">
                  Ver más <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex overflow-x-auto pb-4 px-4 space-x-3 hide-scrollbar">
                {newServices.services.map((service) => (
                  <div
                    key={service._id}
                    className="flex-shrink-0 w-32"
                    onClick={() => handleServiceClick(service._id)}
                  >
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="relative pt-[100%]">
                        <img
                          src={service.image || "https://placehold.co/300x200"}
                          alt={service.name}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm text-gray-800 truncate">
                          {service.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-base font-bold">
                            {service.price.toFixed(2)} €
                          </p>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{service.duration}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Services Section */}
            <div className="bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="font-bold text-lg">{featuredServices.name}</h2>
                <button className="text-amber-500 text-sm flex items-center hover:text-amber-600 transition-colors">
                  Ver más <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex overflow-x-auto pb-4 px-4 space-x-3 hide-scrollbar">
                {featuredServices.services.map((service) => (
                  <div
                    key={service._id}
                    className="flex-shrink-0 w-32"
                    onClick={() => handleServiceClick(service._id)}
                  >
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="relative pt-[100%]">
                        <img
                          src={service.image || "https://placehold.co/300x200"}
                          alt={service.name}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm text-gray-800 truncate">
                          {service.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-base font-bold">
                            {service.price.toFixed(2)} €
                          </p>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{service.duration}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Sections */}
            {Object.entries(servicesByCategory).map(
              ([categoryId, category]) => (
                <div key={categoryId} className="bg-white">
                  <div className="flex items-center justify-between px-4 py-3">
                    <h2 className="font-bold text-lg">{category.name}</h2>
                    <button className="text-amber-500 text-sm flex items-center hover:text-amber-600 transition-colors">
                      Ver más <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex overflow-x-auto pb-4 px-4 space-x-3 hide-scrollbar">
                    {category.services.map((service) => (
                      <div
                        key={service._id}
                        className="flex-shrink-0 w-32"
                        onClick={() => handleServiceClick(service._id)}
                      >
                        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="relative pt-[100%]">
                            <img
                              src={
                                service.image || "https://placehold.co/300x200"
                              }
                              alt={service.name}
                              className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <h3 className="font-medium text-sm text-gray-800 truncate">
                              {service.name}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {service.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-base font-bold">
                                {service.price.toFixed(2)} €
                              </p>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-xs">
                                  {service.duration}m
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
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

export default ServicesPage;