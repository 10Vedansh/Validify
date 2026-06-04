import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OAuthRow, PasswordInput, SubmitButton, Field } from "@/components/auth/AuthPrimitives";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";

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
      subtitle="Start validating in under 60 seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <OAuthRow />
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">or with email</span>
          </div>
        </div>
        <Field label="Full name" error={errors.name?.message}>
          <Input autoComplete="name" placeholder="Ada Lovelace" {...register("name")} />
        </Field>
        <Field label="Work email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@startup.com"
            {...register("email")}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <PasswordInput autoComplete="new-password" {...register("password")} />
        </Field>
        <SubmitButton loading={isSubmitting}>Create account</SubmitButton>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our Terms and Privacy.
        </p>
      </form>
    </AuthLayout>
  );
}
