export default function Logo() {
  return (
    <div className="flex items-center gap-5">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_50px_rgba(59,130,246,0.45)]">
        <span className="text-4xl">☁️</span>
      </div>

      <div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          LoveDrive
        </h1>

        <p className="mt-1 text-lg text-zinc-400">
          Private Cloud Storage
        </p>
      </div>
    </div>
  );
}