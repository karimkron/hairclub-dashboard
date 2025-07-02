import { format, isBefore, isAfter, isSameDay, addDays, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a un string para mostrar al usuario
 * @param date Fecha a formatear
 * @param includeDay Si se debe incluir el nombre del día
 */
export const formatDate = (date: Date | string, includeDay = true): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!isValid(dateObj)) {
      return 'Fecha inválida';
    }
    
    const formatStr = includeDay ? 'EEEE, d MMMM yyyy' : 'd MMMM yyyy';
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Error de formato';
  }
};

/**
 * Formatea una hora a un string para mostrar al usuario
 * @param time Hora en formato HH:MM
 * @param use24HourFormat Si se debe usar formato de 24 horas
 */
export const formatTime = (time: string, use24HourFormat = true): string => {
  if (!time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return time; // Devolver original si no tiene formato válido
  }
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    // Crear fecha temporal solo para formatear la hora
    const tempDate = new Date();
    tempDate.setHours(hours, minutes, 0, 0);
    
    const formatStr = use24HourFormat ? 'HH:mm' : 'h:mm aaa';
    return format(tempDate, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formateando hora:', error);
    return time; // Devolver original en caso de error
  }
};

/**
 * Verifica si una fecha está en el pasado
 */
export const isDateInPast = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return isBefore(dateObj, today);
  } catch (error) {
    console.error('Error verificando fecha pasada:', error);
    return false;
  }
};

/**
 * Verifica si una fecha y hora están en el pasado
 */
export const isDateTimeInPast = (date: Date | string, time: string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    const now = new Date();
    
    if (!time) return isBefore(dateObj, now);
    
    const [hours, minutes] = time.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    
    return isBefore(dateObj, now);
  } catch (error) {
    console.error('Error verificando datetime pasado:', error);
    return false;
  }
};

/**
 * Verifica si una fecha está dentro de un rango permitido
 * @param date Fecha a verificar
 * @param maxMonths Número máximo de meses hacia adelante permitido
 */
export const isDateInRange = (date: Date | string, maxMonths = 2): boolean => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Fecha mínima (hoy)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fecha máxima permitida
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + maxMonths);
    maxDate.setHours(23, 59, 59, 999);
    
    return !isBefore(dateObj, today) && !isAfter(dateObj, maxDate);
  } catch (error) {
    console.error('Error verificando rango de fecha:', error);
    return false;
  }
};

/**
 * Crea un timestamp completo a partir de una fecha y hora
 */
export const createDateTime = (date: Date | string, time: string): Date => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    
    if (!time) return dateObj;
    
    const [hours, minutes] = time.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    
    return dateObj;
  } catch (error) {
    console.error('Error creando datetime:', error);
    return new Date(); // Devolver fecha actual en caso de error
  }
};

/**
 * Convierte un tiempo (HH:MM) a minutos desde el inicio del día
 */
export const timeToMinutes = (time: string): number => {
  if (!time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
    return 0;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convierte minutos desde el inicio del día a tiempo (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  if (minutes < 0 || minutes >= 24 * 60) {
    return '00:00';
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Verifica si hay solapamiento entre dos rangos de tiempo
 */
export const hasTimeOverlap = (
  startTime1: string, 
  endTime1: string, 
  startTime2: string, 
  endTime2: string
): boolean => {
  const start1 = timeToMinutes(startTime1);
  const end1 = timeToMinutes(endTime1);
  const start2 = timeToMinutes(startTime2);
  const end2 = timeToMinutes(endTime2);
  
  return (start1 < end2 && end1 > start2);
};

/**
 * Calcula la hora de finalización en base a una hora de inicio y duración
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  
  return minutesToTime(endMinutes);
};