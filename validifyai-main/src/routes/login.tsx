import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthRow, PasswordInput, SubmitButton, Field } from "@/components/auth/AuthPrimitives";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      toast.success("Welcome back");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Login failed");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue building investor-ready startups."
      variant="login"
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="relative text-white/60 hover:text-white transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/60 after:transition-all after:duration-300 hover:after:w-full"
          >
            Create account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <OAuthRow />

        {/* Divider */}
        <motion.div
          className="relative my-4"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-white/30 tracking-wider">
              OR CONTINUE WITH EMAIL
            </span>
          </div>
        </motion.div>

        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@startup.com"
            {...register("email")}
            className={cn(
              "h-10 bg-white/[0.03] border border-white/[0.08]",
              "placeholder:text-white/25",
              "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
              "transition-all duration-300",
            )}
          />
        </Field>
        <Field
          label="Password"
          error={errors.password?.message}
          hint={
            <Link
              to="/forgot-password"
              className="relative text-xs text-white/30 hover:text-white/50 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/50 after:transition-all after:duration-300 hover:after:w-full"
            >
              Forgot?
            </Link>
          }
        >
          <PasswordInput autoComplete="current-password" {...register("password")} />
        </Field>
        <SubmitButton loading={isSubmitting} showArrow>
          Sign In
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
