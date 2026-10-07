import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Should I Do Next? — Stop Deciding. Start Doing.",
  description:
    "A decision engine for people who are stuck, not lazy. Tell us your energy and your time — get one clear next step, every time.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <span className="font-semibold text-foreground">WhatNext?</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI-powered decision engine
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
            What should you{" "}
            <span className="text-gradient">do next?</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            You're stuck, not lazy. Tell us your energy and your time — get{" "}
            <strong className="text-foreground">one clear next step</strong>, every time.
            No lists. No schedules. Just one answer.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="btn-primary px-8 py-3.5 text-base shadow-glow-primary">
              Get unstuck free →
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3.5 text-base">
              Sign in
            </Link>
          </div>

          {/* Demo card */}
          <div className="max-w-md mx-auto card shadow-card-primary p-6 text-left animate-glow">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-warning/60" />
                <span className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground font-mono ml-2">whatnext.app</span>
            </div>

            <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
              <span className="badge-primary">⚡ Energy: 3/5</span>
              <span className="badge-primary">⏱ 30 min free</span>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Send the client proposal
              </h3>
              <p className="text-sm text-muted-foreground">
                It's been sitting for 2 days, fits your time window perfectly, and completing it
                will unblock everything else this week.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 text-sm py-2 rounded-lg bg-success/10 text-success border border-success/20 font-medium hover:bg-success/20 transition-colors">
                ✓ Do it
              </button>
              <button className="flex-1 text-sm py-2 rounded-lg bg-surface-hover text-muted-foreground border border-border font-medium hover:text-foreground transition-colors">
                ✗ Not now
              </button>
              <button className="flex-1 text-sm py-2 rounded-lg bg-surface-hover text-muted-foreground border border-border font-medium hover:text-foreground transition-colors">
                ⏸ Later
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                The problem isn't laziness.
                <br />
                <span className="text-gradient">It's the cost of choosing.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                You open your to-do list, see 40 items, and close your laptop having done nothing —
                not because you're lazy, but because deciding what to do costs more energy than
                any individual task.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We remove the choice. One question, one answer, every time.
              </p>
            </div>

            {/* Before/After */}
            <div className="space-y-4">
              <div className="card p-5 opacity-60">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Before — your to-do list</p>
                <div className="space-y-2">
                  {[
                    "Reply to Sarah's email",
                    "Finish quarterly report",
                    "Schedule dentist",
                    "Review PRs",
                    "Call investor",
                    "Update documentation",
                    "Pay bills",
                    "+ 33 more items...",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground/60">
                      <div className="w-3.5 h-3.5 rounded border border-border flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-muted-foreground text-2xl">↓</div>

              <div className="card p-5 border-primary/30 bg-primary/5 shadow-glow-primary">
                <p className="text-xs font-medium text-primary mb-3 uppercase tracking-wider">After — WhatNext?</p>
                <p className="text-lg font-semibold text-foreground">Reply to Sarah's email</p>
                <p className="text-sm text-muted-foreground mt-1">She's waiting on your decision to unblock her whole week.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground mb-16 max-w-xl mx-auto">
            Three steps. Zero overthinking.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Tell us where you're at",
                desc: "Energy level, time available, optional mood check. Takes 5 seconds.",
                icon: "⚡",
              },
              {
                step: "2",
                title: "Get one answer, not ten",
                desc: "We look at your goals, tasks, calendar, and history. Then we give you exactly one thing to do.",
                icon: "🎯",
              },
              {
                step: "3",
                title: "Do it, then ask again",
                desc: "Accept, reject, or snooze. Each response makes the next suggestion smarter.",
                icon: "🔄",
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 hover:border-primary/30 transition-colors group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mb-4 mx-auto group-hover:bg-primary group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing teaser */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Stop deciding. Start doing.
          </h2>
          <p className="text-muted-foreground mb-12">No credit card required to start.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="card p-6 text-left">
              <p className="text-sm font-semibold text-muted-foreground mb-1">Free</p>
              <p className="text-3xl font-bold text-foreground mb-1">$0</p>
              <p className="text-sm text-muted-foreground mb-6">5 questions/day, forever</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2">✓ Manual context input</li>
                <li className="flex gap-2">✓ Full query history</li>
                <li className="flex gap-2">✓ Accept / reject / snooze</li>
              </ul>
              <Link href="/signup" className="btn-secondary w-full text-center block py-2.5 text-sm">
                Get started
              </Link>
            </div>

            <div className="card p-6 text-left border-primary/40 bg-primary/5 shadow-glow-primary relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-primary text-xs">Most popular</span>
              <p className="text-sm font-semibold text-primary mb-1">Pro</p>
              <p className="text-3xl font-bold text-foreground mb-1">$8<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-sm text-muted-foreground mb-6">For when stuck happens more than 5x/day</p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex gap-2">✓ Unlimited queries</li>
                <li className="flex gap-2">✓ Priority support</li>
              </ul>
              <Link href="/signup" className="btn-primary w-full text-center block py-2.5 text-sm">
                Upgrade to Pro
              </Link>
            </div>
          </div>

          <Link href="/pricing" className="inline-block mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
            See full pricing →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-border text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to stop the scroll?
          </h2>
          <p className="text-muted-foreground mb-8">
            No credit card. 5 free questions a day, forever.
          </p>
          <Link href="/signup" className="btn-primary px-10 py-4 text-base inline-block shadow-glow-primary">
            Get unstuck — it's free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
              W
            </div>
            WhatNext? — Stop deciding. Start doing.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
