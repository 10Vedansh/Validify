import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function OAuthRow() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-2"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.04 },
        },
      }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Button
          variant="outline"
          type="button"
          size="sm"
          className="h-9 w-full font-normal transition-all duration-200 hover:border-muted-foreground/30 hover:bg-muted/20 active:scale-[0.98]"
        >
          <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.96h5.35c-.23 1.5-1.6 4.4-5.35 4.4-3.22 0-5.84-2.66-5.84-5.96s2.62-5.96 5.84-5.96c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.7 3.92 14.6 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.66 8.65-8.8 0-.6-.06-1.04-.13-1.1z"
            />
          </svg>
          Google
        </Button>
      </motion.div>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 8 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
        }}
      >
        <Button
          variant="outline"
          type="button"
          size="sm"
          className="h-9 w-full font-normal transition-all duration-200 hover:border-muted-foreground/30 hover:bg-muted/20 active:scale-[0.98]"
        >
          <Github className="mr-2 h-3.5 w-3.5" /> GitHub
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
      />
      <button
        type="button"
        aria-label="toggle password"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};
export function SubmitButton({ loading, children, className, ...rest }: SubmitButtonProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      <Button
        type="submit"
        disabled={loading || rest.disabled}
        className={cn("h-10 w-full transition-all duration-200 active:scale-[0.98]", className)}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </>
        ) : (
          children
        )}
      </Button>
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
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {hint}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </motion.div>
  );
}
