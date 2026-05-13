import { Item } from "@/lib/utils";
import { Button } from "./ui/Button";
import { Trash2, Plus, Minus } from "lucide-react";

interface ItemCardProps {
  item: Item;
  currentUser: string;
  isCreator: boolean;
  onToggleClaim: (itemId: string, increment: number) => void;
  onDelete: (itemId: string) => void;
}

export function ItemCard({ item, currentUser, isCreator, onToggleClaim, onDelete }: ItemCardProps) {
  const claims = item.claims || {};
  const myClaimsCount = claims[currentUser] || 0;
  
  // Calculate how many total have been claimed
  const totalClaimed = Object.values(claims).reduce((sum, count) => sum + count, 0);
  const remaining = (item.amount || 1) - totalClaimed;

  // Flatten claims to array for display
  const displayClaims: string[] = [];
  Object.entries(claims).forEach(([name, count]) => {
    for (let i = 0; i < count; i++) {
      displayClaims.push(name);
    }
  });

  return (
    <div className="bg-white border-retro shadow-retro p-4 rounded-xl flex flex-col justify-between items-start mb-4 relative">
      {isCreator && (
        <button 
          onClick={() => onDelete(item.id)}
          className="absolute top-2 right-2 p-2 text-retro-fg/40 hover:text-retro-red hover:bg-retro-red/10 rounded-md transition-colors"
          title="Delete Item"
        >
          <Trash2 size={18} />
        </button>
      )}

      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg pr-8">{item.name} <span className="text-sm font-normal text-retro-fg/60 ml-2">x{item.amount || 1}</span></h3>
          <p className="text-retro-fg/70 font-mono">Rp {item.price.toLocaleString("id-ID")} <span className="text-xs">/ea</span></p>
          
          {displayClaims.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {displayClaims.map((name, idx) => (
                <span 
                  key={`${name}-${idx}`} 
                  className="bg-retro-blue/20 text-retro-blue border-2 border-retro-blue px-2 py-0.5 rounded-md text-xs font-bold"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end mt-4 sm:mt-0">
          {myClaimsCount > 0 ? (
            <div className="flex items-center bg-retro-bg border-retro rounded-md overflow-hidden shadow-[2px_2px_0px_0px_rgba(28,28,28,1)]">
              <button 
                onClick={() => onToggleClaim(item.id, -1)}
                className="p-2 hover:bg-retro-red hover:text-white transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-mono font-bold w-8 text-center">{myClaimsCount}</span>
              <button 
                onClick={() => remaining > 0 && onToggleClaim(item.id, 1)}
                disabled={remaining === 0}
                className="p-2 hover:bg-retro-green hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-retro-fg"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <Button
              variant="default"
              onClick={() => onToggleClaim(item.id, 1)}
              disabled={remaining === 0}
              className="w-full sm:w-auto bg-retro-yellow disabled:opacity-50"
            >
              {remaining === 0 ? "Sold Out" : "Claim"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
