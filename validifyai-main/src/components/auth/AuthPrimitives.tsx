import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Github, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { itemVariants, ease } from "@/lib/motion";

export function OAuthRow() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.04 },
        },
      }}
    >
      <motion.div variants={itemVariants}>
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full font-normal text-sm"
        >
          <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.96h5.35c-.23 1.5-1.6 4.4-5.35 4.4-3.22 0-5.84-2.66-5.84-5.96s2.62-5.96 5.84-5.96c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.7 3.92 14.6 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.66 8.65-8.8 0-.6-.06-1.04-.13-1.1z"
            />
          </svg>
          Google
        </Button>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full font-normal text-sm"
        >
          <Github className="mr-2 h-4 w-4 shrink-0" />
          GitHub
        </Button>
      </motion.div>
    </motion.div>
  );
}

type PasswordInputProps = React.ComponentProps<typeof Input>;
export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? "text" : "password"}
        placeholder={props.placeholder ?? "••••••••"}
        className={cn("pr-11", props.className)}
      />
      <button
        type="button"
        aria-label="toggle password"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-200"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

type SubmitButtonProps = {
  loading?: boolean;
  children: ReactNode;
  showArrow?: boolean;
  className?: string;
  disabled?: boolean;
};
export function SubmitButton({
  loading,
  children,
  showArrow,
  className,
  disabled,
}: SubmitButtonProps) {
  return (
    <motion.div variants={itemVariants}>
      <motion.button
        type="submit"
        disabled={loading || disabled}
        className={cn(
          "group relative h-11 w-full rounded-xl font-medium text-sm text-white",
          "bg-gradient-to-b from-primary to-primary/80",
          "shadow-[0_0_24px_-4px_oklch(0.65_0.22_280/0.25)]",
          "hover:shadow-[0_0_32px_-4px_oklch(0.65_0.22_280/0.45)]",
          "hover:-translate-y-0.5",
          "active:translate-y-0 active:scale-[0.98]",
          "transition-all duration-300 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_24px_-4px_oklch(0.65_0.22_280/0.25)]",
          "overflow-hidden",
          className,
        )}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Please wait</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {children}
            {showArrow && (
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            )}
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
}) {
  return (
    <motion.div
      className="space-y-1.5"
      variants={itemVariants}
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground/70 font-normal">{label}</Label>
        {hint}
      </div>
      {children}
      {error && <p className="text-xs text-destructive/80">{error}</p>}
    </motion.div>
  );
}
