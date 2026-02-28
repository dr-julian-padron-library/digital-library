import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetNewsListQuery } from "@/features/content-management/api/newsApiSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Calendar, Image as ImageIcon } from "lucide-react";
import { PaginationComponent } from "@/common/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";

const NewsListPage: React.FC = () => {
    const { t } = useTranslation();
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<string>("9"); // Grid of 3x3 default

    const { data: newsData, isFetching } = useGetNewsListQuery({
        page_size: parseInt(pageSize, 10),
        page: page,
        ordering: "-published_date", // newest first
        is_published: true,
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const count = newsData?.count || 0;
    const maxPage = Math.ceil(count / parseInt(pageSize, 10));

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
            <section className="mb-12 md:mb-16 text-center">
                <h1 className="font-display text-4xl md:text-5xl mb-4 text-biblioteca-blue dark:text-primary tracking-tight">
                    {t("newsList.title")} <span className="text-highlight-gold italic">{t("newsList.titleHighlight")}</span>
                </h1>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"></div>

                <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    {t("newsList.subtitle")}
                </p>
            </section>

            <div className="flex justify-end mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{t("newsList.show")}</span>
                    <Select value={pageSize} onValueChange={(val) => { setPageSize(val); setPage(1); }}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder={t("newsList.select")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="24">24</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isFetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse h-96 bg-muted/50"></Card>
                    ))}
                </div>
            ) : count === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">{t("newsList.noNews")}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newsData?.results?.map((news) => (
                            <Link to={`/noticias/${news.slug}`} key={news.id} className="block group">
                                <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                                        {news.image ? (
                                            <img
                                                src={news.image}
                                                alt={news.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <ImageIcon className="h-10 w-10 opacity-50" />
                                                <span className="text-sm">{t("newsList.noImage")}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                        </div>
                                    </div>
                                    <CardHeader className="pt-4 pb-2">
                                        <CardDescription className="flex items-center gap-2 text-primary/80 mb-2 font-medium">
                                            <Calendar className="h-4 w-4" />
                                            {news.published_date
                                                ? new Date(news.published_date).toLocaleDateString("es-ES", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })
                                                : t("newsList.dateNotAvailable")}
                                        </CardDescription>
                                        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                                            {news.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="link" className="p-0 text-primary">
                                            {t("newsList.readMore")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-center">
                        <PaginationComponent
                            currentPage={page}
                            maxPage={maxPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default NewsListPage;
