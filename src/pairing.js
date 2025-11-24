const bcrypt = require('bcrypt');
const qrcode = require('qrcode');
const fs = require('fs');

const OWNER_IMAGE_PATH = './assets/owner.jpg';

function isWhatsAppRegistered(sock, phone) {
  // Baileys exposes onWhatsApp - adapt if your version differs
  return sock.onWhatsApp?.([phone + '@s.whatsapp.net']).then(res => Array.isArray(res) && res[0]?.exists).catch(() => false);
}

function init(app, sock) {
  app.post('/api/pair/request', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'phone required' });

    const registered = await isWhatsAppRegistered(sock, phone);
    if (!registered) return res.json({ registered: false, message: 'Number not on WhatsApp' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = Date.now() + 4 * 60 * 1000; // 4 minutes

    global.pairStore.set(phone, { codeHash, expiresAt, attempts: 0 });

    // send pairing message with owner image if exists
    const caption = `──⟪ ShacksTech MD Pairing ⟫──\nWelcome! Pairing code:\n\n*${code}*\n\nThis code expires in 4 minutes.`;
    try {
      if (fs.existsSync(OWNER_IMAGE_PATH)) {
        const buffer = fs.readFileSync(OWNER_IMAGE_PATH);
        await sock.sendMessage(phone + '@s.whatsapp.net', { image: buffer, caption });
      } else {
        await sock.sendMessage(phone + '@s.whatsapp.net', { text: caption });
      }
    } catch (e) {
      console.error('sendMessage err', e?.message || e);
    }

    res.json({ sent: true, expiresIn: 240 });
  });

  app.post('/api/pair/verify', async (req, res) => {
    const { phone, code } = req.body;
    const record = global.pairStore.get(phone);
    if (!record) return res.status(400).json({ error: 'No pairing requested' });
    if (Date.now() > record.expiresAt) {
      global.pairStore.delete(phone);
      return res.status(400).json({ error: 'Pairing code expired' });
    }
    if (record.attempts >= 5) {
      global.pairStore.delete(phone);
      return res.status(429).json({ error: 'Too many attempts' });
    }
    record.attempts++;
    const ok = await bcrypt.compare(code, record.codeHash);
    if (!ok) return res.status(400).json({ error: 'Incorrect code' });

    global.linkedUsers.set(phone, { linkedAt: new Date().toISOString(), role: 'user' });
    global.pairStore.delete(phone);

    // confirmation message
    const confirmation = `✅ *ShacksTech MD connected successfully.*\n\nWelcome, *${phone}* — you can now use the bot.`;
    try {
      if (fs.existsSync(OWNER_IMAGE_PATH)) {
        const buffer = fs.readFileSync(OWNER_IMAGE_PATH);
        await sock.sendMessage(phone + '@s.whatsapp.net', { image: buffer, caption: confirmation });
      } else {
        await sock.sendMessage(phone + '@s.whatsapp.net', { text: confirmation });
      }
    } catch (e) {
      console.error('confirm send error', e?.message || e);
    }

    res.json({ linked: true });
  });

  app.get('/api/qr/:text', async (req, res) => {
    // generate small QR (text could be session string or other)
    const text = req.params.text || 'shacks-qr';
    const png = await qrcode.toBuffer(text, { width: 360 });
    res.set('Content-Type', 'image/png');
    res.send(png);
  });
}

module.exports = { init };