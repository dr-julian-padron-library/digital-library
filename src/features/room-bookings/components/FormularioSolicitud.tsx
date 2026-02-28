
import React, { useState, useEffect } from 'react';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Checkbox } from '@/common/components/ui/checkbox';
import { Card, CardContent } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, User, Mail, Phone, Hash, Calendar, Clock, Users, FileText } from 'lucide-react';
import { DatosSolicitud } from '@/features/room-bookings/pages/RoomBookingPage';
import { useToast } from '@/common/hooks/use-toast';
import { useCreateRoomBookingMutation } from '../api/roomBookingsApi';
import { CedulaInput } from '@/common/components/ui/cedula-input';

interface FormularioSolicitudProps {
  datosSolicitud: Partial<DatosSolicitud>;
  onDatosActualizados: (datos: Partial<DatosSolicitud>) => void;
  onEnviar: (datos: DatosSolicitud) => Promise<void>;
  onRetroceder: () => void;
  isLoading: boolean;
}

export function FormularioSolicitud({
  datosSolicitud,
  onDatosActualizados,
  onEnviar,
  onRetroceder,
  isLoading: propIsLoading
}: FormularioSolicitudProps) {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [createBooking, { isLoading: isMutationLoading }] = useCreateRoomBookingMutation();

  const isLoading = propIsLoading || isMutationLoading;

  const validarCampo = (campo: string, valor: any) => {
    const nuevosErrores = { ...errores };

    switch (campo) {
      case 'nombreCompleto':
        if (!valor || valor.trim().length < 3) {
          nuevosErrores[campo] = 'El nombre debe tener al menos 3 caracteres';
        } else {
          delete nuevosErrores[campo];
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!valor || !emailRegex.test(valor)) {
          nuevosErrores[campo] = 'Ingresa un email válido';
        } else {
          delete nuevosErrores[campo];
        }
        break;
      case 'telefono':
        const telefonoRegex = /^[0-9]{10,11}$/;
        if (!valor || !telefonoRegex.test(valor.replace(/\D/g, ''))) {
          nuevosErrores[campo] = 'Ingresa un teléfono válido (10-11 dígitos)';
        } else {
          delete nuevosErrores[campo];
        }
        break;
      case 'cedula':
        const cedulaRegex = /^[VE][0-9]{7,8}$/;
        if (!valor || !cedulaRegex.test(valor.toUpperCase())) {
          nuevosErrores[campo] = 'Formato: V12345678 o E12345678';
        } else {
          delete nuevosErrores[campo];
        }
        break;
      case 'numeroParticipantes':
        const num = parseInt(valor);
        if (!valor || num < 1 || num > 50) {
          nuevosErrores[campo] = 'Entre 1 y 50 participantes';
        } else {
          delete nuevosErrores[campo];
        }
        break;
      case 'tipoEvento':
        if (!valor) {
          nuevosErrores[campo] = 'Selecciona el tipo de evento';
        } else {
          delete nuevosErrores[campo];
        }
        break;
      case 'descripcion':
        if (!valor || valor.trim().length < 10) {
          nuevosErrores[campo] = 'Describe brevemente el evento (mínimo 10 caracteres)';
        } else {
          delete nuevosErrores[campo];
        }
        break;
    }

    setErrores(nuevosErrores);
  };

  const actualizarCampo = (campo: string, valor: any) => {
    onDatosActualizados({ [campo]: valor });
    validarCampo(campo, valor);
  };

  const validarFormulario = () => {
    const camposRequeridos = [
      'nombreCompleto', 'email', 'telefono', 'cedula',
      'tipoEvento', 'numeroParticipantes', 'descripcion'
    ];

    let formularioValido = true;
    const nuevosErrores: Record<string, string> = {};

    camposRequeridos.forEach(campo => {
      const valor = datosSolicitud[campo as keyof DatosSolicitud];
      validarCampo(campo, valor);
      if (!valor) {
        nuevosErrores[campo] = 'Este campo es requerido';
        formularioValido = false;
      }
    });

    setErrores(prev => ({ ...prev, ...nuevosErrores }));
    return formularioValido && Object.keys(errores).length === 0;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Preparar datos para inserción en API (Django/RTK Query)
      const datosParaInsertar = {
        event_date: datosSolicitud.fecha!.toISOString().split('T')[0],
        start_time: datosSolicitud.horaInicio!,
        end_time: datosSolicitud.horaFin!,
        event_type: datosSolicitud.tipoEvento!,
        participant_count: datosSolicitud.numeroParticipantes!,
        description: datosSolicitud.descripcion!,
        requires_equipment: datosSolicitud.requiereEquipos || false,
        requested_equipment: datosSolicitud.equiposSolicitados || null,
        full_name: datosSolicitud.nombreCompleto!,
        national_document: datosSolicitud.cedula!,
        email: datosSolicitud.email!,
        phone: datosSolicitud.telefono!,
      };

      const result = await createBooking(datosParaInsertar).unwrap();

      console.log('Solicitud enviada exitosamente:', result);
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud ha sido registrada exitosamente",
      });

      await onEnviar(datosSolicitud as DatosSolicitud);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado al procesar la solicitud. Por favor inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onRetroceder}
          className="text-primary hover:bg-muted/20 mb-4"
          disabled={isLoading}
        >
          <ArrowLeft size={16} className="mr-2" />
          Cambiar horario
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={manejarEnvio} className="space-y-6">
            {/* Datos Personales */}
            <DatosPersonalesCard
              datosSolicitud={datosSolicitud}
              actualizarCampo={actualizarCampo}
              errores={errores}
              isLoading={isLoading}
            />

            {/* Detalles del Evento */}
            <DetallesEventoCard
              datosSolicitud={datosSolicitud}
              actualizarCampo={actualizarCampo}
              errores={errores}
              isLoading={isLoading}
            />

            <Button
              type="submit"
              className="w-full py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Enviando solicitud...
                </>
              ) : (
                'Enviar Solicitud'
              )}
            </Button>
          </form>
        </div>

        {/* Resumen de la reserva */}
        <div className="lg:col-span-1">
          <ResumenReservaCard datosSolicitud={datosSolicitud} />
        </div>
      </div>
    </div>
  );
}

const DatosPersonalesCard = ({ datosSolicitud, actualizarCampo, errores, isLoading }: any) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
        <User size={20} className="mr-2" />
        Datos Personales
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
          <Input
            id="nombreCompleto"
            value={datosSolicitud.nombreCompleto || ''}
            onChange={(e) => actualizarCampo('nombreCompleto', e.target.value)}
            placeholder="Tu nombre completo"
            className={errores.nombreCompleto ? 'border-destructive focus:border-destructive' : ''}
            disabled={isLoading}
          />
          {errores.nombreCompleto && (
            <p className="text-destructive text-sm mt-1">{errores.nombreCompleto}</p>
          )}
        </div>

        <div>
          <Label htmlFor="cedula">Cédula de Identidad *</Label>
          <CedulaInput
            id="cedula"
            value={datosSolicitud.cedula || ''}
            onChange={(valor) => actualizarCampo('cedula', valor)}
            placeholder="12345678"
            className={errores.cedula ? 'border-destructive focus:border-destructive' : ''}
            disabled={isLoading}
          />
          {errores.cedula && (
            <p className="text-destructive text-sm mt-1">{errores.cedula}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Correo Electrónico *</Label>
          <Input
            id="email"
            type="email"
            value={datosSolicitud.email || ''}
            onChange={(e) => actualizarCampo('email', e.target.value)}
            placeholder="tu@email.com"
            className={errores.email ? 'border-destructive focus:border-destructive' : ''}
            disabled={isLoading}
          />
          {errores.email && (
            <p className="text-destructive text-sm mt-1">{errores.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            value={datosSolicitud.telefono || ''}
            onChange={(e) => actualizarCampo('telefono', e.target.value)}
            placeholder="04121234567"
            className={errores.telefono ? 'border-destructive focus:border-destructive' : ''}
            disabled={isLoading}
          />
          {errores.telefono && (
            <p className="text-destructive text-sm mt-1">{errores.telefono}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const DetallesEventoCard = ({ datosSolicitud, actualizarCampo, errores, isLoading }: any) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
        <FileText size={20} className="mr-2" />
        Detalles del Evento
      </h3>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tipoEvento">Tipo de Evento *</Label>
            <Select
              value={datosSolicitud.tipoEvento || ''}
              onValueChange={(valor) => actualizarCampo('tipoEvento', valor)}
              disabled={isLoading}
            >
              <SelectTrigger className={errores.tipoEvento ? 'border-destructive focus:border-destructive' : ''}>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reunion">Reunión</SelectItem>
                <SelectItem value="conferencia">Conferencia</SelectItem>
                <SelectItem value="taller">Taller</SelectItem>
                <SelectItem value="seminario">Seminario</SelectItem>
                <SelectItem value="evento-cultural">Evento Cultural</SelectItem>
                <SelectItem value="capacitacion">Capacitación</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errores.tipoEvento && (
              <p className="text-destructive text-sm mt-1">{errores.tipoEvento}</p>
            )}
          </div>

          <div>
            <Label htmlFor="numeroParticipantes">Número de Participantes *</Label>
            <Input
              id="numeroParticipantes"
              type="number"
              min="1"
              max="50"
              value={datosSolicitud.numeroParticipantes || ''}
              onChange={(e) => actualizarCampo('numeroParticipantes', parseInt(e.target.value))}
              placeholder="Ej: 25"
              className={errores.numeroParticipantes ? 'border-destructive focus:border-destructive' : ''}
              disabled={isLoading}
            />
            {errores.numeroParticipantes && (
              <p className="text-destructive text-sm mt-1">{errores.numeroParticipantes}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción del Evento *</Label>
          <Textarea
            id="descripcion"
            value={datosSolicitud.descripcion || ''}
            onChange={(e) => actualizarCampo('descripcion', e.target.value)}
            placeholder="Describe brevemente el propósito y actividades del evento..."
            rows={4}
            className={errores.descripcion ? 'border-destructive focus:border-destructive' : ''}
            disabled={isLoading}
          />
          {errores.descripcion && (
            <p className="text-destructive text-sm mt-1">{errores.descripcion}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requiereEquipos"
              checked={datosSolicitud.requiereEquipos || false}
              onCheckedChange={(checked) => actualizarCampo('requiereEquipos', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="requiereEquipos">
              Requiero equipos adicionales (proyector, sonido, etc.)
            </Label>
          </div>

          {datosSolicitud.requiereEquipos && (
            <div>
              <Label htmlFor="equiposSolicitados">Equipos Solicitados</Label>
              <Textarea
                id="equiposSolicitados"
                value={datosSolicitud.equiposSolicitados || ''}
                onChange={(e) => actualizarCampo('equiposSolicitados', e.target.value)}
                placeholder="Especifica qué equipos necesitas..."
                rows={2}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ResumenReservaCard = ({ datosSolicitud }: any) => (
  <Card className="sticky top-4">
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Resumen de Reserva
      </h3>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Calendar size={16} className="text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">
              {datosSolicitud.fecha && format(datosSolicitud.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Clock size={16} className="text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Horario</p>
            <p className="font-medium">
              {datosSolicitud.horaInicio} - {datosSolicitud.horaFin}
            </p>
          </div>
        </div>

        {datosSolicitud.numeroParticipantes && (
          <div className="flex items-center space-x-3">
            <Users size={16} className="text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Participantes</p>
              <p className="font-medium">{datosSolicitud.numeroParticipantes} personas</p>
            </div>
          </div>
        )}

        {datosSolicitud.tipoEvento && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo de Evento</p>
            <Badge variant="outline" className="bg-muted/20 capitalize">
              {datosSolicitud.tipoEvento.replace('-', ' ')}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          * Recibirás confirmación por email en un plazo máximo de 24 horas
        </p>
      </div>
    </CardContent>
  </Card>
);
