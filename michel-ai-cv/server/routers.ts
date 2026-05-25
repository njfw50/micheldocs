import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // CV Data Procedures
  cv: router({
    getProfile: publicProcedure.query(async () => {
      const profileData = await db.getProfile();
      const experiences = await db.getAllExperiences();
      const education = await db.getAllEducation();
      const skills = await db.getAllSkills();
      const metrics = await db.getBusinessMetrics();
      const research = await db.getAcademicResearch();
      const values = await db.getHumanValues();

      return {
        profile: profileData,
        experiences,
        education,
        skills,
        businessMetrics: metrics,
        academicResearches: research,
        humanValues: values,
      };
    }),

    getFilteredContent: publicProcedure
      .input(z.enum(["tech", "travel", "admin", "all"]))
      .query(async ({ input: filter }) => {
        const profileData = await db.getProfile();
        
        // Get experiences for this filter
        const allExperiences = await db.getAllExperiences();
        const experiences = allExperiences.filter(e => e.category === filter || e.category === "all");
        
        // Get education for this filter
        const allEducation = await db.getAllEducation();
        const education = allEducation.filter(e => e.category === filter || e.category === "all");
        
        // Get skills for this filter
        const allSkills = await db.getAllSkills();
        const skills = allSkills.filter(s => s.profileFilter === filter || s.profileFilter === "all");
        
        const metrics = await db.getBusinessMetrics();
        const research = await db.getAcademicResearch();
        const values = await db.getHumanValues();

        return {
          profile: profileData,
          experiences,
          education,
          skills,
          businessMetrics: metrics,
          academicResearches: research,
          humanValues: values,
          filter,
        };
      }),
  }),

  // Chat & AI Procedures
  chat: router({
    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string(),
        profileFilter: z.enum(["tech", "travel", "admin", "all"]),
      }))
      .mutation(async ({ input }) => {
        try {
          // Get filtered CV content for context
          const allExperiences = await db.getAllExperiences();
          const experiences = allExperiences.filter(e => input.profileFilter === "all" || e.category === input.profileFilter || e.category === "all");
          
          const allEducation = await db.getAllEducation();
          const education = allEducation.filter(e => input.profileFilter === "all" || e.category === input.profileFilter || e.category === "all");
          
          const allSkills = await db.getAllSkills();
          const skills = allSkills.filter(s => input.profileFilter === "all" || s.profileFilter === input.profileFilter || s.profileFilter === "all");
          
          const profileData = await db.getProfile();

          // Build context for LLM
          const contextText = `
You are an AI assistant representing Michel de Souza, a Software Engineer in career transition with expertise in full-stack development, travel/hospitality, and administration.

PROFILE INFORMATION:
Name: ${profileData?.name || "Michel de Souza"}
Title: ${profileData?.title || "Software Engineer in Transition"}
Location: ${profileData?.location || "New York Area, United States"}
Email: ${profileData?.email || "michelstravelus@gmail.com"}
LinkedIn: ${profileData?.linkedin || "https://www.linkedin.com/in/njfw23/"}

SUMMARY:
${profileData?.summary || ""}

ENGINEERING DOGMAS:
${profileData?.dogma1 || ""}
${profileData?.dogma2 || ""}
${profileData?.dogma3 || ""}
${profileData?.dogma4 || ""}

RELEVANT EXPERIENCE (${input.profileFilter} profile):
${experiences.map(e => `- ${e.title} at ${e.company} (${e.dateRange}): ${e.description || ""}`).join("\n")}

EDUCATION:
${education.map(e => `- ${e.title} from ${e.institution} (${e.dateRange}): ${e.description || ""}`).join("\n")}

SKILLS:
${skills.map(s => `- ${s.name} (${s.category})`).join(", ")}

INSTRUCTIONS:
1. Always respond in a professional and personalized manner
2. Base your answers ONLY on the information provided above
3. If a question cannot be answered with the provided information, politely explain that and suggest contacting Michel directly
4. Be concise but informative
5. Maintain Michel's voice and personality
6. Do not invent or assume information not provided
          `;

          // Get previous messages for context
          const previousMessages = await db.getChatMessages(input.sessionId);
          const conversationHistory = previousMessages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          }));

          // Add current user message
          conversationHistory.push({
            role: "user" as const,
            content: input.message,
          });

          // Call LLM
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: contextText,
              },
              ...conversationHistory,
            ],
          });

          const assistantMessage = response.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";

          // Save user message
          await db.saveChatMessage({
            sessionId: input.sessionId,
            role: "user",
            content: input.message,
            profileFilter: input.profileFilter,
          });

          // Save assistant message
          await db.saveChatMessage({
            sessionId: input.sessionId,
            role: "assistant",
            content: assistantMessage,
            profileFilter: input.profileFilter,
          });

          // Notify Michel about the new question
          await notifyOwner({
            title: "🤖 New Question from Recruiter",
            content: `A recruiter asked: "${input.message}"\n\nProfile Filter: ${input.profileFilter.toUpperCase()}`,
          });

          // Also save notification to database
          await db.createNotification({
            title: "New Question from Recruiter",
            message: `A recruiter asked: "${input.message}"`,
            question: input.message,
            profileFilter: input.profileFilter,
          });

          return {
            success: true,
            message: assistantMessage,
          };
        } catch (error) {
          console.error("Chat error:", error);
          return {
            success: false,
            message: "An error occurred while processing your message.",
          };
        }
      }),

    getMessages: publicProcedure
      .input(z.string())
      .query(async ({ input: sessionId }) => {
        return await db.getChatMessages(sessionId);
      }),
  }),

  // Notifications
  notifications: router({
    getAll: protectedProcedure.query(async () => {
      return await db.getNotifications();
    }),

    markAsRead: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: notificationId }) => {
        return await db.markNotificationAsRead(notificationId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
