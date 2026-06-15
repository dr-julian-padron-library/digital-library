import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, ShieldAlert, Copy, Check, ExternalLink, Globe } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const translations = {
  es: {
    portalTag: "Portal Digital",
    title: "Biblioteca Pública Central",
    subtitle: "Dr. Julián Padrón",
    offlineText: "Estimado usuario, le informamos que los servicios digitales y la plataforma en línea de la biblioteca se encuentran temporalmente suspendidos.",
    contactHeader: "Contacto de Soporte y Consultas",
    phoneLabel: "Línea de Atención / WhatsApp",
    emailLabel: "Correo Electrónico",
    copy: "Copiar",
    copied: "Copiado",
    callTitle: "Llamar por teléfono",
    waTitle: "Chat de WhatsApp",
    emailTitle: "Redactar correo",
    address: "Maturín, Estado Monagas, Venezuela",
    copyright: "Biblioteca Pública Central Dr. Julián Padrón.",
    waMessage: "Hola, me pongo en contacto desde el portal de la biblioteca para solicitar soporte."
  },
  en: {
    portalTag: "Digital Portal",
    title: "Central Public Library",
    subtitle: "Dr. Julián Padrón",
    offlineText: "Dear user, we inform you that the digital services and online platform of the library are temporarily suspended.",
    contactHeader: "Support & Inquiries Contact",
    phoneLabel: "Helpline / WhatsApp",
    emailLabel: "Email Address",
    copy: "Copy",
    copied: "Copied",
    callTitle: "Call Phone",
    waTitle: "WhatsApp Chat",
    emailTitle: "Compose email",
    address: "Maturin, Monagas State, Venezuela",
    copyright: "Dr. Julián Padrón Central Public Library.",
    waMessage: "Hello, I am contacting you from the library portal to request support."
  }
};

export default function DownPage() {
  const { i18n } = useTranslation();
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const phoneNum = "0414-7876877";
  const emailAddr = "alfredorodriguezfcw@gmail.com";

  // Manage language state reactively
  const [currentLang, setCurrentLang] = useState<"es" | "en">(
    (i18n.language || navigator.language || "es").startsWith("en") ? "en" : "es"
  );
  const t = translations[currentLang];

  useEffect(() => {
    const detected = (i18n.language || navigator.language || "es").startsWith("en") ? "en" : "es";
    setCurrentLang(detected);
  }, []);

  const changeLang = (lang: "es" | "en") => {
    // Synchronously update local React state first so UI updates instantly
    setCurrentLang(lang);
    setIsLangOpen(false);

    // Defer the heavy global i18n changeLanguage to the next event loop tick
    setTimeout(() => {
      i18n.changeLanguage(lang).catch((err) => {
        console.error("Failed to change i18n language:", err);
      });
    }, 0);
  };

  useEffect(() => {
    if (!isLangOpen) return;
    const handleClose = () => setIsLangOpen(false);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, [isLangOpen]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLangOpen(!isLangOpen);
  };

  const handleCopy = async (text: string, type: "phone" | "email") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "phone") {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // WhatsApp API Link with custom message
  const waLink = `https://wa.me/584147876877?text=${encodeURIComponent(t.waMessage)}`;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans overflow-hidden px-4">
      <style>{`
        @keyframes slowPulseAura {
          0% {
            transform: scale(0.8) rotate(0deg);
            opacity: 0;
          }
          10% {
            transform: scale(1.3) rotate(60deg);
            opacity: 0.45;
          }
          20% {
            transform: scale(1.6) rotate(120deg);
            opacity: 0.15;
          }
          30% {
            transform: scale(1.8) rotate(180deg);
            opacity: 0;
          }
          100% {
            transform: scale(1.8) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-40px, 40px) scale(1.12); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(40px, 30px) scale(0.92); }
        }
        .animate-aura-slow {
          animation: slowPulseAura 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-float-1 {
          animation: float-1 18s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 22s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-3 16s ease-in-out infinite;
        }
      `}</style>

      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Dynamic backlights / background glow with active floating animations */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none animate-float-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-float-2" />
      <div className="absolute top-1/2 left-1/3 w-[25rem] h-[25rem] bg-amber-500/8 rounded-full blur-[110px] pointer-events-none animate-float-3" />

      {/* Decorative top border line with venezuelan gradient or library blue */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-amber-500" />

      {/* Main Glassmorphism Container */}
      <div className="relative z-10 max-w-xl w-full bg-slate-950/40 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 sm:p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-[border-color,background-color] duration-300 hover:border-white/[0.12] hover:bg-slate-950/45">

        {/* Language selector dropdown container */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleDropdownToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white text-slate-300 transition-colors duration-100 active:scale-95 active:bg-white/15 shadow-sm"
            title={currentLang === "es" ? "Select language" : "Seleccionar idioma"}
          >
            <Globe className="w-4 h-4" />
            <span>{currentLang === "es" ? "Español" : "English"}</span>
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg bg-slate-950 border border-white/10 shadow-2xl py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  changeLang("es");
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left transition-colors duration-75 active:scale-[0.97] active:bg-white/10 ${currentLang === "es"
                    ? "text-blue-400 bg-slate-800/50"
                    : "text-slate-300 hover:bg-slate-800/30 hover:text-white"
                  }`}
              >
                <span>Español</span>
                {currentLang === "es" && <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  changeLang("en")}
                }
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left transition-colors duration-75 active:scale-[0.97] active:bg-white/10 ${currentLang === "en"
                    ? "text-blue-400 bg-slate-800/50"
                    : "text-slate-300 hover:bg-slate-800/30 hover:text-white"
                  }`}
              >
                <span>English</span>
                {currentLang === "en" && <Check className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="flex justify-center mb-3 sm:mb-6 mt-2 sm:mt-0">
          <div className="relative flex items-center justify-center">
            {/* Pulsating Aura */}
            <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-600/40 via-blue-400/10 to-indigo-500/30 blur-xl animate-aura-slow pointer-events-none" />

            {/* The Circle */}
            <div className="relative z-10 inline-flex items-center justify-center p-3 sm:p-4 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/25 text-blue-400 shadow-lg shadow-blue-950/50">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="text-center space-y-2 mb-4 sm:space-y-3 sm:mb-8">
          <span className="text-sm font-semibold tracking-wider text-blue-400 uppercase">
            {t.portalTag}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight leading-snug">
            {t.title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              {t.subtitle}
            </span>
          </h1>
          <div className="h-0.5 w-16 bg-blue-500/30 mx-auto rounded-full my-2 sm:my-4" />
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            {t.offlineText}
          </p>
        </div>

        {/* Contact details Card List */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-slate-500 uppercase px-1">
            {t.contactHeader}
          </h2>

          {/* Phone / WhatsApp block */}
          <div className="group relative flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all shadow-md gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-950/50 text-blue-400 border border-blue-900/30">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500 font-medium truncate">{t.phoneLabel}</p>
                <p className="text-base sm:text-lg font-semibold text-white tracking-wide truncate">{phoneNum}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => handleCopy(phoneNum, "phone")}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10 transition-all active:scale-95 duration-100"
                title="Copiar número"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-400">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.copy}</span>
                  </>
                )}
              </button>

              {/* WhatsApp Redirect */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 duration-100"
                title={t.waTitle}
              >
                <FaWhatsapp className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </a>

              {/* Call Redirect */}
              <a
                href={`tel:${phoneNum.replace("-", "")}`}
                className="md:hidden flex items-center justify-center p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 duration-100"
                title={t.callTitle}
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Email block */}
          <div className="group relative flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all shadow-md gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-950/50 text-blue-400 border border-blue-900/30">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500 font-medium truncate">{t.emailLabel}</p>
                <p className="text-base sm:text-lg font-semibold text-white truncate max-w-[185px] sm:max-w-xs" title={emailAddr}>
                  {emailAddr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => handleCopy(emailAddr, "email")}
                className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10 transition-all active:scale-95 duration-100"
                title="Copiar correo"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline text-emerald-400">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.copy}</span>
                  </>
                )}
              </button>
              <a
                href={`mailto:${emailAddr}`}
                className="flex items-center justify-center p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 duration-100"
                title={t.emailTitle}
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer info inside the card */}
        <p className="mt-4 sm:mt-8 text-center text-sm text-slate-500 leading-normal">
          {t.address} <br />
        </p>

      </div>

      {/* Outer subtle page footer */}
      <footer className="relative z-10 mt-4 sm:mt-8 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} {t.copyright}
      </footer>
    </div>
  );
}
