"use client";

import { useEffect, useState, use } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, increment, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item, calculateSplit } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ItemCard } from "@/components/ItemCard";
import { SummaryBoard } from "@/components/SummaryBoard";
import { Share2, Settings, X, Check } from "lucide-react";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("1");

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [taxInput, setTaxInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  useEffect(() => {
    // Check localStorage for existing session identity
    const savedName = localStorage.getItem(`splitbill_name_${id}`);
    if (savedName) {
      setCurrentUser(savedName);
    }

    // Subscribe to Firestore changes
    const unsub = onSnapshot(doc(db, "bills", id), (doc) => {
      if (doc.exists()) {
        setBill(doc.data());
      } else {
        setBill(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    
    const name = nicknameInput.trim();
    setCurrentUser(name);
    localStorage.setItem(`splitbill_name_${id}`, name);

    // Add user to participants if not already there
    if (bill && !bill.participants.includes(name)) {
      const docRef = doc(db, "bills", id);
      await updateDoc(docRef, {
        participants: arrayUnion(name)
      });
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim() || !newItemAmount.trim()) return;

    const itemId = `item_${Date.now()}`;
    const price = parseInt(newItemPrice.replace(/\D/g, ""), 10);
    const amount = parseInt(newItemAmount, 10);
    
    if (isNaN(price) || isNaN(amount) || amount < 1) return;

    const docRef = doc(db, "bills", id);
    await updateDoc(docRef, {
      [`items.${itemId}`]: {
        id: itemId,
        name: newItemName.trim(),
        price: price,
        amount: amount,
        claims: {}
      }
    });

    setNewItemName("");
    setNewItemPrice("");
    setNewItemAmount("1");
  };

  const handleToggleClaim = async (itemId: string, incrementAmount: number) => {
    if (!currentUser) return;

    const docRef = doc(db, "bills", id);
    
    // Using increment allows atomic updates without race conditions
    await updateDoc(docRef, {
      [`items.${itemId}.claims.${currentUser}`]: increment(incrementAmount)
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!currentUser || currentUser !== bill?.creator) return;
    
    if (confirm("Are you sure you want to delete this item?")) {
      const docRef = doc(db, "bills", id);
      await updateDoc(docRef, {
        [`items.${itemId}`]: deleteField()
      });
    }
  };

  const handleTogglePaid = async (participantName: string, currentStatus: boolean) => {
    if (!currentUser || currentUser !== bill?.creator) return;

    const docRef = doc(db, "bills", id);
    await updateDoc(docRef, {
      [`paid_status.${participantName}`]: !currentStatus
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser !== bill?.creator) return;

    const newTax = parseFloat(taxInput) || 0;
    const newService = parseFloat(serviceInput) || 0;

    const docRef = doc(db, "bills", id);
    await updateDoc(docRef, {
      tax_percentage: newTax,
      service_charge: newService
    });
    setIsEditingSettings(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Split Bill: ${bill?.title}`,
      text: "Join my Split Bill session to claim your items!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;
  }

  if (!bill) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Session not found!</div>;
  }

  // Calculate Summaries
  const summaries = calculateSplit(
    bill.items || {},
    bill.tax_percentage || 0,
    bill.service_charge || 0,
    bill.participants || [],
    bill.paid_status || {}
  );

  if (!currentUser) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border-retro shadow-retro p-8 rounded-2xl">
          <h1 className="text-3xl font-black mb-2 text-center">Join Session</h1>
          <p className="text-center text-retro-fg/80 mb-6 font-medium">
            Enter your nickname to join <strong>{bill.title}</strong>
          </p>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <Input 
              placeholder="e.g. John Doe" 
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              required
            />
            <Button type="submit" size="lg">Join Room</Button>
          </form>
        </div>
      </main>
    );
  }

  const itemsList = Object.values(bill.items || {}) as Item[];

  return (
    <main className="flex-1 flex flex-col items-center p-4 sm:p-8 max-w-5xl mx-auto w-full relative">
      <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-retro-blue text-white p-6 rounded-2xl border-retro shadow-retro">
        <div className="flex-1">
          <h1 className="text-3xl font-black break-words">{bill.title}</h1>
          
          {isEditingSettings ? (
            <form onSubmit={handleSaveSettings} className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-white p-1 rounded-md">
                <span className="text-retro-fg text-xs font-bold pl-2">Tax %</span>
                <input 
                  type="number" 
                  value={taxInput}
                  onChange={(e) => setTaxInput(e.target.value)}
                  className="w-16 h-8 text-retro-fg bg-transparent px-2 outline-none font-bold"
                  step="0.1"
                />
              </div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-md">
                <span className="text-retro-fg text-xs font-bold pl-2">Srvc %</span>
                <input 
                  type="number" 
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  className="w-16 h-8 text-retro-fg bg-transparent px-2 outline-none font-bold"
                  step="0.1"
                />
              </div>
              <button type="submit" className="p-2 bg-retro-green text-white rounded-md border-2 border-retro-green hover:bg-green-600 transition-colors">
                <Check size={16} />
              </button>
              <button type="button" onClick={() => setIsEditingSettings(false)} className="p-2 bg-retro-red text-white rounded-md border-2 border-retro-red hover:bg-red-600 transition-colors">
                <X size={16} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <p className="font-medium opacity-80">Tax: {bill.tax_percentage}% • Service: {bill.service_charge}%</p>
              {currentUser === bill.creator && (
                <button 
                  onClick={() => {
                    setTaxInput(bill.tax_percentage.toString());
                    setServiceInput(bill.service_charge.toString());
                    setIsEditingSettings(true);
                  }}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors"
                  title="Edit Tax & Service"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-white text-retro-fg px-4 py-2 rounded-lg font-bold border-2 border-retro-fg flex-1 sm:flex-none text-center truncate">
            {currentUser}
          </div>
          <button 
            onClick={handleShare}
            className="bg-retro-yellow text-retro-fg p-2 rounded-lg font-bold border-2 border-retro-fg shadow-[2px_2px_0px_0px_rgba(28,28,28,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all flex items-center justify-center"
            title="Share session"
          >
            <Share2 size={24} />
          </button>
        </div>
      </header>

      <div className="w-full flex flex-col lg:flex-row gap-8 items-start relative">
        <div className="w-full lg:flex-1 flex flex-col gap-6">
          <div className="bg-white border-retro shadow-retro p-6 rounded-2xl">
            <h2 className="text-2xl font-black mb-4">Add Item</h2>
            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-4">
              <Input 
                placeholder="Item Name" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
                required
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <Input 
                  placeholder="Price" 
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full sm:w-32"
                  required
                />
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-retro-fg/50 text-sm font-bold">Qty</span>
                  <Input 
                    type="number"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="w-20 pl-8"
                    min="1"
                    required
                  />
                </div>
              </div>
              <Button type="submit">Add</Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-black mb-4 px-2">Items</h2>
            {itemsList.length === 0 ? (
              <p className="text-retro-fg/60 p-4 font-medium border-2 border-dashed border-retro-fg/30 rounded-xl text-center">No items added yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {itemsList.map(item => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    currentUser={currentUser}
                    isCreator={currentUser === bill.creator}
                    onToggleClaim={handleToggleClaim}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0">
          <SummaryBoard 
            summaries={summaries} 
            currentUser={currentUser} 
            creator={bill.creator}
            onTogglePaid={handleTogglePaid}
          />
        </div>
      </div>
    </main>
  );
}
