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
      title="Pick up where you left off"
      subtitle="Continue building your startup with AI-powered validation."
      variant="login"
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="relative text-muted-foreground/60 hover:text-foreground transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-foreground/60 after:transition-all after:duration-300 hover:after:w-full"
          >
            Create account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <OAuthRow />

        <motion.div
          className="relative"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground/40 tracking-wider">
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
          />
        </Field>
        <Field
          label="Password"
          error={errors.password?.message}
          hint={
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-200"
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
