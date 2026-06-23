export interface AntiSlopSettings {
  avoidCliches: boolean;
  sentenceVariety: boolean;
  conversationalCadence: boolean;
  anecdotesAndExamples: boolean;
}

export interface PromptConfig {
  taskDescription: string;
  tone: string;
  targetAudience: string;
  platformRequirements: string;
  humanizationLevel: "None" | "Medium" | "High" | "Maximum";
  antiSlopSettings: AntiSlopSettings;
  optionalContext: string;
  model: string;
}

export interface GeneratedPromptPayload {
  title: string;
  structuredPrompt: string;
  explanation: string;
  tips: string[];
  blockedWords: string[];
  modelUsed?: string;
}

export interface SavedPromptItem {
  id: string;
  title: string;
  config: PromptConfig;
  result: GeneratedPromptPayload;
  createdDate: string;
}
