import React from 'react';
import { useGetSalasQuery } from '@/features/content-management/api/genresApiSlice';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, ArrowRight } from 'lucide-react';

import { useTranslation } from "react-i18next";

const RoomsPage = () => {
    const { t } = useTranslation();
    const { data: salas, isLoading, isError } = useGetSalasQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-primary font-medium italic">{t('rooms.loading')}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-foreground">{t('rooms.error_title')}</h2>
                <p className="text-muted-foreground">{t('rooms.error_message')}</p>
            </div>
        );
    }

    return (
        <main className="flex-1 px-6 md:px-12 py-6 md:py-10">
            <section className="mb-12 md:mb-16 text-center">
                <h2 className="font-display text-4xl md:text-5xl mb-4 text-biblioteca-blue dark:text-primary ">
                    <span>{t('rooms.title_prefix')} <span className="text-highlight-gold italic">{t('rooms.title_highlight')}</span></span>
                </h2>
                <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"></div>

                <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    {t('rooms.description')}
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {salas?.map((item) => (
                    <div
                        key={item.sala}
                        onClick={() => navigate(`/salas/${item.sala}`)}
                        className="group relative flex flex-col items-center text-center border border-border p-8 bg-card hover:bg-muted/50 transition-all duration-500 overflow-hidden cursor-pointer"
                    >
                        {/* Decorative background grid effect could be added here if assets existed */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>

                        <div className="relative w-20 h-20 mb-8 flex items-center justify-center bg-muted rounded-full border border-border group-hover:scale-105 transition-transform">
                            <BookOpen className="h-8 w-8 text-biblioteca-blue dark:text-primary stroke-[1.5]" />
                        </div>

                        <h3 className="font-display text-xl mb-4 tracking-widest uppercase text-biblioteca-blue dark:text-primary">
                            {item.sala}
                        </h3>

                        <div className="inline-flex items-center px-4 py-1.5 bg-muted border border-border rounded-full">
                            <span className="font-mono text-[10px] tracking-tight text-muted-foreground">
                                {item.entries} Generos
                            </span>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 w-full flex justify-center">
                            <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors duration-300" />
                        </div>
                    </div>
                ))}
            </div>

            {!salas || salas.length === 0 && (
                <div className="text-center py-20 bg-muted rounded-2xl border-2 border-dashed border-border mt-12 max-w-3xl mx-auto">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium">{t('rooms.empty')}</p>
                </div>
            )}
        </main>
    );
};

export default RoomsPage;
