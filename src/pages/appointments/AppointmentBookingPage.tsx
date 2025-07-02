import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Scissors,
  Plus,
  Calendar,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useAppointmentStore } from "../../store/appointment.store";
import { bookingService } from "../../services/booking.service";
import {
  format,
  parseISO,
  addDays,
  isPast,
  isSameDay,
  isToday,
  parse,
  addMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DayAvailability {
  date: Date;
  isOpen: boolean;
  slots: string[];
  closingTime?: string; // Para guardar el horario de cierre
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointment: {
    date: Date;
    time: string;
    services: any[];
    totalDuration: number;
    totalPrice: number;
  };


}

// Componente para mostrar errores
const ErrorAlert = ({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) => {
  return (
    <div className="rounded-md bg-red-50 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Confirmación
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 bg-amber-600 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Confirmar Reserva</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h4 className="font-medium text-gray-800 mb-4">
            Detalles de tu cita:
          </h4>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium">Fecha</p>
                <p className="text-gray-600">
                  {format(appointment.date, "EEEE, d MMMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium">Hora</p>
                <p className="text-gray-600">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Scissors className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium">Servicios</p>
                <ul className="text-gray-600">
                  {appointment.services.map((service, index) => (
                    <li key={index}>
                      {service.name} - {service.price.toFixed(2)} €
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium">Duración total</p>
                <p className="text-gray-600">
                  {appointment.totalDuration} minutos
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Precio Total:</p>
              <p className="text-xl font-bold text-amber-600">
                {appointment.totalPrice.toFixed(2)} €
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Confirmar Cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentBookingPage = () => {
  const navigate = useNavigate();
  const daysScrollRef = useRef<HTMLDivElement>(null);
  const timesScrollRef = useRef<HTMLDivElement>(null);

  const {
    selectedServices,
    selectedDate,
    selectedTime,
    setDate,
    setTime,
    removeService,
    clearAppointment,
  } = useAppointmentStore();

  const [availabilityData, setAvailabilityData] = useState<DayAvailability[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: addDays(new Date(), 60),
  });
  const [selectedDaySlots, setSelectedDaySlots] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [closingTimes, setClosingTimes] = useState<Map<string, string>>(
    new Map()
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calcular totales
  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.duration, 0),
    [selectedServices]
  );

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices]
  );

  // Scroll horizontal de días
  const scrollDays = (direction: "left" | "right") => {
    if (daysScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      daysScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Scroll horizontal de horas
  const scrollTimes = (direction: "left" | "right") => {
    if (timesScrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      timesScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Función para extraer los horarios de cierre
  const extractClosingTimes = (availability: any[]) => {
    const closingMap = new Map<string, string>();

    availability.forEach((day) => {
      // Buscar el último slot disponible para cada día
      if (day.slots && day.slots.length > 0) {
        const dateKey = day.date; // Fecha en formato YYYY-MM-DD

        // Encontrar el horario de cierre (último slot + duración de slot)
        const lastSlot = [...day.slots].sort((a, b) => {
          const timeA = parseInt(a.time.replace(":", ""));
          const timeB = parseInt(b.time.replace(":", ""));
          return timeB - timeA;
        })[0];

        // Guardamos el horario de cierre para este día
        if (lastSlot) {
          // Si el último slot es 19:30 y la duración normal es 30 min, el cierre es 20:00
          closingMap.set(dateKey, lastSlot.time);
        }
      }
    });

    return closingMap;
  };

  // Función para verificar si una cita cabe en el horario
  const validateAppointmentTime = (
    date: Date | null,
    time: string,
    duration: number
  ): { isValid: boolean; message: string | null } => {
    if (!date || !time || duration <= 0) {
      return { isValid: false, message: null };
    }

    const dateStr = format(date, "yyyy-MM-dd");
    const closingTime = closingTimes.get(dateStr);

    if (!closingTime) {
      return { isValid: true, message: null }; // Si no tenemos el horario de cierre, asumimos que está bien
    }

    // Convertimos la hora seleccionada y calculamos la hora de finalización
    const selectedTime = parse(time, "HH:mm", new Date());
    const endTime = addMinutes(selectedTime, duration);

    // Convertimos el horario de cierre
    const closingTimeObj = parse(closingTime, "HH:mm", new Date());

    // Calculamos el tiempo base para comparación
    const baseTimeEnding = endTime.getHours() * 60 + endTime.getMinutes();
    const baseTimeClosure =
      closingTimeObj.getHours() * 60 + closingTimeObj.getMinutes() + 30; // Añadimos 30 min a la última hora disponible

    if (baseTimeEnding > baseTimeClosure) {
      const expectedEndTime = format(endTime, "HH:mm");
      return {
        isValid: false,
        message: `Tu cita terminaría a las ${expectedEndTime}, pero el horario de atención finaliza a las ${closingTime}. Por favor, selecciona un horario anterior.`,
      };
    }

    return { isValid: true, message: null };
  };

  // Obtener y procesar disponibilidad
  useEffect(() => {
    const fetchAndProcessAvailability = async () => {
      setIsLoading(true);
      setError(null);
      setValidationError(null);

      try {
        const availability = await bookingService.getFullAvailability();

        if (!availability || availability.length === 0) {
          throw new Error("No se recibieron datos de disponibilidad válidos");
        }

        // Extraer los horarios de cierre para cada día
        const closingMap = extractClosingTimes(availability);
        setClosingTimes(closingMap);

        const processedData = availability.map((day) => ({
          date: parseISO(day.date),
          isOpen: day.isOpen,
          slots: day.slots
            .filter((slot: TimeSlot) => slot.available)
            .map((slot: TimeSlot) => slot.time),
          closingTime: closingMap.get(day.date),
        }));

        setAvailabilityData(processedData);

        if (processedData.length > 0) {
          const startDate = processedData[0].date;
          const endDate = processedData[processedData.length - 1].date;
          setDateRange({ start: startDate, end: endDate });
        }

        // Limpiar hora seleccionada si la fecha actual ya no es válida
        if (selectedDate) {
          const isDateValid = processedData.some(
            (day) => isSameDay(day.date, selectedDate) && day.isOpen
          );

          if (!isDateValid) {
            setDate(""); // Enviamos string vacío en lugar de null
            setTime("");
          } else if (selectedDate && selectedTime) {
            // Validar si la hora seleccionada + duración cabe en el horario
            const validation = validateAppointmentTime(
              selectedDate,
              selectedTime,
              totalDuration
            );
            if (!validation.isValid && validation.message) {
              setValidationError(validation.message);
              setTime(""); // Limpiar la hora si ya no es válida
            }
          }
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error("Error al obtener disponibilidad:", error);
        const errorMessage =
          error.response?.data?.message ||
          "No se pudo cargar la disponibilidad. Por favor, inténtalo de nuevo más tarde.";
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchAndProcessAvailability();

    // Limpiamos el estado al desmontar
    return () => {
      if (!submissionSuccess) {
        // No limpiamos si el usuario acaba de hacer una reserva exitosa
        // para mantener los datos para la página de confirmación
      }
    };
  }, [
    submissionSuccess,
    selectedDate,
    selectedTime,
    setDate,
    setTime,
    totalDuration,
  ]);

  // Filtrar slots para la fecha seleccionada y validar duración
  useEffect(() => {
    if (selectedDate) {
      const dayData = availabilityData.find((day) =>
        isSameDay(day.date, selectedDate)
      );

      if (dayData?.isOpen) {
        // Filtrar slots que permitan acomodar la duración total del servicio
        let validSlots = [...dayData.slots];

        if (totalDuration > 0) {
          // Si hay un tiempo de cierre, filtrar slots que no excedan ese tiempo
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          const closingTime = closingTimes.get(dateStr);

          if (closingTime) {
            validSlots = dayData.slots.filter((slotTime) => {
              const slotObj = parse(slotTime, "HH:mm", new Date());
              const endTime = addMinutes(slotObj, totalDuration);

              const closingTimeObj = parse(closingTime, "HH:mm", new Date());
              // Añadimos 30 min a la última hora disponible para dar margen
              const closingLimit = addMinutes(closingTimeObj, 30);

              return endTime <= closingLimit;
            });
          }
        }

        setSelectedDaySlots(validSlots);

        // Si la hora seleccionada ya no es válida, mostrar error
        if (selectedTime && !validSlots.includes(selectedTime)) {
          setValidationError(
            `La hora seleccionada (${selectedTime}) ya no es válida para la duración total de los servicios (${totalDuration} min).`
          );
          setTime("");
        }
      } else {
        setSelectedDaySlots([]);
        // Si la fecha seleccionada ya no está disponible, resetear
        if (dayData) {
          setDate(""); // Enviamos string vacío en lugar de null
        }
      }
    } else {
      setSelectedDaySlots([]);
    }
  }, [
    selectedDate,
    availabilityData,
    totalDuration,
    closingTimes,
    setDate,
    setTime,
    selectedTime,
  ]);

  // Manejar selección de fecha
  const handleDateSelect = useCallback(
    (date: Date) => {
      const dayData = availabilityData.find((day) => isSameDay(day.date, date));

      if (dayData?.isOpen) {
        setValidationError(null);
        setDate(date);

        // Filtrar slots válidos según la duración del servicio
        let validSlots = [...dayData.slots];

        if (totalDuration > 0) {
          const dateStr = format(date, "yyyy-MM-dd");
          const closingTime = closingTimes.get(dateStr);

          if (closingTime) {
            validSlots = dayData.slots.filter((slotTime) => {
              const slotObj = parse(slotTime, "HH:mm", new Date());
              const endTime = addMinutes(slotObj, totalDuration);

              const closingTimeObj = parse(closingTime, "HH:mm", new Date());
              // Añadimos 30 min a la última hora disponible para dar margen
              const closingLimit = addMinutes(closingTimeObj, 30);

              return endTime <= closingLimit;
            });
          }
        }

        setSelectedDaySlots(validSlots);

        if (validSlots.length === 0 && totalDuration > 0) {
          const dateStr = format(date, "yyyy-MM-dd");
          const closingTime = closingTimes.get(dateStr);
          setValidationError(
            `No hay horarios disponibles para servicios con duración de ${totalDuration} minutos${
              closingTime ? ` (el local cierra a las ${closingTime})` : ""
            }.`
          );
        }

        setTime("");
      } else {
        toast.error("Este día no está disponible para citas");
      }
    },
    [availabilityData, setDate, setTime, totalDuration, closingTimes]
  );

  // Manejar selección de hora
  const handleTimeSelect = useCallback(
    (time: string) => {
      // Validar si la hora seleccionada + duración cabe en el horario
      if (selectedDate) {
        const validation = validateAppointmentTime(
          selectedDate,
          time,
          totalDuration
        );

        if (!validation.isValid && validation.message) {
          setValidationError(validation.message);
          return;
        }

        // Si pasa la validación, actualizar la hora seleccionada
        setValidationError(null);
        setTime(time);
      }
    },
    [selectedDate, totalDuration, setTime]
  );

  // Generar rango de fechas
  const generateDateRange = useCallback(() => {
    if (!availabilityData.length) return [];

    const dates = [];
    let currentDate = new Date(dateRange.start);

    while (currentDate <= dateRange.end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [availabilityData, dateRange]);

  // Obtener estado del día
  const getDayStatus = useCallback(
    (date: Date) => {
      const dayData = availabilityData.find((day) => isSameDay(day.date, date));

      // Verificar si hay slots válidos considerando la duración
      let hasValidSlots = false;

      if (dayData?.slots.length && totalDuration > 0) {
        const dateStr = format(date, "yyyy-MM-dd");
        const closingTime = closingTimes.get(dateStr);

        if (closingTime) {
          hasValidSlots = dayData.slots.some((slotTime) => {
            const slotObj = parse(slotTime, "HH:mm", new Date());
            const endTime = addMinutes(slotObj, totalDuration);

            const closingTimeObj = parse(closingTime, "HH:mm", new Date());
            // Añadimos 30 min a la última hora disponible
            const closingLimit = addMinutes(closingTimeObj, 30);

            return endTime <= closingLimit;
          });
        } else {
          hasValidSlots = dayData.slots.length > 0;
        }
      } else {
        hasValidSlots = (dayData?.slots.length || 0) > 0;
      }

      return {
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isOpen: dayData?.isOpen || false,
        hasSlots: hasValidSlots,
      };
    },
    [availabilityData, selectedDate, totalDuration, closingTimes]
  );

  // MODIFICACIÓN: Actualizada la función handleSubmit para manejar la respuesta de reprogramación
  const handleSubmit = useCallback(async () => {
    setValidationError(null);

    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    // Validar duración vs hora de cierre
    const validation = validateAppointmentTime(
      selectedDate,
      selectedTime,
      totalDuration
    );
    if (!validation.isValid && validation.message) {
      setValidationError(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      // Verificar nuevamente la disponibilidad antes de confirmar
      const availability = await bookingService.getFullAvailability();
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

      // Encontrar el día seleccionado en la disponibilidad actualizada
      const selectedDayData = availability.find(
        (day) => day.date === selectedDateStr
      );

      // Si el día ya no está disponible o la hora no está disponible, mostrar error
      if (!selectedDayData || !selectedDayData.isOpen) {
        setValidationError(
          "Lo sentimos, este día ya no está disponible. Por favor, selecciona otra fecha."
        );
        setIsSubmitting(false);
        return;
      }

      // Verificar si la hora seleccionada sigue disponible
      const isTimeSlotAvailable = selectedDayData.slots.some(
        (slot) => slot.time === selectedTime && slot.available
      );

      if (!isTimeSlotAvailable) {
        setValidationError(
          "Lo sentimos, este horario ya no está disponible. Por favor, selecciona otra hora."
        );
        setSelectedDaySlots(
          selectedDayData.slots
            .filter((slot) => slot.available)
            .map((slot) => slot.time)
        );
        setTime("");
        setIsSubmitting(false);
        return;
      }

      // Validar que la cita no exceda el horario de cierre
      const closingTime =
        selectedDayData.slots[selectedDayData.slots.length - 1].time;
      const appointmentTimeObj = parse(selectedTime, "HH:mm", new Date());
      const endTimeObj = addMinutes(appointmentTimeObj, totalDuration);
      const endTimeStr = format(endTimeObj, "HH:mm");

      const closingTimeObj = parse(closingTime, "HH:mm", new Date());
      const closingTimeWithBuffer = addMinutes(closingTimeObj, 30); // 30 min de margen

      if (endTimeObj > closingTimeWithBuffer) {
        setValidationError(
          `Tu cita terminaría a las ${endTimeStr}, pero el horario de atención finaliza a las ${closingTime}. Por favor, selecciona un horario anterior.`
        );
        setIsSubmitting(false);
        return;
      }

      // Si todo está bien, mostrar el diálogo de confirmación
      setIsSubmitting(false);
      setShowConfirmModal(true);
    } catch (error: any) {
      console.error("Error al verificar disponibilidad:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al verificar disponibilidad. Por favor, inténtalo de nuevo.";
      setValidationError(errorMessage);
      setIsSubmitting(false);
    }
  }, [selectedDate, selectedTime, selectedServices, totalDuration, setTime]);

  interface AppointmentResponse {
    success: boolean;
    rescheduled?: boolean;
    message?: string;
    appointment: any;
  }

  // MODIFICACIÓN: Actualizada la función confirmAppointment para manejar el caso de citas reprogramadas automáticamente
  const confirmAppointment = useCallback(async () => {
    setIsSubmitting(true);
    setValidationError(null);

    try {
      const appointmentData = {
        services: selectedServices.map((service) => service._id),
        date: format(selectedDate!, "yyyy-MM-dd"),
        time: selectedTime,
      };

      const response = await bookingService.createAppointment(appointmentData) as AppointmentResponse;

      setShowConfirmModal(false);
      setSubmissionSuccess(true);

      // MODIFICACIÓN: Verificar si la cita fue reprogramada automáticamente
      if (response.rescheduled) {
        // Guardar información de reprogramación en localStorage
        localStorage.setItem(
          'appointmentRescheduled',
          JSON.stringify({
            wasRescheduled: true,
            originalDate: format(selectedDate!, "yyyy-MM-dd"),
            originalTime: selectedTime,
            newDate: response.appointment.date,
            newTime: response.appointment.time
          })
        );

        // Mostrar un mensaje toast informando sobre la reprogramación
        toast.warning(
          "Tu cita fue reprogramada automáticamente debido a un conflicto de horario.",
          { autoClose: 5000 }
        );
      } else {
        // Si no hubo reprogramación, asegurarse de que el flag no esté en localStorage
        localStorage.removeItem('appointmentRescheduled');
        
        // Mostrar mensaje de éxito estándar
        toast.success("¡Tu cita ha sido agendada con éxito!");
      }

      // Redireccionar a página de confirmación con el estado apropiado
      navigate("/dashboard/appointments/confirmation", {
        state: { 
          appointmentSuccess: true, 
          appointmentData: response.appointment,
          wasRescheduled: response.rescheduled
        },
      });

      // Limpiar el estado
      clearAppointment();
    } catch (error: any) {
      console.error("Error al crear cita:", error);

      // MODIFICACIÓN: Manejar el error específico de conflicto (código 409)
      if (error.response?.status === 409) {
        setValidationError(
          error.response.data.error || 
          "El horario seleccionado ya ha sido reservado. Por favor, selecciona otro horario."
        );
      } else {
        // Extraer mensaje de error del backend
        const errorMessage =
          error.response?.data?.message || "Error al crear la cita";

        // Mostrar error específico
        setValidationError(errorMessage);
      }
      
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedDate,
    selectedTime,
    selectedServices,
    navigate,
    clearAppointment,
  ]);

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="pt-16 pb-20 md:pt-20 bg-gray-50 p-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="pt-16 pb-20 md:pt-20 bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Error al cargar disponibilidad
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Comprobar si hay servicios seleccionados
  if (selectedServices.length === 0) {
    return (
      <div className="pt-16 pb-20 md:pt-20 bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-amber-600 mb-4">
            Reserva de Cita
          </h2>
          <p className="text-gray-600 mb-6">
            Por favor, selecciona al menos un servicio para continuar.
          </p>
          <button
            onClick={() => navigate("/dashboard/services")}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Seleccionar Servicios
          </button>
        </div>
      </div>
    );
  }

  // Agrupar horarios por franja
  const morningSlots = selectedDaySlots.filter(
    (time) => parseInt(time.split(":")[0]) < 12
  );

  const afternoonSlots = selectedDaySlots.filter(
    (time) =>
      parseInt(time.split(":")[0]) >= 12 && parseInt(time.split(":")[0]) < 17
  );

  const eveningSlots = selectedDaySlots.filter(
    (time) => parseInt(time.split(":")[0]) >= 17
  );

  return (
    <div className="pt-16 pb-20 md:pt-20 bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Reserva tu Cita</h1>

        {/* Alerta de error de validación */}
        {validationError && (
          <ErrorAlert
            message={validationError}
            onDismiss={() => setValidationError(null)}
          />
        )}

        {/* Selector de días con scroll horizontal */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Selecciona una fecha
            </h2>

            <div className="hidden md:flex items-center gap-2">
              <button
          onClick={() => scrollDays("left")}
          className="p-2 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white"
          aria-label="Desplazar a la izquierda"
              >
          <ChevronLeft className="h-5 w-5" />
              </button>
              <button
          onClick={() => scrollDays("right")}
          className="p-2 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white"
          aria-label="Desplazar a la derecha"
              >
          <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Contenedor de días con scroll horizontal */}
          <div
            ref={daysScrollRef}
            className="flex overflow-x-auto pb-4 hide-scrollbar space-x-2"
          >
            {generateDateRange().map((date, index) => {
              const { isSelected, isOpen, hasSlots } = getDayStatus(date);
              const dayNumber = format(date, "d");
              const dayName = format(date, "EEE", { locale: es });
              const monthName = format(date, "MMM", { locale: es });
              const isPastDate = isPast(date) && !isSameDay(date, new Date());
              const isCurrentDay = isToday(date);

              return (
          <div key={index} className="flex-shrink-0 first:ml-0">
            <button
              onClick={() => handleDateSelect(date)}
              disabled={!isOpen || isPastDate || !hasSlots}
              className={`w-20 h-24 rounded-xl text-center transition-colors flex flex-col items-center justify-center
                ${
            isSelected
              ? "bg-green-600 text-white shadow-md"
              : isOpen && hasSlots && !isPastDate
              ? "bg-white border-2 border-orange-500 hover:bg-orange-50"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
                ${
            isCurrentDay && !isSelected
              ? "border-2 border-orange-500"
              : ""
                }
              `}
              title={
                !isOpen
            ? "Día no disponible"
            : !hasSlots && totalDuration > 0
            ? `No hay disponibilidad para servicios de ${totalDuration} min`
            : !hasSlots
            ? "No hay horarios disponibles"
            : isPastDate
            ? "Fecha en el pasado"
            : ""
              }
            >
              <span
                className={`text-xs uppercase ${
            isSelected ? "text-white" : "text-gray-500"
                } mb-1`}
              >
                {monthName}
              </span>
              <span
                className={`text-2xl font-bold ${
            isSelected ? "text-white" : ""
                }`}
              >
                {dayNumber}
              </span>
              <span
                className={`text-xs ${
            isSelected ? "text-white" : "text-gray-600"
                } mt-1`}
              >
                {dayName}
              </span>
            </button>
          </div>
              );
            })}
          </div>
        </div>

        {/* Selector de hora con scroll horizontal */}
        {selectedDate && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" /> Selecciona una hora
              </h3>

              {selectedDaySlots.length > 0 && (
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => scrollTimes("left")}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                    aria-label="Desplazar a la izquierda"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollTimes("right")}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                    aria-label="Desplazar a la derecha"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {selectedDaySlots.length > 0 ? (
              <div className="space-y-4">
                {morningSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Mañana
                    </h4>
                    <div
                      ref={timesScrollRef}
                      className="flex overflow-x-auto hide-scrollbar pb-2 space-x-2"
                    >
                      {morningSlots.map((time, i) => (
                        <button
                          key={i}
                          onClick={() => handleTimeSelect(time)}
                          className={`flex-shrink-0 py-3 px-4 rounded-lg text-center min-w-[80px] transition-colors ${
                            selectedTime === time
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Tarde
                    </h4>
                    <div className="flex overflow-x-auto hide-scrollbar pb-2 space-x-2">
                      {afternoonSlots.map((time, i) => (
                        <button
                          key={i}
                          onClick={() => handleTimeSelect(time)}
                          className={`flex-shrink-0 py-3 px-4 rounded-lg text-center min-w-[80px] transition-colors ${
                            selectedTime === time
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {eveningSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Noche
                    </h4>
                    <div className="flex overflow-x-auto hide-scrollbar pb-2 space-x-2">
                      {eveningSlots.map((time, i) => (
                        <button
                          key={i}
                          onClick={() => handleTimeSelect(time)}
                          className={`flex-shrink-0 py-3 px-4 rounded-lg text-center min-w-[80px] transition-colors ${
                            selectedTime === time
                              ? "bg-amber-600 text-white shadow-md"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {totalDuration > 0
                      ? `No hay horarios disponibles para servicios de ${totalDuration} minutos`
                      : "No hay horarios disponibles para esta fecha"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Por favor, selecciona otra fecha
                    {totalDuration > 30
                      ? " o considera reducir los servicios seleccionados"
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Servicios seleccionados */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scissors className="h-5 w-5" /> Servicios seleccionados
          </h3>

          {selectedServices.map((service) => (
            <div key={service._id} className="p-4 mb-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <span className="text-sm text-gray-600">
                    {service.duration} min
                  </span>
                </div>
                <span className="font-bold">{service.price.toFixed(2)} €</span>
              </div>

              {selectedDate && selectedTime && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedTime} - {service.duration} min
                  </span>
                </div>
              )}

              <button
                onClick={() => removeService(service._id)}
                className="mt-2 text-red-500 hover:text-red-700 text-sm"
              >
                Eliminar servicio
              </button>
            </div>
          ))}

          <button
            onClick={() => navigate("/dashboard/services")}
            className="w-full p-2 border-2 border-dashed border-amber-600 rounded-lg
             hover:bg-amber-50 text-amber-600 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir otro servicio
          </button>
        </div>

        {/* Información de tiempo total */}
        {selectedServices.length > 0 && (
          <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-medium">
                Duración total: {totalDuration} minutos
              </span>
            </div>
            {totalDuration > 60 && (
              <p className="mt-2 text-sm text-amber-700">
                Ten en cuenta que algunos horarios pueden no estar disponibles
                debido a la duración total de los servicios.
              </p>
            )}
          </div>
        )}

        {/* Resumen */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold">Total:</h3>
              <span className="text-gray-600">{totalDuration} minutos</span>
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {totalPrice.toFixed(2)} €
            </span>
          </div>

          {/* MODIFICACIÓN: Botón actualizado para mostrar estado de carga */}
          <button
            onClick={handleSubmit}
            disabled={
              !selectedDate ||
              !selectedTime ||
              selectedServices.length === 0 ||
              isSubmitting ||
              !!validationError
            }
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 
             disabled:opacity-50 disabled:cursor-not-allowed transition-colors
             flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Confirmar Reserva
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAppointment}
        appointment={{
          date: selectedDate!,
          time: selectedTime,
          services: selectedServices,
          totalDuration,
          totalPrice,
        }}
      />

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

export default AppointmentBookingPage;