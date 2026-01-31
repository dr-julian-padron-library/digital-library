
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
    ocupada: 'bg-destructive/10 text-destructive hover:bg-destructive/20 line-through',
    disponible: 'bg-card text-foreground hover:bg-accent/10 border border-input cursor-pointer',
    seleccionada: 'bg-primary text-primary-foreground hover:bg-primary/90 ring-2 ring-ring',
    domingo: 'bg-muted text-muted-foreground cursor-not-allowed'
  };

  return (
    <div className="p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendario */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Selecciona una fecha disponible
            </h3>
            <p className="text-muted-foreground text-sm">
              Puedes reservar con hasta 3 meses de anticipación
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-80 bg-muted/20 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              className="mx-auto border border-border rounded-lg p-4 bg-card"
            />
          )}
        </div>

        {/* Panel de información */}
        <div className="space-y-6">
          {/* Leyenda */}
          <div className="bg-muted/10 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-3 flex items-center">
              <InfoIcon size={18} className="mr-2" />
              Disponibilidad
            </h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-card border border-input rounded mr-3"></div>
                <span className="text-sm text-muted-foreground">Fecha disponible</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-destructive/10 border border-destructive/30 rounded mr-3"></div>
                <span className="text-sm text-muted-foreground">Fecha ocupada</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary rounded mr-3"></div>
                <span className="text-sm text-muted-foreground">Fecha seleccionada</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-muted border border-border rounded mr-3"></div>
                <span className="text-sm text-muted-foreground">Domingos (cerrado)</span>
              </div>
            </div>
          </div>

          {/* Información de la fecha seleccionada */}
          {fechaSeleccionada && (
            <div className="bg-card border border-border rounded-lg p-4 animate-fade-in shadow-sm">
              <h4 className="font-semibold text-primary mb-2 flex items-center">
                <CalendarIcon size={18} className="mr-2" />
                Fecha Seleccionada
              </h4>
              <p className="text-lg font-medium text-muted-foreground mb-3">
                {format(fechaSeleccionada, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                ✓ Disponible
              </Badge>

              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  onClick={() => onFechaSeleccionada(fechaSeleccionada)}
                  className="w-full"
                >
                  Continuar con esta fecha
                </Button>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-accent/10 rounded-lg p-4">
            <h4 className="font-semibold text-primary mb-2">
              Información Importante
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
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
