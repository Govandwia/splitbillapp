"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function Home() {
  const [title, setTitle] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !creatorName.trim()) return;

    setIsLoading(true);
    try {
      const creator = creatorName.trim();
      const docRef = await addDoc(collection(db, "bills"), {
        title: title.trim(),
        creator: creator,
        created_at: serverTimestamp(),
        tax_percentage: 11, // Default tax in Indonesia
        service_charge: 0,
        participants: [creator],
        items: {},
        paid_status: {}
      });

      // Save creator identity locally so they don't have to join again
      localStorage.setItem(`splitbill_name_${docRef.id}`, creator);

      router.push(`/session/${docRef.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please check your Firebase configuration.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md bg-white border-retro shadow-retro p-8 rounded-2xl">
        <h1 className="text-4xl sm:text-5xl font-black mb-2 text-center">
          Split <span className="text-retro-red">Bill.</span>
        </h1>
        <p className="text-center text-retro-fg/80 mb-8 font-medium">
          Real-time collaborative bill splitting with friends. No sign-up required.
        </p>

        <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block font-bold mb-2">Event Name</label>
            <Input 
              id="title"
              placeholder="e.g. Makan Siang Sederhana" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="creator" className="block font-bold mb-2">Your Name</label>
            <Input 
              id="creator"
              placeholder="e.g. Govan (You as Creator)" 
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Session"}
          </Button>
        </form>
      </div>
    </main>
  );
}

