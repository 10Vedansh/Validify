import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthRow, PasswordInput, SubmitButton, Field } from "@/components/auth/AuthPrimitives";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const { register: signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await signup(values);
      toast.success("Account created");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Couldn't create your account");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start validating startup ideas in minutes."
      variant="register"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="relative text-white/60 hover:text-white transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/60 after:transition-all after:duration-300 hover:after:w-full"
          >
            Log in
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
              OR SIGN UP WITH EMAIL
            </span>
          </div>
        </motion.div>

        <Field label="Full name" error={errors.name?.message}>
          <Input
            autoComplete="name"
            placeholder="Ada Lovelace"
            {...register("name")}
            className={cn(
              "h-10 bg-white/[0.03] border border-white/[0.08]",
              "placeholder:text-white/25",
              "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20",
              "transition-all duration-300",
            )}
          />
        </Field>
        <Field label="Work email" error={errors.email?.message}>
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
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" {...register("password")} />
        </Field>
        <SubmitButton loading={isSubmitting}>Create account</SubmitButton>

        <motion.p
          className="text-center text-xs text-white/25 leading-relaxed"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.35, delay: 0.15 } },
          }}
        >
          By signing up you agree to our Terms and Privacy.
        </motion.p>
      </form>
    </AuthLayout>
  );
}
