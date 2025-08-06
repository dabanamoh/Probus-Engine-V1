import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "Probus Engine - Advanced Threat Detection",
  description: "AI-powered threat detection system for monitoring communications and identifying security risks across multiple languages and platforms.",
  keywords: ["Probus Engine", "Threat Detection", "AI Security", "Communication Analysis", "Multi-language", "Email Monitoring", "Chat Analysis"],
  authors: [{ name: "Probus Team" }],
  openGraph: {
    title: "Probus Engine",
    description: "AI-powered threat detection and communication analysis system",
    url: "https://probus-engine.com",
    siteName: "Probus Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Probus Engine",
    description: "AI-powered threat detection and communication analysis system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
