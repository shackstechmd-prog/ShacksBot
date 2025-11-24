module.exports = {
  name: 'menu',
  handler: async ({ sock, msg, remoteJid }) => {
    const menu = `──⟪ ShacksTech MD ⟫──\nOwner: SHACKS TECH (+256759590343)\nPrefix: .\nMode: Public\nSpeed: 27997 ms\n\nAI MENU\n• .photoai — random image\n• .generateimage [prompt] — text->image (veron-apis)\n\nAUDIO MENU\n• .bass [reply to audio] — add bass\n• .reverse [reply to audio] — reverse audio\n\nDOWNLOAD MENU\n• .tiktok [url] — download tiktok\n• .instagram [url] — download instagram\n• .song [title|url] — download song\n\nType .help for owner info.`;
    await sock.sendMessage(remoteJid, { text: menu });
  }
};