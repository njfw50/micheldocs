import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { X, Send, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBoxProps {
  sessionId: string;
  profileFilter: "tech" | "travel" | "admin" | "all";
  onClose: () => void;
}

export default function ChatBox({ sessionId, profileFilter, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: existingMessages } = trpc.chat.getMessages.useQuery(sessionId);
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    if (existingMessages) {
      const formattedMessages: ChatMessage[] = existingMessages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [existingMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    
    // Add user message
    const newUserMessage: ChatMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const result = await sendMessageMutation.mutateAsync({
        sessionId,
        message: userMessage,
        profileFilter,
      });

      if (result.success) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: String(result.message),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 h-screen md:h-[600px] md:rounded-tl-2xl bg-black/95 border border-white/10 backdrop-blur-md flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="space-y-1">
          <h3 className="font-bold text-white">Chat com Michel</h3>
          <p className="text-xs text-white/60">
            Perfil: {profileFilter === "all" ? "Completo" : profileFilter.toUpperCase()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 h-full">
            <div className="text-4xl">💬</div>
            <div className="space-y-2">
              <p className="font-semibold text-white">Bem-vindo ao Chat!</p>
              <p className="text-sm text-white/60">
                Faça perguntas sobre meu perfil, experiência, habilidades ou valores.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-xs p-4 ${
                    message.role === "user"
                      ? "bg-teal-600/80 text-white border-teal-500"
                      : "bg-white/10 text-white border-white/20"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Streamdown>{message.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </Card>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-white/10 text-white border-white/20 p-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 p-4 space-y-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Faça uma pergunta..."
          disabled={isLoading}
          className="input-premium"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full button-premium gap-2"
        >
          <Send className="w-4 h-4" />
          Enviar
        </Button>
      </form>
    </div>
  );
}
