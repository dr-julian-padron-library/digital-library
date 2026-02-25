import { useParams, useNavigate } from "react-router-dom";
import { useGetBookBySlugQuery } from "@/features/content-management/api/booksApiSlice";
import type { components } from "@/common/types/generated-api-types";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { ReturnButton } from "@/common/components/ui/return-button";
import { Separator } from "@/common/components/ui/separator";
import { AspectRatio } from "@/common/components/ui/aspect-ratio";
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { AlertCircle, QrCode } from 'lucide-react';
import { useTranslation } from "react-i18next";

export type Book = components['schemas']['Book'];

const BookPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: book, isLoading, error } = useGetBookBySlugQuery(slug!);
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-6">
                <div className="text-xl font-medium text-biblioteca-blue dark:text-blue-400 animate-pulse">
                    {t("bookPage.loading")}
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-6">
                <div className="text-xl font-medium text-red-500">
                    {book ? t("bookPage.errorLoading") : t("bookPage.notFound")}
                </div>
            </div>
        );
    }

    const authorCount = book.authors_detail?.length;
    const authorLabel = authorCount && authorCount > 1 ? t("bookPage.authors") : t("bookPage.author");

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <ReturnButton />
            {/* The main content now uses a grid layout with a specific column and row configuration. */}
            <div className="grid gap-6 mt-4 md:grid-cols-[1fr_2fr] md:grid-rows-[min-content_1fr]">
                {/* Book Cover */}
                {/* On larger screens, the cover and title are on the same row. On smaller screens, they stack vertically. */}
                <div className="flex justify-center md:col-span-1 md:row-span-1 rounded-lg bg-glass dark:bg-accent/10 px-2">
                    <div className="w-48 sm:w-64">
                        <AspectRatio ratio={2 / 3}>
                            <img
                                src={book.cover}
                                alt={t("bookPage.coverOf", { title: book.title })}
                                className="h-full w-full rounded-md object-contain"
                            />
                        </AspectRatio>
                    </div>
                </div>

                {/* Title and Synopsis Panel */}
                <div className="flex-grow grid gap-2 rounded-lg bg-white dark:bg-card p-4 shadow-lg md:col-span-1 border dark:border-border">
                    {/* Title */}
                    <div className="flex flex-col items-start justify-between gap-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground md:text-3xl">
                            {book.title}
                        </h1>
                        {/* Cota (Primary Identifier) */}
                        {book.cota && (
                            <Badge variant="outline" className="text-lg font-mono border-biblioteca-blue dark:border-blue-400 text-biblioteca-blue dark:text-blue-400 px-3 py-1">
                                {book.cota}
                            </Badge>
                        )}
                    </div>

                    {/* Author(s) */}
                    {book.authors_detail && book.authors_detail.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-muted-foreground">
                            <span className="font-semibold">{authorLabel}</span>{" "}
                            {book.authors_detail.map((a) => a.name).join(", ")}
                        </div>
                    )}

                    {/* Number of Pages */}
                    {book.pages && (
                        <div className="text-sm text-gray-600 dark:text-muted-foreground">
                            <span className="font-semibold">{t("bookPage.pages")}</span>{" "}
                            {book.pages}
                        </div>
                    )}

                    {/* Meta Info and Rating */}
                    {book.language_detail && (
                        <div className="text-sm text-gray-600 dark:text-muted-foreground">
                            <span className="font-semibold">{t("bookPage.language")}</span>{" "}
                            {book.language_detail.name}
                        </div>
                    )}


                    {book.publication_date && (
                        <div className="text-sm text-gray-600 dark:text-muted-foreground">
                            <span className="font-semibold">{t("bookPage.publicationDate")}</span>{" "}
                            {book.publication_date}
                        </div>
                    )}

                    {/* Classification Fields */}
                    {(book.class_number || book.cutter_number || book.work_mark) && (
                        <div className="flex flex-wrap gap-4 mt-2 p-2 bg-gray-50 dark:bg-muted/50 rounded-md text-sm border border-gray-100 dark:border-border">
                            {book.class_number && (
                                <div>
                                    <span className="font-semibold text-xs text-gray-500 dark:text-muted-foreground block">{t("bookPage.classNum")}</span>
                                    <span className="font-mono text-gray-700 dark:text-foreground">{book.class_number}</span>
                                </div>
                            )}
                            {book.cutter_number && (
                                <div>
                                    <span className="font-semibold text-xs text-gray-500 dark:text-muted-foreground block">{t("bookPage.cutterNum")}</span>
                                    <span className="font-mono text-gray-700 dark:text-foreground">{book.cutter_number}</span>
                                </div>
                            )}
                            {book.work_mark && (
                                <div>
                                    <span className="font-semibold text-xs text-gray-500 dark:text-muted-foreground block">{t("bookPage.workMark")}</span>
                                    <span className="font-mono text-gray-700 dark:text-foreground">{book.work_mark}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Genres as Badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {book.genres_detail?.map((genre) => (
                            <Badge key={genre.id} variant="secondary" className="px-3 py-1">
                                {genre.label}
                            </Badge>
                        ))}
                    </div>

                    <Separator />

                    {/* Synopsis */}
                    <div className="grid gap-2">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-foreground">
                            {t("bookPage.synopsis")}
                        </h2>
                        <p className="text-sm text-gray-700 dark:text-muted-foreground">
                            {book.description || "—"}
                        </p>
                    </div>
                </div>

                {/* Key Details Panel */}
                {/* This section now spans both columns on the second row on larger screens. */}
                <div className="flex-grow grid gap-4 rounded-lg bg-white dark:bg-card p-4 shadow-lg md:col-span-2 md:row-start-2 border dark:border-border">
                    {/* Key Details */}
                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                        <div>
                            <span className="font-semibold text-gray-800 dark:text-foreground">{t("bookPage.publisher")}</span>{" "}
                            <span className="text-gray-700 dark:text-muted-foreground">{book.publisher || "—"}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-800 dark:text-foreground">{t("bookPage.material")}</span>{" "}
                            <span className="text-gray-700 dark:text-muted-foreground">
                                {book.material_type_detail?.name || "—"}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-800 dark:text-foreground">{t("bookPage.availableCopies")}</span>{" "}
                            <span className="text-gray-700 dark:text-muted-foreground">
                                {book.available_copies ?? "—"}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-800 dark:text-foreground">{t("bookPage.totalInStock")}</span>{" "}
                            <span className="text-gray-700 dark:text-muted-foreground">
                                {book.quantity_in_stock ?? "—"}
                            </span>
                        </div>
                    </div>

                    {/* Digital File Link */}
                    {book.digital_file && (
                        <div className="mt-4">
                            <a
                                href={book.digital_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-biblioteca-blue dark:text-blue-400 underline"
                            >
                                {t("bookPage.downloadDigitalFile")}
                            </a>
                        </div>
                    )}

                    {/* Secondary Details (ISBN moved here) */}
                    {book.isbn && (
                        <div className="mt-2">
                            <span className="font-semibold text-gray-800 dark:text-foreground">{t("bookPage.isbn")}</span>{" "}
                            <span className="text-gray-700 dark:text-muted-foreground text-sm">{book.isbn}</span>
                        </div>
                    )}
                </div>

                {/* QR Code Section */}
                <div className="md:col-span-1 md:row-span-2">
                    <Card className={`h-fit transition-all duration-300 ${!book.cota ? 'border-yellow-500/50 bg-yellow-500/5 dark:bg-yellow-500/10' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className={`h-5 w-5 ${book.cota ? 'text-biblioteca-blue dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-500'}`} />
                                {t("bookPage.bookCode")}
                            </CardTitle>
                            <CardDescription>
                                {book.cota
                                    ? t("bookPage.scanCode")
                                    : t("bookPage.missingDataForCode")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
                            {book.cota ? (
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50">
                                    <QRCodeSVG
                                        value={book.cota}
                                        size={200}
                                        level="H"
                                        className="h-auto w-full max-w-[200px]"
                                    />
                                    <p className="mt-4 text-xs text-center text-muted-foreground font-mono">
                                        {book.cota}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center space-y-4 py-4">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                                        <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium text-yellow-800 dark:text-yellow-400">
                                            {t("bookPage.qrNotAvailable")}
                                        </p>
                                        <p className="text-sm text-muted-foreground px-4 text-left">
                                            {t("bookPage.qrRequirement")}
                                        </p>
                                    </div>

                                    {/* Dynamic Listing of Missing Fields for Auto-Generation */}
                                    {(!book.class_number || !book.cutter_number || !book.work_mark) && (
                                        <div className="w-full mt-2 p-3 bg-background/50 rounded-lg border border-border/50 text-left">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2">{t("bookPage.missingForAutogen")}</p>
                                            <ul className="text-sm list-disc list-inside text-muted-foreground">
                                                {!book.class_number && <li className="text-yellow-700 dark:text-yellow-500/90">{t("bookPage.classificationNumber")}</li>}
                                                {!book.cutter_number && <li className="text-yellow-700 dark:text-yellow-500/90">{t("bookPage.cutterNumber")}</li>}
                                                {!book.work_mark && <li className="text-yellow-700 dark:text-yellow-500/90">{t("bookPage.workMarkCode")}</li>}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookPage;