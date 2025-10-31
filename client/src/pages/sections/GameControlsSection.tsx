import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const leaderboardData = [
  {
    rank: null,
    name: "Maxim",
    subtitle: "32 TON",
    subtitleColor: "opacity-50 text-white",
    avatar: "/figmaAssets/ellipse-34-5.png",
    puppyPug: "/figmaAssets/puppy-pug-1-5.png",
    tonAmount: "32",
    multiplier: "(x1.3)",
    showTonIcon: true,
    showPuppyLeft: true,
    bgColor: "bg-[#19191f]",
    rankColor: "",
  },
  {
    rank: null,
    name: "Maxim",
    subtitle: "32 TON",
    subtitleColor: "opacity-50 text-white",
    avatar: "/figmaAssets/ellipse-34-5.png",
    puppyPug: "/figmaAssets/puppy-pug-1-5.png",
    tonAmount: "32",
    multiplier: "(x1.3)",
    showTonIcon: true,
    showPuppyLeft: false,
    bgColor: "bg-[#19191f]",
    rankColor: "",
  },
  {
    rank: "2",
    name: "Maxim",
    subtitle: "330 000 points",
    subtitleColor: "text-[#acacac]",
    avatar: "/figmaAssets/ellipse-34-5.png",
    puppyPug: "/figmaAssets/puppy-pug-1-5.png",
    tonAmount: null,
    multiplier: null,
    showTonIcon: false,
    showPuppyLeft: false,
    bgColor: "bg-[#cdcdcd1a]",
    rankColor: "text-[#ababab]",
  },
  {
    rank: "3",
    name: "Maxim",
    subtitle: "330 000 points",
    subtitleColor: "text-[#ba8f56]",
    avatar: "/figmaAssets/ellipse-34-5.png",
    puppyPug: "/figmaAssets/puppy-pug-1-5.png",
    tonAmount: null,
    multiplier: null,
    showTonIcon: false,
    showPuppyLeft: false,
    bgColor: "bg-[#603e001a]",
    rankColor: "text-[#ba8f56]",
  },
  {
    rank: "4",
    name: "Maxim",
    subtitle: "330 000 points",
    subtitleColor: "opacity-50 text-white",
    avatar: "/figmaAssets/ellipse-34-5.png",
    puppyPug: "/figmaAssets/puppy-pug-1-5.png",
    tonAmount: null,
    multiplier: null,
    showTonIcon: false,
    showPuppyLeft: false,
    bgColor: "bg-[#19191f]",
    rankColor: "text-white",
  },
  {
    rank: "4",
    name: "Maxim",
    subtitle: "330 000 points",
    subtitleColor: "opacity-50 text-white",
    avatar: "/figmaAssets/ellipse-34-5.png",
    puppyPug: "/figmaAssets/puppy-pug-1-5.png",
    tonAmount: null,
    multiplier: null,
    showTonIcon: false,
    showPuppyLeft: false,
    bgColor: "bg-[#19191f]",
    rankColor: "text-white",
  },
];

export const GameControlsSection = (): JSX.Element => {
  return (
    <section className="w-full px-4 py-2.5 bg-[#15151a] rounded-2xl">
      <div className="flex flex-col gap-1.5">
        {leaderboardData.map((player, index) => (
          <Card
            key={index}
            className={`${player.bgColor} border-0 rounded-2xl`}
          >
            <CardContent className="p-[13px_13px_9px_13px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {player.rank && (
                    <div
                      className={`text-sm tracking-[-0.28px] [font-family:'Inter',Helvetica] font-semibold text-center leading-[normal] ${player.rankColor}`}
                    >
                      {player.rank}
                    </div>
                  )}
                  <div className="flex items-start gap-[11px]">
                    <img
                      className="w-9 h-9 object-cover rounded-full"
                      alt="Player avatar"
                      src={player.avatar}
                    />
                    <div className="flex flex-col w-[72px]">
                      <div className="[font-family:'Inter',Helvetica] font-bold text-white text-sm tracking-[-0.28px] leading-[21.3px]">
                        {player.name}
                      </div>
                      <div
                        className={`[font-family:'Inter',Helvetica] font-medium text-[10px] text-center tracking-[-0.20px] leading-[normal] ${player.subtitleColor}`}
                      >
                        {player.subtitle}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {player.showPuppyLeft && (
                    <img
                      className="w-[39.76px] h-[39.76px] object-cover"
                      alt="Puppy pug"
                      src={player.puppyPug}
                    />
                  )}
                  {player.tonAmount && (
                    <div className="flex items-center gap-0.5">
                      <div className="flex items-center gap-1.5">
                        {player.showTonIcon && (
                          <img
                            className="w-5 h-5"
                            alt="TON icon"
                            src="/figmaAssets/simple-icons-ton-2.svg"
                          />
                        )}
                        <div className="text-white text-lg tracking-[-0.36px] [font-family:'Inter',Helvetica] font-semibold text-center leading-[normal]">
                          {player.tonAmount}
                        </div>
                      </div>
                      {player.multiplier && (
                        <div className="text-sm tracking-[-0.28px] [font-family:'Inter',Helvetica] font-semibold text-[#c3ff00] text-center leading-[normal]">
                          {player.multiplier}
                        </div>
                      )}
                    </div>
                  )}
                  {!player.showPuppyLeft && player.puppyPug && (
                    <img
                      className="w-[39.76px] h-[39.76px] object-cover"
                      alt="Puppy pug"
                      src={player.puppyPug}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
