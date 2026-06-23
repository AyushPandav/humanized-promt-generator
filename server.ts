import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize SQLite Database
const db = new Database("history.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS prompt_history (
    id TEXT PRIMARY KEY,
    title TEXT,
    config_task_description TEXT,
    config_tone TEXT,
    config_target_audience TEXT,
    config_platform_requirements TEXT,
    config_humanization_level TEXT,
    config_anti_slop_settings TEXT,
    config_optional_context TEXT,
    config_model TEXT,
    result_title TEXT,
    result_structured_prompt TEXT,
    result_explanation TEXT,
    result_tips TEXT,
    result_blocked_words TEXT,
    result_model_used TEXT,
    created_date TEXT
  )
`);

app.use(express.json());

// Lazy-initialize the Gemini client to prevent startup crashes if GEMINI_API_KEY is missing
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it via Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    api_configured: !!process.env.GEMINI_API_KEY,
  });
});

// Helper to map DB row to frontend SavedPromptItem
function mapRowToItem(row: any) {
  return {
    id: row.id,
    title: row.title,
    config: {
      taskDescription: row.config_task_description,
      tone: row.config_tone,
      targetAudience: row.config_target_audience,
      platformRequirements: row.config_platform_requirements,
      humanizationLevel: row.config_humanization_level,
      antiSlopSettings: JSON.parse(row.config_anti_slop_settings),
      optionalContext: row.config_optional_context,
      model: row.config_model
    },
    result: {
      title: row.result_title,
      structuredPrompt: row.result_structured_prompt,
      explanation: row.result_explanation,
      tips: JSON.parse(row.result_tips),
      blockedWords: JSON.parse(row.result_blocked_words),
      modelUsed: row.result_model_used
    },
    createdDate: row.created_date
  };
}

// GET all prompt history
app.get("/api/history", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM prompt_history ORDER BY created_date DESC");
    const rows = stmt.all();
    const history = rows.map(mapRowToItem);
    res.json(history);
  } catch (err: any) {
    console.error("Failed to fetch history:", err);
    res.status(500).json({ error: "Failed to fetch prompt history." });
  }
});

// POST to save a new prompt to history
app.post("/api/history", (req, res) => {
  try {
    const { id, title, config, result, createdDate } = req.body;

    if (!id || !title || !config || !result) {
      res.status(400).json({ error: "Invalid history payload. All fields are required." });
      return;
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO prompt_history (
        id, title, config_task_description, config_tone, config_target_audience,
        config_platform_requirements, config_humanization_level, config_anti_slop_settings,
        config_optional_context, config_model, result_title, result_structured_prompt,
        result_explanation, result_tips, result_blocked_words, result_model_used, created_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title,
      config.taskDescription,
      config.tone,
      config.targetAudience,
      config.platformRequirements,
      config.humanizationLevel,
      JSON.stringify(config.antiSlopSettings),
      config.optionalContext,
      config.model,
      result.title,
      result.structuredPrompt,
      result.explanation,
      JSON.stringify(result.tips),
      JSON.stringify(result.blockedWords),
      result.modelUsed || "",
      createdDate || new Date().toISOString()
    );

    res.json({ status: "success", id });
  } catch (err: any) {
    console.error("Failed to save history:", err);
    res.status(500).json({ error: "Failed to save prompt to history." });
  }
});

// DELETE a history item by ID
app.delete("/api/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM prompt_history WHERE id = ?");
    const result = stmt.run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: "History item not found." });
      return;
    }
    res.json({ status: "success", id });
  } catch (err: any) {
    console.error("Failed to delete history:", err);
    res.status(500).json({ error: "Failed to delete prompt history item." });
  }
});

// Helper function to get fallback models if a selected model is overloaded
function getFallbackModels(requestedModel: string): string[] {
  const models = [requestedModel];
  const fallbacks = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const f of fallbacks) {
    if (!models.includes(f)) {
      models.push(f);
    }
  }
  return models;
}

// Endpoint to generate prompt
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const {
      taskDescription,
      tone,
      targetAudience,
      platformRequirements,
      humanizationLevel = "High",
      antiSlopSettings = {
        avoidCliches: true,
        sentenceVariety: true,
        conversationalCadence: true,
        anecdotesAndExamples: true,
      },
      optionalContext = "",
      model = "gemini-2.5-flash",
    } = req.body;

    if (!taskDescription || taskDescription.trim() === "") {
      res.status(400).json({ error: "Task description is required." });
      return;
    }

    const ai = getGeminiClient();

    // Draft the instructions to Gemini to generate the prompt
    const systemInstruction = `You are an expert prompt engineer specializing in crafting flawless, highly effective, robust, and anti-slop prompts for Large Language Models.
Your goal is to build a detailed, structured prompt that instructs an LLM to generate content matching the user's specific guidelines, ensuring the output sounds deeply human, natural, and free of standard AI writing signatures (slop).

AI signature/cliche words to avoid and explicitly list constraints for: 'delve', 'testament', 'tapestry', 'beacon', 'moreover', 'pioneering', 'furthermore', 'revolutionary', 'leverage', 'synergy', 'embark', 'demystify', 'in conclusion', 'it is important to note', 'journey'.

The output MUST be in a clean JSON format matching the schema requested. The structuredPrompt field should return a complete, production-ready, copy-pasteable, master prompt (not just a short sentence) that the user can run in ChatGPT, Gemini, or Claude. The prompt should include sections like 'Objective', 'Role & Context', 'Tone Guidelines', 'Negative Constraints (Words & Styles to Avoid)', 'Structural Formatting', and 'Examples/Placeholder instructions'.`;

    const configText = `
User's Target Task: "${taskDescription}"
Target Audience: "${targetAudience || "General Public"}"
Tone & Vibe: "${tone || "Professional yet conversational"}"
Platform/Format Requirements: "${platformRequirements || "Standard Blog or Article"}"
Humanization Level: "${humanizationLevel}"

Anti-Slop Directives:
- Avoid cliches: ${antiSlopSettings.avoidCliches}
- Varied sentence structures (short and punchy combined with descriptive ones): ${antiSlopSettings.sentenceVariety}
- Conversational cadence (use of rhetorical questions, minor imperfect pacing, contractions, humble pronouns): ${antiSlopSettings.conversationalCadence}
- Add examples/anecdotes guidelines: ${antiSlopSettings.anecdotesAndExamples}

Additional Custom Context or Guidelines: "${optionalContext}"
    `;

    const promptText = `Generate a master prompt for this task. Ensure that the generated prompt is organized cleanly as a markdown-formatted string inside the JSON. Including placeholders for variables the user might need to swap out.`;

    const modelsToTry = getFallbackModels(model);
    let lastError: any = null;
    let response = null;
    let finalModelUsed = "";

    for (const currentModel of modelsToTry) {
      try {
        console.log(`[API] Attempting generation with model: ${currentModel}`);
        response = await ai.models.generateContent({
          model: currentModel,
          contents: [
            { text: configText },
            { text: promptText }
          ],
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "A short, punchy, active title for the generated prompt (e.g., 'Authentic Founder Story Builder')"
                },
                structuredPrompt: {
                  type: Type.STRING,
                  description: "The complete, highly detailed prompt markdown string, with clear labels and placeholders (e.g., [Insert Data Here])."
                },
                explanation: {
                  type: Type.STRING,
                  description: "A 1-2 sentence description of of the strategy used to prevent AI slop for this target."
                },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-3 practical tips for running or fine-tuning this prompt successfully."
                },
                blockedWords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific cliches and vocabulary words explicitly forbidden in the instructions."
                }
              },
              required: ["title", "structuredPrompt", "explanation", "tips", "blockedWords"]
            }
          }
        });
        finalModelUsed = currentModel;
        break; // Successfully generated content!
      } catch (err: any) {
        console.error(`[API] Model ${currentModel} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("All attempted Gemini models returned empty responses or failed.");
    }

    const payload = JSON.parse(response.text.trim());
    payload.modelUsed = finalModelUsed;
    res.json(payload);
  } catch (err: any) {
    console.error("Error in generate-prompt:", err);
    res.status(500).json({
      error: err?.message || "An unexpected error occurred while generating the prompt."
    });
  }
});

// Endpoint to run a prompt sandbox test (uses Gemini to directly execute the generated prompt with simple user input)
app.post("/api/test-prompt", async (req, res) => {
  try {
    const { promptText, testInputText = "", model = "gemini-2.5-flash" } = req.body;

    if (!promptText || promptText.trim() === "") {
      res.status(400).json({ error: "Prompt text is required for testing." });
      return;
    }

    const ai = getGeminiClient();

    // We will combine the generated prompt and user test details
    const contentToSend = `
[PROMPT CONTEXT & INSTRUCTIONS]
${promptText}

[USER TEST INPUT / TOPIC TO GENERATE ON]
${testInputText || "Write a standard piece following the prompt rules above."}
    `;

    const modelsToTry = getFallbackModels(model);
    let lastError: any = null;
    let response = null;

    for (const currentModel of modelsToTry) {
      try {
        console.log(`[API Sandbox] Attempting test run with model: ${currentModel}`);
        response = await ai.models.generateContent({
          model: currentModel,
          contents: contentToSend,
          config: {
            temperature: 0.7,
          }
        });
        break;
      } catch (err: any) {
        console.error(`[API Sandbox] Model ${currentModel} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("All attempted Gemini models failed in the Sandbox test run.");
    }

    res.json({
      resultText: response.text,
    });
  } catch (err: any) {
    console.error("Error in test-prompt:", err);
    res.status(500).json({
      error: err?.message || "An unexpected error occurred during the prompt test run."
    });
  }
});

// Start express server and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
