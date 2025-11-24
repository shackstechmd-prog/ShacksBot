const express = require('express');
const fs = require('fs');
const path = require('path');
const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys');
const handler = require('./handler');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

// simple in-memory stores (replace with DB)
global.linkedUsers = new Map();
global.pairStore = new Map();

async function start() {
  // Use multi-file auth state so sessions persist in disk (data/ folder)
  const { state, saveCreds } = await useMultiFileAuthState('./data/auth_info_multi');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) start();
    }
    console.log('connection update', connection);
  });

  // attach message handler
  handler(sock);

  // pairing routes
  const pairing = require('./pairing');
  pairing.init(app, sock);

  // small health route
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), linked: Array.from(global.linkedUsers.keys()).length });
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => console.error('START ERROR', err));
