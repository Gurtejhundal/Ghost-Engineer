"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const steps = [
  "Connecting to GitHub",
  "Reading repository tree",
  "Detecting tech stack",
  "Identifying critical files",
  "Summoning AI council",
  "Generating engineering review",
];

const detailSteps = [
  "Parsing repo metadata...",
  "Mapping file tree...",
  "Compressing repository context...",
  "Routing summary through expert agents...",
  "Normalizing structured output...",
];

export function ScanningSequence({ activeStep }: { activeStep: number }) {
  return (
    <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#123B35] bg-[#030807]/85 p-5 shadow-2xl shadow-[#00A88F]/10">
      <div className="relative overflow-hidden rounded-2xl border border-[#0F2A26] bg-[#000000] p-5">
        <motion.div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D1B2] to-transparent"
          animate={{ y: [0, 240, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative grid gap-3">
          {steps.map((step, index) => {
            const complete = index < activeStep;
            const active = index === activeStep;
            return (
              <div
                key={step}
                className="flex min-h-14 items-center justify-between rounded-2xl border border-[#0F2A26] bg-[#06110F]/70 px-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-xl ${
                      complete
                        ? "bg-[#7CFF00]/15 text-[#7CFF00]"
                        : active
                          ? "bg-[#00D1B2]/15 text-[#00D1B2]"
                          : "bg-[#08201C] text-[#55706A]"
                    }`}
                  >
                    {complete ? (
                      <Check className="h-4 w-4" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="font-mono text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#FFFFFF]">{step}</span>
                </div>
                <span className="hidden font-mono text-xs text-[#55706A] sm:block">
                  {complete ? "complete" : active ? "active" : "queued"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-5">
        {detailSteps.map((step, index) => (
          <div
            key={step}
            className={`rounded-2xl border px-3 py-3 font-mono text-xs ${
              index <= activeStep
                ? "border-[#00D1B2]/35 bg-[#00D1B2]/10 text-[#E0F2FE]"
                : "border-[#0F2A26] bg-[#06110F]/50 text-[#55706A]"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
