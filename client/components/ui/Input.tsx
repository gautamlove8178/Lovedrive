import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3",
        "text-white placeholder:text-zinc-500",
        "outline-none transition-all",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40",
        className
      )}
    />
  );
}