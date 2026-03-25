import { motion } from "framer-motion";

interface AuthToggleProps {
  mode: "login" | "signup";
  onToggle: (mode: "login" | "signup") => void;
  role: "farmer" | "customer";
}

const AuthToggle = ({ mode, onToggle, role }: AuthToggleProps) => {
  const activeColor = role === "farmer" ? "bg-primary" : "bg-accent";

  return (
    <div className="relative flex rounded-xl bg-muted p-1 mb-8">
      <motion.div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg ${activeColor}`}
        animate={{ x: mode === "login" ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => onToggle("login")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
          mode === "login" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onToggle("signup")}
        className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
          mode === "signup" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthToggle;
