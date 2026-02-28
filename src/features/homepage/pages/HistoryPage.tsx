import React from 'react';
import { Calendar, MapPin, Users, BookOpen, Award, Building, ArrowRight } from "lucide-react";
import bibliotecaHistoria from "/history_background.jpg";
import { ReturnButton } from "@/common/components/ui/return-button";
import { useTranslation } from "react-i18next";

export default function HistoriaPage() {
  const { t } = useTranslation();
  const historicalMilestones = [
    {
      title: t('history.milestones.foundation.title'),
      icon: Calendar,
      content: t('history.milestones.foundation.content'),
      highlight: t('history.milestones.foundation.highlight'),
      colorTheme: {
        iconBg: "bg-[#003366]", // Biblioteca Blue
        iconColor: "text-white",
        highlightText: "text-[#60a5fa] dark:text-[#60a5fa]", // Highlight Blue
        borderColor: "group-hover:border-[#003366]/30",
        glow: "group-hover:shadow-[0_0_30px_-5px_rgba(0,51,102,0.3)]"
      }
    },
    {
      title: t('history.milestones.location.title'),
      icon: MapPin,
      content: t('history.milestones.location.content'),
      highlight: t('history.milestones.location.highlight'),
      colorTheme: {
        iconBg: "bg-[#ffe23b]", // Biblioteca Gold
        iconColor: "text-black",
        highlightText: "text-[#ffe23b] dark:text-[#ffe23b]",
        borderColor: "group-hover:border-[#ffe23b]/30",
        glow: "group-hover:shadow-[0_0_30px_-5px_rgba(255,226,59,0.3)]"
      }
    },
    {
      title: t('history.milestones.patron.title'),
      icon: Award,
      content: t('history.milestones.patron.content'),
      highlight: t('history.milestones.patron.highlight'),
      colorTheme: {
        iconBg: "bg-[#16a34a]", // Green
        iconColor: "text-white",
        highlightText: "text-[#16a34a] dark:text-[#4ade80]",
        borderColor: "group-hover:border-[#16a34a]/30",
        glow: "group-hover:shadow-[0_0_30px_-5px_rgba(22,163,74,0.3)]"
      }
    },
    {
      title: t('history.milestones.community.title'),
      icon: Users,
      content: t('history.milestones.community.content'),
      highlight: t('history.milestones.community.highlight'),
      colorTheme: {
        iconBg: "bg-[#9333ea]", // Purple
        iconColor: "text-white",
        highlightText: "text-[#9333ea] dark:text-[#c084fc]",
        borderColor: "group-hover:border-[#9333ea]/30",
        glow: "group-hover:shadow-[0_0_30px_-5px_rgba(147,51,234,0.3)]"
      }
    }
  ];

  return (
    <main className="flex-1 w-full bg-background min-h-screen">
      {/* Header Section - Matching RoomsPage */}
      <section className="px-6 md:px-12 py-16 md:py-10 text-center relative overflow-hidden">

        <h1 className="font-display text-4xl md:text-5xl mb-4 text-biblioteca-blue dark:text-primary tracking-tight">
          {t('history.title_prefix')} <span className="italic text-highlight-gold">{t('history.title_highlight')}</span>
        </h1>

        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"></div>

        <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t('history.subtitle')}
        </p>
      </section>

      {/* Grid Section - Matching RoomsPage Card Style */}
      <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {historicalMilestones.map((item, index) => (
            <div
              key={index}
              className={`group relative flex flex-col items-center text-center border border-border p-8 bg-card/[0.5] hover:bg-muted/30 transition-all duration-500 overflow-hidden ${item.colorTheme.borderColor} ${item.colorTheme.glow}`}
            >
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>

              <div className={`relative w-16 h-16 mb-6 flex items-center justify-center rounded-full border border-border/10 shadow-lg group-hover:scale-105 transition-all duration-300 ${item.colorTheme.iconBg}`}>
                <item.icon className={`h-7 w-7 stroke-[1.5] ${item.colorTheme.iconColor}`} />
              </div>

              <h3 className="font-display text-lg mb-3 tracking-wide text-foreground font-medium">
                {item.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {item.content.split(item.highlight).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={`font-bold ${item.colorTheme.highlightText}`}>{item.highlight}</span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Split Section - Mision/Vision + Image - Connecting styles */}
      <section className="px-6 md:px-12 py-24 bg-muted/10 border-y border-border/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Text Content - Adapted from SelectedRoomPage style */}
          <div className="space-y-16">
            <div className="relative">
              <h3 className="text-3xl font-display italic text-foreground mb-6">
                {t('history.mission.title')}
              </h3>
              <div className="h-px w-12 bg-primary mb-6"></div>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                {t('history.mission.content')}
              </p>
            </div>

            <div className="relative">
              <h3 className="text-3xl font-display italic text-foreground mb-6">
                {t('history.vision.title')}
              </h3>
              <div className="h-px w-12 bg-biblioteca-gold mb-6"></div>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                {t('history.vision.content')}
              </p>
            </div>
          </div>

          {/* Image Composition */}
          <div className="relative">
            <div className="absolute inset-0 bg-biblioteca-blue/5 rounded-lg transform translate-x-4 translate-y-4"></div>
            <div className="relative rounded-lg overflow-hidden border border-border shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
              <img
                src={bibliotecaHistoria}
                alt="Biblioteca Dr. Julián Padrón"
                className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <p className="font-display text-2xl text-foreground italic">Dr. Julián Padrón</p>
                <p className="font-mono text-xs text-primary mt-2">{t('history.image_caption')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy/Quote Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <BookOpen className="h-8 w-8 text-biblioteca-gold mx-auto mb-8 opacity-80" />
          <blockquote className="font-display text-3xl md:text-5xl font-medium leading-tight text-foreground mb-8">
            {t('history.quote')}
          </blockquote>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
            — {t('history.legacy')}
          </p>

          <div className="mt-12 flex justify-center">
            <ReturnButton />
          </div>
        </div>
      </section>
    </main>
  );
}