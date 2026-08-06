import Logo from "@/components/common/Logo";
import LoginForm from "./LoginForm";

interface Props {
  onLogin: () => void;
}

export default function LoginCard({ onLogin }: Props) {
  return (
    <div
      className="
      w-full
      max-w-xl
      rounded-[32px]
      border
      border-white/10
      bg-white/5
      p-10
      backdrop-blur-3xl
      shadow-[0_0_80px_rgba(37,99,235,0.18)]
    "
    >
      <Logo />

      <div className="mt-8">
        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
}