import { ParticipantSummary } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface SummaryBoardProps {
  summaries: ParticipantSummary[];
  currentUser: string;
  creator: string;
  onTogglePaid: (name: string, currentStatus: boolean) => void;
}

export function SummaryBoard({ summaries, currentUser, creator, onTogglePaid }: SummaryBoardProps) {
  if (summaries.length === 0) return null;

  const isCreator = currentUser === creator;

  return (
    <div className="bg-retro-bg border-retro shadow-retro p-4 sm:p-6 rounded-xl mt-8 lg:mt-0 lg:sticky lg:top-8">
      <h2 className="text-2xl font-black mb-4">Bill Summary</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-retro-fg">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2 text-right">Total</th>
              <th className="py-2 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr 
                key={summary.name} 
                className={`border-b border-retro-fg/20 ${summary.name === currentUser ? "bg-retro-yellow/20 font-bold" : ""}`}
              >
                <td className="py-3 px-2">
                  <div className="flex flex-col">
                    <span>{summary.name} {summary.name === currentUser && "(You)"}</span>
                    {summary.name === creator && <span className="text-[10px] text-retro-fg/60 uppercase tracking-wider font-bold">Creator</span>}
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="font-mono font-bold text-retro-red">
                    {Math.round(summary.total).toLocaleString("id-ID")}
                  </div>
                  <div className="font-mono text-xs text-retro-fg/60">
                    sub: {Math.round(summary.subtotal).toLocaleString("id-ID")}
                  </div>
                </td>
                <td className="py-3 px-2 text-center align-middle">
                  {isCreator ? (
                    <button 
                      onClick={() => onTogglePaid(summary.name, !!summary.isPaid)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border-2 transition-all ${
                        summary.isPaid 
                        ? "bg-retro-green/20 border-retro-green text-retro-green hover:bg-retro-green hover:text-white" 
                        : "bg-retro-bg border-retro-fg/30 text-retro-fg/60 hover:border-retro-fg hover:text-retro-fg"
                      }`}
                    >
                      {summary.isPaid ? <CheckCircle size={14} /> : <Circle size={14} />}
                      {summary.isPaid ? "Paid" : "Unpaid"}
                    </button>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border-2 ${
                      summary.isPaid 
                      ? "bg-retro-green/20 border-retro-green text-retro-green" 
                      : "bg-retro-bg border-retro-fg/30 text-retro-fg/60"
                    }`}>
                      {summary.isPaid ? <CheckCircle size={14} /> : <Circle size={14} />}
                      {summary.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
