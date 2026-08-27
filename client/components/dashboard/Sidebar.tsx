"use client";

import {
  Folder,
  Upload,
  Users,
  Star,
  Trash2,
  Settings,
  LayoutDashboard,
  Cloud,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

const menu = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    path: "/",
  },
  {
    icon: Folder,
    title: "My Files",
    path: "/my-files",
  },
  {
    icon: Upload,
    title: "Upload",
    path: "#upload",
  },
  {
    icon: Users,
    title: "Shared",
    path: "/shared",
  },
  {
    icon: Star,
    title: "Favorites",
    path: "/favorites",
  },
  {
    icon: Trash2,
    title: "Trash",
    path: "/trash",
  },
  {
    icon: Settings,
    title: "Settings",
    path: "/settings",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (
    path: string
  ) => {
    if (path === "#upload") {
      if (pathname !== "/") {
        router.push("/#upload");
        return;
      }

      setTimeout(() => {
        document
          .getElementById("upload-zone")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);

      return;
    }

    router.push(path);
  };

  return (
    <aside className="group sticky top-0 z-50 flex h-screen w-[76px] shrink-0 flex-col overflow-hidden border-r border-white/5 bg-[#0d1528] px-3 py-5 transition-[width] duration-300 ease-in-out hover:w-64">

      {/* ===============================
          LOGO
      =============================== */}

      <div className="mb-8 flex h-12 items-center">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
          <Cloud className="h-6 w-6" />
        </div>

        <div className="ml-3 min-w-0 translate-x-[-8px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">

          <h1 className="whitespace-nowrap text-xl font-bold text-white">
            LoveDrive
          </h1>

          <p className="whitespace-nowrap text-xs text-zinc-500">
            Private Cloud
          </p>

        </div>

      </div>

      {/* ===============================
          NAVIGATION
      =============================== */}

      <nav className="space-y-2">

        {menu.map((item) => {

          const Icon = item.icon;

          const active =
            mounted &&
            item.path !== "#upload" &&
            (
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(
                    item.path
                  )
            );

          const buttonClass = active
            ? "flex h-12 w-full items-center gap-4 overflow-hidden rounded-xl px-3 transition-all duration-200 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            : "flex h-12 w-full items-center gap-4 overflow-hidden rounded-xl px-3 transition-all duration-200 text-zinc-400 hover:bg-white/5 hover:text-white";

          const iconClass = active
            ? "h-6 w-6 shrink-0 transition-transform duration-200 scale-105"
            : "h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-105";

          return (
            <button
              key={item.title}
              type="button"
              onClick={() =>
                handleNavigation(
                  item.path
                )
              }
              title={item.title}
              className={buttonClass}
            >

              {/* ICON */}

              <Icon
                className={iconClass}
              />

              {/* TEXT */}

              <span className="whitespace-nowrap translate-x-[-8px] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                {item.title}
              </span>

            </button>
          );
        })}

      </nav>

      {/* ===============================
          BOTTOM
      =============================== */}

      <div className="mt-auto overflow-hidden border-t border-white/5 pt-4">

        <p className="whitespace-nowrap px-3 text-xs text-zinc-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          LoveDrive Private Cloud
        </p>

      </div>

    </aside>
  );
}