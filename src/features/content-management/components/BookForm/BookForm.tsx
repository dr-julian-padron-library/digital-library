import { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '@/common/hooks/use-toast';
import { Button } from '@/common/components/ui/button';
import { Input } from '@/common/components/ui/input';
import { Textarea } from '@/common/components/ui/textarea';
import { Label } from '@/common/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Save, X, Upload, CalendarIcon, Plus, FileText, Trash2 } from 'lucide-react';
import { mapBookToFormValues, BookFormData } from '@/features/content-management/components/BookForm/BookFormConfig';
import type { Book } from '@/features/content-management/api/booksApiSlice';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { cn } from '@/common/lib/utils';
import { Calendar } from '@/common/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetMaterialTypesQuery } from '@/features/content-management/api/materialTypesApiSlice';
import { useGetLanguagesQuery } from '@/features/content-management/api/languagesApiSlice';
import { useGetGenresQuery } from '@/features/content-management/api/genresApiSlice';
import { useGetAuthorsQuery } from '@/features/content-management/api/authorsApiSlice';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/common/components/ui/command";
import {
  Popover as CommandPopover,
  PopoverContent as CommandPopoverContent,
  PopoverTrigger as CommandPopoverTrigger,
} from "@/common/components/ui/popover";
import { useDebounce } from '@/common/components/ui/use-debounce';
import { useTranslation } from 'react-i18next';

interface BookFormProps {
  initialData?: Book;
  onSubmit: (bookData: BookFormData | FormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function BookForm({ initialData, onSubmit, onCancel, isSubmitting }: BookFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { data: materialTypes } = useGetMaterialTypesQuery({ page_size: 1000 });
  const { data: languages } = useGetLanguagesQuery({ page_size: 1000 });
  const { data: genresData } = useGetGenresQuery({ page_size: 1000 });
  const { data: authorsData } = useGetAuthorsQuery({ page_size: 1000 });

  const [authorSearch, setAuthorSearch] = useState('');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const debouncedAuthorSearch = useDebounce(authorSearch, 50);

  const isEditMode = !!initialData;

  const defaultValues = useMemo(
    () => ({
      ...mapBookToFormValues(initialData),
      authors: initialData?.authors_detail?.map((author) => author.name) || [],
      genres: initialData?.genres_detail?.map((g) => g.slug) || [], // CHANGE 1: Use g.slug instead of g.label
      material_type: initialData?.material_type_detail?.slug || "",
      language: initialData?.language_detail?.name || "",
    }),
    [initialData]
  );

  const { register, handleSubmit, formState: { errors }, reset, watch, control, setValue } = useForm<BookFormData>({
    defaultValues,
    values: initialData ? defaultValues : undefined,
  });

  const watchedCover = watch('cover');
  const watchedDigitalFile = watch('digital_file');

  let languageResults = [];
  let count = 0;

  if (languages && "results" in languages) {
    languageResults = languages.results;
    count = languages.count;
  } else if (Array.isArray(languages)) {
    languageResults = languages;
    count = languages.length;
  }

  useEffect(() => {
    let newUrl: string | null = null;
    let cleanup: (() => void) | undefined;

    if (watchedCover instanceof File) {
      const url = URL.createObjectURL(watchedCover);
      newUrl = url;
      cleanup = () => URL.revokeObjectURL(url);
    } else if (typeof watchedCover === 'string') {
      newUrl = watchedCover;
    }

    setCoverPreviewUrl(newUrl);
    return cleanup;
  }, [watchedCover]);

  const onFormSubmit = async (data: BookFormData) => {
    try {
      // Create a new FormData object
      const formData = new FormData();

      // Explicitly append all fields
      formData.append('title', data.title);
      if (data.isbn) formData.append('isbn', data.isbn);
      if (data.pages) formData.append('pages', String(data.pages));
      if (data.publisher) formData.append('publisher', data.publisher);
      if (data.description) formData.append('description', data.description);
      if (data.material_type) formData.append('material_type', data.material_type);
      if (data.language) formData.append('language', data.language);
      if (data.quantity_in_stock) formData.append('quantity_in_stock', String(data.quantity_in_stock));
      if (data.available_copies) formData.append('available_copies', String(data.available_copies));


      // Append authors array
      if (data.authors && data.authors.length > 0) {
        data.authors.forEach(author => formData.append('authors', author));
      }

      // Append genres array
      if (data.genres && data.genres.length > 0) {
        data.genres.forEach(genre => formData.append('genres', genre));
      }

      // Append date field
      if (data.publication_date && !isNaN(Date.parse(data.publication_date as string))) {
        formData.append(
          'publication_date',
          new Date(data.publication_date as string).toISOString().split('bookForm.T')[0]
        );
      }

      // Append file fields
      if (data.cover instanceof File) {
        formData.append('cover', data.cover);
      } else if (data.cover === null) {
        formData.append('cover', '');
      }

      if (data.digital_file instanceof File) {
        formData.append('digital_file', data.digital_file);
      } else if (data.digital_file === null) {
        formData.append('digital_file', '');
      }

      // Append classification fields
      if (data.class_number) formData.append('class_number', data.class_number);
      if (data.cutter_number) formData.append('cutter_number', data.cutter_number);
      if (data.work_mark) formData.append('work_mark', data.work_mark);

      // Log FormData contents for debugging
      console.log(languageResults);
      console.log("FormData contents before submission:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Pass the FormData object to the onSubmit prop
      onSubmit(formData);
    } catch (error) {
      toast({ title: 'Error', description: t("bookForm.errorProcessing"), variant: 'destructive' });
    }
  };


  const handleCoverDelete = () => {
    setValue('cover', null, { shouldDirty: true });
    setCoverPreviewUrl(null);
  };

  const handleDigitalFileDelete = () => {
    setValue('digital_file', null, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BookCoverCard
          t={t}
          coverPreviewUrl={coverPreviewUrl}
          handleCoverDelete={handleCoverDelete}
          watchedCover={watchedCover}
          watchedDigitalFile={watchedDigitalFile}
          handleDigitalFileDelete={handleDigitalFileDelete}
          errors={errors}
          setValue={setValue}
        />

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <BookBasicInfoCard
            t={t}
            register={register}
            errors={errors}
            control={control}
            authorsData={authorsData}
            debouncedAuthorSearch={debouncedAuthorSearch}
            setAuthorSearch={setAuthorSearch}
            authorSearch={authorSearch}
            materialTypes={materialTypes}
            genresData={genresData}
          />

          {/* Publicación */}
          <BookPublicationCard
            t={t}
            register={register}
            control={control}
            errors={errors}
            languageResults={languageResults}
          />

          {/* Inventario (solo edición) */}
          {isEditMode && (
            <BookInventoryCard
              t={t}
              register={register}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-biblioteca-blue text-biblioteca-blue hover:bg-biblioteca-blue hover:text-white"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          {t("bookForm.cancel")}
        </Button>
        <Button
          type="submit"
          className="bg-biblioteca-blue hover:bg-biblioteca-blue/90 text-white"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditMode ? t("bookForm.updateBook") : t("bookForm.saveBook")}
        </Button>
      </div>
    </form>
  );
}

const BookCoverCard = ({
  t,
  coverPreviewUrl,
  handleCoverDelete,
  watchedCover,
  watchedDigitalFile,
  handleDigitalFileDelete,
  errors,
  setValue
}: any) => (
  <div className="lg:col-span-1">
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-biblioteca-blue">
          {t("bookForm.bookCover")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
          {coverPreviewUrl ? (
            <>
              <img
                src={coverPreviewUrl}
                alt={t("bookForm.preview")}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop';
                }}
              />
              <Button
                type="button"
                onClick={handleCoverDelete}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-900/50 text-white hover:bg-red-500/70 transition-colors"
                variant="ghost"
                size="icon"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Upload className="w-12 h-12" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          {watchedCover && typeof watchedCover !== 'string' && (
            <p className="text-sm text-gray-500 truncate">
              {t("bookForm.selectedFile")} <span className="font-medium text-gray-900">{watchedCover.name}</span>
            </p>
          )}
          <Label htmlFor="cover-upload">
            <div className="w-full flex justify-center items-center py-2 px-4 border border-biblioteca-blue text-biblioteca-blue rounded-md cursor-pointer hover:bg-biblioteca-blue/10 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              <span>{t("bookForm.addFile")}</span>
            </div>
          </Label>
          <Input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue('cover', file);
              }
            }}
            className="hidden" // Oculta el input de archivo real
          />
          {errors.cover?.message && (
            <p className="text-red-500 text-sm">{String(errors.cover.message)}</p>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="digital_file">{t("bookForm.digitalFileTitle")}</Label>
          {watchedDigitalFile && (
            <div className="text-sm text-gray-500 flex items-center justify-end">
              {typeof watchedDigitalFile === 'string' ? (
                <div className="flex items-center space-x-2">
                  <a
                    href={watchedDigitalFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-biblioteca-blue hover:underline"
                  >
                    {t("bookForm.viewFile")}
                  </a>
                  <Button
                    type="button"
                    onClick={handleDigitalFileDelete}
                    className="p-1 text-red-500 hover:bg-red-500/10"
                    variant="ghost"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{t("bookForm.fileAdded")}</span>
                  <Button
                    type="button"
                    onClick={handleDigitalFileDelete}
                    className="p-1 text-red-500 hover:bg-red-500/10"
                    variant="ghost"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          <Label htmlFor="digital-file-upload">
            <div className="w-full flex justify-center items-center py-2 px-4 border border-biblioteca-blue text-biblioteca-blue rounded-md cursor-pointer hover:bg-biblioteca-blue/10 transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              <span>{t("bookForm.addFile")}</span>
            </div>
          </Label>
          <Input
            id="digital-file-upload"
            type="file"
            accept=".pdf,.epub"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue('digital_file', file);
              }
            }}
            className="hidden" // Oculta el input de archivo real
          />
          {errors.digital_file?.message && (
            <p className="text-red-500 text-sm">{String(errors.digital_file.message)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);



const BookBasicInfoCard = ({
  t,
  register,
  errors,
  control,
  authorsData,
  debouncedAuthorSearch,
  setAuthorSearch,
  authorSearch,
  materialTypes,
  genresData
}: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-biblioteca-blue">{t("bookForm.basicInfo")}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">{t("bookForm.titleLabel")}</Label>
          <Input
            id="title"
            {...register('title', { required: t("bookForm.titleRequired") })}
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title?.message && (
            <p className="text-red-500 text-sm">{String(errors.title.message)}</p>
          )}
        </div>

        {/* Autores */}
        <div className="space-y-2">
          <Label htmlFor="authors">{t("bookForm.authorsLabel")}</Label>
          <Controller
            name="authors"
            control={control}
            render={({ field }) => {
              const handleAddAuthor = (name: string) => {
                if (!name.trim()) return;
                if (!field.value.includes(name)) {
                  field.onChange([...(field.value || []), name]);
                }
                setAuthorSearch("");
              };

              const filteredAuthors = authorsData?.results
                ?.filter(
                  (author: any) =>
                    !(field.value || []).includes(author.name) &&
                    author.name.toLowerCase().includes(debouncedAuthorSearch.toLowerCase())
                ) || [];

              const noMatchingAuthor =
                debouncedAuthorSearch &&
                !filteredAuthors.find(
                  (author: any) => author.name.toLowerCase() === debouncedAuthorSearch.toLowerCase()
                );

              return (
                <CommandPopover>
                  <CommandPopoverTrigger asChild>
                    <div className="flex flex-wrap gap-2 min-h-10 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                      {(field.value || []).length === 0 && (
                        <div className="flex items-center">
                          <span className="text-muted-foreground">{t("bookForm.selectAuthors")}</span>
                          <div className="ml-2 w-6 h-6 rounded-full bg-biblioteca-blue text-white flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                      {(field.value || []).map((author: string, index: number) => (
                        <div
                          key={author}
                          className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs flex items-center"
                        >
                          {author}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const newAuthors = (field.value || []).filter((_: any, i: number) => i !== index);
                              field.onChange(newAuthors);
                            }}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CommandPopoverTrigger>
                  <CommandPopoverContent className="p-0" side="bottom" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={t("bookForm.searchAuthors")}
                        value={authorSearch}
                        onValueChange={setAuthorSearch}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && noMatchingAuthor) {
                            e.preventDefault();
                            handleAddAuthor(debouncedAuthorSearch);
                          }
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>{t("bookForm.noAuthorsFound")}</CommandEmpty>
                        <CommandGroup>
                          {noMatchingAuthor && (
                            <CommandItem onSelect={() => handleAddAuthor(debouncedAuthorSearch)}>
                              {t("bookForm.addAuthor", { name: debouncedAuthorSearch })}
                            </CommandItem>
                          )}
                          {authorsData?.results?.map((author: any) => (
                            <CommandItem
                              key={author.name}
                              value={author.name}
                              onSelect={() => handleAddAuthor(author.name)}
                            >
                              {author.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </CommandPopoverContent>
                </CommandPopover>
              );
            }}
          />
          {errors.authors?.message && (
            <p className="text-red-500 text-sm">{String(errors.authors.message)}</p>
          )}
        </div>

        {/* ISBN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="isbn">{t("bookForm.isbnLabel")}</Label>
          </div>
          <Input id="isbn" {...register('isbn')} placeholder="978-0-123456-78-9" />
        </div>

        {/* Classification Fields */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <Label className="text-biblioteca-blue">{t("bookForm.catalogingTitle")}</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md bg-gray-50/50">
            <div className="space-y-2">
              <Label htmlFor="class_number" className="text-xs text-muted-foreground">{t("bookForm.classNumberLabel")}</Label>
              <Input id="class_number" {...register('class_number')} placeholder="e.g. 863" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutter_number" className="text-xs text-muted-foreground">{t("bookForm.cutterNumberLabel")}</Label>
              <Input id="cutter_number" {...register('cutter_number')} placeholder="e.g. G166" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work_mark" className="text-xs text-muted-foreground">{t("bookForm.workMarkLabel")}</Label>
              <Input id="work_mark" {...register('work_mark')} placeholder="e.g. d" />
            </div>
            <div className="col-span-1 md:col-span-3 text-xs text-muted-foreground italic">
              {t("bookForm.catalogingDisclaimer")}
            </div>
          </div>
        </div>

        {/* Tipo de Material */}
        <div className="space-y-2">
          <Label htmlFor="material_type">{t("bookForm.materialTypeLabel")}</Label>
          <Controller
            name="material_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.material_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t("bookForm.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {materialTypes?.results?.map((type: any) => (
                    // 👇 mandamos el slug al backend, mostramos el nombre al usuario
                    <SelectItem key={type.slug} value={type.slug}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.material_type?.message && (
            <p className="text-red-500 text-sm">{String(errors.material_type.message)}</p>
          )}
        </div>

        {/* Géneros */}
        <div className="space-y-2">
          <Label htmlFor="genres" className='block py-2'>{t("bookForm.genreLabel")}</Label>
          <Controller
            name="genres"
            control={control}
            render={({ field }) => (
              <CommandPopover>
                <CommandPopoverTrigger asChild>
                  <Button variant="outline" className="w-auto justify-between">
                    {field.value?.[0] ? genresData?.results?.find((g: any) => g.slug === field.value?.[0])?.label : t("bookForm.selectGenre")}
                  </Button>
                </CommandPopoverTrigger>
                <CommandPopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder={t("bookForm.searchGenres")} />
                    <CommandList>
                      <CommandEmpty>{t("bookForm.noGenresFound")}</CommandEmpty>
                      <CommandGroup>
                        {genresData?.results?.map((genre: any) => (
                          <CommandItem
                            key={genre.slug}
                            value={genre.slug}
                            onSelect={() => field.onChange([genre.slug])} // CHANGE 2: Set the form field value to the genre slug
                          >
                            {genre.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </CommandPopoverContent>
              </CommandPopover>
            )}
          />
          {errors.genres?.message && (
            <p className="text-red-500 text-sm">{String(errors.genres.message)}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">{t("bookForm.descriptionLabel")}</Label>
        <Textarea id="description" {...register('description')} rows={3} />
      </div>
    </CardContent>
  </Card>
);

const BookPublicationCard = ({ t, register, control, errors, languageResults }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-biblioteca-blue">{t("bookForm.publicationDetails")}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="publisher">{t("bookForm.publisherLabel")}</Label>
          <Input id="publisher" {...register('publisher')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publication_date">{t("bookForm.publicationDateLabel")}</Label>
          <Controller
            name="publication_date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="publication_date"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !value && 'text-muted-foreground',
                      errors.publication_date && 'border-red-500'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), 'PPP', { locale: es }) : <span>{t("bookForm.chooseDate")}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(date) => onChange(date?.toISOString())}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date > today || date < new Date('1900-01-01');
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.publication_date?.message && (
            <p className="text-red-500 text-sm">{String(errors.publication_date.message)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">{t("bookForm.languageLabel")}</Label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.language ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t("bookForm.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  {languageResults.map((lang: any) => (
                    <SelectItem key={lang.slug} value={lang.name}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.language?.message && (
            <p className="text-red-500 text-sm">{String(errors.language.message)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pages">{t("bookForm.pagesLabel")}</Label>
        <Input id="pages" type="number" min="1" {...register('pages', { valueAsNumber: true })} />
      </div>

    </CardContent>
  </Card>
);

const BookInventoryCard = ({ t, register }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-biblioteca-blue">{t("bookForm.inventory")}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity_in_stock">{t("bookForm.totalCopies")}</Label>
          <Input
            id="quantity_in_stock"
            type="number"
            {...register('quantity_in_stock', { valueAsNumber: true })}
            className=""
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="available_copies">{t("bookForm.availableCopies")}</Label>
          <Input
            id="available_copies"
            type="number"
            {...register('available_copies', { valueAsNumber: true })}
            className=""
            readOnly // Make this input read-only
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default BookForm;