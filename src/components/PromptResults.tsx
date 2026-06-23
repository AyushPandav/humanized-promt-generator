import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  Download,
  Play,
  Save,
  Eye,
  Edit3,
  Sparkles,
  Info,
  Shield,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { GeneratedPromptPayload, PromptConfig } from "../types";

interface PromptResultsProps {
  payload: GeneratedPromptPayload | null;
  config: PromptConfig;
  onSave: (customTitle: string) => void;
  isSaving: boolean;
  onTestPrompt: (promptText: string, testInput: string) => Promise<string>;
}

export default function PromptResults({
  payload,
  config,
  onSave,
  isSaving,
  onTestPrompt
}: PromptResultsProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "sandbox">("preview");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Sandbox testing states
  const [sandboxInput, setSandboxInput] = useState("");
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  // Sync editedPrompt whenever a new payload is generated
  useEffect(() => {
    if (payload) {
      setEditedPrompt(payload.structuredPrompt);
      setSaveTitle(payload.title);
    }
  }, [payload]);

  // Track prompt changes when payload changes
  const activePromptText = isEditing ? editedPrompt : (payload?.structuredPrompt || "");

  const handleCopy = () => {
    if (!activePromptText) return;
    navigator.clipboard.writeText(activePromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activePromptText || !payload) return;
    const blob = new Blob([activePromptText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-prompt.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerSave = () => {
    if (!saveTitle.trim()) return;
    onSave(saveTitle);
    setShowSaveDialog(false);
  };

  const handleSandboxRun = async () => {
    if (!activePromptText.trim()) return;
    setIsTesting(true);
    setSandboxError(null);
    try {
      const output = await onTestPrompt(activePromptText, sandboxInput);
      setSandboxResult(output);
    } catch (err: any) {
      setSandboxError(err?.message || "Failed to execute prompt in sandbox.");
    } finally {
      setIsTesting(false);
    }
  };

  const loadPayloadResult = () => {
    if (payload) {
      setEditedPrompt(payload.structuredPrompt);
      setSaveTitle(payload.title);
    }
  };

  // If no prompt generated yet, show placeholder empty state inside beautiful dark card layout
  if (!payload) {
    return (
      <div className="bg-[#141417] border border-slate-800/90 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center min-h-[500px]">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20 shadow-inner">
          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 font-display">Output Preview Block</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-3 leading-relaxed font-mono italic opacity-60">
          Waiting for task input to architect your meta-prompt structure... your final prompt will include constraints for burstiness, perplexity, and rhetorical variation to ensure a 100% human-grade result.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 w-full max-w-lg">
          <div className="bg-[#0A0A0B]/60 border border-slate-800 p-4 rounded-xl text-left">
            <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/25 mb-2">
              <span className="text-xs">🛡️</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 font-display">Anti-Slop Banning</h4>
            <p className="text-[10px] text-slate-500 mt-1">Strips cliches and robotic, repetitive adjectives.</p>
          </div>
          <div className="bg-[#0A0A0B]/60 border border-slate-800 p-4 rounded-xl text-left">
            <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/25 mb-2">
              <span className="text-xs">👥</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 font-display">Audience Voice</h4>
            <p className="text-[10px] text-slate-500 mt-1">Custom tailoring calibrated perfectly to target personas.</p>
          </div>
          <div className="bg-[#0A0A0B]/60 border border-slate-800 p-4 rounded-xl text-left">
            <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/25 mb-2">
              <span className="text-xs">🧪</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 font-display">Sandbox Arena</h4>
            <p className="text-[10px] text-slate-500 mt-1">Debug and run your generated template live immediately.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141417] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
      {/* Header Tabs with Title */}
      <div className="bg-[#0A0A0B]/80 border-b border-slate-800/70 p-4 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[9px] tracking-widest text-indigo-400 font-bold uppercase font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {config.tone} PROMPT RECIPE
            </span>
            {payload.modelUsed && (
              <span className="text-[9px] tracking-widest text-emerald-400 font-bold uppercase font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                🤖 Generated by {payload.modelUsed}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-100 font-display mt-1">
            {payload.title}
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#0A0A0B] p-1 rounded-lg border border-slate-800 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              activeTab === "preview"
                ? "bg-indigo-600 text-slate-100 shadow-md"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Prompt View
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              activeTab === "sandbox"
                ? "bg-indigo-600 text-slate-100 shadow-md"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            <Play className="w-3.5 h-3.5" /> Sandbox Run
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        /* PROMPT WORKSPACE TAB */
        <div className="flex-1 p-5 flex flex-col space-y-6">
          {/* Main Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0B] p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isEditing) {
                    setEditedPrompt(payload.structuredPrompt);
                  }
                  setIsEditing(!isEditing);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-tight transition flex items-center gap-1 ${
                  isEditing
                    ? "bg-indigo-600 text-slate-100"
                    : "bg-[#141417] border border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Edit3 className="w-3" />
                {isEditing ? "Locks and Preview" : "Manual Edit"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={loadPayloadResult}
                  className="py-1.5 px-3 bg-[#141417] border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-400 transition"
                  title="Revert modifications back to Gemini's custom draft"
                >
                  Reset Edits
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                className="py-1.5 px-3 bg-[#141417] border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Prompt
                  </>
                )}
              </button>

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                className="py-1.5 px-3 bg-[#141417] border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                title="Download prompt as markdown"
              >
                <Download className="w-3 h-3" /> Download .MD
              </button>

              {/* Save template locally */}
              <button
                type="button"
                onClick={() => {
                  setSaveTitle(payload.title);
                  setShowSaveDialog(true);
                }}
                className="py-1.5 px-3 bg-indigo-500/10 border border-indigo-500/25 hover:bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Save className="w-3 h-3" /> Save Template
              </button>
            </div>
          </div>

          {/* Main display content container */}
          <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 relative flex flex-col min-h-[350px]">
            {isEditing ? (
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="flex-1 w-full h-full p-4 font-mono text-xs bg-slate-950 text-slate-150 focus:outline-none leading-relaxed resize-none border-0"
                placeholder="Modify your prompt instructions manually..."
              />
            ) : (
              <div className="flex-1 p-5 overflow-auto max-h-[450px] bg-[#0c0c0e] prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-sans scrollbar">
                {/* Manual formatting styling wrapper for standard markdown rendering */}
                <div className="space-y-4">
                  <ReactMarkdown>{activePromptText}</ReactMarkdown>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-4 text-[9px] font-bold text-indigo-400 select-none bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded font-mono">
              {isEditing ? "📝 MANUAL DRAFT" : "🔒 READ-ONLY META ENGINE"}
            </div>
          </div>

          {/* Prompt metadata and firewalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Cliche Words Blocked */}
            <div className="bg-red-950/15 border border-red-900/30 rounded-xl p-4 flex gap-3">
              <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1 w-full">
                <span className="text-xs font-bold text-red-300 block font-display">
                  Anti-Slop Vocab Locks
                </span>
                <span className="text-[10px] text-slate-400 block leading-relaxed">
                  Explicit rules embedded to block the following stale phrases from the generation parameters:
                </span>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {payload.blockedWords && payload.blockedWords.length > 0 ? (
                    payload.blockedWords.map((word) => (
                      <span
                        key={word}
                        className="text-[10px] leading-none bg-red-950/45 border border-red-900/30 text-red-400 font-semibold rounded px-1.5 py-1 font-mono"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500">All standard slop cliches successfully banned.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Prompt strategy explanation */}
            <div className="bg-indigo-950/15 border border-indigo-900/20 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-300 block font-display">
                  Architecture Strategy
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  {payload.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Expert running tips */}
          {payload.tips && payload.tips.length > 0 && (
            <div className="bg-[#0A0A0B] border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-display">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Operational Running Tips
              </span>
              <ul className="list-disc pl-5 space-y-1">
                {payload.tips.map((tip, index) => (
                  <li key={index} className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* INTERACTIVE SANDBOX TAB */
        <div className="flex-1 p-5 flex flex-col space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-indigo-400">🧪 Interactive Sandbox Grid:</span> Test drive this compiled meta-prompt immediately before exporting. Enter your specific criteria variables, raw bullets, or general guidelines below, then click "Run Test Draft" to run it dynamically via server-side Gemini.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Input Variables */}
            <div className="space-y-2 flex flex-col h-full">
              <label htmlFor="sandboxInput" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] block font-display">
                ✍️ Sandbox Variable Input
              </label>
              <textarea
                id="sandboxInput"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="E.g., Give concrete details: My note-taking app is offline first, loads on the client in 20ms, and securely persists data in client local storage."
                className="flex-1 w-full min-h-[160px] p-3 text-xs bg-slate-950 border border-slate-850 rounded-xl text-slate-100 placeholder-slate-600 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed resize-none font-sans"
              />

              <button
                type="button"
                disabled={isTesting || !sandboxInput.trim()}
                onClick={handleSandboxRun}
                className={`w-full py-2.5 px-4 rounded-lg font-bold uppercase tracking-widest text-xs transition duration-200 border flex items-center justify-center gap-2 ${
                  isTesting || !sandboxInput.trim()
                    ? "bg-[#1d1d22]/50 border-slate-850 text-slate-600 cursor-not-allowed shadow-none"
                    : "bg-indigo-600 hover:bg-indigo-500 hover:border-indigo-400 border-indigo-600 text-white shadow-lg shadow-indigo-950/30 cursor-pointer"
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                {isTesting ? "Executing Sandbox Draft..." : "Run Test Draft"}
              </button>
            </div>

            {/* Simulated Live Output screen */}
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] flex items-center justify-between font-display">
                <span>⚡ Prompt Response terminal</span>
                {sandboxResult && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sandboxResult);
                      alert("Sandbox output copied!");
                    }}
                    className="text-[10px] text-indigo-455 hover:text-indigo-400 font-semibold"
                  >
                    Copy Output
                  </button>
                )}
              </label>
              <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 relative flex flex-col min-h-[220px]">
                <div className="flex-1 p-4 overflow-auto max-h-[350px] font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                  {isTesting ? (
                    <div className="flex items-center justify-center h-full flex-col gap-2">
                       <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500 font-mono text-[10px]">Processing prompt guidelines...</span>
                    </div>
                  ) : sandboxError ? (
                    <div className="flex items-center gap-2 text-red-400 p-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{sandboxError}</span>
                    </div>
                  ) : sandboxResult ? (
                    sandboxResult
                  ) : (
                    <span className="text-slate-650 select-none text-[10px] italic">Terminal empty. Enter coordinates on the left variable box and click "Run Test Draft" to test output patterns.</span>
                  )}
                </div>
                <div className="absolute top-2 right-4 text-[8px] font-semibold text-slate-500 select-none bg-slate-900 px-1 rounded font-mono">
                  TERMINAL OUTPUT
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE DIALOG OVERLAY */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#141417] rounded-2xl p-6 border border-slate-800 shadow-2xl max-w-sm w-full space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-display">Save Prompt Preset</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Assign a custom title to easily access this prompt from your saved history shelf later.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="saveTitle" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block font-display">Name Preset</label>
              <input
                id="saveTitle"
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="E.g., Substack Tech Explainer"
                className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/50 outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-3.5 py-2 bg-transparent border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-lg text-xs font-bold uppercase tracking-tight transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!saveTitle.trim()}
                onClick={triggerSave}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-tight transition shadow-lg shadow-indigo-950/40 disabled:bg-[#1d1d22] disabled:text-slate-600 disabled:border-slate-850"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
