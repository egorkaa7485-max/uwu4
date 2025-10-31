import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BetInfoSection } from "./sections/BetInfoSection";
import { GameControlsSection } from "./sections/GameControlsSection";
import { TimerSection } from "./sections/TimerSection";

export const Crash = (): JSX.Element => {
  return (
    <div className="bg-[#0f0f12] overflow-hidden w-full min-w-[390px] min-h-[840px] relative flex flex-col">
      <div className="absolute w-full left-0 bottom-0 h-[34px] flex items-end justify-center z-50">
        <div className="mb-2 w-[139px] h-[5px] bg-white rounded-[100px]" />
      </div>

      <header className="flex w-full items-center justify-between px-4 pt-[102px] pb-6">
        <Avatar className="w-9 h-9">
          <AvatarImage
            src="/figmaAssets/ellipse-34-5.png"
            alt="Profile"
            className="object-cover"
          />
        </Avatar>

        <Button className="h-9 px-4 bg-[#c3ff00] hover:bg-[#c3ff00]/90 rounded-3xl">
          <span className="[font-family:'Inter',Helvetica] font-bold text-[#242424] text-xs tracking-[-0.24px]">
            Connect Wallet
          </span>
        </Button>
      </header>

      <div className="inline-flex items-center justify-center gap-1.5 px-4 pb-4">
        <img
          className="w-6 h-6"
          alt="Solar round double"
          src="/figmaAssets/solar-round-double-alt-arrow-down-bold.svg"
        />
        <h1 className="[font-family:'Inter',Helvetica] font-bold text-white text-2xl tracking-[-0.48px]">
          Crash
        </h1>
      </div>

      <main className="flex flex-col px-4 gap-4">
        <section className="relative w-full h-[261px] rounded-3xl bg-[linear-gradient(180deg,rgba(26,26,43,1)_0%,rgba(21,21,26,1)_100%)] overflow-hidden">
          <img
            className="absolute inset-0 w-full h-full"
            alt="Mask group"
            src="/figmaAssets/mask-group.png"
          />

          <div className="absolute top-12 left-5 flex flex-col items-start">
            <div className="font-bold text-[32px] tracking-[-0.64px] [font-family:'Inter',Helvetica] text-white leading-[normal]">
              00:03
            </div>
            <div className="opacity-50 [font-family:'Inter',Helvetica] font-medium text-white text-xs tracking-[-0.24px] leading-[normal]">
              Waiting for new round
            </div>
          </div>

          <img
            className="absolute top-[84px] right-[30px] w-[132px] h-[132px] object-cover"
            alt="Yellow pug"
            src="/figmaAssets/puppy-pug-1-5.png"
          />

          <div className="absolute top-[29px] left-[204px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[19px] left-[68px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[66px] left-[30px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[6px] left-[147px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[80px] left-[165px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[12px] left-[245px] w-px h-px bg-white rounded-[0.5px]" />
        </section>

        <TimerSection />
        <BetInfoSection />

        <Button
          disabled
          className="w-full h-[52px] bg-[#15151a] hover:bg-[#15151a] rounded-3xl cursor-not-allowed"
        >
          <span className="[font-family:'Inter',Helvetica] font-bold text-[#3c3c3c] text-base tracking-[-0.32px]">
            Waiting for new round
          </span>
        </Button>

        <GameControlsSection />
      </main>
    </div>
  );
};
