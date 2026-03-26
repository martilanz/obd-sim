import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let t = 0;
let fuelLevel = 72;
let activeDtc = [];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function maybeToggleDtc() {
  const possible = [
    {error: "P0301", descr: "Cylinder 1 Misfire"}, 
    { error: "P0420", descr: "Catalyst efficiency below thresold"}, 
    { error:"P0171", descr: "System too lean"},
    {error: "P0101", descr: "Mass Air Flow"}];
  const chance = Math.random();

  if (chance < 0.03 && activeDtc.length === 0) {
    activeDtc = [possible[Math.floor(Math.random() * possible.length)]];
    console.log(activeDtc)
  } else if (chance > 0.97) {
    activeDtc = [];
  }
}

function generateObdFrame() {
  t += 1;

  const speed = Math.round(50 + 25 * Math.sin(t / 8) + Math.random() * 6);
  const rpm = Math.round(1400 + speed * 35 + 400 * Math.sin(t / 4));
  const coolantTemp = Math.round(clamp(70 + t * 0.05 + Math.random() * 2, 70, 96));
  const throttle = Math.round(clamp(12 + speed / 4 + Math.random() * 8, 0, 100));

  fuelLevel = clamp(fuelLevel - 0.03, 0, 100);
  maybeToggleDtc();

  return {
    timestamp: new Date().toISOString(),
    rpm,
    speed,
    coolantTemp,
    throttle,
    fuelLevel: Number(fuelLevel.toFixed(1)),
    engineLoad: Math.round(clamp(20 + speed / 2 + Math.random() * 10, 0, 100)),
    batteryVoltage: Number((12.2 + Math.random() * 0.8).toFixed(2)),
    dtc: activeDtc
  };
}

let latestFrame = generateObdFrame();

app.get("/api/live", (_req, res) => {
  res.json(latestFrame);
});

app.get("/api/dtc", (_req, res) => {
  res.json({
    timestamp: latestFrame.timestamp,
    dtc: latestFrame.dtc
  });
});

app.post("/api/dtc/clear", (_req, res) => {
  activeDtc = [];
  latestFrame = {
    ...latestFrame,
    dtc: []
  };

  broadcast({
    type: "dtc_cleared",
    payload: latestFrame
  });

  res.json({ ok: true });
});

function broadcast(message) {
  const data = JSON.stringify(message);

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

wss.on("connection", (ws) => {
  ws.send(
    JSON.stringify({
      type: "live",
      payload: latestFrame
    })
  );
});

setInterval(() => {
  latestFrame = generateObdFrame();

  broadcast({
    type: "live",
    payload: latestFrame
  });
}, 1000);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`OBD simulator listening on http://localhost:${PORT}`);
});