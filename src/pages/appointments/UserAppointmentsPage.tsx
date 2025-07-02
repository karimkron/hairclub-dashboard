// src/pages/appointments/UserAppointmentsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { bookingService } from '../../services/booking.service';
import Swal from 'sweetalert2';
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
}

const UserAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Modificamos el parámetro status para incluir los tres estados requeridos
      const response = await api.get('/api/appointments/user', {
        params: {
          status: 'pending,confirmed,needsRescheduling'
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
      console.error('Error fetching appointments:', err);
      setError('No se pudieron cargar las citas. Por favor, intenta de nuevo más tarde.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (appointmentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegación al hacer clic en el botón
    
    try {
      const result = await Swal.fire({
        title: '¿Cancelar cita?',
        text: '¿Estás seguro de que deseas cancelar esta cita?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, mantener'
      });

      if (result.isConfirmed) {
        const response = await bookingService.cancelAppointment(appointmentId);
        
        if (response) {
          Swal.fire(
            '¡Cancelada!',
            'Tu cita ha sido cancelada.',
            'success'
          );
          
          // Recargar las citas después de cancelar
          fetchAppointments();
        }
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
      Swal.fire(
        'Error',
        'No se pudo cancelar la cita. Por favor, intenta de nuevo más tarde.',
        'error'
      );
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, d MMMM yyyy', { locale: es });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Pendiente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmada
          </span>
        );
      case 'needsRescheduling':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Necesita Reprogramación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="pt-11">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
              <p className="text-gray-600">Gestiona tus citas programadas</p>
            </div>
            <button 
              onClick={fetchAppointments}
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
      <div className="max-w-7xl mx-auto px-3 pt-2">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAppointments}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Reintentar
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas programadas</h3>
            <p className="text-gray-600 mb-6">
              No tienes citas próximas en este momento.
            </p>
            <button
              onClick={() => navigate('/dashboard/services')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Reservar una cita
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left section - Date and Time */}
                    <div className="flex gap-4">
                      <div className="hidden md:block bg-amber-50 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 md:hidden">
                          <Calendar className="h-5 w-5 text-amber-600" />
                          <h3 className="font-medium text-gray-900">
                            {formatAppointmentDate(appointment.date)}
                          </h3>
                        </div>
                        <h3 className="hidden md:block font-medium text-gray-900">
                          {formatAppointmentDate(appointment.date)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{appointment.time}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{appointment.totalDuration} min</span>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    </div>

                    {/* Right section - Services and Actions */}
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="md:text-right">
                        <h4 className="font-medium text-gray-900">Servicios:</h4>
                        <ul className="text-gray-600 text-sm mt-1">
                          {Array.isArray(appointment.services) &&
                            appointment.services.map((service: any, index: number) => (
                              <li key={index}>
                                {typeof service === 'object' && service.name
                                  ? service.name
                                  : 'Servicio no disponible'}
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Botón de Cancelar */}
                        <button
                          onClick={(e) => handleCancelAppointment(appointment._id, e)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
                        >
                          Cancelar cita
                        </button>
                      </div>
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

export default UserAppointmentsPage;