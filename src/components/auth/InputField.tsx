import type { HTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  role: "farmer" | "customer";
  error?: string;
  maxLength?: number;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  autoComplete?: string;
  showPasswordToggle?: boolean;
}

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  role,
  error,
  maxLength,
  inputMode,
  pattern,
  autoComplete,
  showPasswordToggle = false,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === "password";
  const resolvedInputType = isPasswordInput && showPassword ? "text" : type;
  const focusRing = role === "farmer"
    ? "focus-within:ring-primary/40 focus-within:border-primary"
    : "focus-within:ring-accent/40 focus-within:border-accent";

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div
        className={`flex items-center rounded-xl bg-muted/60 border border-border px-3.5 transition-all ring-2 ring-transparent ${focusRing}`}
      >
        <input
          type={resolvedInputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          inputMode={inputMode}
          pattern={pattern}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {isPasswordInput && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground transition-colors ml-2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default InputField;
