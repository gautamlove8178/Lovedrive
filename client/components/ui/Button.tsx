import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({
  children,
  className,
  loading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(
        "w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold transition-all duration-300",
        "hover:bg-blue-700 active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}