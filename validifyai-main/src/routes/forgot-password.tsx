import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SubmitButton, Field } from "@/components/auth/AuthPrimitives";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/schemas";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authService.requestPasswordReset(values.email);
      toast.success("Check your inbox for the reset link.");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Something went wrong");
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll email you a secure reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="text-foreground hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@startup.com"
            {...register("email")}
          />
        </Field>
        <SubmitButton loading={isSubmitting}>Send reset link</SubmitButton>
      </form>
    </AuthLayout>
  );
}
