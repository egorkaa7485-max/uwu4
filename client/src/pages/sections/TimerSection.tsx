import React from "react";
import { Badge } from "@/components/ui/badge";

interface TimerSectionProps {
  history: number[];
}

export const TimerSection = ({ history }: TimerSectionProps): JSX.Element => {
  return (
    <section className="flex items-center gap-2 overflow-x-auto">
      {history.map((multiplier, index) => {
        const highlighted = multiplier >= 5;
        return (
          <Badge
            key={`multiplier-${index}`}
            variant="secondary"
            className={`inline-flex items-center justify-center gap-2.5 p-2.5 rounded-3xl flex-shrink-0 ${
              highlighted ? "bg-[#c3ff001a]" : "bg-[#151515aa]"
            }`}
          >
            <span
              className={`w-fit [font-family:'Inter',Helvetica] text-xs text-center tracking-[-0.24px] leading-[normal] ${
                highlighted
                  ? "font-bold text-[#c3ff00]"
                  : "font-semibold text-white"
              }`}
            >
              x{multiplier % 1 === 0 ? multiplier : multiplier.toFixed(1)}
            </span>
          </Badge>
        );
      })}
    </section>
  );
};
