// src/pages/appointments/AppointmentHistoryPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, CheckCircle, XCircle, Filter, RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../services/api';

// Definir la interfaz de Appointment con los campos necesarios
interface Appointment {
  _id: string;
  date: string;
  time: string;
  totalDuration: number;
  status: string;
  services: any[]; // Podemos definirlo más específicamente si es necesario
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  cancellationReason?: string;
}

const AppointmentHistoryPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('completed,cancelled');
  const [searchQuery] = useState('');

  const fetchAppointmentHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Hacemos directamente la petición HTTP para asegurarnos de que funciona
      const response = await api.get('/api/appointments/user', {
        params: {
          status: statusFilter // Obtenemos citas completadas o canceladas
        }
      });
      
      if (Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        console.error('La respuesta no es un array:', response.data);
        setAppointments([]);
        setError('El formato de datos recibido no es válido');
      }
    } catch (err) {
      console.error('Error fetching appointment history:', err);
      setError('No se pudo cargar el historial de citas. Por favor, intenta de nuevo más tarde.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentHistory();
  }, [statusFilter]); // Se vuelve a cargar cuando cambia el filtro de estado

  // Filtrar citas según búsqueda y estado
  const filteredAppointments = appointments.filter(appointment => {
    // Primero aplicamos el filtro de estado
    if (!statusFilter.split(',').includes(appointment.status)) {
      return false;
    }

    // Luego aplicamos el filtro de búsqueda
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Buscar en nombres de servicios
    const serviceMatch = Array.isArray(appointment.services) && 
      appointment.services.some(service => 
        typeof service === 'object' && 
        'name' in service && 
        service.name?.toLowerCase().includes(query)
      );
    
    // Buscar en fecha
    const dateMatch = format(new Date(appointment.date), 'dd/MM/yyyy').includes(query);
    
    // Buscar en hora
    const timeMatch = appointment.time.toLowerCase().includes(query);
    
    return serviceMatch || dateMatch || timeMatch;
  });

  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'EEEE, d MMMM yyyy', { locale: es });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="pt-14">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Historial de Citas</h1>
              <p className="text-gray-600">Revisa todas tus citas pasadas</p>
            </div>
            <button 
              onClick={fetchAppointmentHistory}
              className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto pt-2 px-6">
        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="completed,cancelled">Todas</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex">
              <span>{error}</span>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay historial de citas</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'completed,cancelled'
                ? 'No tienes citas pasadas en tu historial.'
                : statusFilter === 'completed'
                ? 'No tienes citas completadas en tu historial.'
                : 'No tienes citas canceladas en tu historial.'}
            </p>
            <button
              onClick={() => navigate('/dashboard/services')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Reservar una cita
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6">
                  <div className="flex items-start gap-2">
                    {/* Main content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <h3 className="font-medium text-gray-900 mt-1">
                            {formatAppointmentDate(appointment.date)}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      
                      <div className="text-gray-600">
                        <p className="text-sm">Servicios:</p>
                        <ul className="text-sm mt-1">
                          {Array.isArray(appointment.services) &&
                            appointment.services.map((service: any, index: number) => (
                              <li key={index} className="inline-block mr-2">
                                {typeof service === 'object' && service.name
                                  ? service.name
                                  : 'Servicio no disponible'}
                                {index < (appointment.services as any[]).length - 1 && ','}
                              </li>
                            ))}
                        </ul>
                      </div>
                      
                      {appointment.cancellationReason && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          <strong>Razón de cancelación:</strong> {appointment.cancellationReason}
                        </div>
                      )}
                    </div>
                     {/* Status icon */}
                     <div className="rounded-full p-2 bg-gray-100 flex-shrink-0">
                      {getStatusIcon(appointment.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistoryPage;