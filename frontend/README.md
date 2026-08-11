# Environment Configuration

Create a `.env` file in the frontend root directory:

```env
TOKEN=xxxx
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### Variables

- `TOKEN` — Authentication token for the backend.
- `PORT` — Port used by the Next.js application.
- `NODE_ENV` — Application environment (`development` / `production`).
- `NEXT_PUBLIC_WS_URL` — WebSocket server URL used by the frontend.

For production, use:

```env
TOKEN= your-hash-token
NODE_ENV=production
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

> Do not commit `.env` or expose sensitive tokens.