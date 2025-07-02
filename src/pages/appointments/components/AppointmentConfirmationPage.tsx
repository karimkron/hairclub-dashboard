import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  Scissors,
  Check,
  ArrowLeft,
  Share2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "react-toastify";

const AppointmentConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointment, setAppointment] = useState<any>(null);
  // MODIFICACIÓN: Nuevo estado para controlar si la cita fue reprogramada
  const [wasRescheduled, setWasRescheduled] = useState(false);
  // MODIFICACIÓN: Nuevo estado para el proceso de compartir
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Verificar si hay datos de cita en el state
    if (location.state?.appointmentSuccess && location.state?.appointmentData) {
      setAppointment(location.state.appointmentData);

      // MODIFICACIÓN: Verificar si la cita fue reprogramada desde el state
      if (location.state.wasRescheduled) {
        setWasRescheduled(true);
      }
    } else {
      // Intentar recuperar del localStorage como respaldo
      const savedAppointment = localStorage.getItem("lastConfirmedAppointment");
      if (savedAppointment) {
        try {
          setAppointment(JSON.parse(savedAppointment));

          // MODIFICACIÓN: Verificar si hay información de reprogramación en localStorage
          const rescheduledInfo = localStorage.getItem(
            "appointmentRescheduled"
          );
          if (rescheduledInfo) {
            try {
              const rescheduledData = JSON.parse(rescheduledInfo);
              if (rescheduledData.wasRescheduled) {
                setWasRescheduled(true);
              }
            } catch (error) {
              console.error("Error parsing rescheduled info:", error);
            }
          }
        } catch (error) {
          console.error("Error parsing appointment data:", error);
          navigate("/dashboard");
        }
      } else {
        // No hay datos de cita, redirigir
        navigate("/dashboard");
      }
    }

    // Si hay datos, guardarlos en localStorage
    if (location.state?.appointmentData) {
      localStorage.setItem(
        "lastConfirmedAppointment",
        JSON.stringify(location.state.appointmentData)
      );
    }

    // Limpiar localStorage después de 30 minutos
    const cleanupTimeout = setTimeout(() => {
      localStorage.removeItem("lastConfirmedAppointment");
      localStorage.removeItem("appointmentRescheduled"); // También limpiar datos de reprogramación
    }, 30 * 60 * 1000);

    return () => clearTimeout(cleanupTimeout);
  }, [location, navigate]);

  // MODIFICACIÓN: Actualizada la función para compartir con estado de carga
  const handleShareAppointment = () => {
    if (!appointment) return;

    // Mostrar indicador de carga
    setIsSharing(true);

    // Simulación del proceso de compartir (podría ser una operación real en un caso de producción)
    setTimeout(() => {
      // Implementar lógica de compartir
      toast.info("Función de compartir aún no implementada");
      setIsSharing(false);
    }, 1000);

    // En un caso real, podríamos:
    // 1. Generar un archivo .ics para calendario
    // 2. Compartir un enlace
    // 3. Enviar por email, etc.
  };

  // Si no hay datos de cita, mostrar pantalla de carga
  if (!appointment) {
    return (
      <div className="pt-16 pb-20 md:pt-20 bg-gray-50 p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Formatear la fecha
  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE, d MMMM yyyy", {
    locale: es,
  });

  return (
    <div className="pt-16 pb-20 md:pt-20 bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Banner de éxito */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Tu cita ha sido confirmada con éxito
              </p>
            </div>
          </div>
        </div>

        {/* MODIFICACIÓN: Banner de información de reprogramación */}
        {wasRescheduled && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-amber-800">
                  Tu cita fue reprogramada automáticamente debido a un conflicto
                  de horario.
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  El horario que solicitaste ya había sido reservado por otro
                  cliente. Hemos asignado el siguiente horario disponible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de confirmación */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-amber-600 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">¡Cita Reservada!</h1>
            <p>Te esperamos en nuestra peluquería</p>
          </div>

          <div className="p-6">
            <div className="space-y-6 mb-8">
              {/* Detalles de fecha y hora */}
              <div className="flex items-start gap-4">
                <Calendar className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-700">Fecha y Hora</h3>
                  <p className="text-gray-600">{formattedDate}</p>
                  <p className="text-gray-600">{appointment.time}</p>
                </div>
              </div>

              {/* Servicios */}
              <div className="flex items-start gap-4">
                <Scissors className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-700">Servicios</h3>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    {appointment.services &&
                      appointment.services.map(
                        (service: any, index: number) => (
                          <li key={index} className="flex justify-between">
                            <span>{service.name}</span>
                            <span className="font-medium">
                              {service.price
                                ? `${service.price.toFixed(2)} €`
                                : ""}
                            </span>
                          </li>
                        )
                      )}
                  </ul>
                  <p className="mt-3 font-bold text-gray-800">
                    Total:{" "}
                    {appointment.totalPrice
                      ? `${appointment.totalPrice.toFixed(2)} €`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Duración */}
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-700">Duración</h3>
                  <p className="text-gray-600">
                    {appointment.totalDuration
                      ? `${appointment.totalDuration} minutos`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* MODIFICACIÓN: Instrucciones adicionales sobre cambios de agenda */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Recordatorio
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 text-amber-600 flex-shrink-0">•</div>
                  <span>Por favor, llega 5-10 minutos antes de tu cita.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 text-amber-600 flex-shrink-0">•</div>
                  <span>
                    Si necesitas cancelar o reprogramar, hazlo con al menos 24
                    horas de anticipación.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 text-amber-600 flex-shrink-0">•</div>
                  <span>
                    Se ha enviado un correo de confirmación a tu dirección
                    registrada.
                  </span>
                </li>
                {wasRescheduled && (
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 text-amber-600 flex-shrink-0">
                      •
                    </div>
                    <span>
                      Si el nuevo horario no te conviene, puedes cancelar esta
                      cita y reservar una nueva.
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* MODIFICACIÓN: Botones de acción actualizados para mostrar estado de carga */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 px-4 flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver al Inicio
              </button>
              <button
                onClick={() => {
                  try {
                    if (!appointment) {
                      console.error("No hay cita seleccionada");
                      return;
                    }

                    const appointmentDate = new Date(appointment.date);
                    if (isNaN(appointmentDate.getTime())) {
                      console.error("Fecha de cita inválida");
                      return;
                    }

                    const timeArr = appointment.time.split(":");
                    if (timeArr.length !== 2) {
                      console.error("Formato de hora inválido");
                      return;
                    }

                    const hours = parseInt(timeArr[0]);
                    const minutes = parseInt(timeArr[1]);

                    if (isNaN(hours) || isNaN(minutes)) {
                      console.error("Valores de hora/minutos inválidos");
                      return;
                    }

                    const startDate = new Date(
                      appointmentDate.getFullYear(),
                      appointmentDate.getMonth(),
                      appointmentDate.getDate(),
                      hours,
                      minutes
                    );

                    const endDate = new Date(startDate);
                    const duration = appointment.totalDuration || 60;
                    endDate.setMinutes(startDate.getMinutes() + duration);

                    // Importante: Usamos los valores sin codificar para el contenido del archivo ICS
                    const eventTitle = "Cita en la peluquería";
                    const servicesList =
                      appointment.services
                        ?.map((service: any) => service.name)
                        .join(", ") || "No especificados";
                    const eventDetails = `Servicios: ${servicesList}`;
                    const eventLocation = "Peluquería";

                    const startISO = startDate
                      .toISOString()
                      .replace(/-|:|\.\d+/g, "");
                    const endISO = endDate
                      .toISOString()
                      .replace(/-|:|\.\d+/g, "");

                    // Determinar plataforma
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    const isAndroid = /Android/.test(navigator.userAgent);

                    // Función para escapar caracteres especiales en el formato ICS
                    // Los caracteres como comas, punto y coma, etc. necesitan ser escapados en ICS
                    const escapeIcsValue = (value: string): string => {
                      return value
                        .replace(/\\/g, "\\\\")
                        .replace(/;/g, "\\;")
                        .replace(/,/g, "\\,")
                        .replace(/\n/g, "\\n");
                    };

                    if (isIOS) {
                      // Crear contenido ICS con caracteres correctamente escapados
                      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Peluquería//Reserva//ES
BEGIN:VEVENT
SUMMARY:${escapeIcsValue(eventTitle)}
DTSTART:${startISO}
DTEND:${endISO}
DESCRIPTION:${escapeIcsValue(eventDetails)}
LOCATION:${escapeIcsValue(eventLocation)}
END:VEVENT
END:VCALENDAR`;

                      const blob = new Blob([icsContent], {
                        type: "text/calendar;charset=utf-8",
                      });
                      const url = URL.createObjectURL(blob);

                      // Crear y usar un elemento <a> para descargar el archivo
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "cita_peluqueria.ics";
                      document.body.appendChild(link);
                      link.click();

                      // Mensaje informativo para el usuario
                      alert(
                        "Se ha descargado un archivo de calendario. Por favor, ábrelo para añadir la cita a tu calendario."
                      );

                      // Limpiar recursos
                      setTimeout(() => {
                        URL.revokeObjectURL(url);
                        document.body.removeChild(link);
                      }, 100);
                    } else if (isAndroid) {
                      // Para Android, usamos los valores codificados para la URL
                      const encodedTitle = encodeURIComponent(eventTitle);
                      const encodedDetails = encodeURIComponent(eventDetails);
                      const encodedLocation = encodeURIComponent(eventLocation);

                      // Crear evento para Android (Google Calendar)
                      window.open(
                        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startISO}/${endISO}&details=${encodedDetails}&location=${encodedLocation}`,
                        "_blank"
                      );
                    } else {
                      // Fallback para otros dispositivos (Google Calendar) - también con valores codificados para URL
                      const encodedTitle = encodeURIComponent(eventTitle);
                      const encodedDetails = encodeURIComponent(eventDetails);
                      const encodedLocation = encodeURIComponent(eventLocation);

                      window.open(
                        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startISO}/${endISO}&details=${encodedDetails}&location=${encodedLocation}`,
                        "_blank"
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Error al crear evento de calendario:",
                      error
                    );
                    alert(
                      "Se produjo un error al intentar añadir el evento al calendario. Por favor, inténtalo de nuevo."
                    );
                  }
                }}
                className="flex-1 py-3 px-4 flex justify-center items-center gap-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!appointment}
                aria-label="Añadir cita al calendario"
              >
                <Share2 className="h-5 w-5" />
                Añadir a Calendario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmationPage;
