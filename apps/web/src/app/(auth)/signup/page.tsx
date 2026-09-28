import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your free What Should I Do Next? account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <span className="font-semibold text-foreground">WhatNext?</span>
        </Link>

        <div className="card p-8 animate-fade-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-2">Get unstuck</h1>
          <p className="text-sm text-muted-foreground mb-8">
            5 free questions per day. No credit card required.
          </p>

          <OAuthButtons />
          <div className="mt-6">
            <AuthForm mode="signup" />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <Link href="#" className="underline hover:text-foreground">Terms</Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
