import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import AuthToggle from "./AuthToggle";
import InputField from "./InputField";
import AuthLayout from "./AuthLayout";

interface AuthFormProps {
  role: "farmer" | "customer";
  initialMode?: "login" | "signup";
}

const authFormSchema = z
  .object({
    mode: z.enum(["login", "signup"]),
    username: z.string().optional(),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    password: z.string().min(1, "Password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "signup") {
      if (!data.username || !data.username.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username is required",
          path: ["username"],
        });
      }

      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 8 characters",
          path: ["password"],
        });
      }
    }
  });

type AuthFormValues = z.infer<typeof authFormSchema>;

const AuthForm = ({ role, initialMode = "login" }: AuthFormProps) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      mode: initialMode,
      username: "",
      phone: "",
      password: "",
    },
  });

  const isFarmer = role === "farmer";

  useEffect(() => {
    setMode(initialMode);
    setValue("mode", initialMode);
    clearErrors();
  }, [initialMode, setValue, clearErrors]);

  const authMutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      if (values.mode === "login") {
        return login({
          phone: values.phone,
          password: values.password,
          role,
        });
      }

      return signup({
        username: values.username,
        phone: values.phone,
        password: values.password,
        role,
      });
    },
    onSuccess: (session) => {
      const userRole = session.role ?? role;
      const homePath = userRole === "farmer" ? ROUTES.farmer.home : ROUTES.customer.home;

      navigate(homePath, { replace: true });
      toast.success(mode === "login" ? "Welcome back" : "Account created successfully");
    },
    onError: (error: Error) => {
      const fallback = mode === "login" ? "Unable to log in. Please check your details." : "Unable to create account. Please try again.";
      const message =
        error instanceof Error && typeof error.message === "string" && error.message.trim().length > 0
          ? error.message
          : fallback;
      toast.error(message);
    },
  });

  const onSubmit = (values: AuthFormValues) => {
    authMutation.mutate(values);
  };

  const onToggleMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    setValue("mode", nextMode, { shouldValidate: true });
    clearErrors();
  };

  return (
    <AuthLayout role={role} mode={mode}>
      <h1 className="font-display font-bold text-2xl text-foreground mb-1">
        {mode === "login" ? "Sign in to your account" : "Create your account"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {isFarmer
          ? "Access your farmer dashboard"
          : "Start shopping fresh produce"}
      </p>

      <AuthToggle mode={mode} onToggle={onToggleMode} role={role} />

      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          initial={{ opacity: 0, x: mode === "login" ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === "login" ? 12 : -12 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {mode === "signup" && (
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Full Name"
                  placeholder="Enter full name"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  role={role}
                  autoComplete="name"
                  error={errors.username?.message}
                />
              )}
            />
          )}
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <InputField
                label="Phone Number"
                type="tel"
                  placeholder="Enter 10-digit phone number"
                value={field.value}
                onChange={(value) => field.onChange(value.replace(/\D/g, "").slice(0, 10))}
                role={role}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]{10}"
                autoComplete="tel"
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <InputField
                label="Password"
                type="password"
                  placeholder="Enter password"
                value={field.value}
                onChange={field.onChange}
                role={role}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                showPasswordToggle
                error={errors.password?.message}
              />
            )}
          />

          {mode === "login" && (
            <div className="flex justify-end">
              <button
                type="button"
                className={`text-xs font-medium ${
                  isFarmer ? "text-primary" : "text-accent"
                } hover:underline`}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={authMutation.isPending}
            className={`w-full rounded-xl h-12 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isFarmer
                ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                : "bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
            }`}
          >
            {authMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </motion.form>
      </AnimatePresence>
    </AuthLayout>
  );
};

export default AuthForm;
