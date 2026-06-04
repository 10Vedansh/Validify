import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthRow, PasswordInput, SubmitButton, Field } from "@/components/auth/AuthPrimitives";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
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
      subtitle="Log in to continue validating ideas."
      footer={<>New here? <Link to="/register" className="text-foreground hover:underline">Create an account</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <OAuthRow />
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or with email</span></div>
        </div>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@startup.com" {...register("email")} />
        </Field>
        <Field
          label="Password"
          error={errors.password?.message}
          hint={<Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>}
        >
          <PasswordInput autoComplete="current-password" {...register("password")} />
        </Field>
        <SubmitButton loading={isSubmitting}>Log in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
