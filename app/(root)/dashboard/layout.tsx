"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col gap-8 p-8">
        {children}
      </div>
    </div>
  );
}
