import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const BetInfoSection = (): JSX.Element => {
  return (
    <Card className="w-full bg-[#15151a] rounded-2xl border-0">
      <CardContent className="flex flex-col items-start gap-[13px] p-6">
        <div className="flex items-end gap-[5px] w-full">
          <div className="flex flex-col w-[200px] items-start gap-[3px]">
            <Label className="opacity-50 [font-family:'Inter',Helvetica] font-semibold text-white text-xs tracking-[-0.24px]">
              Bet
            </Label>

            <div className="flex items-center gap-1.5 px-4 py-2.5 w-full bg-[#18181f] rounded-2xl">
              <span className="[font-family:'Inter',Helvetica] font-semibold text-white text-base tracking-[-0.32px]">
                32
              </span>

              <img
                className="w-[18px] h-[18px]"
                alt="Simple icons ton"
                src="/figmaAssets/simple-icons-ton-1.svg"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-[50px] h-[39px] bg-[#18181f] hover:bg-[#18181f]/80 rounded-2xl p-0"
          >
            <span className="text-xs tracking-[-0.24px] [font-family:'Inter',Helvetica] font-semibold text-white">
              x2
            </span>
          </Button>

          <Button
            variant="ghost"
            className="w-[50px] h-[39px] bg-[#18181f] hover:bg-[#18181f]/80 rounded-2xl p-0"
          >
            <span className="font-semibold text-xs tracking-[-0.24px] [font-family:'Inter',Helvetica] text-white">
              /2
            </span>
          </Button>
        </div>

        <div className="flex items-end gap-1 w-full">
          <div className="flex flex-col w-[200px] items-start gap-2">
            <Label className="opacity-50 [font-family:'Inter',Helvetica] font-semibold text-white text-xs tracking-[-0.24px]">
              Auto-cashout
            </Label>

            <div className="flex items-center gap-1.5 px-4 py-2.5 w-full bg-[#18181f] rounded-2xl">
              <span className="text-base tracking-[-0.32px] [font-family:'Inter',Helvetica] font-semibold text-white">
                x2
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-[106px] h-[39px] bg-[#c3ff001a] hover:bg-[#c3ff001a]/80 rounded-2xl p-0"
          >
            <span className="[font-family:'Inter',Helvetica] font-bold text-[#c3ff00] text-xs tracking-[-0.24px]">
              ON
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
