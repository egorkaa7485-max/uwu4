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
    history: []
  });
  
  const [betAmount, setBetAmount] = useState<number | ''>('');
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
        setGameState(prevState => {
          const newState = data.state;
          
          if (newState.phase === "crashed" && prevState.phase !== "crashed") {
            const updatedHistory = [newState.crashPoint, ...prevState.history].slice(0, 15);
            return { ...newState, history: updatedHistory };
          }
          
          return { ...newState, history: prevState.history };
        });
        
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
    if (value === '') {
      setBetAmount('');
      return;
    }
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
    setBetAmount(prev => {
      const current = prev === '' ? 10 : prev;
      return current * 2;
    });
  };

  const divideBet = () => {
    setBetAmount(prev => {
      const current = prev === '' ? 10 : prev;
      return Math.max(1, current / 2);
    });
  };

  const placeBet = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const amount = betAmount === '' ? 10 : betAmount;
      wsRef.current.send(JSON.stringify({
        type: "placeBet",
        playerId: playerId.current,
        amount: amount,
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

  const getPointOnCurve = (t: number, multiplier: number) => {
    let progress;
    if (multiplier <= 2.5) {
      progress = (multiplier - 1) * 0.5;
    } else {
      const remainingProgress = multiplier - 2.5;
      progress = 0.75 + (remainingProgress * 0.03);
    }
    
    const clampedProgress = Math.min(progress, 0.85);
    const x = clampedProgress * 65;
    const y = 100 - (clampedProgress * 45 + Math.sin(clampedProgress * Math.PI * 0.5) * 10);
    return { x, y };
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
        const point = getPointOnCurve(0, gameState.multiplier);
        const pathEndX = point.x;
        const pathEndY = point.y;
        
        const isStarPhase = gameState.multiplier >= 2.5;
        
        return (
          <>
            {isStarPhase && (
              <div className="absolute inset-0 overflow-hidden bg-[#0a0a15]">
                {Array.from({ length: 80 }).map((_, i) => {
                  const startX = Math.random() * 150;
                  const startY = Math.random() * 100;
                  const speed = 0.3 + Math.random() * 0.7;
                  const size = 1 + Math.random() * 2;
                  
                  return (
                    <div
                      key={`star-${i}`}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                      style={{
                        left: `${startX}%`,
                        top: `${startY}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animation: `starFall ${4 / speed}s linear infinite`,
                        animationDelay: `${Math.random() * 3}s`,
                      }}
                    />
                  );
                })}
              </div>
            )}
            
            <div className="absolute top-4 sm:top-12 left-3 sm:left-5 flex flex-col items-start z-10">
              <div className="font-bold text-[48px] sm:text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#c3ff00] leading-[normal]">
                x{gameState.multiplier.toFixed(2)}
              </div>
              <div className="[font-family:'Inter',Helvetica] font-medium text-[#c3ff00] text-xs tracking-[-0.24px] leading-[normal]">
                Fly
              </div>
            </div>
            
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c3ff00" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#c3ff00" />
                  <stop offset="100%" stopColor="#c3ff00" />
                </linearGradient>
                <linearGradient id="yellowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c3ff00" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#c3ff00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 100 Q ${pathEndX * 0.5} ${100 + 10}, ${pathEndX} ${pathEndY} L ${pathEndX} 100 L 0 100 Z`}
                fill="url(#yellowGlow)"
                style={{ 
                  transition: 'all 0.1s linear',
                }}
              />
              <path
                d={`M 0 100 Q ${pathEndX * 0.5} ${100 + 10}, ${pathEndX} ${pathEndY}`}
                stroke="url(#lineGradient)"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                style={{ 
                  transition: 'all 0.1s linear',
                }}
              />
            </svg>
            
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#1a1a2b] to-transparent pointer-events-none z-5" />
            
            <img
              className="absolute w-[60px] sm:w-[80px] md:w-[100px] h-[60px] sm:h-[80px] md:h-[100px] object-cover transition-all duration-100 z-10"
              style={{ 
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: `translate(-50%, -50%) rotate(-15deg)`,
              }}
              alt="Flying pug"
              src="/figmaAssets/puppy-pug-1-5.png"
            />
          </>
        );
      
      case "crashed":
        const crashPoint = getPointOnCurve(0, gameState.crashPoint);
        const crashPathX = crashPoint.x;
        const crashPathY = crashPoint.y;
        
        const wasCrashInStarPhase = gameState.crashPoint >= 2.5;
        
        return (
          <>
            {wasCrashInStarPhase && (
              <div className="absolute inset-0 overflow-hidden bg-[#0a0a15]">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div
                    key={`star-crash-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full opacity-50"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${1 + Math.random() * 2}px`,
                      height: `${1 + Math.random() * 2}px`,
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className="absolute top-4 sm:top-12 left-3 sm:left-5 flex flex-col items-start z-10">
              <div className="font-bold text-[48px] sm:text-[64px] tracking-[-1.28px] [font-family:'Inter',Helvetica] text-[#ff5f5f] leading-[normal]">
                x{gameState.multiplier.toFixed(2)}
              </div>
              <div className="[font-family:'Inter',Helvetica] font-medium text-[#ff5f5f] text-xs tracking-[-0.24px] leading-[normal]">
                Crash
              </div>
            </div>
            
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="crashLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff5f5f" />
                  <stop offset="100%" stopColor="#ff5f5f" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path
                d={`M ${crashPathX} ${crashPathY} L ${crashPathX + 5} ${Math.min(crashPathY + 30, 100)}`}
                stroke="url(#crashLineGradient)"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#1a1a2b] to-transparent pointer-events-none z-5" />
            
            <img
              className="absolute w-[60px] sm:w-[80px] md:w-[100px] h-[60px] sm:h-[80px] md:h-[100px] object-cover z-10"
              style={{ 
                left: `${crashPathX}%`,
                top: `${crashPathY}%`,
                transform: 'translate(-50%, -50%) rotate(90deg)',
              }}
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
    <div className="bg-[#0f0f12] overflow-hidden w-full min-h-screen relative flex flex-col">
      <div className="absolute w-full left-0 bottom-0 h-[34px] flex items-end justify-center z-50 md:hidden">
        <div className="mb-2 w-[139px] h-[5px] bg-white rounded-[100px]" />
      </div>

      <header className="flex w-full items-center justify-between px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-16 pb-4 sm:pb-6">
        <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
          <AvatarImage
            src="/figmaAssets/ellipse-34-5.png"
            alt="Profile"
            className="object-cover"
          />
        </Avatar>

        <Button className="h-8 sm:h-9 px-3 sm:px-4 bg-[#c3ff00] hover:bg-[#c3ff00]/90 rounded-3xl">
          <span className="[font-family:'Inter',Helvetica] font-bold text-[#242424] text-xs tracking-[-0.24px]">
            Connect Wallet
          </span>
        </Button>
      </header>

      <div className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 md:px-8 pb-3 sm:pb-4">
        <img
          className="w-5 h-5 sm:w-6 sm:h-6"
          alt="Solar round double"
          src="/figmaAssets/solar-round-double-alt-arrow-down-bold.svg"
        />
        <h1 className="[font-family:'Inter',Helvetica] font-bold text-white text-xl sm:text-2xl tracking-[-0.48px]">
          Crash
        </h1>
      </div>

      <main className="flex flex-col px-4 sm:px-6 md:px-8 gap-3 sm:gap-4 pb-20 md:pb-8">
        <section className="relative w-full h-[220px] sm:h-[261px] md:h-[300px] lg:h-[350px] rounded-3xl bg-[linear-gradient(180deg,rgba(26,26,43,1)_0%,rgba(21,21,26,1)_100%)] overflow-hidden">
          {gameState.phase === "flying" && gameState.multiplier < 2.5 && (
            <>
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="Mask group"
                src="/figmaAssets/mask-group.png"
              />
              <div className="absolute inset-0 overflow-hidden opacity-80">
                {Array.from({ length: 25 }).map((_, i) => {
                  const height = 40 + Math.random() * 60;
                  const width = 20 + Math.random() * 40;
                  const startLeft = 100 + (i * 6);
                  const delay = i * 0.15;
                  const duration = 8 + Math.random() * 4;
                  
                  return (
                    <div
                      key={`building-${i}`}
                      className="absolute bottom-0 bg-black/60"
                      style={{
                        left: `${startLeft}%`,
                        width: `${width}px`,
                        height: `${height}%`,
                        animation: `buildingMove ${duration}s linear infinite`,
                        animationDelay: `${delay}s`,
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}
          {gameState.phase === "crashed" && gameState.crashPoint < 2.5 && (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              alt="Mask group"
              src="/figmaAssets/mask-group.png"
            />
          )}

          {getGameAreaContent()}
        </section>

        <TimerSection history={gameState.history} />

        <section className="w-full bg-[#15151a] rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-[13px]">
            <div className="flex items-end gap-1 sm:gap-[5px] w-full">
              <div className="flex flex-col flex-1 sm:w-[200px] items-start gap-[3px]">
                <label className="opacity-50 [font-family:'Inter',Helvetica] font-semibold text-white text-xs tracking-[-0.24px]">
                  Bet
                </label>

                <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 w-full bg-[#18181f] rounded-2xl">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    placeholder="10"
                    className="bg-transparent border-0 p-0 h-auto text-white font-semibold text-sm sm:text-base tracking-[-0.32px] [font-family:'Inter',Helvetica] w-full focus-visible:ring-0 placeholder:text-white/30 placeholder:font-semibold"
                  />

                  <img
                    className="w-4 sm:w-[18px] h-4 sm:h-[18px]"
                    alt="Simple icons ton"
                    src="/figmaAssets/simple-icons-ton-1.svg"
                  />
                </div>
              </div>

              <Button
                onClick={multiplyBet}
                variant="ghost"
                className="w-12 sm:w-[50px] h-[35px] sm:h-[39px] bg-[#18181f] hover:bg-[#18181f]/80 rounded-2xl p-0"
              >
                <span className="text-xs tracking-[-0.24px] [font-family:'Inter',Helvetica] font-semibold text-white">
                  x2
                </span>
              </Button>

              <Button
                onClick={divideBet}
                variant="ghost"
                className="w-12 sm:w-[50px] h-[35px] sm:h-[39px] bg-[#18181f] hover:bg-[#18181f]/80 rounded-2xl p-0"
              >
                <span className="font-semibold text-xs tracking-[-0.24px] [font-family:'Inter',Helvetica] text-white">
                  /2
                </span>
              </Button>
            </div>

            <div className="flex items-end gap-1 w-full">
              <div className="flex flex-col flex-1 sm:w-[200px] items-start gap-2">
                <label className="opacity-50 [font-family:'Inter',Helvetica] font-semibold text-white text-xs tracking-[-0.24px]">
                  Auto-cashout
                </label>

                <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 w-full bg-[#18181f] rounded-2xl">
                  <Input
                    type="number"
                    value={autoCashout}
                    onChange={(e) => handleAutoCashoutChange(e.target.value)}
                    step="0.01"
                    disabled={!autoCashoutEnabled}
                    className="bg-transparent border-0 p-0 h-auto text-white font-semibold text-sm sm:text-base tracking-[-0.32px] [font-family:'Inter',Helvetica] w-full focus-visible:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                variant="ghost"
                className={`w-20 sm:w-[106px] h-[35px] sm:h-[39px] ${autoCashoutEnabled ? 'bg-[#c3ff001a]' : 'bg-[#18181f]'} hover:opacity-80 rounded-2xl p-0`}
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
