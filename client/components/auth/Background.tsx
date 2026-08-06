export default function Background() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,transparent_40%)] opacity-40" />

      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
    </>
  );
}