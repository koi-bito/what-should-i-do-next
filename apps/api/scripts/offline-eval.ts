import { config } from "dotenv";
import fs from "fs";
import path from "path";
import {
  buildUserPrompt,
  ruleBasedFallback,
  callClaude,
  type FullContext,
  type AiOutput,
} from "../src/modules/ai/ai-engine";

// Load environment variables (needs ANTHROPIC_API_KEY)
config({ path: path.join(__dirname, "../.env") });
config({ path: path.join(__dirname, "../../.env") }); // fallback

const MOCK_CONTEXTS: FullContext[] = [
  {
    userId: "user-1",
    localTime: "09:00",
    timezone: "America/New_York",
    minutesAvailable: 60,
    energyLevel: 5,
    goals: [
      { title: "Launch startup", priority: 1, targetDate: "2026-12-01" },
    ],
    tasks: [
      { id: "t1", title: "Write landing page copy", estimatedMinutes: 45, dueAt: null },
      { id: "t2", title: "Reply to investor email", estimatedMinutes: 10, dueAt: new Date(Date.now() + 3600000).toISOString() },
      { id: "t3", title: "Redesign logo", estimatedMinutes: 120, dueAt: null },
    ],
    recentActions: [],
  },
  {
    userId: "user-2",
    localTime: "15:30",
    timezone: "Europe/London",
    minutesAvailable: 15,
    energyLevel: 1, // exhausted
    mood: "brain fried",
    goals: [],
    tasks: [
      { id: "t4", title: "Write technical architecture doc", estimatedMinutes: 90, dueAt: null },
      { id: "t5", title: "Approve PR #42", estimatedMinutes: 10, dueAt: null },
      { id: "t6", title: "Pay electric bill", estimatedMinutes: 5, dueAt: new Date(Date.now() + 86400000).toISOString() },
    ],
    recentActions: [
      { title: "Debug memory leak", status: "completed" },
    ],
  },
];

async function runEval() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY is not set. Cannot run LLM evals.");
    process.exit(1);
  }

  console.log("🚀 Starting offline evaluation for", MOCK_CONTEXTS.length, "contexts...");
  
  let markdown = `# Offline AI Evaluation Results\n\n`;
  markdown += `*Generated at: ${new Date().toISOString()}*\n\n`;

  for (let i = 0; i < MOCK_CONTEXTS.length; i++) {
    const ctx = MOCK_CONTEXTS[i];
    console.log(`\nEvaluating Context ${i + 1}/${MOCK_CONTEXTS.length}...`);
    
    markdown += `## Context ${i + 1}\n\n`;
    markdown += `- **Time / Energy**: ${ctx.minutesAvailable}m available, Energy: ${ctx.energyLevel}/5\n`;
    markdown += `- **Tasks**: ${ctx.tasks.length} open tasks\n\n`;

    const userPrompt = buildUserPrompt(ctx, "v1");

    // 1. Rule-based
    const startRule = Date.now();
    const resRule = ruleBasedFallback(ctx);
    const timeRule = Date.now() - startRule;

    // 2. Haiku
    let resHaiku: AiOutput | null = null;
    let timeHaiku = 0;
    try {
      const startHaiku = Date.now();
      resHaiku = await callClaude(userPrompt, "claude-haiku-4-5");
      timeHaiku = Date.now() - startHaiku;
    } catch (e: any) {
      console.error("Haiku failed:", e.message);
    }

    // 3. Sonnet
    let resSonnet: AiOutput | null = null;
    let timeSonnet = 0;
    try {
      const startSonnet = Date.now();
      resSonnet = await callClaude(userPrompt, "claude-sonnet-4-5");
      timeSonnet = Date.now() - startSonnet;
    } catch (e: any) {
      console.error("Sonnet failed:", e.message);
    }

    // Format output
    markdown += `| Model | Suggested Action | Reasoning | Time (ms) |\n`;
    markdown += `|-------|------------------|-----------|-----------|\n`;
    
    markdown += `| **Rule-Based** | ${resRule.action_title} | ${resRule.reasoning} | ${timeRule}ms |\n`;
    
    if (resHaiku) {
      markdown += `| **Haiku 4.5** | ${resHaiku.action_title} | ${resHaiku.reasoning} | ${timeHaiku}ms |\n`;
    } else {
      markdown += `| **Haiku 4.5** | *Failed* | *Failed* | - |\n`;
    }

    if (resSonnet) {
      markdown += `| **Sonnet 4.5** | ${resSonnet.action_title} | ${resSonnet.reasoning} | ${timeSonnet}ms |\n`;
    } else {
      markdown += `| **Sonnet 4.5** | *Failed* | *Failed* | - |\n`;
    }

    markdown += `\n---\n\n`;
  }

  const outPath = path.join(__dirname, "eval-results.md");
  fs.writeFileSync(outPath, markdown);
  console.log(`\n✅ Evaluation complete! Results saved to ${outPath}`);
}

runEval().catch(console.error);
