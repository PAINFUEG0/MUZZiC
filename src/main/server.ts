/** @format */

import fs from "node:fs";
import path from "node:path";
import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import { directories } from "./constants";
import { MessagePayload } from "../shared/types";

const router = express();
const server = createServer(router);

router.get("/", (_, res) => res.sendStatus(200));

router.get("/thumb/:id", (req, res) => {
  const { id } = req.params;
  const thumbPath = path.resolve(directories.thumbnails, `${id}.jpg`);
  const defaultThumbnailPath = path.resolve(".", "public", "logo.png");
  res.sendFile(fs.existsSync(thumbPath) ? thumbPath : defaultThumbnailPath, { dotfiles: "allow" });
});

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => ws.on("message", (message) => console.log("Received message:", message)));

export const api = {
  get port() {
    return (server.address() as any)?.port;
  },
  broadcast(message: MessagePayload) {
    wss.clients.forEach((client) => client.send(JSON.stringify(message)));
  },
  startServer() {
    return new Promise((resolve) => server.listen(0, () => resolve(null)));
  },
};
