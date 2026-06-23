import { Clock, Trash2, ArrowRight, Save, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { SavedPromptItem } from "../types";

interface PromptHistoryProps {
  items: SavedPromptItem[];
  onLoad: (item: SavedPromptItem) => void;
  onDelete: (id: string) => void;
}

export default function PromptHistory({ items, onLoad, onDelete }: PromptHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.config.taskDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#141417] border border-slate-800/90 rounded-2xl p-6 shadow-2xl shadow-black/80 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-display flex items-center gap-1.5">
            📂 Saved Templates Archive <span className="text-[10px] bg-slate-950 border border-slate-800 text-zinc-400 font-mono px-2 py-0.5 rounded-full">{items.length}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Quickly retrieve previous generated prompts and sandbox definitions.</p>
        </div>

        {/* Local Search Input */}
        {items.length > 0 && (
          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search archive..."
              className="w-full text-xs pl-8 pr-3 py-2.5 bg-[#0a0a0c] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-650 focus:bg-slate-900 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center mb-3 border border-slate-850">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 font-display uppercase tracking-wider">No Saved Presets</p>
          <p className="text-[11px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
            When you generate a prompt that meets your expectations, click the <span className="font-semibold text-indigo-400">"Save Template"</span> button to keep it stored in your historical archive.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500">
          No templates match your search terms.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            const formattedDate = new Date(item.createdDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                key={item.id}
                className="group border border-slate-850 bg-[#0A0A0B]/50 hover:border-indigo-500/30 hover:bg-slate-900/40 rounded-xl p-4 transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-100 line-clamp-1 font-display group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h5>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-950"
                      title="Delete saved preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mt-1 uppercase font-mono">
                    <Clock className="w-3 h-3 text-slate-650" />
                    <span>{formattedDate}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {item.config.taskDescription}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-450 py-0.5 px-1.5 rounded">
                      👥 {item.config.targetAudience}
                    </span>
                    <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium py-0.5 px-1.5 rounded">
                      📱 {item.config.platformRequirements}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800/65 mt-4 pt-3 flex justify-end">
                  <button
                    onClick={() => onLoad(item)}
                    className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 group/btn"
                  >
                    Restore
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
