const axios = require('axios');
module.exports = {
  name: 'song',
  handler: async ({ sock, msg, args, remoteJid }) => {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(remoteJid, { text: 'Usage: .song [title or url]' });

    // If url looks like youtube, call veron-apis downloader
    try {
      const apiUrl = `https://veron-apis.zone.id/downloader/youtube/audio?url=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { responseType: 'json' });
      // API shape may differ. This is a placeholder: expect res.data.link or res.data.url
      const fileUrl = res.data?.link || res.data?.url || res.data?.result;
      if (!fileUrl) return sock.sendMessage(remoteJid, { text: 'Could not fetch audio from API' });
      await sock.sendMessage(remoteJid, { audio: { url: fileUrl }, mimetype: 'audio/mpeg' });
    } catch (e) {
      console.error('song error', e?.message);
      await sock.sendMessage(remoteJid, { text: 'Error fetching song' });
    }
  }
};