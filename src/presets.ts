export interface PromptPreset {
  id: string;
  name: string;
  description: string;
  taskDescription: string;
  targetAudience: string;
  platformRequirements: string;
  tone: string;
  humanizationLevel: string;
  antiSlopSettings: {
    avoidCliches: boolean;
    sentenceVariety: boolean;
    conversationalCadence: boolean;
    anecdotesAndExamples: boolean;
  };
  optionalContext: string;
}

export const PRESETS: PromptPreset[] = [
  {
    id: "founder-update",
    name: "Authentic Founder Update",
    description: "Sincere, vision-oriented update for investors and community. High-conviction, natural pacing.",
    taskDescription: "Write a monthly update reporting our key growth milestones, engineering hurdles (being honest about what broke), and our core focus for next month.",
    targetAudience: "Investors, users, and the tech community",
    platformRequirements: "Newsletter or LinkedIn (approx. 400-600 words)",
    tone: "Transparent, visionary, and honest",
    humanizationLevel: "Maximum",
    antiSlopSettings: {
      avoidCliches: true,
      sentenceVariety: true,
      conversationalCadence: true,
      anecdotesAndExamples: true
    },
    optionalContext: "Never use commercial corporate buzzwords. Admit failures directly before highlighting solutions."
  },
  {
    id: "tech-tutorial",
    name: "No-Bullshit Tech Explainer",
    description: "Instructively plain, clear, and direct. Explains concepts without flowery metaphors or artificial enthusiasm.",
    taskDescription: "Explain how React Server Components (RSC) differ from standard client-side components with a code example showing data flow.",
    targetAudience: "Frontend developers learning modern frameworks",
    platformRequirements: "Technical blog post (Medium or personal site)",
    tone: "Helpful, instructional, and concise",
    humanizationLevel: "High",
    antiSlopSettings: {
      avoidCliches: true,
      sentenceVariety: true,
      conversationalCadence: true,
      anecdotesAndExamples: true
    },
    optionalContext: "Avoid saying 'In this tutorial, we will dive deep'. Start with direct comparison code right away. Do not add an 'In Conclusion' header."
  },
  {
    id: "opinionated-take",
    name: "Bold Industry Take",
    description: "Conversational, direct, opinionated. Feels like a Slack direct-message from a trusted colleague.",
    taskDescription: "Discuss why over-indexing on AI generation actually dilutes brand trust and how rare, crafted human perspectives are the new premium asset.",
    targetAudience: "Marketers, writers, and product managers",
    platformRequirements: "X (Twitter) long-form post or Substack feature",
    tone: "Bold, intellectual, and slightly conversational",
    humanizationLevel: "Maximum",
    antiSlopSettings: {
      avoidCliches: true,
      sentenceVariety: true,
      conversationalCadence: true,
      anecdotesAndExamples: false
    },
    optionalContext: "Use active verbs. Avoid academic preamble. Get straight to the controversial take."
  },
  {
    id: "simple-outreach",
    name: "Personal Client Outreach",
    description: "Short, highly personalized, empathetic. Zero corporate networking jargon.",
    taskDescription: "A cold email outreach offering an audit of their current web design to improve checkout performance.",
    targetAudience: "E-commerce store owners",
    platformRequirements: "Direct cold email (Max 150 words)",
    tone: "Empathetic, helpful, and non-intrusive",
    humanizationLevel: "High",
    antiSlopSettings: {
      avoidCliches: true,
      sentenceVariety: true,
      conversationalCadence: true,
      anecdotesAndExamples: true
    },
    optionalContext: "Must read like it was typed manually in 1 minute. Give them one specific thing that is broken on their landing page without pitching services yet."
  }
];

export const TONE_OPTIONS = [
  { value: "Sincere & Empathetic", label: "🤝 Sincere & Empathetic" },
  { value: "Direct & Concise", label: "⚡ Direct & Concise" },
  { value: "Helpful & Instructional", label: "📚 Helpful & Instructional" },
  { value: "Bold & Opinionated", label: "🔥 Bold & Opinionated" },
  { value: "Visionary & Transparent", label: "✨ Visionary & Transparent" },
  { value: "Casual & Witty", label: "☕ Casual & Witty" },
  { value: "Academic & Objective", label: "🎓 Academic & Analytical" }
];

export const AUDIENCE_OPTIONS = [
  "Junior Developers / Designers",
  "Senior Executives & Decision Makers",
  "E-Commerce Store Owners",
  "General Consumers",
  "Academics or Researchers",
  "SaaS Product Users",
  "Engineering Leaders"
];

export const PLATFORM_OPTIONS = [
  "LinkedIn Post / Feature Article",
  "Technical Blog Post (Markdown)",
  "Email Newsletter / Cold Outreach",
  "X (Twitter) Thread",
  "Short Product Documentation",
  "Internal Team Announcement",
  "Podcast Script Draft"
];

export const MODEL_OPTIONS = [
  { value: "gemini-2.5-flash", label: "⚡ Gemini 2.5 Flash (Recommended - Fast & Stable)" },
  { value: "gemini-2.5-pro", label: "🧠 Gemini 2.5 Pro (Analytical - Best for Complex)" },
  { value: "gemini-1.5-flash", label: "⏳ Gemini 1.5 Flash (Legacy - High Availability)" },
  { value: "gemini-1.5-pro", label: "🏛️ Gemini 1.5 Pro (Legacy - Highly Stable)" },
  { value: "gemini-3.5-flash", label: "🧪 Gemini 3.5 Flash (Preview - High Load)" }
];
