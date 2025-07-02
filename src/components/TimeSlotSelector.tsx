import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
  availableSlots: string[];
  selectedTime: string;
  onSelectTime: (time: string) => void;
  serviceDuration?: number;
  className?: string;
  loadingSlots?: boolean;
}

/**
 * Componente para seleccionar un horario disponible
 */
const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  availableSlots,
  selectedTime,
  onSelectTime,
  serviceDuration,
  className = '',
  loadingSlots = false
}) => {
  if (loadingSlots) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
        <p className="text-sm text-gray-400 mt-1">Por favor, selecciona otra fecha</p>
      </div>
    );
  }

  // Agrupar horarios por franja
  const morningSlots = availableSlots.filter(
    time => parseInt(time.split(':')[0]) < 12
  );
  
  const afternoonSlots = availableSlots.filter(
    time => parseInt(time.split(':')[0]) >= 12 && parseInt(time.split(':')[0]) < 17
  );
  
  const eveningSlots = availableSlots.filter(
    time => parseInt(time.split(':')[0]) >= 17
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Encabezado */}
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5" /> 
        Selecciona un horario
        {serviceDuration && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Duración: {serviceDuration} min)
          </span>
        )}
      </h3>

      {/* Franjas horarias */}
      {morningSlots.length > 0 && (
        <div>
          <h4 className="text-sm text-gray-500 mb-2">Mañana</h4>
          <div className="flex flex-wrap gap-2">
            {morningSlots.map((time) => (
              <button
                key={time}
                onClick={() => onSelectTime(time)}
                className={`py-2 px-4 rounded-md text-center min-w-[80px] transition-colors ${
                  selectedTime === time 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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
          <h4 className="text-sm text-gray-500 mb-2">Tarde</h4>
          <div className="flex flex-wrap gap-2">
            {afternoonSlots.map((time) => (
              <button
                key={time}
                onClick={() => onSelectTime(time)}
                className={`py-2 px-4 rounded-md text-center min-w-[80px] transition-colors ${
                  selectedTime === time 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
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
          <h4 className="text-sm text-gray-500 mb-2">Noche</h4>
          <div className="flex flex-wrap gap-2">
            {eveningSlots.map((time) => (
              <button
                key={time}
                onClick={() => onSelectTime(time)}
                className={`py-2 px-4 rounded-md text-center min-w-[80px] transition-colors ${
                  selectedTime === time 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;