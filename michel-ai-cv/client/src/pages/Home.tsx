import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Heart } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 gradient-premium -z-10" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/20 to-transparent -z-10" />

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold text-white">Michel</div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setLocation("/")}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setLocation("/cv")}
            >
              Currículo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setLocation("/values")}
            >
              Valores
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto w-full">
          {/* Left Content - Bold Typography */}
          <div className="space-y-6 animate-slide-in-up">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-black text-white leading-tight">
                Bem-vindo ao
                <span className="text-gradient-dark block">Universo</span>
                de Michel
              </h1>
              <p className="text-xl text-white/80 max-w-md leading-relaxed">
                Software Engineer em transição de carreira, guiado pelo rigor técnico de Harvard e uma filosofia de desenvolvimento baseada em excelência.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Button
                onClick={() => setLocation("/cv")}
                className="button-premium gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Explorar Currículo
              </Button>
              <Button
                onClick={() => setLocation("/values")}
                className="button-outline-premium gap-2"
              >
                <Heart className="w-5 h-5" />
                Valores & Dogmas
              </Button>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "IA Embarcada",
                description: "Chat inteligente para conversar sobre meu perfil",
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Currículo Premium",
                description: "Design moderno com filtro dinâmico de perfil",
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Valores Humanos",
                description: "Princípios inegociáveis que norteiam minha carreira",
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Métricas de Impacto",
                description: "Conquistas quantificadas e visualizações",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card-premium p-6 space-y-3 group cursor-pointer"
                style={{
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                <div className="text-teal-400 group-hover:text-teal-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-white group-hover:text-teal-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <div className="text-sm font-medium mb-2">Explore mais</div>
        <div className="text-2xl">↓</div>
      </div>
    </div>
  );
}
