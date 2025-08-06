import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// Zona horaria de Santiago de Chile
const CHILE_TIMEZONE = 'America/Santiago';

// Formatear fecha a hora local chilena
export const formatToChileTime = (date, formatStr = 'dd/MM/yyyy HH:mm:ss') => {
  return formatInTimeZone(new Date(date), CHILE_TIMEZONE, formatStr, { locale: es });
};

// Obtener fecha actual en Chile
export const getChileTime = () => {
  return new Date().toLocaleString('es-CL', { 
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Convertir fecha UTC a hora chilena
export const utcToChileTime = (utcDate) => {
  return new Date(utcDate).toLocaleString('es-CL', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
