"use client";

import {
  Folder,
  Upload,
  Users,
  Star,
  Trash2,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const menu = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    active: true,
  },
  {
    icon: Folder,
    title: "My Files",
  },
  {
    icon: Upload,
    title: "Upload",
  },
  {
    icon: Users,
    title: "Shared",
  },
  {
    icon: Star,
    title: "Favorites",
  },
  {
    icon: Trash2,
    title: "Trash",
  },
  {
    icon: Settings,
    title: "Settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 border-r border-white/10 bg-[#0D1528] p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          ☁ LoveDrive
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Private Cloud Storage
        </p>
      </div>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                item.active
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}