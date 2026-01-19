import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  user: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
  }),
  national_document: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const defaultProfileFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  national_document: '',
  address: '',
  birth_date: '',
  phone: '',
  confirm_password: '',
};

/**
 * Maps a Profile model object to the format expected by the ProfileForm.
 * This is useful for editing existing profile entries.
 * @param {Profile | null | undefined} profile - The Profile model object to map.
 * @returns {typeof defaultProfileFormValues} The formatted object for form reset.
 */
export const mapProfileToFormValues = (profile: Profile | null | undefined) => {
  if (!profile) {
    return defaultProfileFormValues;
  }

  return {
    first_name: profile.user?.first_name ?? '',
    last_name: profile.user?.last_name ?? '',
    email: profile.user?.email ?? '',
    password: '',
    confirm_password: '',
    national_document: profile.national_document ?? '',
    address: profile.address ?? '',
    birth_date: profile.birth_date ?? '',
    phone: profile.phone ?? '',
  };
};

export type ProfileFormData = typeof defaultProfileFormValues;