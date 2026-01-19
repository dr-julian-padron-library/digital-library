import { SearchSection } from "@/features/homepage/components/SearchSection";
import { FeaturedBooks } from "@/features/content/components/FeaturedBooks";
import { ServicesSection } from "@/features/homepage/components/ServicesSection";
import { NewsSection } from "@/features/homepage/components/NewsSection";
import { UpcomingBookings } from "@/features/homepage/components/UpcomingBookings";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
  return <div className="min-h-screen">
    {/* Hero Section con búsqueda */}
    <section className="relative bg-background bg-[url('/julian_padron.png')] bg-center bg-cover opacity-100 text-white min-h-[600px] flex flex-col justify-center items-center overflow-hidden bg-no-repeat">
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">

          {/* Top Label with Lines */}
          <div className="flex items-center gap-4 mb-4 opacity-80 animate-fade-in">
            <div className="h-[1px] w-12 bg-highlight-gold"></div>
            <span className="text-highlight-gold tracking-[0.2em] text-sm md:text-base uppercase font-medium">{t('homepage.hero.location_label')}</span>
            <div className="h-[1px] w-12 bg-highlight-gold"></div>
          </div>

          <h1 className="font-display font-medium text-5xl md:text-8xl mb-6 animate-fade-in leading-tight">
            <span className="block mb-2">{t('homepage.hero.title_line1')}</span>
            <span className="block italic text-6xl md:text-9xl mb-4">{t('homepage.hero.central')}</span>
            <span className="block text-2xl md:text-4xl font-normal opacity-90">
              {t('homepage.hero.name')}
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 text-white/80 animate-fade-in font-light leading-relaxed">
            {t('homepage.hero.description')}
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-highlight-gold/90 animate-fade-in text-sm tracking-wide">
            <div className="flex items-center gap-2">
              <span className="text-highlight-gold">📍</span>
              <span>{t('homepage.hero.address')}</span>
            </div>
            <div className="hidden md:block w-1 h-1 bg-highlight-gold rounded-full opacity-50"></div>
            <div className="flex items-center gap-2">
              <span className="text-highlight-gold">📖</span>
              <span>{t('homepage.hero.state_country')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elemento decorativo sutil */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent opacity-80"></div>
    </section>

    {/* Sección de búsqueda */}
    {/* <SearchSection /> */}

    {/* Libros destacados */}
    {/* <FeaturedBooks /> */}

    {/* Servicios */}
    <ServicesSection />

    {/* Noticias y eventos */}
    <NewsSection />

    {/* Próximos Eventos */}
    <UpcomingBookings />

  </div>;
};
export default Index;