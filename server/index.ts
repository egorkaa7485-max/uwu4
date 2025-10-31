import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketServer } from 'ws';
import { CrashGame } from "./game/crashGame";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const crashGame = new CrashGame();

  const wss = new WebSocketServer({ 
    noServer: true 
  });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;
    
    if (pathname === '/game') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    log('Game WebSocket client connected');
    crashGame.addClient(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'placeBet') {
          const success = crashGame.placeBet(
            data.playerId,
            data.amount,
            data.autoCashout
          );
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'betPlaced',
              success
            }));
          }
        } else if (data.type === 'cashout') {
          const result = crashGame.cashout(data.playerId);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'cashoutResult',
              ...result
            }));
          }
        }
      } catch (error) {
        log(`WebSocket message error: ${error}`);
      }
    });

    ws.on('error', (error) => {
      log(`WebSocket connection error: ${error.message}`);
    });

    ws.on('close', () => {
      log('Game WebSocket client disconnected');
      crashGame.removeClient(ws);
    });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
