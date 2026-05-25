import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Shield, Star, Users, Lightbulb, Zap } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield className="w-12 h-12" />,
  star: <Star className="w-12 h-12" />,
  users: <Users className="w-12 h-12" />,
  lightbulb: <Lightbulb className="w-12 h-12" />,
  zap: <Zap className="w-12 h-12" />,
};

export default function Values() {
  const [, setLocation] = useLocation();
  const { data: cvData, isLoading } = trpc.cv.getProfile.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-premium flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const profile = cvData?.profile;
  const values = cvData?.humanValues || [];

  return (
    <div className="min-h-screen gradient-premium">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 gap-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-white">Valores Humanos & Dogmas</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </nav>

      <div className="container py-12 space-y-12">
        {/* Engineering Dogmas */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="section-title">Dogmas de Engenharia</h2>
            <p className="section-subtitle">
              Princípios inegociáveis que guiam meu desenvolvimento de software
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: 1, text: profile?.dogma1 },
              { num: 2, text: profile?.dogma2 },
              { num: 3, text: profile?.dogma3 },
              { num: 4, text: profile?.dogma4 },
            ]
              .filter(d => d.text)
              .map((dogma) => (
                <Card
                  key={dogma.num}
                  className="card-premium p-8 space-y-4 border-l-4 border-l-teal-400 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="text-5xl font-black text-teal-400/20 mb-2">
                      {dogma.num}
                    </div>
                    <p className="text-white leading-relaxed text-lg font-medium">
                      {dogma.text}
                    </p>
                  </div>
                </Card>
              ))}
          </div>
        </section>

        {/* Human Values */}
        {values.length > 0 && (
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="section-title">Valores Humanos</h2>
              <p className="section-subtitle">
                Princípios que norteiam minhas decisões e carreira
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, idx) => (
                <Card
                  key={value.id}
                  className="card-premium p-8 space-y-4 flex flex-col items-center text-center group cursor-pointer"
                  style={{
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="text-teal-400 group-hover:text-violet-400 transition-colors duration-300 transform group-hover:scale-110">
                    {iconMap[value.icon || "star"] || <Star className="w-12 h-12" />}
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-teal-300 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors leading-relaxed">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Philosophy Section */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h2 className="section-title">Filosofia de Desenvolvimento</h2>
            <p className="section-subtitle">
              Como aplico meus valores na prática
            </p>
          </div>

          <Card className="card-premium p-12 space-y-6 bg-gradient-to-br from-violet-900/20 to-teal-900/20">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">
                Arquitetura Defensiva
              </h3>
              <p className="text-white/80 leading-relaxed">
                Antecipo falhas em cada camada do sistema. Cada componente é projetado para falhar graciosamente, com tratamento explícito de erros e validação rigorosa de dados.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">
                Qualidade Acima de Tudo
              </h3>
              <p className="text-white/80 leading-relaxed">
                Não entrego código que não entendo completamente. Cada linha é testada, documentada e segue padrões rigorosos de engenharia de software.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-teal-300">
                Isolamento de Serviços
              </h3>
              <p className="text-white/80 leading-relaxed">
                Uso adapters e princípios SOLID para manter componentes desacoplados. Isso facilita testes, manutenção e escalabilidade futura.
              </p>
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-4xl font-bold text-white">
            Pronto para conversar?
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Tenho interesse em oportunidades onde posso aplicar esses princípios e agregar valor através de código de qualidade e pensamento estratégico.
          </p>
          <Button
            onClick={() => setLocation("/cv")}
            className="button-premium gap-2 mx-auto"
          >
            Explorar Currículo Completo
          </Button>
        </section>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-float" />
      <div className="fixed bottom-1/3 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: "1.5s" }} />
    </div>
  );
}
