import React from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetNewsBySlugQuery } from "@/features/content-management/api/newsApiSlice";
import { Button } from "@/common/components/ui/button";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";

const NewsDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { t } = useTranslation();

    const { data: newsItem, isFetching } = useGetNewsBySlugQuery(slug || "", {
        skip: !slug,
    });

    if (isFetching) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
                <div className="h-8 w-32 bg-muted rounded mb-8"></div>
                <div className="h-64 md:h-96 bg-muted rounded-xl mb-8 w-full"></div>
                <div className="h-12 w-3/4 bg-muted rounded mb-4"></div>
                <div className="h-4 w-1/4 bg-muted rounded mb-8"></div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (!newsItem) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-4xl">
                <h2 className="text-3xl font-display font-bold text-secondary mb-4">
                    {t("newsDetail.notFoundTitle")}
                </h2>
                <p className="text-muted-foreground mb-8">
                    {t("newsDetail.notFoundDesc")}
                </p>
                <Link to="/noticias">
                    <Button>{t("newsDetail.backToList")}</Button>
                </Link>
            </div>
        );
    }

    return (
        <article className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in relative">
            <Link to="/noticias" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group">
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                {t("newsDetail.back")}
            </Link>

            {newsItem.image && (
                <div className="w-full h-64 md:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-lg">
                    <img
                        src={newsItem.image}
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                    {newsItem.title}
                </h1>

                {newsItem.subtitle && (
                    <h2 className="text-xl md:text-2xl text-muted-foreground mb-6 font-medium">
                        {newsItem.subtitle}
                    </h2>
                )}

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground border-b pb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary/80" />
                        <time dateTime={newsItem.published_date}>
                            {newsItem.published_date
                                ? new Date(newsItem.published_date).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })
                                : t("newsDetail.dateNotAvailable")}
                        </time>
                    </div>
                </div>
            </header>

            <div className="prose prose-lg md:prose-xl max-w-none text-foreground/90 whitespace-pre-wrap">
                {newsItem.content}
            </div>
        </article>
    );
};

export default NewsDetailPage;
