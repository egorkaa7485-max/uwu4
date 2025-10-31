import { WebSocket } from 'ws';

export type GamePhase = 'waiting' | 'flying' | 'crashed';

export interface GameState {
  phase: GamePhase;
  multiplier: number;
  crashPoint: number;
  timeRemaining: number;
  history: number[];
}

export interface PlayerBet {
  playerId: string;
  amount: number;
  autoCashout?: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
}

export class CrashGame {
  private phase: GamePhase = 'waiting';
  private multiplier: number = 1.0;
  private crashPoint: number = 0;
  private timeRemaining: number = 25;
  private history: number[] = [];
  private bets: Map<string, PlayerBet> = new Map();
  private gameInterval: NodeJS.Timeout | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor() {
    this.startGameCycle();
    this.loadHistory();
  }

  private loadHistory() {
    this.history = [21, 2.3, 1.2, 3.1, 23, 15, 17, 3.5, 3.5, 3.5, 3.5];
  }

  public addClient(ws: WebSocket) {
    this.clients.add(ws);
    this.sendStateToClient(ws);
  }

  public removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  public placeBet(playerId: string, amount: number, autoCashout?: number): boolean {
    if (this.phase !== 'waiting') {
      return false;
    }

    this.bets.set(playerId, {
      playerId,
      amount,
      autoCashout,
      cashedOut: false
    });

    return true;
  }

  public cashout(playerId: string): { success: boolean; winnings?: number } {
    if (this.phase !== 'flying') {
      return { success: false };
    }

    const bet = this.bets.get(playerId);
    if (!bet || bet.cashedOut) {
      return { success: false };
    }

    bet.cashedOut = true;
    bet.cashoutMultiplier = this.multiplier;
    const winnings = bet.amount * this.multiplier;

    this.broadcast({
      type: 'cashout',
      playerId,
      multiplier: this.multiplier,
      winnings
    });

    return { success: true, winnings };
  }

  private generateCrashPoint(): number {
    const e = 0.01;
    const h = Math.random();
    return Math.max(1.0, Math.floor((100 / (100 * h - h + e)) * 100) / 100);
  }

  private startGameCycle() {
    this.runWaitingPhase();
  }

  private runWaitingPhase() {
    this.phase = 'waiting';
    this.timeRemaining = 25;
    this.crashPoint = this.generateCrashPoint();
    this.multiplier = 1.0;
    this.bets.clear();

    this.broadcast({
      type: 'gameState',
      state: this.getState()
    });

    this.gameInterval = setInterval(() => {
      this.timeRemaining -= 1;

      if (this.timeRemaining <= 0) {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.runFlyingPhase();
      } else {
        this.broadcast({
          type: 'gameState',
          state: this.getState()
        });
      }
    }, 1000);
  }

  private runFlyingPhase() {
    this.phase = 'flying';
    this.multiplier = 1.0;
    const startTime = Date.now();

    this.broadcast({
      type: 'gameState',
      state: this.getState()
    });

    this.gameInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      this.multiplier = Math.min(this.crashPoint, 1.0 + elapsed * 0.1);
      
      this.bets.forEach((bet) => {
        if (!bet.cashedOut && bet.autoCashout && this.multiplier >= bet.autoCashout) {
          this.cashout(bet.playerId);
        }
      });

      if (this.multiplier >= this.crashPoint) {
        if (this.gameInterval) clearInterval(this.gameInterval);
        this.runCrashedPhase();
      } else {
        this.broadcast({
          type: 'gameState',
          state: this.getState()
        });
      }
    }, 100);
  }

  private runCrashedPhase() {
    this.phase = 'crashed';
    this.multiplier = this.crashPoint;
    this.history.unshift(this.crashPoint);
    this.history = this.history.slice(0, 11);

    this.broadcast({
      type: 'gameState',
      state: this.getState()
    });

    setTimeout(() => {
      this.runWaitingPhase();
    }, 3000);
  }

  private getState(): GameState {
    return {
      phase: this.phase,
      multiplier: Math.round(this.multiplier * 10) / 10,
      crashPoint: this.crashPoint,
      timeRemaining: this.timeRemaining,
      history: this.history
    };
  }

  private sendStateToClient(ws: WebSocket) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'gameState',
        state: this.getState()
      }));
    }
  }

  private broadcast(message: any) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  public destroy() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.clients.clear();
  }
}
