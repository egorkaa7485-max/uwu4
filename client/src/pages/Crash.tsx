import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BetInfoSection } from "./sections/BetInfoSection";
import { GameControlsSection } from "./sections/GameControlsSection";
import { TimerSection } from "./sections/TimerSection";

type GameState = "waiting" | "flying" | "crashed" | "win";

export const Crash = (): JSX.Element => {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [showCongrats, setShowCongrats] = useState(false);
  const [multiplier, setMultiplier] = useState(3.5);
  const [countdown, setCountdown] = useState(3);
  const [winnings, setWinnings] = useState(112);
  const congratsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (congratsTimeoutRef.current) {
      clearTimeout(congratsTimeoutRef.current);
      congratsTimeoutRef.current = null;
    }

    if (gameState === "win") {
      congratsTimeoutRef.current = setTimeout(() => {
        setShowCongrats(true);
      }, 1000);
    }

    return () => {
      if (congratsTimeoutRef.current) {
        clearTimeout(congratsTimeoutRef.current);
      }
    };
  }, [gameState]);

  const handleGameAction = () => {
    if (gameState === "waiting") {
      return;
    } else if (gameState === "flying") {
      setGameState("win");
    }
  };

  const cycleGameState = () => {
    setShowCongrats(false);

    const states: GameState[] = ["waiting", "flying", "crashed", "win"];
    const currentIndex = states.indexOf(gameState);
    const nextIndex = (currentIndex + 1) % states.length;
    setGameState(states[nextIndex]);
  };

  const getGameAreaContent = () => {
    switch (gameState) {
      case "waiting":
        return (
          <>
            <div className="absolute top-12 left-5 flex flex-col items-start">
              <div className="font-bold text-[32px] tracking-[-0.64px] [font-family:'Inter',Helvetica] text-white leading-[normal]">
                00:0{countdown}
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
          </>
        );
      
      case "flying":
        return (
          <>
            <div className="absolute top-12 left-5 flex flex-col items-start">
              <div className="font-bold text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#c3ff00] leading-[normal]">
                x{multiplier.toFixed(1)}
              </div>
              <div className="[font-family:'Inter',Helvetica] font-medium text-[#c3ff00] text-xs tracking-[-0.24px] leading-[normal]">
                Fly
              </div>
            </div>
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 358 261" fill="none">
              <path
                d="M 0 261 Q 90 200, 180 120 T 358 0"
                stroke="#c3ff00"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            <img
              className="absolute top-[50px] right-[30px] w-[100px] h-[100px] object-cover"
              alt="Flying pug"
              src="/figmaAssets/puppy-pug-1-5.png"
            />
          </>
        );
      
      case "crashed":
        return (
          <>
            <div className="absolute top-12 left-5 flex flex-col items-start">
              <div className="font-bold text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#ff0000] leading-[normal]">
                x{multiplier.toFixed(1)}
              </div>
              <div className="[font-family:'Inter',Helvetica] font-medium text-[#ff0000] text-xs tracking-[-0.24px] leading-[normal]">
                Crash
              </div>
            </div>
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 358 261" fill="none">
              <path
                d="M 0 261 Q 90 200, 180 120 T 250 150 L 260 240"
                stroke="#ff0000"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            <img
              className="absolute bottom-[30px] right-[50px] w-[100px] h-[100px] object-cover"
              alt="Crashed pug"
              src="/figmaAssets/puppy-pug-1-5.png"
            />
          </>
        );
      
      case "win":
        return (
          <>
            <div className="absolute top-12 left-5 flex flex-col items-start">
              <div className="font-bold text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#c3ff00] leading-[normal]">
                x{multiplier.toFixed(1)}
              </div>
              <div className="[font-family:'Inter',Helvetica] font-medium text-[#c3ff00] text-xs tracking-[-0.24px] leading-[normal]">
                Win
              </div>
            </div>
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 358 261" fill="none">
              <path
                d="M 0 261 Q 90 200, 180 120 T 358 0"
                stroke="#c3ff00"
                strokeWidth="3"
                fill="none"
              />
            </svg>
            <img
              className="absolute top-[50px] right-[30px] w-[100px] h-[100px] object-cover"
              alt="Winning pug"
              src="/figmaAssets/puppy-pug-1-5.png"
            />
          </>
        );
      
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (gameState) {
      case "waiting":
        return (
          <Button
            disabled
            className="w-full h-[52px] bg-[#15151a] hover:bg-[#15151a] rounded-3xl cursor-not-allowed"
          >
            <span className="[font-family:'Inter',Helvetica] font-bold text-[#3c3c3c] text-base tracking-[-0.32px]">
              Waiting for new round
            </span>
          </Button>
        );
      
      case "flying":
        return (
          <Button
            onClick={handleGameAction}
            className="w-full h-[52px] bg-[#c3ff00] hover:bg-[#c3ff00]/90 rounded-3xl"
          >
            <span className="[font-family:'Inter',Helvetica] font-bold text-[#242424] text-base tracking-[-0.32px]">
              Bet
            </span>
          </Button>
        );
      
      case "crashed":
      case "win":
        return (
          <Button
            disabled
            className="w-full h-[52px] bg-[#15151a] hover:bg-[#15151a] rounded-3xl cursor-not-allowed"
          >
            <span className="[font-family:'Inter',Helvetica] font-bold text-[#3c3c3c] text-base tracking-[-0.32px]">
              Waiting for new round
            </span>
          </Button>
        );
      
      default:
        return null;
    }
  };

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
          className="w-6 h-6 cursor-pointer"
          alt="Solar round double"
          src="/figmaAssets/solar-round-double-alt-arrow-down-bold.svg"
          onClick={cycleGameState}
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

          {getGameAreaContent()}

          <div className="absolute top-[29px] left-[204px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[19px] left-[68px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[66px] left-[30px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[6px] left-[147px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[80px] left-[165px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[12px] left-[245px] w-px h-px bg-white rounded-[0.5px]" />
        </section>

        <TimerSection />
        <BetInfoSection />

        {getActionButton()}

        <GameControlsSection />
      </main>

      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="bg-[#15151a] border-0 rounded-3xl max-w-[342px] p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <img
                className="w-[132px] h-[132px] object-cover"
                alt="Congratulations pug"
                src="/figmaAssets/puppy-pug-1-5.png"
              />
              <h2 className="[font-family:'Inter',Helvetica] font-bold text-white text-2xl tracking-[-0.48px] text-center">
                Congratulations!
              </h2>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
              <div className="flex flex-col items-center gap-1">
                <span className="[font-family:'Inter',Helvetica] font-medium text-white/50 text-sm tracking-[-0.28px]">
                  You won
                </span>
                <div className="flex items-center gap-2">
                  <img
                    className="w-6 h-6"
                    alt="TON icon"
                    src="/figmaAssets/simple-icons-ton-1.svg"
                  />
                  <span className="[font-family:'Inter',Helvetica] font-bold text-[#c3ff00] text-[32px] tracking-[-0.64px]">
                    {winnings}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowCongrats(false);
                  setGameState("waiting");
                }}
                className="w-full h-[52px] bg-[#c3ff00] hover:bg-[#c3ff00]/90 rounded-3xl"
              >
                <span className="[font-family:'Inter',Helvetica] font-bold text-[#242424] text-base tracking-[-0.32px]">
                  Continue
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
