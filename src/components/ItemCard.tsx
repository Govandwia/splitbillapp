import { Item } from "@/lib/utils";
import { Button } from "./ui/Button";
import { Trash2, Plus, Minus, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/Input";

interface ItemCardProps {
  item: Item;
  currentUser: string;
  isCreator: boolean;
  onToggleClaim: (itemId: string, increment: number) => void;
  onDelete: (itemId: string) => void;
  onEdit: (itemId: string, newName: string, newPrice: number, newAmount: number) => void;
}

export function ItemCard({ item, currentUser, isCreator, onToggleClaim, onDelete, onEdit }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [editAmount, setEditAmount] = useState((item.amount || 1).toString());

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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(editPrice.replace(/\D/g, ""), 10);
    const amount = parseInt(editAmount, 10);
    if (!editName.trim() || isNaN(price) || isNaN(amount) || amount < 1) return;
    
    onEdit(item.id, editName, price, amount);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditAmount((item.amount || 1).toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSaveEdit} className="bg-white border-retro shadow-retro p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <Input 
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 w-full"
          placeholder="Item Name"
          required
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            className="w-full sm:w-28"
            placeholder="Price"
            type="number"
            required
          />
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-retro-fg/50 text-sm font-bold">Qty</span>
            <Input 
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-16 pl-8"
              type="number"
              min="1"
              required
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button type="submit" className="p-2.5 bg-retro-green text-white rounded-md border-2 border-retro-green hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all">
            <Check size={18} />
          </button>
          <button type="button" onClick={handleCancelEdit} className="p-2.5 bg-retro-red text-white rounded-md border-2 border-retro-red hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all">
            <X size={18} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white border-retro shadow-retro p-4 rounded-xl flex flex-col justify-between items-start mb-4 relative group">
      {isCreator && (
        <div className="absolute -top-3 -right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 bg-retro-yellow text-retro-fg rounded-full border-2 border-retro-fg shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] hover:-translate-y-0.5 transition-transform"
            title="Edit Item"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="p-1.5 bg-retro-red text-white rounded-full border-2 border-retro-fg shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] hover:-translate-y-0.5 transition-transform"
            title="Delete Item"
          >
            <Trash2 size={14} />
          </button>
        </div>
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
