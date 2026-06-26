/**
 * Folder: src/constants
 * File: pricing.ts
 * Purpose:
 * - Static pricing plans data.
 * - Single source of truth for all plan details.
 */

import type { PricingPlan } from "@/types/pricing";

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for job seekers getting started",
    tokens: "1,000 tokens / month",
    featured: false,
    features: [
      "1 CV upload & analysis",
      "ATS Score calculation",
      "Basic strengths & weaknesses",
      "3 AI improvement suggestions",
      "Email support",
    ],
    cta: "Get Started",
  //  href: "/register?plan=Basic",
  },
  {
    name: "Pro",
    price: "500",
    description: "For serious job seekers & recruiters",
    tokens: "2000 tokens / month",
    featured: true,
    features: [
      "Unlimited CV uploads",
      "Advanced ATS analysis",
      "Full strengths & weaknesses",
      "AI career assistant (chat)",
      "Job matching analysis",
      "Missing skills detection",
      "Priority support",
    ],
    cta: "Get Pro",
    // href: "/register?plan=Pro",
  },
  {
    name: "Enterprise",
    price: "1000",
    description: "For companies hiring at scale",
    tokens: "4000 tokens / month",
    featured: false,
    features: [
      "Everything in Pro",
      "Natural language candidate search",
      "AI candidate ranking",
      "Bulk CV processing",
      "Custom integrations",
      "Dedicated account manager",
      "SLA support",
    ],
    cta: "Contact Sales",
  //  href: "/register?plan=Enterprise"
  },
];
