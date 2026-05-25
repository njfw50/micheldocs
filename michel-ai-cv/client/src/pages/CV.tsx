import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import { nanoid } from "nanoid";

type ProfileFilter = "tech" | "travel" | "admin" | "all";

export default function CV() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<ProfileFilter>("all");
  const [showChat, setShowChat] = useState(false);
  const [sessionId] = useState(() => nanoid());

  const { data: cvData, isLoading } = trpc.cv.getFilteredContent.useQuery(filter);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-premium flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const profile = cvData?.profile;
  const experiences = cvData?.experiences || [];
  const education = cvData?.education || [];
  const skills = cvData?.skills || [];
  const metrics = cvData?.businessMetrics || [];

  const filterOptions: { value: ProfileFilter; label: string; icon: string }[] = [
    { value: "all", label: "Perfil Completo", icon: "🌟" },
    { value: "tech", label: "Tech", icon: "💻" },
    { value: "travel", label: "Turismo", icon: "✈️" },
    { value: "admin", label: "Administração", icon: "🏢" },
  ];

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
          <h1 className="text-2xl font-bold text-white">Currículo Profissional</h1>
          <Button
            size="sm"
            className="button-premium gap-2"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle className="w-4 h-4" />
            Chat IA
          </Button>
        </div>
      </nav>

      <div className="container py-8 space-y-8">
        {/* Profile Header */}
        {profile && (
          <div className="card-premium p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <img
                  src={profile.profileImage || ""}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-teal-400/50 object-cover"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {profile.name}
                  </h1>
                  <p className="text-xl text-teal-300">{profile.title}</p>
                  <p className="text-sm text-white/60 mt-1">📍 {profile.location}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="badge-premium">
                      📞 {profile.phone}
                    </a>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="badge-premium">
                      ✉️ Email
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="badge-premium">
                      in LinkedIn
                    </a>
                  )}
                  {profile.facebook && (
                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="badge-premium">
                      f Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {profile.summary && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/80 leading-relaxed">{profile.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Filter Section */}
        <div className="card-premium p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Foco do Recrutador</h3>
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => setFilter(option.value)}
                className={`gap-2 ${
                  filter === option.value
                    ? "button-premium"
                    : "button-outline-premium"
                }`}
              >
                {option.icon} {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="space-y-4">
            <h2 className="section-title">Métricas de Impacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.id} className="card-premium p-6 text-center space-y-2">
                  <div className="text-3xl font-bold text-teal-400">
                    {metric.value}
                  </div>
                  <div className="text-sm text-white/60">{metric.unit}</div>
                  <div className="text-white font-semibold">{metric.name}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="section-title">Experiência Profissional</h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <Card key={exp.id} className="card-premium p-6 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                      <p className="text-teal-300 font-semibold">{exp.company}</p>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {exp.dateRange}
                    </Badge>
                  </div>
                  {exp.location && (
                    <p className="text-sm text-white/60">📍 {exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-white/80">{exp.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-4">
            <h2 className="section-title">Educação</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <Card key={edu.id} className="card-premium p-6 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{edu.title}</h3>
                      <p className="text-teal-300 font-semibold">{edu.institution}</p>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {edu.dateRange}
                    </Badge>
                  </div>
                  {edu.description && (
                    <p className="text-white/80">{edu.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="section-title">Habilidades & Competências</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["tech", "core", "language", "certification"].map((category) => {
                const categorySkills = skills.filter(s => s.category === category);
                if (categorySkills.length === 0) return null;

                const categoryLabels: Record<string, string> = {
                  tech: "Tecnologias",
                  core: "Competências Principais",
                  language: "Idiomas",
                  certification: "Certificações",
                };

                return (
                  <Card key={category} className="card-premium p-6 space-y-4">
                    <h4 className="font-bold text-teal-300">{categoryLabels[category]}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="bg-white/10 text-white border-white/20">
                          {skill.name}
                          {skill.levelText && ` (${skill.levelText})`}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <ChatBox
          sessionId={sessionId}
          profileFilter={filter}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
