import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#0D1528] px-8 py-5">
      <div className="relative w-96">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          size={20}
        />

        <input
          type="text"
          placeholder="Search files..."
          className="w-full rounded-xl border border-white/10 bg-[#111C34] py-3 pl-12 pr-4 text-white outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        <Bell className="cursor-pointer text-zinc-400 hover:text-white" />

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold">
            LG
          </div>

          <div>
            <p className="font-semibold">Love Gautam</p>
            <p className="text-sm text-zinc-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}