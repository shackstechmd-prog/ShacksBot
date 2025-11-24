const fs = require('fs');
const path = require('path');

const OWNER_NUMBERS = (process.env.OWNER_NUMBERS || '256759590343').split(',').map(x => x.trim());

// load command modules
const commands = new Map();
['menu','owner','song'].forEach(name => {
  try {
    const mod = require(`./commands/${name}`);
    commands.set(mod.name, mod);
  } catch (e) { /* ignore */ }
});

module.exports = function(sock) {
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const messages = m.messages;
      if (!messages || !messages.length) return;
      const msg = messages[0];
      if (!msg.message) return;
      if (msg.key && msg.key.fromMe) return; // ignore our messages

      const remoteJid = msg.key.remoteJid;
      const sender = (msg.key.participant || remoteJid).split('@')[0];
      const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
      if (!text.startsWith('.')) return;

      const parts = text.slice(1).split(/\s+/);
      const cmd = parts.shift().toLowerCase();
      const args = parts;

      // owner-only command list
      const ownerOnly = new Set(['block','delete','disk','gcaddprivacy','join','leave','restart','setbio','setprofilepic','unblock','warn','addbadword','addsud o']);

      if (ownerOnly.has(cmd) && !OWNER_NUMBERS.includes(sender)) {
        const reply = `you're not my owner @${sender} kumanyonko`;
        await sock.sendMessage(remoteJid, { text: reply, mentions: [msg.key.participant || msg.key.remoteJid] });
        return;
      }

      // dispatch
      const command = commands.get(cmd);
      if (!command) {
        await sock.sendMessage(remoteJid, { text: `Unknown command: ${cmd}. Type .menu` });
        return;
      }

      await command.handler({ sock, msg, args, sender, remoteJid });

    } catch (e) {
      console.error('handler error', e);
    }
  });
};