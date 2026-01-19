
import React, { useMemo } from 'react';
import { Calendar } from '@/common/components/ui/calendar';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { format, isSameDay, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { useGetBlockedSchedulesQuery, useGetRoomBookingsQuery } from '../api/roomBookingsApi';

interface CalendarioDisponibilidadProps {
  fechaSeleccionada?: Date;
  onFechaSeleccionada: (fecha: Date) => void;
}

export function CalendarioDisponibilidad({
  fechaSeleccionada,
  onFechaSeleccionada
}: CalendarioDisponibilidadProps) {
  const { data: solicitudesAprobadas, isLoading: isLoadingSolicitudes } = useGetRoomBookingsQuery({ status: 'aprobada' });
  const { data: horariosBloquados, isLoading: isLoadingBloqueados } = useGetBlockedSchedulesQuery({});

  const fechasOcupadas = useMemo(() => {
    const fechasOcupadasSet = new Set<string>();

    horariosBloquados?.forEach(horario => {
      fechasOcupadasSet.add(horario.date);
    });

    solicitudesAprobadas?.forEach(solicitud => {
      fechasOcupadasSet.add(solicitud.event_date);
    });

    return Array.from(fechasOcupadasSet).map(fecha => new Date(fecha + 'T00:00:00'));
  }, [horariosBloquados, solicitudesAprobadas]);

  const isLoading = isLoadingSolicitudes || isLoadingBloqueados;

  const esFechaDisponible = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // No permitir fechas pasadas
    if (isBefore(fecha, hoy)) return false;

    // No permitir fechas muy lejanas (máximo 3 meses)
    const limiteMaximo = addDays(hoy, 90);
    if (isAfter(fecha, limiteMaximo)) return false;

    // No permitir domingos (día 0)
    if (fecha.getDay() === 0) return false;

    // Verificar si la fecha está ocupada
    return !fechasOcupadas.some(fechaOcupada => isSameDay(fecha, fechaOcupada));
  };

  const modifiers = {
    ocupada: fechasOcupadas,
    disponible: (fecha: Date) => esFechaDisponible(fecha),
    seleccionada: fechaSeleccionada ? [fechaSeleccionada] : [],
    domingo: (fecha: Date) => fecha.getDay() === 0
  };

  const modifiersClassNames = {
    ocupada: 'bg-red-100 text-red-800 hover:bg-red-200 line-through',
    disponible: 'bg-green-50 text-green-800 hover:bg-green-100 cursor-pointer',
    seleccionada: 'bg-biblioteca-blue text-white hover:bg-biblioteca-blue/80 ring-2 ring-biblioteca-gold',
    domingo: 'bg-gray-100 text-gray-400 cursor-not-allowed'
  };

  return (
    <div className="p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendario */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-biblioteca-blue mb-2">
              Selecciona una fecha disponible
            </h3>
            <p className="text-biblioteca-gray text-sm">
              Puedes reservar con hasta 3 meses de anticipación
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-80 bg-biblioteca-light/20 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-biblioteca-blue"></div>
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={fechaSeleccionada}
              onSelect={(fecha) => {
                if (fecha && esFechaDisponible(fecha)) {
                  onFechaSeleccionada(fecha);
                }
              }}
              locale={es}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              disabled={(fecha) => !esFechaDisponible(fecha)}
              className="mx-auto border border-biblioteca-light/30 rounded-lg p-4 bg-white"
            />
          )}
        </div>

        {/* Panel de información */}
        <div className="space-y-6">
          {/* Leyenda */}
          <div className="bg-biblioteca-light/10 rounded-lg p-4">
            <h4 className="font-semibold text-biblioteca-blue mb-3 flex items-center">
              <InfoIcon size={18} className="mr-2" />
              Disponibilidad
            </h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-3"></div>
                <span className="text-sm text-biblioteca-gray">Fecha disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-3"></div>
                <span className="text-sm text-biblioteca-gray">Fecha ocupada</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-biblioteca-blue rounded mr-3"></div>
                <span className="text-sm text-biblioteca-gray">Fecha seleccionada</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-3"></div>
                <span className="text-sm text-biblioteca-gray">Domingos (cerrado)</span>
              </div>
            </div>
          </div>

          {/* Información de la fecha seleccionada */}
          {fechaSeleccionada && (
            <div className="bg-white border border-biblioteca-gold/30 rounded-lg p-4 animate-fade-in">
              <h4 className="font-semibold text-biblioteca-blue mb-2 flex items-center">
                <CalendarIcon size={18} className="mr-2" />
                Fecha Seleccionada
              </h4>
              <p className="text-lg font-medium text-biblioteca-gray mb-3">
                {format(fechaSeleccionada, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                ✓ Disponible
              </Badge>

              <div className="mt-4 pt-4 border-t border-biblioteca-light/20">
                <Button
                  onClick={() => onFechaSeleccionada(fechaSeleccionada)}
                  className="w-full bg-biblioteca-blue hover:bg-biblioteca-blue/90 text-white"
                >
                  Continuar con esta fecha
                </Button>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-biblioteca-gold/10 rounded-lg p-4">
            <h4 className="font-semibold text-biblioteca-blue mb-2">
              Información Importante
            </h4>
            <ul className="text-sm text-biblioteca-gray space-y-1">
              <li>• Horario disponible: 8:00 AM - 6:00 PM</li>
              <li>• Capacidad máxima: 50 personas</li>
              <li>• Solicitud mínima: 2 días de anticipación</li>
              <li>• Confirmación por email en 24 horas</li>
              <li>• Los domingos la biblioteca permanece cerrada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
