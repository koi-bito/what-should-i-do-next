"use client";

import { useState } from "react";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/auth/supabase-browser";

const credentialsSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabaseBrowserClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        router.push("/onboarding");
      } else {
        const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/app");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id={`${mode}-form`}>
      <div>
        <label htmlFor={`${mode}-email`} className="block text-sm font-medium text-muted-foreground mb-2">
          Email address
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-base"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor={`${mode}-password`} className="block text-sm font-medium text-muted-foreground mb-2">
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-base"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        id={`${mode}-submit-btn`}
        className="btn-primary w-full py-3 text-sm"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {mode === "login" ? "Signing in..." : "Creating account..."}
          </span>
        ) : (
          mode === "login" ? "Sign in" : "Create account"
        )}
      </button>

      {mode === "login" ? (
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up free
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </form>
  );
}
