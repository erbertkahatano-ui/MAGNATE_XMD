const express = require("express");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
app.use(express.json());

let pairingCodeGlobal = "";

async function startBot(number) {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  if (number && !sock.authState.creds.registered) {
    setTimeout(async () => {
      pairingCodeGlobal = await sock.requestPairingCode(number);
      console.log("PAIR CODE:", pairingCodeGlobal);
    }, 2000);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text = msg.message.conversation || "";
    const from = msg.key.remoteJid;

    if (text === ".menu") {
      await sock.sendMessage(from, { text: "🎛 Magnate XMD Menu Active" });
    }

    if (text === ".ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!" });
    }
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot(number);
    }
  });
}

/* 🌐 API FOR WEBSITE */
app.post("/pair", async (req, res) => {
  const { number } = req.body;

  startBot(number);

  setTimeout(() => {
    res.json({
      number,
      code: pairingCodeGlobal || "Generating..."
    });
  }, 4000);
});

app.listen(3000, () => console.log("Magnate XMD running..."));
