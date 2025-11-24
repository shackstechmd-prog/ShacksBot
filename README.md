# ShacksTech MD - Baileys Pairing Scaffold

This branch contains a minimal scaffold to run a Baileys-based WhatsApp bot with pairing endpoints and a modular command handler. It's intentionally minimal — replace in-memory stores with a real database in production and add the owner image at `assets/owner.jpg`.

Quick start:
1. Copy your owner image to `assets/owner.jpg`.
2. Create a `.env` file with: OWNER_NUMBERS=256759590343 PORT=3000
3. npm install
4. npm run dev

Files added:
- src/server.js - Express server and Baileys connection boot
- src/pairing.js - Pairing endpoints (/api/pair/request, /api/pair/verify)
- src/handler.js - Message handler and command dispatcher
- src/commands/menu.js, owner.js, song.js - Example commands

Security & notes:
- This scaffold uses in-memory stores (Map). Replace with Postgres/Mongo/Redis for persistence.
- Baileys multi-device sessions require saving auth state. Add persistent auth state to avoid re-scanning.
- For production consider using the official WhatsApp Business API to reduce ban risk.
