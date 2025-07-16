// src/app/layout.tsx
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata = {
  title: "Nexium Summarizer",
  description: "Summarize any blog with AI + Urdu translation",
  keywords: ["AI", "Urdu", "Blog", "Summarizer", "Supabase", "MongoDB"],
  authors: [{ name: "Jamal Nadeem" }],
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
