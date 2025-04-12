"use client";

import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DefaultLayoutWrapper({ 
  children,
  hasEnvVars,
  authComponent
}: { 
  children: React.ReactNode;
  hasEnvVars: boolean;
  authComponent: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const logoContent = mounted ? (
    <>
      <Image
        src="/logo_with_text_black.png"
        alt="Stokesian Logo"
        width={200}
        height={45}
        className={`h-10 w-auto ${theme === 'dark' ? 'hidden' : 'block'}`}
        priority
      />
      <Image
        src="/logo_with_text_white.png"
        alt="Stokesian Logo"
        width={200}
        height={45}
        className={`h-10 w-auto ${theme === 'dark' ? 'block' : 'hidden'}`}
        priority
      />
    </>
  ) : null;

  return (
    <main className="min-h-screen flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 fixed top-0 bg-background/80 z-50">
        <div className="w-full flex justify-between items-center p-3 px-8 text-sm">
          <div className="flex gap-5 items-center">
            <Link href={"/"}>
              {logoContent}
            </Link>
          </div>
          {!hasEnvVars ? <EnvVarWarning /> : authComponent}
        </div>
      </nav>
      <div className="flex-1 w-full pt-16">
        {children}
      </div>
      <footer className="w-full flex items-center justify-center border-t border-border bg-background text-center text-xs gap-8 py-6">
        <p className="text-muted-foreground">
          Copyright © 2025 {" "}
          <a
            href="/"
            target="_blank"
            className="text-foreground hover:text-foreground/80 transition-colors"
            rel="noreferrer"
          >
            StokesFlow
          </a>
          . All rights reserved.
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
} 