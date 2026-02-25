import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/common/components/ui/card';
import { Avatar, AvatarFallback } from '@/common/components/ui/avatar';
import { Button } from '@/common/components/ui/button';
import { Edit, User, Mail, Phone, MapPin, Briefcase, Calendar, BookOpen, Activity } from 'lucide-react';
import { Separator } from '@/common/components/ui/separator';
import { ReturnButton } from '@/common/components/ui/return-button';
import { useToast } from '@/common/hooks/use-toast';
import { ProfileForm } from '@/features/content-management/components/ProfileForm/ProfileForm';
import { Profile, ProfileFormData } from '@/features/content-management/components/ProfileForm/ProfileFormConfig';
import { useGetProfileByIdQuery, useUpdateProfileMutation, useCreateProfileMutation } from '@/features/content-management/api/profilesApiSlice';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading, isError } = useGetProfileByIdQuery(id!, {
    skip: !id,
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [createProfile, { isLoading: isCreatingProfile }] = useCreateProfileMutation();

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async (profileData: ProfileFormData) => {
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        formData.append(key, profileData[key as keyof ProfileFormData]);
      });
      if (id) {
        // Handle update operation
        await updateProfile({ id, formData }).unwrap();
        toast({
          title: t("profileForm.success"),
          description: t("profileForm.profileUpdated"),
        });
        setEditing(false);
      } else {
        // Handle create operation
        await createProfile({ formData }).unwrap(); // Fix is here
        toast({
          title: t("profileForm.success"),
          description: t("profileForm.profileCreated"),
        });
        navigate('/gestion/usuarios');
      }
    } catch (error) {
      toast({
        title: t("profileForm.error"),
        description: id ? t("profileForm.profileUpdateError") : t("profileForm.profileCreateError"),
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
    if (!firstName || !lastName) return '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!id) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <ReturnButton />
        <div className="flex items-center justify-between my-3">
          <h1 className="text-3xl font-bold text-biblioteca-dark">{t("profileForm.createNewProfile")}</h1>
        </div>
        <ProfileForm
          onSubmit={handleSave}
          onCancel={() => navigate(-1)}
          isSubmitting={isCreatingProfile}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-biblioteca-primary"></div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <ReturnButton />
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t("profileForm.userNotFound")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <ReturnButton />
      <div className="flex items-center justify-between my-3">
        <h1 className="text-3xl font-bold text-biblioteca-dark">{t("profileForm.userProfile")}</h1>
        {!editing && (
          <Button onClick={handleEdit} size="sm">
            <Edit className="h-4 w-4 mr-2" />
            {t("profileForm.editProfile")}
          </Button>
        )}
      </div>

      {editing ? (
        <ProfileForm
          profile={profile}
          onSubmit={handleSave}
          onCancel={handleCancel}
          isSubmitting={isUpdatingProfile}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-biblioteca-primary text-white">
                  {getInitials(profile.user?.first_name, profile.user?.last_name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{`${profile.user?.first_name} ${profile.user?.last_name}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{t("profileForm.nationalDocument", { id: profile.national_document || t("profileForm.notAvailable") })}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.address}</span>
                </div>
              )}
              {profile.birth_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{t("profileForm.birthDate", { date: new Date(profile.birth_date).toLocaleDateString() })}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics and Other Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("profileForm.additionalInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t("profileForm.loanStatistics")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}