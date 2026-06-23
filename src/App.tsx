import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, History, Info, HelpCircle } from "lucide-react";
import PromptForm from "./components/PromptForm";
import PromptResults from "./components/PromptResults";
import PromptHistory from "./components/PromptHistory";
import { PromptConfig, GeneratedPromptPayload, SavedPromptItem } from "./types";

export default function App() {
  // Form State
  const [configState, setConfigState] = useState<PromptConfig>({
    taskDescription: "",
    tone: "Direct & Concise",
    targetAudience: "Junior Developers / Designers",
    platformRequirements: "Technical Blog Post (Markdown)",
    humanizationLevel: "High",
    antiSlopSettings: {
      avoidCliches: true,
      sentenceVariety: true,
      conversationalCadence: true,
      anecdotesAndExamples: false
    },
    optionalContext: "",
    model: "gemini-2.5-flash"
  });

  // Generated Result State
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPromptPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // History State
  const [savedList, setSavedList] = useState<SavedPromptItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load Saved History on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/history");
        if (response.ok) {
          const data = await response.json();
          setSavedList(data);
        } else {
          throw new Error("Failed to load history from SQLite database.");
        }
      } catch (err) {
        console.error("Failed to load history:", err);
        // Fallback to local storage if API call fails
        const local = localStorage.getItem("prompt_humanizer_saved_v1");
        if (local) {
          setSavedList(JSON.parse(local));
        }
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  // Handle generating a new prompt from server-side Gemini route
  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    setApiError(null);
    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configState)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server failed to generate prompt. Please check your config.");
      }

      setGeneratedPrompt(data);
    } catch (err: any) {
      console.error(err);
      setApiError(err?.message || "An unexpected error occurred while communicating with the API.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle running prompt sandbox live against server-side Gemini route
  const handleTestPrompt = async (promptText: string, testInput: string): Promise<string> => {
    const response = await fetch("/api/test-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promptText, testInputText: testInput, model: configState.model })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Sandbox run failed. Try tweaking your test text.");
    }

    return data.resultText || "No response received from Sandbox.";
  };

  // Save current generated state to SQLite History
  const handleSaveToHistory = async (customTitle: string) => {
    if (!generatedPrompt) return;

    const newItem: SavedPromptItem = {
      id: Date.now().toString(),
      title: customTitle,
      config: { ...configState },
      result: { ...generatedPrompt },
      createdDate: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) {
        throw new Error("Failed to save to database");
      }
      const updated = [newItem, ...savedList];
      setSavedList(updated);
      localStorage.setItem("prompt_humanizer_saved_v1", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save history item to DB:", err);
      alert("Failed to save template to the database. Saving locally in browser session instead.");
      const updated = [newItem, ...savedList];
      setSavedList(updated);
      localStorage.setItem("prompt_humanizer_saved_v1", JSON.stringify(updated));
    }
  };

  // Delete from history
  const handleDeleteFromHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete from database");
      }
      const updated = savedList.filter((item) => item.id !== id);
      setSavedList(updated);
      localStorage.setItem("prompt_humanizer_saved_v1", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to delete history item:", err);
      alert("Failed to delete template from the database.");
    }
  };

  // Load a save prompt item into primary active states
  const handleLoadSavedItem = (item: SavedPromptItem) => {
    setConfigState({ ...item.config });
    setGeneratedPrompt({ ...item.result });
    // Scroll to top of page smoothly so user is focused on the restored prompt
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 flex flex-col font-sans">
      {/* Upper Brand Nav Rail */}
      <header className="bg-[#141417]/85 border-b border-slate-800/90 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-950/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase text-indigo-400 font-display flex items-center gap-1 leading-none">
                PromptForge <span className="text-slate-500 font-medium">/ Humanizer</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Anti-Slop Compiler • v2.4.0</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-300 flex items-center gap-1 font-medium bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/25">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Humanize Protocol Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Descriptive intro statement banner designed in sleek Bento fashion */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base font-bold text-slate-100 font-display">The Meta-Prompt Compiler</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard AI slop is instantly flagged. Humanize your prompting with specific constraint sets, burstiness directives, and strict tone firewalls that force natural sentence cadence.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-slate-400">TARGET LLM</div>
              <div className="font-bold text-slate-300">Gemini/Claude/GPT</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400">COMPILER</div>
              <div className="font-bold text-indigo-400 font-sans capitalize">{generatedPrompt?.modelUsed || configState.model}</div>
            </div>
          </div>
        </div>

        {/* Global Error Banner (API keys not set or network failure) */}
        {apiError && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-100 p-4 rounded-xl flex items-start gap-3 shadow-xs">
            <div className="p-1 px-2 bg-red-900/30 rounded text-red-400">⚠️</div>
            <div>
              <h4 className="text-xs font-bold font-display">Generation Process Halted</h4>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">{apiError}</p>
              <p className="text-[10px] text-red-400 mt-2">
                Make sure you have your <span className="font-semibold font-mono">GEMINI_API_KEY</span> provided inside the <span className="font-semibold">Settings &gt; Secrets</span> panel.
              </p>
            </div>
          </div>
        )}

        {/* Dual Pillar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form left block (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <PromptForm
                config={configState}
                onChange={setConfigState}
                onGenerate={handleGeneratePrompt}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Results preview right block (7 cols) */}
          <div className="lg:col-span-7">
            <PromptResults
              payload={generatedPrompt}
              config={configState}
              onSave={handleSaveToHistory}
              isSaving={false}
              onTestPrompt={handleTestPrompt}
            />
          </div>
        </div>

        {/* Historical Archive Bottom Segment */}
        {!loadingHistory && (
          <div className="pt-2">
            <PromptHistory
              items={savedList}
              onLoad={handleLoadSavedItem}
              onDelete={handleDeleteFromHistory}
            />
          </div>
        )}
      </main>

      {/* Footer Statement */}
      <footer className="border-t border-slate-900 bg-[#0A0A0B] py-6 text-center select-none text-[10px] text-slate-600 font-medium tracking-widest uppercase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 PROMPTFORGE. Designed for Creative Agencies & Thought Leaders.</p>
          <div className="flex items-center gap-3">
            <span>🛡️ SERVER-SIDE KEY SYSTEM SECURE</span>
            <span>✨ STABLE BUILD v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
