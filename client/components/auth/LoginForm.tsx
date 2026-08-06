"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "123456") {
      onLogin();
      return;
    }

    alert("Invalid Username or Password");
  };

  return (
    <div className="mt-8 space-y-5">
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Username
        </label>

        <div className="relative">
          <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="pl-12"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Password
        </label>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />

          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            className="pl-12 pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button onClick={handleLogin}>
        Secure Login
      </Button>
    </div>
  );
}