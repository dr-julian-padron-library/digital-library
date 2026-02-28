import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/common/components/ui/card";
import { useToast } from "@/common/components/ui/use-toast";
import { ReturnButton } from "@/common/components/ui/return-button";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Textarea } from "@/common/components/ui/textarea";
import { Switch } from "@/common/components/ui/switch";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/common/components/ui/form";
import {
    useGetNewsBySlugQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
} from "@/features/content-management/api/newsApiSlice";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
    title: z.string().min(1, "El título es obligatorio").max(100, "El título no puede superar los 100 caracteres"),
    subtitle: z.string().max(255, "El subtítulo no puede superar los 255 caracteres").optional().or(z.literal("")),
    content: z.string().min(50, "El contenido debe tener al menos 50 caracteres"),
    is_published: z.boolean().default(false),
    published_date: z.string().optional().or(z.literal("")),
    image: z.any()
        .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `El tamaño máximo es 5MB.`)
        .refine(
            (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
            "Solo se admiten formatos .jpg, .jpeg, .png y .webp."
        )
        .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const NewsFormPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();
    const isEditMode = !!slug;

    const { data: newsItem, isLoading: isNewsLoading } = useGetNewsBySlugQuery(slug || "", {
        skip: !isEditMode,
    });

    const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
    const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            subtitle: "",
            content: "",
            is_published: false,
            published_date: "",
        },
    });

    useEffect(() => {
        if (newsItem && isEditMode) {
            form.reset({
                title: newsItem.title,
                subtitle: newsItem.subtitle || "",
                content: newsItem.content,
                is_published: newsItem.is_published || false,
                // format date to mapping type if needed, e.g YYYY-MM-DDTHH:mm
                published_date: newsItem.published_date
                    ? new Date(newsItem.published_date).toISOString().slice(0, 16)
                    : "",
            });
        }
    }, [newsItem, isEditMode, form]);

    const onSubmit = async (values: FormValues) => {
        const formData = new FormData();
        formData.append("title", values.title);
        if (values.subtitle) formData.append("subtitle", values.subtitle);
        formData.append("content", values.content);
        formData.append("is_published", String(values.is_published));

        if (values.published_date) {
            // Converts datetime-local back to iso
            formData.append("published_date", new Date(values.published_date).toISOString());
        }

        if (values.image && values.image.length > 0) {
            formData.append("image", values.image[0]);
        }

        try {
            if (isEditMode && slug) {
                await updateNews({ slug, data: formData }).unwrap();
                toast({ title: t("newsForm.updateSuccess") });
            } else {
                await createNews(formData).unwrap();
                toast({ title: t("newsForm.createSuccess") });
            }
            navigate("/gestion/noticias");
        } catch (error) {
            toast({
                title: t("newsForm.saveErrorTitle"),
                description: t("newsForm.saveErrorDesc"),
                variant: "destructive",
            });
        }
    };

    const isLoading = isNewsLoading || isCreating || isUpdating;

    return (
        <Card>
            <ReturnButton />
            <CardHeader className="px-6 py-4">
                <CardTitle>{isEditMode ? t("newsForm.editTitle") : t("newsForm.createTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
                {isNewsLoading ? (
                    <div>{t("newsForm.loading")}</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => {
                                    const titleLength = field.value?.length || 0;
                                    const isTitleValid = titleLength > 0 && titleLength <= 100;
                                    return (
                                        <FormItem>
                                            <FormLabel>{t("newsForm.titleLabel")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("newsForm.titlePlaceholder")} {...field} />
                                            </FormControl>
                                            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
                                                <div className="flex items-center gap-1">
                                                    {isTitleValid ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                                                    <span className={isTitleValid ? "text-foreground" : titleLength > 100 ? "text-destructive" : ""}>{t("newsForm.max100")}</span>
                                                </div>
                                                <span className={titleLength > 100 ? "text-destructive" : ""}>{titleLength}/100</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="subtitle"
                                render={({ field }) => {
                                    const subtitleLength = field.value?.length || 0;
                                    const hasContent = subtitleLength > 0;
                                    const isValid = hasContent && subtitleLength <= 255;
                                    return (
                                        <FormItem>
                                            <FormLabel>{t("newsForm.subtitleLabel")}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t("newsForm.subtitlePlaceholder")} {...field} value={field.value || ""} />
                                            </FormControl>
                                            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
                                                <div className="flex items-center gap-1">
                                                    {isValid ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                                                    <span className={isValid ? "text-foreground" : subtitleLength > 255 ? "text-destructive" : ""}>{t("newsForm.max255")}</span>
                                                </div>
                                                <span className={subtitleLength > 255 ? "text-destructive" : ""}>{subtitleLength}/255</span>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => {
                                    const isContentValid = field.value ? field.value.length >= 50 : false;

                                    return (
                                        <FormItem>
                                            <FormLabel>{t("newsForm.contentLabel")}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t("newsForm.contentPlaceholder")}
                                                    className="min-h-[200px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <div className="text-[11px] text-muted-foreground mt-2 space-y-1">
                                                <div className="flex items-center gap-1">
                                                    {isContentValid ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                                                    <span className={isContentValid ? "text-foreground" : ""}>{t("newsForm.min50")}</span>
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>{t("newsForm.imageLabel")} {isEditMode ? t("newsForm.optional") : ""}</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                {...field}
                                                onChange={(e) => {
                                                    onChange(e.target.files);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {isEditMode && newsItem?.image && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                {t("newsForm.currentImage")} <a href={newsItem.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{t("newsForm.viewImage")}</a>
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-6 items-start">
                                <FormField
                                    control={form.control}
                                    name="is_published"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-1/2">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{t("newsForm.publishedLabel")}</FormLabel>
                                                <div className="text-sm text-muted-foreground">
                                                    {t("newsForm.publishedDesc")}
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="published_date"
                                    render={({ field }) => (
                                        <FormItem className="w-1/2">
                                            <FormLabel>{t("newsForm.publishedDateLabel")}</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/gestion/noticias")}
                                    disabled={isLoading}
                                >
                                    {t("newsForm.cancel")}
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? t("newsForm.saving") : isEditMode ? t("newsForm.update") : t("newsForm.create")}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
};

export default NewsFormPage;
