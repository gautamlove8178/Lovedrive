"use client";

import { useState } from "react";

interface LoginFormProps {
  onLogin: (
    email: string,
    password: string
  ) => Promise<void>;
}

export default function LoginForm({
  onLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      await onLogin(
        email,
        password
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* EMAIL */}

      <div className="mb-[1.2rem]">
        <label className="mb-2 ml-[5px] block text-[0.85rem] text-[#999]">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Enter email"
          autoComplete="email"
          className="
            w-full
            rounded-[15px]
            border
            border-transparent
            bg-white/[0.07]
            px-[18px]
            py-[14px]
            text-base
            text-white
            outline-none
            transition
            placeholder:text-[#777]
            focus:border-[#d4a373]
            focus:bg-white/[0.12]
          "
        />
      </div>

      {/* PASSWORD */}

      <div className="mb-[1.2rem]">
        <label className="mb-2 ml-[5px] block text-[0.85rem] text-[#999]">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="Enter Password"
          autoComplete="current-password"
          className="
            w-full
            rounded-[15px]
            border
            border-transparent
            bg-white/[0.07]
            px-[18px]
            py-[14px]
            text-base
            text-white
            outline-none
            transition
            placeholder:text-[#777]
            focus:border-[#d4a373]
            focus:bg-white/[0.12]
          "
        />
      </div>

      {/* BUTTON */}

      <button
        type="submit"
        disabled={loading}
        className="
          mt-[10px]
          w-full
          rounded-[15px]
          border-none
          px-[15px]
          py-[15px]
          text-base
          font-semibold
          text-[#121417]
          cursor-pointer
          transition
          hover:scale-[1.02]
          disabled:cursor-wait
          disabled:opacity-60
        "
        style={{
          background:
            "linear-gradient(135deg,#bf953f,#fcf6ba,#b38728,#fcf6ba,#aa771c)",
        }}
      >
        {loading
          ? "Signing In..."
          : "Sign In"}
      </button>
    </form>
  );
}