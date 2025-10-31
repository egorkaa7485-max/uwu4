import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GameControlsSection } from "./sections/GameControlsSection";
import { TimerSection } from "./sections/TimerSection";

type GamePhase = "waiting" | "flying" | "crashed";

interface GameState {
  phase: GamePhase;
  multiplier: number;
  crashPoint: number;
  timeRemaining: number;
  history: number[];
}

export const Crash = (): JSX.Element => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "waiting",
    multiplier: 1.0,
    crashPoint: 0,
    timeRemaining: 25,
    history: [21, 2.3, 1.2, 3.1, 23, 15, 17, 3.5, 3.5, 3.5, 3.5]
  });
  
  const [betAmount, setBetAmount] = useState(32);
  const [autoCashout, setAutoCashout] = useState(2);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(true);
  const [hasBet, setHasBet] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [winnings, setWinnings] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const playerId = useRef(`player_${Date.now()}`);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/game`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to game server");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "gameState") {
        setGameState(data.state);
        
        if (data.state.phase === "crashed") {
          setHasBet(false);
        }
      } else if (data.type === "betPlaced") {
        if (data.success) {
          setHasBet(true);
        }
      } else if (data.type === "cashout") {
        if (data.playerId === playerId.current) {
          setWinnings(data.winnings);
          setShowCongrats(true);
          setHasBet(false);
        }
      } else if (data.type === "cashoutResult") {
        if (data.success) {
          setWinnings(data.winnings);
          setShowCongrats(true);
          setHasBet(false);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Disconnected from game server");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleBetAmountChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setBetAmount(num);
    }
  };

  const handleAutoCashoutChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 1.01) {
      setAutoCashout(num);
    }
  };

  const multiplyBet = () => {
    setBetAmount(prev => prev * 2);
  };

  const divideBet = () => {
    setBetAmount(prev => Math.max(1, prev / 2));
  };

  const placeBet = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "placeBet",
        playerId: playerId.current,
        amount: betAmount,
        autoCashout: autoCashoutEnabled ? autoCashout : undefined
      }));
    }
  };

  const handleCashout = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "cashout",
        playerId: playerId.current
      }));
    }
  };

  const getGameAreaContent = () => {
    switch (gameState.phase) {
      case "waiting":
        return (
          <>
            <div className="absolute top-12 left-5 flex flex-col items-start">
              <div className="font-bold text-[32px] tracking-[-0.64px] [font-family:'Inter',Helvetica] text-white leading-[normal]">
                00:{gameState.timeRemaining.toString().padStart(2, '0')}
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
            <div className="absolute top-12 left-5 flex flex-col items-start z-10">
              <div className="font-bold text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#c3ff00] leading-[normal]">
                x{gameState.multiplier.toFixed(2)}
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
              className="absolute top-[50px] right-[30px] w-[100px] h-[100px] object-cover transition-transform duration-100"
              style={{ transform: `translateY(-${(gameState.multiplier - 1) * 30}px)` }}
              alt="Flying pug"
              src="/figmaAssets/puppy-pug-1-5.png"
            />
          </>
        );
      
      case "crashed":
        return (
          <>
            <div className="absolute top-12 left-5 flex flex-col items-start z-10">
              <div className="font-bold text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#ff5f5f] leading-[normal]">
                x{gameState.multiplier.toFixed(2)}
              </div>
              <div className="[font-family:'Inter',Helvetica] font-medium text-[#ff5f5f] text-xs tracking-[-0.24px] leading-[normal]">
                Crash
              </div>
            </div>
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 358 261" fill="none">
              <path
                d="M 0 261 Q 90 200, 180 120 T 250 150 L 260 240"
                stroke="#ff5f5f"
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
      
      default:
        return null;
    }
  };

  const getActionButton = () => {
    if (gameState.phase === "waiting" && !hasBet) {
      return (
        <Button
          onClick={placeBet}
          className="w-full h-[52px] bg-[#c3ff00] hover:bg-[#c3ff00]/90 rounded-3xl"
        >
          <span className="[font-family:'Inter',Helvetica] font-bold text-[#242424] text-base tracking-[-0.32px]">
            Bet
          </span>
        </Button>
      );
    } else if (gameState.phase === "flying" && hasBet) {
      return (
        <Button
          onClick={handleCashout}
          className="w-full h-[52px] bg-[#c3ff00] hover:bg-[#c3ff00]/90 rounded-3xl"
        >
          <span className="[font-family:'Inter',Helvetica] font-bold text-[#242424] text-base tracking-[-0.32px]">
            Cashout x{gameState.multiplier.toFixed(2)}
          </span>
        </Button>
      );
    } else {
      return (
        <Button
          disabled
          className="w-full h-[52px] bg-[#15151a] hover:bg-[#15151a] rounded-3xl cursor-not-allowed"
        >
          <span className="[font-family:'Inter',Helvetica] font-bold text-[#3c3c3c] text-base tracking-[-0.32px]">
            {gameState.phase === "waiting" ? "Bet Placed" : "Waiting for new round"}
          </span>
        </Button>
      );
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

          {getGameAreaContent()}

          <div className="absolute top-[29px] left-[204px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[19px] left-[68px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[66px] left-[30px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[6px] left-[147px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[80px] left-[165px] w-px h-px bg-white rounded-[0.5px]" />
          <div className="absolute top-[12px] left-[245px] w-px h-px bg-white rounded-[0.5px]" />
        </section>

        <TimerSection history={gameState.history} />

        <section className="w-full bg-[#15151a] rounded-2xl p-6">
          <div className="flex flex-col gap-[13px]">
            <div className="flex items-end gap-[5px] w-full">
              <div className="flex flex-col w-[200px] items-start gap-[3px]">
                <label className="opacity-50 [font-family:'Inter',Helvetica] font-semibold text-white text-xs tracking-[-0.24px]">
                  Bet
                </label>

                <div className="flex items-center gap-1.5 px-4 py-2.5 w-full bg-[#18181f] rounded-2xl">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    className="bg-transparent border-0 p-0 h-auto text-white font-semibold text-base tracking-[-0.32px] [font-family:'Inter',Helvetica] w-full focus-visible:ring-0"
                  />

                  <img
                    className="w-[18px] h-[18px]"
                    alt="Simple icons ton"
                    src="/figmaAssets/simple-icons-ton-1.svg"
                  />
                </div>
              </div>

              <Button
                onClick={multiplyBet}
                variant="ghost"
                className="w-[50px] h-[39px] bg-[#18181f] hover:bg-[#18181f]/80 rounded-2xl p-0"
              >
                <span className="text-xs tracking-[-0.24px] [font-family:'Inter',Helvetica] font-semibold text-white">
                  x2
                </span>
              </Button>

              <Button
                onClick={divideBet}
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
                <label className="opacity-50 [font-family:'Inter',Helvetica] font-semibold text-white text-xs tracking-[-0.24px]">
                  Auto-cashout
                </label>

                <div className="flex items-center gap-1.5 px-4 py-2.5 w-full bg-[#18181f] rounded-2xl">
                  <Input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => handleAutoCashoutChange(e.target.value)}
                    step="0.01"
                    disabled={!autoCashoutEnabled}
                    className="bg-transparent border-0 p-0 h-auto text-white font-semibold text-base tracking-[-0.32px] [font-family:'Inter',Helvetica] w-full focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                variant="ghost"
                className={`w-[106px] h-[39px] ${autoCashoutEnabled ? 'bg-[#c3ff001a]' : 'bg-[#18181f]'} hover:opacity-80 rounded-2xl p-0`}
              >
                <span className={`[font-family:'Inter',Helvetica] font-bold ${autoCashoutEnabled ? 'text-[#c3ff00]' : 'text-white'} text-xs tracking-[-0.24px]`}>
                  {autoCashoutEnabled ? "ON" : "OFF"}
                </span>
              </Button>
            </div>
          </div>
        </section>

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
                    {winnings.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowCongrats(false)}
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
