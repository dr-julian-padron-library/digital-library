import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/features/authentication/api/authApiSlice';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { ReturnButton } from '@/common/components/ui/return-button';
import { useToast } from '@/common/hooks/use-toast';
import { Loader2, User as UserIcon, Phone, MapPin, Calendar, CreditCard, Lock, Eye, EyeOff, Key } from 'lucide-react';

const userEditSchema = z.object({
    national_document: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    birth_date: z.string().optional().nullable(),
    old_password: z.string().optional(),
    new_password: z.string().optional(),
    confirm_password: z.string().optional(),
}).refine((data) => {
    if (data.old_password || data.new_password || data.confirm_password) {
        if (!data.old_password) return false;
        if (!data.new_password) return false;
        if (!data.confirm_password) return false;
    }
    return true;
}, {
    message: "Para cambiar la contraseña, debes llenar todos los campos de contraseña.",
    path: ["old_password"],
}).refine((data) => {
    if (data.new_password && data.new_password.length < 8) {
        return false;
    }
    return true;
}, {
    message: "La nueva contraseña debe tener al menos 8 caracteres.",
    path: ["new_password"],
}).refine((data) => {
    if (data.new_password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm_password"],
});

type UserEditFormData = z.infer<typeof userEditSchema>;

export default function UserEditPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { data: profile, isLoading } = useGetUserProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isDirty },
        reset,
    } = useForm<UserEditFormData>({
        resolver: zodResolver(userEditSchema),
        defaultValues: {
            national_document: '',
            phone: '',
            address: '',
            birth_date: '',
            old_password: '',
            new_password: '',
            confirm_password: '',
        }
    });

    useEffect(() => {
        if (profile) {
            reset({
                national_document: profile.national_document || '',
                phone: profile.phone || '',
                address: profile.address || '',
                birth_date: profile.birth_date || '',
                old_password: '',
                new_password: '',
                confirm_password: '',
            });
        }
    }, [profile, reset]);

    const onSubmit = async (data: UserEditFormData) => {
        try {
            const formData = new FormData();
            if (data.national_document && !profile?.national_document) {
                formData.append('national_document', data.national_document);
            }
            if (data.phone) formData.append('phone', data.phone);
            if (data.address) formData.append('address', data.address);
            if (data.birth_date) formData.append('birth_date', data.birth_date);

            if (data.old_password && data.new_password) {
                formData.append('old_password', data.old_password);
                formData.append('new_password', data.new_password);
            }

            await updateProfile(formData).unwrap();

            toast({
                title: "Perfil actualizado",
                description: "Tus datos han sido guardados correctamente.",
            });

            navigate('/perfil');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            let errorMessage = "No se pudo actualizar el perfil. Por favor intenta de nuevo.";

            if (error?.data?.old_password) {
                errorMessage = "La contraseña actual es incorrecta.";
            }

            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-biblioteca-blue" />
            </div>
        );
    }

    const hasNationalDocument = !!profile?.national_document;

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-2xl">
            <ReturnButton />

            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-biblioteca-blue">Editar Perfil</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-biblioteca-blue" />
                            Información Personal
                        </CardTitle>
                        <CardDescription>
                            Actualiza tu información de contacto y datos personales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* National Document */}
                        <div className="space-y-2">
                            <Label htmlFor="national_document" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Cédula de Identidad
                            </Label>
                            <Input
                                id="national_document"
                                {...register('national_document')}
                                disabled={hasNationalDocument}
                                className={hasNationalDocument ? "bg-muted" : ""}
                                placeholder="Ej. V-12345678"
                            />
                            {hasNationalDocument && (
                                <p className="text-xs text-muted-foreground">
                                    El documento de identidad no se puede modificar una vez establecido.
                                </p>
                            )}
                            {errors.national_document && (
                                <p className="text-sm text-destructive">{errors.national_document.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Teléfono
                            </Label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="+58 412 1234567"
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Dirección
                            </Label>
                            <Input
                                id="address"
                                {...register('address')}
                                placeholder="Ej. Av. Principal, Edificio A, Piso 1"
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address.message}</p>
                            )}
                        </div>

                        {/* Birth Date */}
                        <div className="space-y-2">
                            <Label htmlFor="birth_date" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Fecha de Nacimiento
                            </Label>
                            <Input
                                id="birth_date"
                                type="date"
                                {...register('birth_date')}
                            />
                            {errors.birth_date && (
                                <p className="text-sm text-destructive">{errors.birth_date.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Password Change Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-biblioteca-blue" />
                            Cambiar Contraseña
                        </CardTitle>
                        <CardDescription>
                            Deja estos campos vacíos si no deseas cambiar tu contraseña.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="old_password">Contraseña Anterior</Label>
                            <div className="relative">
                                <Input
                                    id="old_password"
                                    type={showOldPassword ? "text" : "password"}
                                    {...register('old_password')}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    {showOldPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                            {errors.old_password && (
                                <p className="text-sm text-destructive">{errors.old_password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new_password">Nueva Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="new_password"
                                    type={showNewPassword ? "text" : "password"}
                                    {...register('new_password')}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                            {errors.new_password && (
                                <p className="text-sm text-destructive">{errors.new_password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirm_password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register('confirm_password')}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                            {errors.confirm_password && (
                                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
                            )}
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
                            <div className="flex items-center gap-2 font-medium text-foreground/80">
                                <Lock className="h-4 w-4" />
                                Requisitos de seguridad
                            </div>
                            <ul className="list-disc list-inside space-y-1 ml-1">
                                <li>La contraseña debe tener al menos 8 caracteres.</li>
                                <li>No debe ser una contraseña común o fácil de adivinar.</li>
                                <li>Se recomienda combinar letras, números y símbolos.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/perfil')}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-biblioteca-blue hover:bg-biblioteca-blue/90"
                    >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>

            </form>
        </div>
    );
}
