import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-[#0B1120] text-white">
      {children}
    </main>
  );
}