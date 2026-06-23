import { useState, useEffect } from "react";
import { Sparkles, ShieldAlert, AlertTriangle, RefreshCw, Info } from "lucide-react";
import { PRESETS, TONE_OPTIONS, AUDIENCE_OPTIONS, PLATFORM_OPTIONS, MODEL_OPTIONS, PromptPreset } from "../presets";
import { PromptConfig } from "../types";

const SLOP_WORDS_LIST = [
  "delve",
  "testament",
  "tapestry",
  "beacon",
  "moreover",
  "pioneering",
  "furthermore",
  "leverage",
  "embark",
  "demystify",
  "revolutionary",
  "synergy",
  "journey"
];

interface PromptFormProps {
  config: PromptConfig;
  onChange: (newConfig: PromptConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function PromptForm({ config, onChange, onGenerate, isGenerating }: PromptFormProps) {
  const [detectedSlop, setDetectedSlop] = useState<string[]>([]);

  // Monitor the task description for live slop scanning
  useEffect(() => {
    const text = config.taskDescription.toLowerCase();
    const found = SLOP_WORDS_LIST.filter((word) => text.includes(word));
    setDetectedSlop(found);
  }, [config.taskDescription]);

  const updateField = (field: keyof PromptConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const updateAntiSlop = (settingKey: keyof PromptConfig["antiSlopSettings"], value: boolean) => {
    onChange({
      ...config,
      antiSlopSettings: {
        ...config.antiSlopSettings,
        [settingKey]: value,
      },
    });
  };

  const applyPreset = (preset: PromptPreset) => {
    onChange({
      taskDescription: preset.taskDescription,
      tone: preset.tone,
      targetAudience: preset.targetAudience,
      platformRequirements: preset.platformRequirements,
      humanizationLevel: preset.humanizationLevel as any,
      antiSlopSettings: { ...preset.antiSlopSettings },
      optionalContext: preset.optionalContext,
      model: config.model || "gemini-2.5-flash",
    });
  };

  const fillRandomSample = () => {
    const randomIndex = Math.floor(Math.random() * PRESETS.length);
    applyPreset(PRESETS[randomIndex]);
  };

  return (
    <div className="bg-[#141417] border border-slate-800/90 rounded-2xl p-6 shadow-2xl shadow-black/80 space-y-6">
      {/* Presets Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 font-display">
            ⚡ Quick Presets Recipes
          </label>
          <button
            type="button"
            onClick={fillRandomSample}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Randomize
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3 rounded-xl border border-slate-800 bg-[#0A0A0B]/60 hover:bg-slate-800/60 hover:border-indigo-500/30 text-xs transition-all duration-200 group"
            >
              <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                {preset.name}
              </div>
              <div className="text-slate-500 line-clamp-1 mt-0.5 text-[10px]">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-800/60" />

      {/* Task Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="taskDescription" className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-display">
            🎯 General Writing Goal
          </label>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Describe Target Task</span>
        </div>
        <textarea
          id="taskDescription"
          rows={4}
          value={config.taskDescription}
          onChange={(e) => updateField("taskDescription", e.target.value)}
          placeholder="Describe what you want to create... e.g. 'An article explaining quantum computing to a high schooler without using cliché buzzwords.'"
          className="w-full text-sm p-3.5 bg-[#0a0a0c] border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:bg-[#0c0c0e] focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all outline-none leading-relaxed resize-none font-sans"
        />

        {/* Live Slop Detector Alert banner */}
        {detectedSlop.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex items-start gap-2.5 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-300 leading-relaxed">
              <span className="font-bold text-amber-400">Detected AI slop vocabulary:</span>{" "}
              {detectedSlop.map((word) => (
                <span
                  key={word}
                  className="inline-block px-1.5 py-0.2 bg-amber-950/70 border border-amber-800/40 rounded font-code text-amber-300 mx-0.5 text-[11px]"
                >
                  "{word}"
                </span>
              ))}
              <br />
              <p className="mt-1 text-slate-400 text-[10px] leading-relaxed">
                No worries! Our Prompt Engine will generate strict meta-instructions explicitly banning these clichés.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tone Selection */}
        <div className="space-y-1.5">
          <label htmlFor="tone" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] font-display">
            🎭 Resonance Style
          </label>
          <select
            id="tone"
            value={config.tone}
            onChange={(e) => updateField("tone", e.target.value)}
            className="w-full text-xs p-2.5 bg-[#0A0A0B] border border-slate-800 rounded-lg text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            {TONE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#141417]">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Humanization Strength Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="humanizationLevel" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] font-display">
              🧬 Humanization Level
            </label>
            <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase">{config.humanizationLevel}</span>
          </div>
          <div className="flex bg-[#0A0A0B] p-1 rounded-lg border border-slate-800">
            {(["None", "Medium", "High", "Maximum"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => updateField("humanizationLevel", lvl)}
                className={`flex-1 text-[10px] py-1 text-center font-bold tracking-tight rounded-md transition-all uppercase ${
                  config.humanizationLevel === lvl
                    ? "bg-indigo-600 text-slate-100 shadow-md"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target Audience */}
        <div className="space-y-1.5">
          <label htmlFor="targetAudience" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] font-display">
            👥 Target Audience
          </label>
          <input
            id="targetAudience"
            type="text"
            list="audience-presets"
            value={config.targetAudience}
            onChange={(e) => updateField("targetAudience", e.target.value)}
            placeholder="e.g. Executives, Technical Peers"
            className="w-full text-xs p-2.5 bg-[#0A0A0B] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <datalist id="audience-presets">
            {AUDIENCE_OPTIONS.map((aud) => (
              <option key={aud} value={aud} />
            ))}
          </datalist>
        </div>

        {/* Platform Requirements */}
        <div className="space-y-1.5">
          <label htmlFor="platformRequirements" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] font-display">
            📱 Platform / Format
          </label>
          <input
            id="platformRequirements"
            type="text"
            list="platform-presets"
            value={config.platformRequirements}
            onChange={(e) => updateField("platformRequirements", e.target.value)}
            placeholder="e.g. Substack, Newsletter, Documentation"
            className="w-full text-xs p-2.5 bg-[#0A0A0B] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <datalist id="platform-presets">
            {PLATFORM_OPTIONS.map((plat) => (
              <option key={plat} value={plat} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="model" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] font-display flex items-center gap-1">
          🤖 Gemini Compiler Model
        </label>
        <select
          id="model"
          value={config.model || "gemini-2.5-flash"}
          onChange={(e) => updateField("model", e.target.value)}
          className="w-full text-xs p-2.5 bg-[#0A0A0B] border border-slate-800 rounded-lg text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#141417]">
              {opt.label}
            </option>
          ))}
        </select>
        <p className="text-[9px] text-slate-500 leading-normal">
          If your chosen model is experiencing heavy traffic, the server will automatically fall back to a highly available alternative.
        </p>
      </div>

      <hr className="border-slate-800/60" />

      {/* Shield Firewalls (Custom Knobs) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 font-display">
          <ShieldAlert className="w-4 h-4 text-indigo-400" /> Constraint Checklist
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Prevent Cliches */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-950/40 rounded-xl border border-slate-800 hover:bg-slate-900 cursor-pointer transition">
            <input
              type="checkbox"
              checked={config.antiSlopSettings.avoidCliches}
              onChange={(e) => updateAntiSlop("avoidCliches", e.target.checked)}
              className="mt-0.5 accent-indigo-500 w-4 h-4 text-indigo-600 bg-[#0a0a0b] border-slate-800 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-300 block">Ban AI Buzzwords</span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                Strips 'delve', 'tapestry', 'leverage', etc.
              </span>
            </div>
          </label>

          {/* Varied Sentence Length */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-950/40 rounded-xl border border-slate-800 hover:bg-slate-900 cursor-pointer transition">
            <input
              type="checkbox"
              checked={config.antiSlopSettings.sentenceVariety}
              onChange={(e) => updateAntiSlop("sentenceVariety", e.target.checked)}
              className="mt-0.5 accent-indigo-500 w-4 h-4 text-indigo-600 bg-[#0a0a0b] border-slate-800 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-300 block">Natural Sentence Pacing</span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                Blends short punchy sentences with details.
              </span>
            </div>
          </label>

          {/* Conversational Cadence */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-950/40 rounded-xl border border-slate-800 hover:bg-slate-900 cursor-pointer transition">
            <input
              type="checkbox"
              checked={config.antiSlopSettings.conversationalCadence}
              onChange={(e) => updateAntiSlop("conversationalCadence", e.target.checked)}
              className="mt-0.5 accent-indigo-500 w-4 h-4 text-indigo-600 bg-[#0a0a0b] border-slate-800 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-300 block">Personal Cadence</span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                Includes contractions, rhetorical hooks, and pronouns.
              </span>
            </div>
          </label>

          {/* Anecdotes and Examples */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-950/40 rounded-xl border border-slate-800 hover:bg-slate-900 cursor-pointer transition">
            <input
              type="checkbox"
              checked={config.antiSlopSettings.anecdotesAndExamples}
              onChange={(e) => updateAntiSlop("anecdotesAndExamples", e.target.checked)}
              className="mt-0.5 accent-indigo-500 w-4 h-4 text-indigo-600 bg-[#0a0a0b] border-slate-800 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-300 block">Example Anchor</span>
              <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">
                Grounds concepts with realistic metaphors/quotes.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Additional Custom Instructions */}
      <div className="space-y-1.5">
        <label htmlFor="optionalContext" className="text-[10px] font-bold uppercase tracking-widest text-[#8f93a2] flex items-center gap-1 font-display">
          ✨ Optional Custom Rules
        </label>
        <input
          id="optionalContext"
          type="text"
          value={config.optionalContext}
          onChange={(e) => updateField("optionalContext", e.target.value)}
          placeholder="e.g. Keep output text concise, use Markdown formatting, first-person only"
          className="w-full text-xs p-2.5 bg-[#0A0A0B] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={isGenerating || !config.taskDescription.trim()}
        onClick={onGenerate}
        className={`w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 border ${
          !config.taskDescription.trim()
            ? "bg-[#1d1d22]/50 border-slate-850 text-slate-600 cursor-not-allowed shadow-none"
            : "bg-indigo-600 hover:bg-indigo-500 hover:border-indigo-400 text-white shadow-xl shadow-indigo-950/50 active:scale-98 cursor-pointer"
        } flex items-center justify-center gap-2`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
        {isGenerating ? "ARCHITECTING META-PROMPT..." : "Generate Ultimate Prompt"}
      </button>
    </div>
  );
}
