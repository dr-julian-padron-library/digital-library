import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetNewsListQuery } from "@/features/content-management/api/newsApiSlice";

export function NewsSection() {
  const { t } = useTranslation();
  const { data: newsData, isFetching } = useGetNewsListQuery({
    page_size: 3,
    page: 1,
    ordering: "-published_date",
    is_published: true,
  });

  const displayNews = newsData?.results || [];

  if (!isFetching && displayNews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold text-primary mb-4">
              {t('homepage.news.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('homepage.news.subtitle')}
            </p>
          </div>
          <Link to="/noticias">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              {t('homepage.news.view_all')}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isFetching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse h-64 bg-muted/50"></Card>
            ))
          ) : (
            displayNews.map((item) => (
              <Card key={item.id} className="book-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary text-sm font-medium flex items-center gap-1.5">
                      <Newspaper className="w-4 h-4" />
                      Noticia
                    </span>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {item.published_date && new Date(item.published_date).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <CardTitle className="text-primary font-display text-lg line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {item.subtitle}
                  </p>
                  <Link to={`/noticias/${item.slug}`}>
                    <Button variant="ghost" className="text-primary hover:text-destructive p-0">
                      {t('homepage.news.read_more')}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
