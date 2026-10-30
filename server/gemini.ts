import { GoogleGenAI } from "@google/genai";
import { FinancialAuditResult, BudgetConfig, Transaction, SavingsGoal } from "../src/types.js";

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Deterministic rule-based financial analysis engine.
 * Serves as a resilient fallback if GEMINI_API_KEY is not configured or rate limits are reached.
 */
export function generateFallbackAnalysis(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  savingsGoals: SavingsGoal[],
  currencySymbol: string = "$"
): FinancialAuditResult {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Filter or aggregate transactions
  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpending: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalIncome += tx.amount;
    } else if (tx.type === "expense") {
      totalExpense += tx.amount;
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRatePercent = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Top expense category
  let topExpenseCategory = "None";
  let topExpenseAmount = 0;
  for (const [cat, amt] of Object.entries(categorySpending)) {
    if (amt > topExpenseAmount) {
      topExpenseAmount = amt;
      topExpenseCategory = cat;
    }
  }
  const topExpensePercentOfIncome =
    totalIncome > 0 ? Math.round((topExpenseAmount / totalIncome) * 100) : 0;

  // Calculate overspending alerts
  const overspendingAlerts: FinancialAuditResult["overspendingAlerts"] = [];
  const recommendedBudgetAdjustments: FinancialAuditResult["recommendedBudgetAdjustments"] = [];

  for (const [cat, limit] of Object.entries(budgetConfig.categoryLimits || {})) {
    const spent = categorySpending[cat] || 0;
    if (limit > 0 && spent > 0) {
      const ratio = spent / limit;
      if (ratio >= 1.0) {
        overspendingAlerts.push({
          category: cat,
          spent,
          limit,
          excess: spent - limit,
          severity: ratio >= 1.25 ? "Critical" : "High",
        });
        recommendedBudgetAdjustments.push({
          category: cat,
          currentLimit: limit,
          suggestedLimit: Math.round(spent * 1.1),
          reason: `Historical burn rate exceeded cap by ${currencySymbol}${Math.round(spent - limit)}. Reallocate discretionary surplus or trim by 15%.`,
        });
      } else if (ratio >= 0.85) {
        overspendingAlerts.push({
          category: cat,
          spent,
          limit,
          excess: 0,
          severity: "Moderate",
        });
      }
    }
  }

  // Health Score Calculation (0-100)
  // Factors:
  // 1. Savings Rate (up to 40 pts)
  // 2. Budget adherence (up to 30 pts)
  // 3. Diversified spending / top category ratio (up to 15 pts)
  // 4. Savings goals progress (up to 15 pts)
  let score = 50;

  if (totalIncome > 0) {
    if (savingsRatePercent >= 30) score += 25;
    else if (savingsRatePercent >= 20) score += 18;
    else if (savingsRatePercent >= 10) score += 10;
    else if (savingsRatePercent >= 0) score += 2;
    else score -= 20; // Deficit spending
  }

  // Budget adherence
  if (budgetConfig.monthlyOverallCap > 0) {
    const capRatio = totalExpense / budgetConfig.monthlyOverallCap;
    if (capRatio <= 0.8) score += 15;
    else if (capRatio <= 1.0) score += 8;
    else score -= 15;
  }

  // Overspending penalties
  score -= overspendingAlerts.length * 5;

  // Savings goals progress bonus
  const totalGoalTarget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalGoalCurrent = savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
  if (totalGoalTarget > 0 && totalGoalCurrent / totalGoalTarget >= 0.25) {
    score += 10;
  }

  // Clamp score between 10 and 98
  score = Math.max(12, Math.min(96, Math.round(score)));

  let letterGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
  if (score >= 88) letterGrade = 'A';
  else if (score >= 75) letterGrade = 'B';
  else if (score >= 60) letterGrade = 'C';
  else if (score >= 45) letterGrade = 'D';
  else letterGrade = 'F';

  // Emergency Fund Roadmap
  // Target: 6 months of baseline expenses
  const monthlyExpense = totalExpense > 0 ? totalExpense : 1000;
  const recommendedEmergencyFund = monthlyExpense * 6;
  const emergencyGoal = savingsGoals.find(
    (g) => g.goal_name.toLowerCase().includes("emergency") || g.goal_name.toLowerCase().includes("safety")
  );
  const currentEmergencySavings = emergencyGoal
    ? emergencyGoal.current_amount
    : Math.max(0, Math.round(netSavings * 0.5));
  const monthsCovered = Number((currentEmergencySavings / (monthlyExpense || 1)).toFixed(1));
  const remainingEmergencyFund = Math.max(0, recommendedEmergencyFund - currentEmergencySavings);
  const targetMonthsToFull = netSavings > 0 ? Math.ceil(remainingEmergencyFund / (netSavings * 0.4)) : 24;
  const monthlySavingsTarget = Math.round(remainingEmergencyFund / (targetMonthsToFull || 12));

  // Summary
  let summary = "";
  if (savingsRatePercent >= 20 && overspendingAlerts.length === 0) {
    summary = `Healthy cash flow with a robust ${savingsRatePercent}% savings rate. Budgeting disciplines are firmly intact with zero critical overspend breaches.`;
  } else if (netSavings < 0) {
    summary = `Cash flow is currently in a deficit of ${currencySymbol}${Math.abs(netSavings)}. Discretionary spending in ${topExpenseCategory} warrants immediate restructuring.`;
  } else {
    summary = `Cash flow remains positive with ${currencySymbol}${netSavings} saved. Focus on addressing ${overspendingAlerts.length} elevated categories to fortify your emergency reserves.`;
  }

  // 4-step action plan
  const actionPlan = [
    {
      step: 1,
      title: "Consolidate Discretionary Outflows",
      description: `Audit recurring subscriptions and dining expenses in '${topExpenseCategory}'. Aim to recover at least ${currencySymbol}${Math.round(totalExpense * 0.08)} per month.`,
      impact: "High Cash-Flow Recovery",
    },
    {
      step: 2,
      title: "Automate Emergency Contributions",
      description: `Establish a recurring transfer of ${currencySymbol}${monthlySavingsTarget} on the 1st of each month directly to your liquid safety reserve.`,
      impact: "Builds 6-Month Liquidity Moat",
    },
    {
      step: 3,
      title: "Synchronize Category Envelopes",
      description: `Enforce a strict cap on ${overspendingAlerts.length > 0 ? overspendingAlerts[0].category : "Housing & Utilities"} to prevent end-of-month budget creep.`,
      impact: "Prevents Hidden Capital Leaks",
    },
    {
      step: 4,
      title: "Accelerate Top Savings Goal",
      description: savingsGoals.length > 0
        ? `Allocate 30% of any unexpected income or bonuses toward '${savingsGoals[0].goal_name}' to beat the ${savingsGoals[0].deadline} deadline.`
        : "Define a high-priority savings goal for upcoming major milestones to keep savings goal-oriented.",
      impact: "Compound Growth & Goal Completion",
    },
  ];

  return {
    healthScore: score,
    letterGrade,
    summary,
    overspendingAlerts,
    recommendedBudgetAdjustments,
    emergencyFundRoadmap: {
      currentEmergencySavings,
      recommendedEmergencyFund,
      monthsCovered,
      monthlySavingsTarget,
      targetMonthsToFull: Math.min(60, targetMonthsToFull),
      recommendation: monthsCovered < 3
        ? "Priority #1: Expand liquid cushion to at least 3 full months before aggressive market investments."
        : "Stable emergency coverage. Maintain scheduled deposits and direct surplus to wealth building.",
    },
    actionPlan,
    keyMetrics: {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRatePercent,
      topExpenseCategory,
      topExpensePercentOfIncome,
    },
    generatedAt: new Date().toISOString(),
    source: "heuristic",
  };
}

/**
 * AI-powered Financial Health Audit using Gemini 2.5 Flash
 */
export async function performGeminiHealthAudit(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  savingsGoals: SavingsGoal[],
  currencySymbol: string = "$"
): Promise<FinancialAuditResult> {
  const fallback = generateFallbackAnalysis(transactions, budgetConfig, savingsGoals, currencySymbol);
  const client = getGeminiClient();

  if (!client) {
    return fallback;
  }

  try {
    const prompt = `You are a certified professional financial auditor and advisor.
Analyze the following personal finance ledger and return an in-depth financial audit strictly in JSON format.

User Financial Ledger:
- Currency Symbol: "${currencySymbol}"
- Total Income: ${fallback.keyMetrics.totalIncome}
- Total Expenses: ${fallback.keyMetrics.totalExpense}
- Net Savings: ${fallback.keyMetrics.netSavings}
- Savings Rate: ${fallback.keyMetrics.savingsRatePercent}%
- Monthly Overall Spending Cap: ${budgetConfig.monthlyOverallCap}
- Category Limits: ${JSON.stringify(budgetConfig.categoryLimits)}
- Recent Transactions: ${JSON.stringify(transactions.slice(-25))}
- Active Savings Goals: ${JSON.stringify(savingsGoals)}

Respond with a single JSON object (no markdown, no backticks, valid JSON only) with this exact schema:
{
  "healthScore": <integer 0 to 100>,
  "letterGrade": <"A" | "B" | "C" | "D" | "F">,
  "summary": <concise 2-sentence executive summary of financial status>,
  "overspendingAlerts": [
    {
      "category": <category string>,
      "spent": <number>,
      "limit": <number>,
      "excess": <number>,
      "severity": <"Moderate" | "High" | "Critical">
    }
  ],
  "recommendedBudgetAdjustments": [
    {
      "category": <string>,
      "currentLimit": <number>,
      "suggestedLimit": <number>,
      "reason": <string>
    }
  ],
  "emergencyFundRoadmap": {
    "currentEmergencySavings": <number>,
    "recommendedEmergencyFund": <number>,
    "monthsCovered": <number>,
    "monthlySavingsTarget": <number>,
    "targetMonthsToFull": <number>,
    "recommendation": <string>
  },
  "actionPlan": [
    {
      "step": 1,
      "title": <action title string>,
      "description": <action description string>,
      "impact": <action impact tag string>
    },
    {
      "step": 2,
      "title": <string>,
      "description": <string>,
      "impact": <string>
    },
    {
      "step": 3,
      "title": <string>,
      "description": <string>,
      "impact": <string>
    },
    {
      "step": 4,
      "title": <string>,
      "description": <string>,
      "impact": <string>
    }
  ]
}`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return fallback;
    }

    const parsed = JSON.parse(text);

    return {
      healthScore: typeof parsed.healthScore === "number" ? Math.max(0, Math.min(100, parsed.healthScore)) : fallback.healthScore,
      letterGrade: ["A", "B", "C", "D", "F"].includes(parsed.letterGrade) ? parsed.letterGrade : fallback.letterGrade,
      summary: parsed.summary || fallback.summary,
      overspendingAlerts: Array.isArray(parsed.overspendingAlerts) ? parsed.overspendingAlerts : fallback.overspendingAlerts,
      recommendedBudgetAdjustments: Array.isArray(parsed.recommendedBudgetAdjustments) ? parsed.recommendedBudgetAdjustments : fallback.recommendedBudgetAdjustments,
      emergencyFundRoadmap: parsed.emergencyFundRoadmap || fallback.emergencyFundRoadmap,
      actionPlan: Array.isArray(parsed.actionPlan) && parsed.actionPlan.length > 0 ? parsed.actionPlan : fallback.actionPlan,
      keyMetrics: fallback.keyMetrics,
      generatedAt: new Date().toISOString(),
      source: "gemini",
    };
  } catch (error) {
    console.error("Gemini Health Audit call encountered error, utilizing resilient fallback engine:", error);
    return fallback;
  }
}

/**
 * Context-aware conversational financial advisory powered by Gemini 2.5 Flash
 */
export async function generateAdvisorChatResponse(
  message: string,
  history: Array<{ sender: "user" | "assistant"; text: string }>,
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  savingsGoals: SavingsGoal[],
  currencySymbol: string = "$"
): Promise<{ text: string; suggestions: string[] }> {
  const client = getGeminiClient();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const categorySpending: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === "expense") {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    }
  }

  // If no Gemini client, run heuristic fallback response
  if (!client) {
    const q = message.toLowerCase();
    let text = "";
    let suggestions = [
      "How can I cut dining out costs?",
      "What is the 50/30/20 budgeting rule?",
      "How much should my emergency fund be?",
    ];

    if (q.includes("save") || q.includes("cut") || q.includes("reduce")) {
      text = `Based on your live ledger, your monthly net cash flow is **${currencySymbol}${netSavings.toLocaleString()}** (Income: ${currencySymbol}${totalIncome.toLocaleString()}, Expenses: ${currencySymbol}${totalExpense.toLocaleString()}).\n\nTo increase your savings:\n1. Audit your top spending category (**${Object.keys(categorySpending)[0] || "General Expenses"}**).\n2. Allocate an additional 5-10% of monthly surplus directly to your active goals.\n3. Implement the 24-hour rule for non-essential purchases over ${currencySymbol}50.`;
      suggestions = [
        "How do I balance debt vs savings?",
        "Show me my highest expense category",
        "Give me a 30-day savings challenge",
      ];
    } else if (q.includes("food") || q.includes("dining") || q.includes("grocery")) {
      const foodSpent = categorySpending["Food & Dining"] || 0;
      text = `You have spent **${currencySymbol}${foodSpent.toLocaleString()}** in Food & Dining. A recommended rule of thumb is keeping grocery and dining expenses beneath 12-15% of your total income. Batch meal prepping and reviewing grocery lists can trim 15-20% quickly.`;
      suggestions = [
        "How to budget for groceries?",
        "Can I afford to dine out this weekend?",
        "How can I save $200 more this month?",
      ];
    } else if (q.includes("emergency") || q.includes("fund")) {
      const recommended = (totalExpense || 1000) * 6;
      text = `An optimal safety cushion is **3 to 6 months of living expenses**, which equals approximately **${currencySymbol}${recommended.toLocaleString()}** based on your current burn rate. Keep this in a high-yield liquid account where it earns interest without principal volatility.`;
      suggestions = [
        "Where should I keep emergency funds?",
        "Should I invest before having 6 months saved?",
        "How to start saving from zero?",
      ];
    } else {
      text = `Hello! I am your AI Financial Advisor. Based on your live ledger records:\n- **Total Income**: ${currencySymbol}${totalIncome.toLocaleString()}\n- **Total Expenses**: ${currencySymbol}${totalExpense.toLocaleString()}\n- **Net Savings**: ${currencySymbol}${netSavings.toLocaleString()}\n\nFeel free to ask me for custom budgeting plans, category trim ideas, or emergency fund roadmaps!`;
    }

    return { text, suggestions };
  }

  try {
    const systemPrompt = `You are a certified, friendly, and practical personal finance advisor bot.
The user is asking you for financial advice. You have direct access to their real-time financial ledger:
- Currency: "${currencySymbol}"
- Total Income recorded: ${currencySymbol}${totalIncome}
- Total Expenses recorded: ${currencySymbol}${totalExpense}
- Net Monthly Savings: ${currencySymbol}${netSavings}
- Monthly Spending Cap: ${budgetConfig.monthlyOverallCap ? currencySymbol + budgetConfig.monthlyOverallCap : "Not set"}
- Expense by Category: ${JSON.stringify(categorySpending)}
- Active Savings Goals: ${JSON.stringify(savingsGoals.map(g => ({ name: g.goal_name, target: g.target_amount, current: g.current_amount, deadline: g.deadline })))}

Guidelines:
- Give clear, empowering, mathematically sound personal finance advice.
- Cite specific figures from their ledger when relevant to make the advice hyper-personalized.
- Avoid generic filler. Keep answers focused, well-formatted with markdown bullets where helpful.
- Tone: Professional, encouraging, realistic.
- At the end of your response, provide exactly 3 relevant follow-up question suggestions formatted on a new line prefixed with "SUGGESTIONS:" followed by pipe-separated questions. Example:
SUGGESTIONS: How can I save more on food? | What is my savings rate? | Should I pay off debt first?`;

    const formattedHistory = history.slice(-6).map((h) => `${h.sender === "user" ? "User" : "Advisor"}: ${h.text}`).join("\n");
    const fullPrompt = `${systemPrompt}\n\nRecent Conversation:\n${formattedHistory}\n\nUser: ${message}\nAdvisor:`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    let rawText = response.text || "I am analyzing your finances. What specific area would you like to explore?";
    let suggestions = [
      "How can I save $250 more this month?",
      "Is my spending balanced?",
      "Review my emergency fund target",
    ];

    if (rawText.includes("SUGGESTIONS:")) {
      const parts = rawText.split("SUGGESTIONS:");
      rawText = parts[0].trim();
      const rawSuggestions = parts[1].trim().split("|").map(s => s.trim()).filter(Boolean);
      if (rawSuggestions.length > 0) {
        suggestions = rawSuggestions.slice(0, 3);
      }
    }

    return {
      text: rawText,
      suggestions,
    };
  } catch (error) {
    console.error("Gemini Advisor Chat error, using fallback response:", error);
    return {
      text: `Based on your live finances (${currencySymbol}${totalIncome.toLocaleString()} income, ${currencySymbol}${totalExpense.toLocaleString()} expenses), keeping your top categories within strict bounds is the fastest way to hit your savings goals. Let me know which category you'd like to optimize!`,
      suggestions: [
        "How can I reduce monthly expenses?",
        "What is my emergency fund target?",
        "How to budget using 50/30/20?",
      ],
    };
  }
}
