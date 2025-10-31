import React from "react";
import { Badge } from "@/components/ui/badge";

const multipliers = [
  { value: "x21", highlighted: true },
  { value: "x2.3", highlighted: false },
  { value: "x1.2", highlighted: false },
  { value: "x3.1", highlighted: false },
  { value: "x23", highlighted: true },
  { value: "x15", highlighted: true },
  { value: "x17", highlighted: true },
  { value: "x3.5", highlighted: false },
  { value: "x3.5", highlighted: false },
  { value: "x3.5", highlighted: false },
  { value: "x3.5", highlighted: false },
];

export const TimerSection = (): JSX.Element => {
  return (
    <section className="flex items-center gap-2 px-4">
      {multipliers.map((multiplier, index) => (
        <Badge
          key={`multiplier-${index}`}
          variant="secondary"
          className={`inline-flex items-center justify-center gap-2.5 p-2.5 rounded-3xl ${
            multiplier.highlighted ? "bg-[#c3ff001a]" : "bg-[#151515aa]"
          }`}
        >
          <span
            className={`w-fit [font-family:'Inter',Helvetica] text-xs text-center tracking-[-0.24px] leading-[normal] ${
              multiplier.highlighted
                ? "font-bold text-[#c3ff00]"
                : "font-semibold text-white"
            }`}
          >
            {multiplier.value}
          </span>
        </Badge>
      ))}
    </section>
  );
};
