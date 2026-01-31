
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { CalendarioDisponibilidad } from '@/features/room-bookings/components/CalendarioDisponibilidad';
import { SelectorHorarios } from '@/features/room-bookings/components/SelectorHorarios';
import { FormularioSolicitud } from '@/features/room-bookings/components/FormularioSolicitud';
import { PantallaConfirmacion } from '@/features/room-bookings/components/PantallaConfirmacion';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

export type PasoFormulario = 'fecha' | 'hora' | 'datos' | 'confirmacion';

export interface DatosSolicitud {
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  cedula: string;
  tipoEvento: string;
  numeroParticipantes: number;
  descripcion: string;
  requiereEquipos: boolean;
  equiposSolicitados?: string;
}

const PrestamoSala = () => {
  const [pasoActual, setPasoActual] = useState<PasoFormulario>('fecha');
  const [datosSolicitud, setDatosSolicitud] = useState<Partial<DatosSolicitud>>({});

  const actualizarDatos = (nuevosDatos: Partial<DatosSolicitud>) => {
    setDatosSolicitud(prev => ({ ...prev, ...nuevosDatos }));
  };

  const avanzarPaso = () => {
    const pasos: PasoFormulario[] = ['fecha', 'hora', 'datos', 'confirmacion'];
    const indiceActual = pasos.indexOf(pasoActual);
    if (indiceActual < pasos.length - 1) {
      setPasoActual(pasos[indiceActual + 1]);
    }
  };

  const retrocederPaso = () => {
    const pasos: PasoFormulario[] = ['fecha', 'hora', 'datos', 'confirmacion'];
    const indiceActual = pasos.indexOf(pasoActual);
    if (indiceActual > 0) {
      setPasoActual(pasos[indiceActual - 1]);
    }
  };

  const getIconoPaso = (paso: PasoFormulario) => {
    const iconos = {
      fecha: Calendar,
      hora: Clock,
      datos: Users,
      confirmacion: CheckCircle
    };
    return iconos[paso];
  };

  const getTituloPaso = (paso: PasoFormulario) => {
    const titulos = {
      fecha: 'Seleccionar Fecha',
      hora: 'Elegir Horario',
      datos: 'Datos del Solicitante',
      confirmacion: 'Solicitud Enviada'
    };
    return titulos[paso];
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 'fecha':
        return (
          <CalendarioDisponibilidad
            fechaSeleccionada={datosSolicitud.fecha}
            onFechaSeleccionada={(fecha) => {
              actualizarDatos({ fecha });
              avanzarPaso();
            }}
          />
        );
      case 'hora':
        return (
          <SelectorHorarios
            fecha={datosSolicitud.fecha!}
            horaInicio={datosSolicitud.horaInicio}
            horaFin={datosSolicitud.horaFin}
            onHorarioSeleccionado={(horaInicio, horaFin) => {
              actualizarDatos({ horaInicio, horaFin });
              avanzarPaso();
            }}
            onRetroceder={retrocederPaso}
          />
        );
      case 'datos':
        return (
          <FormularioSolicitud
            datosSolicitud={datosSolicitud}
            onDatosActualizados={actualizarDatos}
            onEnviar={async (datos) => {
              // Loading handled in component, we just accept success
              setPasoActual('confirmacion');
            }}
            onRetroceder={retrocederPaso}
            isLoading={false} // No parent loading state anymore
          />
        );
      case 'confirmacion':
        return (
          <PantallaConfirmacion
            datosSolicitud={datosSolicitud as DatosSolicitud}
            onNuevaSolicitud={() => {
              setDatosSolicitud({});
              setPasoActual('fecha');
            }}
          />
        );
      default:
        return null;
    }
  };

  const IconoPaso = getIconoPaso(pasoActual);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Préstamo de Sala
          </h1>
          <p className="text-xl md:text-2xl text-accent mb-2">
            Solicita el uso de nuestras instalaciones
          </p>
          <p className="text-primary-foreground/80">
            Reserva espacios para eventos, reuniones y actividades académicas
          </p>
        </div>
      </div>

      {/* Indicador de Progreso */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-4 md:space-x-8">
          {(['fecha', 'hora', 'datos', 'confirmacion'] as PasoFormulario[]).map((paso, index) => {
            const Icono = getIconoPaso(paso);
            const esActivo = paso === pasoActual;
            const esCompletado = (['fecha', 'hora', 'datos', 'confirmacion'] as PasoFormulario[]).indexOf(paso) <
              (['fecha', 'hora', 'datos', 'confirmacion'] as PasoFormulario[]).indexOf(pasoActual);

            return (
              <div key={paso} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${esActivo ? 'bg-primary border-primary text-primary-foreground scale-110' :
                    esCompletado ? 'bg-accent border-accent text-accent-foreground' :
                      'bg-card border-border text-muted-foreground'}
                `}>
                  <Icono size={20} />
                </div>
                {index < 3 && (
                  <div className={`
                    w-8 md:w-16 h-0.5 mx-2 transition-colors duration-300
                    ${esCompletado ? 'bg-accent' : 'bg-border'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="max-w-4xl mx-auto shadow-2xl border-border overflow-hidden bg-card">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle className="flex items-center text-2xl text-primary">
              <IconoPaso className="mr-3" size={28} />
              {getTituloPaso(pasoActual)}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="min-h-[500px]">
              {renderPaso()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrestamoSala;
