"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

export function BookDemo() {
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Replace this URL with your actual Calendly scheduling link
    const calendlyURL = `https://calendly.com/stokesian/demo?email=${encodeURIComponent(email)}`;
    window.location.href = calendlyURL;
  };

  // Prevent hydration errors by not rendering theme-dependent content until mounted
  const logoContent = mounted ? (
    <>
      <Image
        src="/logo_black.png"
        alt="Logo"
        width={400}
        height={400}
        className={`object-contain opacity-90 transition-opacity duration-200 group-hover:opacity-100 ${
          theme === 'dark' ? 'hidden' : 'block'
        }`}
        priority
      />
      <Image
        src="/logo_white.png"
        alt="Logo"
        width={400}
        height={400}
        className={`object-contain opacity-90 transition-opacity duration-200 group-hover:opacity-100 ${
          theme === 'dark' ? 'block' : 'hidden'
        }`}
        priority
      />
    </>
  ) : null;

  return (
    <section id="book-demo" className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-background">
      <div className="container relative z-10 max-w-5xl mx-auto px-4 animate-in fade-in-50 duration-500">
        <div 
          className="relative p-6 md:p-12 lg:p-16 backdrop-blur-sm"
          style={{
            background: `
              linear-gradient(180deg, 
                hsl(var(--background)) 0%,
                hsl(var(--card)) 15%,
                hsl(var(--card) / 98%) 100%
              )
            `,
            borderImage: `
              linear-gradient(to bottom, 
                hsl(var(--background) / 85%) 0%,
                hsl(var(--foreground) / 5%) 35%,
                hsl(var(--foreground) / 25%) 100%
              ) 1
            `,
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: `
              0 20px 80px -20px hsl(var(--foreground) / 15%)
            `
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent opacity-75" />
          
          <div className="relative flex justify-between items-center gap-12">
            <div className="flex-1 space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground/95 to-foreground/75">
                  Book a Demo
                </h2>
                
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Get beta access now, secure extended free trial on release
                </p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="relative flex items-center bg-muted/50 border-2 border-border 
                  hover:bg-muted/80 hover:border-primary/20 transition-all duration-200 group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-6 py-3 text-lg bg-transparent text-foreground 
                      placeholder:text-muted-foreground focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 mx-1 text-lg font-medium text-primary-foreground 
                      bg-primary hover:bg-primary/90 hover:shadow-xl 
                      transition-all duration-200 shadow-lg shadow-primary/20"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>

            <div className="hidden lg:block relative w-96 h-96 group">
              {logoContent}
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 