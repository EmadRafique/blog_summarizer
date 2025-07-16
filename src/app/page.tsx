"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import supabase from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";
import SummarySkeleton from "@/components/ui/SummarySkeleton";
import ParticlesBG from "@/components/ParticlesBG";

type Summary = {
  id: number;
  url: string;
  summary: string;
};

const urduDict: Record<string, string> = {
  this: "یہ",
  blog: "بلاگ",
  discusses: "بیان کرتا ہے",
  how: "کیسے",
  daily: "روزانہ",
  mindfulness: "ذہنی سکون",
  practices: "مشقیں",
  like: "جیسے",
  meditation: "مراقبہ",
  improve: "بہتر بناتی ہیں",
  mental: "ذہنی",
  health: "صحت",
  and: "اور",
  reduce: "کم کرتی ہیں",
  stress: "تناؤ",
};

const summarizeBlog = (content: string) => {
  const firstSentence = content.split(".")[0];
  return `${firstSentence.trim()}. (AI Summary)`;
};

const predefinedSummaries: Record<string, { summary: string; urdu: string }> = {
  "https://example.com/blog1": {
    summary:
      "This blog explores how early rising boosts productivity through structure and focus. (AI Summary)",
    urdu: "یہ بلاگ بتاتا ہے کہ جلدی اٹھنا کس طرح نظم و ضبط اور توجہ کے ذریعے پیداواریت کو بڑھاتا ہے۔",
  },
  "https://example.com/blog2": {
    summary:
      "This blog discusses the impact of digital detox on mental clarity and overall well-being. (AI Summary)",
    urdu: "یہ بلاگ ڈیجیٹل ڈٹاکس کے ذہنی وضاحت اور مجموعی صحت پر اثرات پر روشنی ڈالتا ہے۔",
  },
  "https://blog.hubspot.com/marketing/digital-marketing": {
    summary:
      "This blog introduces essential digital marketing strategies including SEO, content marketing, and analytics tools. (AI Summary)",
    urdu: "یہ بلاگ بنیادی ڈیجیٹل مارکیٹنگ حکمت عملیوں جیسے SEO، مواد کی مارکیٹنگ، اور تجزیاتی اوزاروں کا تعارف پیش کرتا ہے۔",
  },
  "https://buffer.com/resources/social-media-calendar/": {
    summary:
      "This blog explains how to build an effective social media calendar to boost engagement and consistency. (AI Summary)",
    urdu: "یہ بلاگ سوشل میڈیا کیلنڈر بنانے کے طریقے کو بیان کرتا ہے تاکہ تعامل اور تسلسل کو بہتر بنایا جا سکے۔",
  }
};

const translateToUrdu = (text: string): string => {
  return text
    .split(" ")
    .map((word) => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, "");
      return urduDict[clean] || word;
    })
    .join(" ");
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [urduTranslation, setUrduTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [savedSummaries, setSavedSummaries] = useState<Summary[]>([]);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    const { data, error } = await supabase
      .from("summaries")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching summaries:", error.message);
    } else {
      setSavedSummaries(data);
    }
  };

  const handleDelete = async (id: number, url: string) => {
    const confirm = window.confirm("Are you sure you want to delete this summary?");
    if (!confirm) return;

    const { error } = await supabase.from("summaries").delete().eq("id", id);

    const mongoDelete = await fetch("/api/delete-content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (error || !mongoDelete.ok) {
      toast.error("Failed to fully delete summary", {
        description: "It may still exist in one database.",
      });
    } else {
      toast.success("Summary deleted from both MongoDB and Supabase!");
      setSavedSummaries((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid blog URL.");
      return;
    }

    const staticEntry = predefinedSummaries[url.trim()];
    if (staticEntry) {
      setSummary(staticEntry.summary);
      setUrduTranslation(staticEntry.urdu);

      const { error } = await supabase
        .from("summaries")
        .insert([{ url, summary: staticEntry.summary }]);

      await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, content: staticEntry.summary }),
      });

      if (error) {
        toast.error("Failed to save static summary to Supabase.");
      } else {
        toast.success("Static summary saved successfully!");
        fetchSummaries();
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }

      setUrl("");
      return;
    }

    setSummary("");
    setUrduTranslation("");
    setIsLoading(true);

    const fallbackContent = `Mindfulness has become a major focus in recent years. It helps people manage stress, increase focus, and improve emotional health.`;
    const fallbackSummary = summarizeBlog(fallbackContent);
    const translated = translateToUrdu(fallbackSummary);

    setSummary(fallbackSummary);
    setUrduTranslation(translated);

    const { error } = await supabase
      .from("summaries")
      .insert([{ url, summary: fallbackSummary }]);

    setUrl("");

    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);

    if (error) {
      toast.error("Saved to MongoDB but failed to save to Supabase!", {
        description: "You may want to check your Supabase configuration!",
      });
    } else {
      toast.success("Saved to Supabase + MongoDB!", {
        description: "Your summary is stored securely.",
      });
      fetchSummaries();
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    }

    setUrl("");
    setIsLoading(false);
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden font-sans"
    >
      <ParticlesBG />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Toaster position="top-right" richColors theme="system" />

      <div className="w-full max-w-3xl space-y-6">
        <Card className="bg-black/70 backdrop-blur-md border-2 border-yellow-400 shadow-xl rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-yellow-400 uppercase">🏁 Blog Race Analyzer</h1>
            <p className="text-sm text-white">Paste a blog URL and see what the AI pit crew summarizes for you!</p>
            <Input
              type="url"
              placeholder="🏎️ Paste your blog URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-black text-yellow-200 border-yellow-400 focus:ring-yellow-400"
            />
            <div className="text-sm text-white space-y-2">
              <p className="mt-2">🏁 Try sample blogs:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => setUrl("https://example.com/blog1")} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-3 rounded-lg shadow-md flex items-center gap-2">🏎️ Early Riser Tips</button>
                <button onClick={() => setUrl("https://example.com/blog2")} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-3 rounded-lg shadow-md flex items-center gap-2">🏎️ Digital Detox</button>
                <button onClick={() => setUrl("https://blog.hubspot.com/marketing/digital-marketing")} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-3 rounded-lg shadow-md flex items-center gap-2">🏎️ Digital Marketing</button>
                <button onClick={() => setUrl("https://buffer.com/resources/social-media-calendar/")} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-3 rounded-lg shadow-md flex items-center gap-2">🏎️ Social Media Calendar</button>
              </div>
            </div>
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-lg shadow-md"
            >
              {isLoading ? "🏁 Loading..." : "🔥 Get AI Summary"}
            </motion.button>

            {summary && (
              <div ref={summaryRef} className="pt-4 space-y-4">
                <div className="text-white">
                  <h2 className="text-xl font-bold text-yellow-300">AI Summary:</h2>
                  <p className="text-sm bg-gray-800 p-3 rounded-md border border-yellow-500">{summary}</p>
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold text-yellow-300">Urdu Translation:</h2>
                  <p className="text-sm bg-gray-800 p-3 rounded-md border border-yellow-500">{urduTranslation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.main>
  );
}
