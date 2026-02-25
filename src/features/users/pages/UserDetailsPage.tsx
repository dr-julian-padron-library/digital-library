import { useNavigate } from 'react-router-dom';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/common/components/ui/card';
import { ReturnButton } from '@/common/components/ui/return-button';
import { ArrowLeft, Mail, Phone, Calendar, Activity, User, CreditCard, MapPin, AlertCircle, QrCode, Edit } from 'lucide-react';
import { useToast } from '@/common/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetUserProfileQuery } from "@/features/authentication/api/authApiSlice.ts";
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '../../authentication/hooks/useCurrentUser';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export default function DetallesUsuario() {
  const { isLoading, isError } = useGetUserProfileQuery();
  const { profile, displayName, email, initials } = useCurrentUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-biblioteca-blue" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold text-destructive">{t("users.errorLoadingProfile")}</h2>
        <p className="mt-2 text-muted-foreground">{t("users.userInformationNotFound")}</p>
        <Button className="mt-4" onClick={() => navigate(-1)}>{t("users.back")}</Button>
      </div>
    );
  }

  const hasRequiredFields =
    profile.national_document &&
    profile.phone &&
    profile.address &&
    profile.birth_date;

  const missingFields = [];
  if (!profile.national_document) missingFields.push(t("users.nationalDocument"));
  if (!profile.phone) missingFields.push(t("users.phone"));
  if (!profile.address) missingFields.push(t("users.address"));
  if (!profile.birth_date) missingFields.push(t("users.birthDate"));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ReturnButton />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-biblioteca-blue">{t("users.userDetails")}</h1>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate('/perfil/editar')}>
          <Edit className="h-4 w-4" />
          {t("users.editProfile")}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: User Details */}
        <div className="w-full lg:w-2/3 space-y-6 order-2 lg:order-1">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-biblioteca-blue" />
                {t("users.personalInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-x-6 gap-y-4 grid-cols-1 xl:grid-cols-2">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">{t("users.fullName")}</label>
                  <p className="text-lg font-semibold">{displayName}</p>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">{t("users.nationalDocument")}</label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono">{profile.national_document || t("users.notRegistered")}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 xl:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">{t("users.email")}</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="break-all">{email}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">{t("users.phone")}</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{profile.phone || t("users.notProvided")}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1 xl:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">{t("users.address")}</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="break-all">{profile.address || t("users.notProvidedAddress")}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">{t("users.birthDate")}</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{profile.birth_date ? format(new Date(profile.birth_date), 'PPP', { locale: es }) : t("users.notProvided")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estado y Actividad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-biblioteca-blue" />
                {t("users.statusAndActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("users.featureAvailableSoonLoans")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Préstamos */}
          <Card>
            <CardHeader>
              <CardTitle>{t("users.loanHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("users.featureAvailableSoonLoans")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle>{t("users.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("users.featureAvailableSoonActivity")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: QR Code */}
        <div className="w-full lg:w-1/3 space-y-6 order-1 lg:order-2">
          <Card className={`h-fit transition-all duration-300 ${!hasRequiredFields ? 'border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-500/10' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className={`h-5 w-5 ${hasRequiredFields ? 'text-biblioteca-blue' : 'text-yellow-600 dark:text-yellow-500'}`} />
                {t("users.digitalCredential")}
              </CardTitle>
              <CardDescription>
                {hasRequiredFields
                  ? t("users.scanCodeIdentifyUser")
                  : t("users.completeProfileToGenerateCredential")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
              {hasRequiredFields ? (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50">
                  <QRCodeSVG
                    value={String(profile.id)}
                    size={200}
                    level="H"
                    className="h-auto w-full max-w-[200px]"
                  />
                  <p className="mt-4 text-xs text-center text-muted-foreground font-mono">
                    ID: {profile.id}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                    <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-yellow-800 dark:text-yellow-400">
                      {t("users.incompleteProfile")}
                    </p>
                    <p className="text-sm text-muted-foreground px-4">
                      {t("users.mustAddInfoForQR")}
                    </p>
                  </div>
                  <ul className="text-sm text-left list-disc list-inside text-muted-foreground bg-background/50 p-3 rounded-lg w-full border border-border/50">
                    {missingFields.map((field) => (
                      <li key={field} className="text-yellow-700 dark:text-yellow-500/90 font-medium">
                        {field}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-700 dark:text-yellow-400 mt-2"
                    onClick={() => navigate('/perfil/editar') /* Assuming an edit route exists, or logic to open edit dialog */}
                  >
                    {t("users.completeProfile")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}