
import React, { useState } from 'react';
import { Button } from '@/common/components/ui/button';
import { Badge } from '@/common/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useGetBlockedSchedulesQuery, useGetRoomBookingsQuery } from '../api/roomBookingsApi';

interface SelectorHorariosProps {
  fecha: Date;
  horaInicio?: string;
  horaFin?: string;
  onHorarioSeleccionado: (horaInicio: string, horaFin: string) => void;
  onRetroceder: () => void;
}

interface FranjaHoraria {
  inicio: string;
  fin: string;
  disponible: boolean;
  etiqueta: string;
}

export function SelectorHorarios({
  fecha,
  horaInicio,
  horaFin,
  onHorarioSeleccionado,
  onRetroceder
}: SelectorHorariosProps) {
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<{ inicio: string; fin: string } | null>(
    horaInicio && horaFin ? { inicio: horaInicio, fin: horaFin } : null
  );

  const fechaStr = fecha.toISOString().split('T')[0];

  const { data: solicitudesAprobadas, isLoading: isLoadingSolicitudes } = useGetRoomBookingsQuery({
    date: fechaStr,
    status: 'aprobada'
  });

  const { data: horariosBloquados, isLoading: isLoadingBloqueados } = useGetBlockedSchedulesQuery({
    date: fechaStr
  });

  const isLoading = isLoadingSolicitudes || isLoadingBloqueados;

  const confirmarSeleccion = () => {
    if (horarioSeleccionado) {
      onHorarioSeleccionado(horarioSeleccionado.inicio, horarioSeleccionado.fin);
    }
  };

  const seleccionarHorario = (inicio: string, fin: string) => {
    setHorarioSeleccionado({ inicio, fin });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biblioteca-blue mx-auto mb-4"></div>
          <p className="text-biblioteca-gray">Cargando horarios disponibles...</p>
        </div>
      </div>
    );
  }

  // Generar franjas horarias
  const franjas: FranjaHoraria[] = [
    { inicio: '08:00', fin: '10:00', disponible: true, etiqueta: 'Mañana temprano' },
    { inicio: '10:00', fin: '12:00', disponible: true, etiqueta: 'Media mañana' },
    { inicio: '12:00', fin: '14:00', disponible: true, etiqueta: 'Mediodía' },
    { inicio: '14:00', fin: '16:00', disponible: true, etiqueta: 'Tarde temprana' },
    { inicio: '16:00', fin: '18:00', disponible: true, etiqueta: 'Tarde' },
  ];

  // Marcar franjas como ocupadas
  const horariosOcupados = [
    ...(horariosBloquados || []),
    ...(solicitudesAprobadas || [])
  ];

  franjas.forEach(franja => {
    const ocupado = horariosOcupados.some(horario => {
      const inicioFranja = franja.inicio;
      const finFranja = franja.fin;
      const inicioOcupado = horario.start_time; // Changed from hora_inicio
      const finOcupado = horario.end_time;     // Changed from hora_fin

      // Verificar si hay solapamiento
      return (inicioFranja < finOcupado && finFranja > inicioOcupado);
    });

    if (ocupado) {
      franja.disponible = false;
    }
  });

  // Check if previously selected time is still available
  if (horarioSeleccionado) {
    const selectedFranja = franjas.find(f => f.inicio === horarioSeleccionado.inicio && f.fin === horarioSeleccionado.fin);
    if (selectedFranja && !selectedFranja.disponible) {
      // Deselect if it became unavailable
      // But maybe we shouldn't automatically deselect in render loop, just show as unavailable
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onRetroceder}
          className="text-biblioteca-blue hover:bg-biblioteca-light/20 mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Cambiar fecha
        </Button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-biblioteca-blue mb-2">
            Selecciona el horario
          </h3>
          <p className="text-biblioteca-gray">
            Para el {format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Lista de horarios */}
        <div className="space-y-4">
          <h4 className="font-medium text-biblioteca-blue mb-4 flex items-center">
            <Clock size={18} className="mr-2" />
            Horarios Disponibles
          </h4>

          <div className="space-y-3">
            {franjas.map((franja, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${franja.disponible
                    ? (horarioSeleccionado?.inicio === franja.inicio && horarioSeleccionado?.fin === franja.fin)
                      ? 'border-biblioteca-blue bg-biblioteca-blue/5 ring-2 ring-biblioteca-gold/30'
                      : 'border-biblioteca-light/30 hover:border-biblioteca-blue/30 hover:bg-biblioteca-light/10'
                    : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                  }
                `}
                onClick={() => franja.disponible && seleccionarHorario(franja.inicio, franja.fin)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-biblioteca-blue">
                        {franja.inicio} - {franja.fin}
                      </div>
                      {horarioSeleccionado?.inicio === franja.inicio &&
                        horarioSeleccionado?.fin === franja.fin && (
                          <CheckCircle size={20} className="text-biblioteca-gold" />
                        )}
                    </div>
                    <div className="text-sm text-biblioteca-gray mt-1">
                      {franja.etiqueta}
                    </div>
                  </div>

                  <div>
                    <Badge
                      variant={franja.disponible ? "outline" : "destructive"}
                      className={
                        franja.disponible
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {franja.disponible ? 'Disponible' : 'Ocupado'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de confirmación */}
        <div className="space-y-6">
          {horarioSeleccionado && (
            <div className="bg-white border border-biblioteca-gold/30 rounded-lg p-6 animate-fade-in">
              <h4 className="font-semibold text-biblioteca-blue mb-4 flex items-center">
                <CheckCircle size={18} className="mr-2" />
                Horario Seleccionado
              </h4>

              <div className="space-y-3 mb-6">
                <div>
                  <span className="text-sm text-biblioteca-gray">Fecha:</span>
                  <p className="font-medium text-biblioteca-blue">
                    {format(fecha, "EEEE, d 'de' MMMM", { locale: es })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-biblioteca-gray">Horario:</span>
                  <p className="font-medium text-biblioteca-blue text-xl">
                    {horarioSeleccionado.inicio} - {horarioSeleccionado.fin}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-biblioteca-gray">Duración:</span>
                  <p className="font-medium text-biblioteca-blue">2 horas</p>
                </div>
              </div>

              <Button
                onClick={confirmarSeleccion}
                className="w-full bg-biblioteca-blue hover:bg-biblioteca-blue/90 text-white"
              >
                Continuar con este horario
              </Button>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-biblioteca-light/10 rounded-lg p-4">
            <h4 className="font-semibold text-biblioteca-blue mb-3">
              Información del Préstamo
            </h4>
            <ul className="text-sm text-biblioteca-gray space-y-2">
              <li>• <strong>Capacidad:</strong> Hasta 50 personas</li>
              <li>• <strong>Incluye:</strong> Mesas, sillas, proyector</li>
              <li>• <strong>Servicios adicionales:</strong> Disponibles bajo solicitud</li>
              <li>• <strong>Responsabilidades:</strong> Mantener orden y limpieza</li>
            </ul>
          </div>

          {!horarioSeleccionado && (
            <div className="text-center p-6 bg-biblioteca-gold/5 rounded-lg">
              <Clock size={32} className="mx-auto text-biblioteca-gold mb-3" />
              <p className="text-biblioteca-gray">
                Selecciona un horario disponible para continuar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
