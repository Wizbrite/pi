"use client";

import React, { useState } from "react";
import {
  Check,
  Zap,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PaymentMethod = "mtn_momo" | "orange_momo" | "card";
type Step = 1 | 2 | 3 | 4;

interface Plan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  priceXAF: number;
  priceUSD: number;
  period: string;
  description: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly Pass",
    priceXAF: 2500,
    priceUSD: 4.99,
    period: "per month",
    description: "Great for quick revision and targeted practice before mini-exams.",
    features: [
      "Access to 50+ GCE Past Papers",
      "Basic AI Explanation Assistant",
      "Unlimited Quiz Mode Practice",
      "Standard XP & Streak Tracking",
      "Community Discussion Forum",
    ],
  },
  {
    id: "term",
    name: "Term Pass (3 Months)",
    popular: true,
    badge: "Most Popular",
    priceXAF: 6000,
    priceUSD: 11.99,
    period: "for 3 months",
    description: "Ideal for a full school term preparation across all core subjects.",
    features: [
      "Access to ALL GCE O/A Level Papers",
      "Unlimited AI Tutor Deep-Dives",
      "Timed Exam Mode Simulation",
      "Topic Weakness Analytics",
      "Download Papers for Offline Use",
      "Priority Support",
    ],
  },
  {
    id: "annual",
    name: "GCE Final Pass (Annual)",
    badge: "Best Value - Save 40%",
    priceXAF: 18000,
    priceUSD: 29.99,
    period: "per year",
    description: "Complete package for students aiming for top Grade A results in GCE.",
    features: [
      "Everything in Term Pass",
      "Full Mock Exam Grading Engine",
      "1-on-1 AI Mentor Recommendations",
      "Downloadable Model Answer Keys",
      "Parent/Sponsor Progress Dashboard",
      "Guaranteed GCE Pass Bonus XP",
    ],
  },
];

export default function SubscriptionPage() {
  const [currency, setCurrency] = useState<"XAF" | "USD">("XAF");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]);
  
  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mtn_momo");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const openCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep(1);
    setIsModalOpen(true);
  };

  const handleNextStep = () => {
    if (step === 2) {
      // Simulate Payment Processing
      setIsProcessing(true);
      setStep(3);
      setTimeout(() => {
        setIsProcessing(false);
        setStep(4);
      }, 3500);
      return;
    }
    setStep((prev) => (prev + 1) as Step);
  };

  const formatPrice = (plan: Plan) => {
    if (currency === "XAF") {
      return `${plan.priceXAF.toLocaleString()} FCFA`;
    }
    return `$${plan.priceUSD.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background space-y-8 pb-16">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider py-1 px-3 border-primary/30 text-primary bg-primary/5">
          <Sparkles className="w-3.5 h-3.5 mr-1 inline-block" /> Upgrade Your GCE Prep
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Unlock Unlimited Past Papers & AI Tutoring
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Choose a plan that fits your study schedule. Instant activation with Mobile Money or Bank Card.
        </p>

        {/* CURRENCY TOGGLE */}
        <div className="pt-2 flex justify-center items-center">
          <div className="bg-muted p-1 rounded-xl flex items-center border border-border">
            <button
              onClick={() => setCurrency("XAF")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                currency === "XAF"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FCFA (XAF - Mobile Money)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                currency === "USD"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD ($ - International)
            </button>
          </div>
        </div>
      </div>

      {/* PRICING CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl bg-card border p-6 flex flex-col justify-between shadow-xs transition hover:shadow-md ${
              plan.popular
                ? "border-primary ring-2 ring-primary/20 bg-gradient-to-b from-primary/[0.02] to-transparent"
                : "border-border"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground font-extrabold text-[11px] px-3 py-0.5 shadow-xs">
                  {plan.badge}
                </Badge>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                  {plan.description}
                </p>
              </div>

              <div className="border-y border-border py-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground">{formatPrice(plan)}</span>
                  <span className="text-xs text-muted-foreground font-medium">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 pt-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-border/60">
              <Button
                onClick={() => openCheckout(plan)}
                className={`w-full font-bold text-xs h-10 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* TRUST FOOTER */}
      <div className="max-w-4xl mx-auto bg-muted/40 border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Instant & Secure Activation</h4>
            <p className="text-xs text-muted-foreground">Supported via MTN MoMo, Orange Money, and Visa/Mastercard.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-bold">MTN Mobile Money</Badge>
          <Badge variant="outline" className="text-[10px] font-bold">Orange Money</Badge>
          <Badge variant="outline" className="text-[10px] font-bold">Cards</Badge>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="max-w-3xl mx-auto space-y-4 pt-4">
        <h3 className="text-lg font-extrabold text-foreground text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" /> How does Mobile Money payment work?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5">
              When you select MTN or Orange Money, enter your phone number. You will receive a prompt directly on your phone asking you to enter your secret PIN to authorize the payment.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card space-y-1">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" /> Can I cancel anytime?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed pl-5">
              Yes! All passes are one-time payments or non-binding passes. You won't be charged hidden renewal fees without your explicit permission.
            </p>
          </div>
        </div>
      </div>

      {/* PAYMENT FLOW MODAL (4 STEPS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider block">
                  Step {step} of 4
                </span>
                <h3 className="text-base font-bold text-foreground">
                  {step === 1 && "Confirm Plan"}
                  {step === 2 && "Select Payment Method"}
                  {step === 3 && "Processing Payment"}
                  {step === 4 && "Payment Successful!"}
                </h3>
              </div>
              {step !== 3 && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xs font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* STEP PROGRESS BAR */}
            <div className="w-full bg-muted h-1">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-5">
              
              {/* STEP 1: PLAN CONFIRMATION */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-extrabold text-foreground">{selectedPlan.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedPlan.period}</p>
                      </div>
                      <span className="text-lg font-black text-foreground">{formatPrice(selectedPlan)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-muted-foreground uppercase text-[10px]">Includes:</span>
                    {selectedPlan.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-foreground/90">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleNextStep} className="w-full font-bold text-xs h-10 mt-2">
                    Proceed to Payment <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}

              {/* STEP 2: PAYMENT METHOD & DETAILS */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mtn_momo")}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition ${
                        paymentMethod === "mtn_momo"
                          ? "border-amber-500 bg-amber-500/10 font-bold text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-amber-500" />
                      <span className="text-[10px]">MTN MoMo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("orange_momo")}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition ${
                        paymentMethod === "orange_momo"
                          ? "border-orange-500 bg-orange-500/10 font-bold text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-orange-500" />
                      <span className="text-[10px]">Orange Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/10 font-bold text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-[10px]">Card</span>
                    </button>
                  </div>

                  {/* FORM FIELDS BASED ON METHOD */}
                  {paymentMethod !== "card" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground block">
                        Enter Mobile Money Number (+237)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="e.g. 670000000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        A USSD prompt will be sent to your phone to authorize {formatPrice(selectedPlan)}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-foreground block mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">MM/YY</label>
                          <input
                            type="text"
                            placeholder="12/26"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-foreground block mb-1">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 text-xs font-bold h-10">
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                    </Button>
                    <Button onClick={handleNextStep} className="w-2/3 font-bold text-xs h-10 bg-primary">
                      Pay {formatPrice(selectedPlan)}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: PROCESSING WAITING SCREEN */}
              {step === 3 && (
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                    <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Waiting for Payment Authorization...</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check your phone screen for the Mobile Money PIN prompt and enter your code.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-1 font-mono">
                    <Clock className="w-3 h-3 animate-spin" /> Auto-detecting status...
                  </Badge>
                </div>
              )}

              {/* STEP 4: SUCCESS CONFIRMATION */}
              {step === 4 && (
                <div className="py-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-foreground">Subscription Activated!</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your <span className="font-bold text-foreground">{selectedPlan.name}</span> is now active. All GCE papers and AI features are fully unlocked.
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-xl text-left border border-border space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Ref:</span>
                      <span className="font-mono font-bold">GCE-2026-9812</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-bold">{formatPrice(selectedPlan)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full font-bold text-xs h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Start Studying Now
                  </Button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}