import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useToast } from '@/common/hooks/use-toast';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/common/components/ui/card';
import { Save, X, Eye, EyeOff } from 'lucide-react';
import {
  Profile,
  ProfileFormData,
  defaultProfileFormValues,
  mapProfileToFormValues,
} from '@/features/content-management/components/ProfileForm/ProfileFormConfig';

interface ProfileFormProps {
  profile?: Profile | null;
  onSubmit: (profileData: ProfileFormData) => void;
  onCancel: () => void;
  isUpdatingProfile?: boolean;
  isSubmitting?: boolean;
}

export function ProfileForm({
  profile,
  onSubmit,
  onCancel,
  isUpdatingProfile,
  isSubmitting,
}: ProfileFormProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: defaultProfileFormValues,
  });

  const onFormSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    try {
      onSubmit(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Error al procesar el perfil.`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (profile) {
      reset(mapProfileToFormValues(profile));
    } else {
      reset(defaultProfileFormValues);
    }
  }, [profile, reset]);

  const isNewProfile = !profile;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isNewProfile ? 'Crear Nuevo Perfil' : 'Editar Perfil'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                {...register('first_name', { required: 'El nombre es requerido' })}
                className={errors.first_name ? 'border-red-500' : ''}
                placeholder="Ej. Juan"
              />
              {errors.first_name?.message && (
                <p className="text-red-500 text-sm">{String(errors.first_name.message)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                {...register('last_name', { required: 'El apellido es requerido' })}
                className={errors.last_name ? 'border-red-500' : ''}
                placeholder="Ej. Pérez"
              />
              {errors.last_name?.message && (
                <p className="text-red-500 text-sm">{String(errors.last_name.message)}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: 'El correo electrónico es requerido' })}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Ej. juan.perez@example.com"
            />
            {errors.email?.message && (
              <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'La contraseña es requerida' })}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password?.message && (
                <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirm_password', {
                    required: 'Confirmar la contraseña es requerido',
                    validate: (value, formValues) =>
                      value === formValues.password || 'Las contraseñas no coinciden',
                  })}
                  className={errors.confirm_password ? 'border-red-500 pr-10' : 'pr-10'}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirm_password?.message && (
                <p className="text-red-500 text-sm">{String(errors.confirm_password.message)}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="national_document">Documento de identidad</Label>
              <Input
                id="national_document"
                {...register('national_document')}
                className={errors.national_document ? 'border-red-500' : ''}
                placeholder="Ej. V-12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
                placeholder="Ej. +58 412 1234567"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              {...register('address')}
              className={errors.address ? 'border-red-500' : ''}
              placeholder="Ej. Av. Francisco de Miranda"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de nacimiento</Label>
            <Input
              id="birth_date"
              type="date"
              {...register('birth_date')}
              className={errors.birth_date ? 'border-red-500' : ''}
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-biblioteca-blue text-biblioteca-blue hover:bg-biblioteca-blue hover:text-white"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-biblioteca-blue hover:bg-biblioteca-blue/90 text-white"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isNewProfile ? 'Crear Perfil' : 'Actualizar Perfil'}
        </Button>
      </div>
    </form>
  );
}