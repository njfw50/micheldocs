import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { profile, experiences, education, skills, businessMetrics, humanValues } from "./drizzle/schema.ts";

const schema = { profile, experiences, education, skills, businessMetrics, humanValues };

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    console.log("🌱 Starting seed...");

    // Insert Profile
    await db.insert(schema.profile).values({
      name: "Michel de Souza",
      title: "Software Engineer in Transition · CS50x Harvard · Full-Stack Developer",
      location: "New York Area, United States",
      phone: "+1 (862) 350-1161",
      email: "michelstravelus@gmail.com",
      linkedin: "https://www.linkedin.com/in/njfw23/",
      facebook: "https://www.facebook.com/njfw23",
      profileImage: "https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-1/680351558_35213996131578073_8785402727836984375_n.jpg",
      summary: "Software Engineer in career transition, guided by the technical rigor of Harvard's CS50 and a development philosophy based on high-quality processes and defensive architecture. After a solid trajectory in real-time service management and logistics (Concierge and Travel Agent), I decided to transfer my expertise in solving complex problems into Software Engineering. My technical foundation was forged in CS50x, mastering from low-level fundamentals and memory management in C, to algorithm development in Python and modern applications with TypeScript, Node.js and SQL.",
      dogma1: "DOGMA 1: Defensive Architecture — Anticipate failure at every layer",
      dogma2: "DOGMA 2: No Silent Failures — Explicit error handling in all layers",
      dogma3: "DOGMA 3: Validate ALL Inputs with Zod — Data integrity via strict schema validation",
      dogma4: "DOGMA 4: External Service Isolation — Adapters & SOLID (Dependency Inversion) for maintainability",
    });

    // Insert Experiences
    const experiences = [
      {
        title: "Administrative Clerk",
        company: "Liberty Mechanical Contractors LLC",
        location: "Newark, New Jersey",
        dateRange: "Mar 2025 – Present",
        description: "Office administration, document management and operational support for a mechanical contracting company.",
        category: "admin",
        orderIndex: 1,
      },
      {
        title: "Concierge",
        company: "CITYBAY BUILDERS AND REALTORS PRIVATE LIMITED",
        location: "Elizabeth, New Jersey",
        dateRange: "Apr 2023 – Present",
        description: "High-standard guest and tenant services, real-time problem resolution, coordination of requests and logistics in a residential/commercial building.",
        category: "admin",
        orderIndex: 2,
      },
      {
        title: "Travel Agent",
        company: "Michels Travel",
        location: "Newark, New Jersey",
        dateRange: "Jan 2019 – Present",
        description: "Planning and coordination of international travel packages. Built the Michel's Travel platform — a full-stack flight booking system using React, Drizzle ORM and Tailwind CSS.",
        category: "travel",
        orderIndex: 3,
      },
      {
        title: "Travel Agent",
        company: "Costamar Travel Group",
        location: "United States",
        dateRange: "Jun 2015 – Present",
        description: "Sales and customer service in a large travel agency network serving the Latin American community in the USA.",
        category: "travel",
        orderIndex: 4,
      },
      {
        title: "Driver",
        company: "Lyft",
        dateRange: "Jan 2019 – May 2023 · 4 yrs 5 mos",
        category: "all",
        orderIndex: 5,
      },
      {
        title: "Bilingual Receptionist",
        company: "Kiss — A Procura",
        dateRange: "Nov 2013 – Present",
        category: "admin",
        orderIndex: 6,
      },
      {
        title: "Crew Steward",
        company: "Costa Crociere",
        dateRange: "Jan 2013 – Oct 2013 · 10 mos",
        description: "On-board service aboard international cruise ships. Multilingual customer experience in a high-pressure hospitality environment.",
        category: "travel",
        orderIndex: 7,
      },
      {
        title: "Service Supervisor",
        company: "Rei do Mate",
        dateRange: "Feb 2010 – Nov 2010 · 10 mos",
        category: "admin",
        orderIndex: 8,
      },
    ];

    for (const exp of experiences) {
      await db.insert(schema.experiences).values(exp);
    }

    // Insert Education
    const education = [
      {
        title: "CS50x — Introduction to Computer Science",
        institution: "Harvard University",
        dateRange: "Jul 2024 – Dec 2024",
        description: "C, Python, SQL, TypeScript, data structures, algorithms, memory management, web development with Flask and JavaScript.",
        category: "tech",
        orderIndex: 1,
      },
      {
        title: "English Intermediate B1.2",
        institution: "Coursera",
        dateRange: "Jul 2024",
        category: "all",
        orderIndex: 2,
      },
      {
        title: "English Intermediate B2 — Applied Linguistics",
        institution: "English Language Academy — MALTA",
        dateRange: "2013",
        category: "all",
        orderIndex: 3,
      },
    ];

    for (const edu of education) {
      await db.insert(schema.education).values(edu);
    }

    // Insert Skills
    const skills = [
      { name: "TypeScript", category: "tech", profileFilter: "tech", orderIndex: 1 },
      { name: "JavaScript", category: "tech", profileFilter: "tech", orderIndex: 2 },
      { name: "React", category: "tech", profileFilter: "tech", orderIndex: 3 },
      { name: "Node.js", category: "tech", profileFilter: "tech", orderIndex: 4 },
      { name: "Express", category: "tech", profileFilter: "tech", orderIndex: 5 },
      { name: "SQL", category: "tech", profileFilter: "tech", orderIndex: 6 },
      { name: "C", category: "tech", profileFilter: "tech", orderIndex: 7 },
      { name: "Python", category: "tech", profileFilter: "tech", orderIndex: 8 },
      { name: "Drizzle ORM", category: "tech", profileFilter: "tech", orderIndex: 9 },
      { name: "Zod", category: "tech", profileFilter: "tech", orderIndex: 10 },
      { name: "Tailwind CSS", category: "tech", profileFilter: "tech", orderIndex: 11 },
      { name: "Git/GitHub", category: "tech", profileFilter: "tech", orderIndex: 12 },
      { name: "Problem Solving", category: "core", profileFilter: "all", orderIndex: 1 },
      { name: "Attention to Detail", category: "core", profileFilter: "all", orderIndex: 2 },
      { name: "Communication", category: "core", profileFilter: "all", orderIndex: 3 },
      { name: "Teamwork", category: "core", profileFilter: "all", orderIndex: 4 },
      { name: "Leadership", category: "core", profileFilter: "all", orderIndex: 5 },
      { name: "Portuguese", category: "language", levelPercent: 100, levelText: "Native", profileFilter: "all", orderIndex: 1 },
      { name: "English", category: "language", levelPercent: 85, levelText: "Intermediate B2", profileFilter: "all", orderIndex: 2 },
      { name: "Spanish", category: "language", levelPercent: 70, levelText: "Intermediate", profileFilter: "all", orderIndex: 3 },
      { name: "CS50x Verified Certificate", category: "certification", profileFilter: "tech", orderIndex: 1 },
      { name: "English Intermediate B1.2 (Coursera)", category: "certification", profileFilter: "all", orderIndex: 2 },
    ];

    for (const skill of skills) {
      await db.insert(schema.skills).values(skill);
    }

    // Insert Business Metrics
    const metrics = [
      { name: "Years of Experience", value: 15, unit: "years", orderIndex: 1 },
      { name: "Projects Completed", value: 12, unit: "projects", orderIndex: 2 },
      { name: "Languages Spoken", value: 3, unit: "languages", orderIndex: 3 },
    ];

    for (const metric of metrics) {
      await db.insert(schema.businessMetrics).values(metric);
    }

    // Insert Human Values
    const values = [
      { title: "Integrity", description: "Honesty and strong moral principles in all professional interactions", icon: "shield", orderIndex: 1 },
      { title: "Excellence", description: "Commitment to delivering high-quality work and continuous improvement", icon: "star", orderIndex: 2 },
      { title: "Collaboration", description: "Working effectively with teams to achieve common goals", icon: "users", orderIndex: 3 },
      { title: "Innovation", description: "Embracing new ideas and technologies to solve complex problems", icon: "lightbulb", orderIndex: 4 },
      { title: "Resilience", description: "Perseverance through challenges and learning from setbacks", icon: "zap", orderIndex: 5 },
    ];

    for (const value of values) {
      await db.insert(schema.humanValues).values(value);
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
