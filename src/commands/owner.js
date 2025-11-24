const fs = require('fs');
const OWNER_IMAGE_PATH = './assets/owner.jpg';
module.exports = {
  name: 'owner',
  handler: async ({ sock, msg, remoteJid }) => {
    const caption = `Owner: SHACKS TECH\nPhone: +256759590343 (Uganda)\n\nShacksTech is from Uganda, the Pearl of Africa.`;
    if (fs.existsSync(OWNER_IMAGE_PATH)) {
      const buffer = fs.readFileSync(OWNER_IMAGE_PATH);
      await sock.sendMessage(remoteJid, { image: buffer, caption });
    } else {
      await sock.sendMessage(remoteJid, { text: caption });
    }
  }
};