# Termdo Web

Terminal-styled React web client for Termdo. Talks to the public Gateway API under `/api`, which proxies to the internal Auth and Tasks microservices.

This app works with:

- termdo-gateway-api: Public API gateway and auth flow
- termdo-auth-api: Authentication and JWT issuance
- termdo-tasks-api: Task CRUD API
- termdo-db: PostgreSQL backing store (used by APIs)
- termdo-infra: Infrastructure and deployment

## Features

- Terminal UI powered by xterm.js with custom theme
- Login, Signup, Logout, and full Tasks CRUD via Gateway
- Browser-friendly auth: token stored in HTTP-only cookie by the gateway
- Hostname telemetry: logs which services responded using aggregated `hostnames`
- Static build served by Nginx with strict security headers and `/api` proxy

## Tech Stack

- UI: React 19, TypeScript, Vite 7
- Terminal: `@xterm/xterm` + `@xterm/addon-fit`
- Runtime (prod): Nginx (Alpine) serving static assets with `/api` proxy to the gateway
- Lint/Format: ESLint + Prettier

## Getting Started

### Prerequisites

- Node `v24.6.0` (or `nvm use`)
- Docker and Docker Compose (recommended to get `/api` proxy working)
- `.env` file (see `.env.example`)

### Environment Variables

- `APP_PORT`: Port for the local dev server or preview
- `API_HOST`: Hostname for the Gateway API (used by Nginx in the container)
- `API_PORT`: Port for the Gateway API (used by Nginx in the container)

Create `.env` by copying `.env.example` and setting the values.

### Run with Docker Compose (recommended)

This builds the app and serves it through Nginx. The `/api` path is proxied to the Gateway.

```bash
docker compose up --build
```

Defaults:
- Web is served on `http://localhost:8000`
- Nginx proxies `/api/*` to `http://${API_HOST}:${API_PORT}` and sets `X-Client-Browser: 1` so the gateway stores JWT in a cookie.
- Ensure `termdo-gateway-api` is running and reachable (preferably on the shared `termdo-net` network). Set `API_HOST` to `gateway-api` if both Compose projects use `name: termdo` and the shared `termdo-net`.

### Local Build + Run using Docker (no Compose)

```bash
npm ci
npm run build
docker build -t termdo-web:local .
docker run --rm -e API_HOST=localhost -e API_PORT=3000 -p 8000:80 termdo-web:local
```

Then start the gateway separately on port `3000`.

### Local Development (Vite)

```bash
npm ci
npm run watch   # Vite dev server on APP_PORT
```

Note: The Vite dev server does not provide the `/api` proxy. For end-to-end flows, prefer Docker (Nginx) so `/api` routes to the Gateway. Alternatively, run a local reverse proxy or adjust Vite to proxy `/api` to the gateway.

## App Behavior

- All API requests go to `/api/...` and are proxied by Nginx to the Gateway API.
- The Gateway attaches/refreshes an HTTP-only `token` cookie for browser clients and strips the token from the JSON body.
- The app displays and logs `hostnames` of responding services for easier debugging.

## Security Headers (Nginx)

- Adds CSP, Referrer-Policy, X-Content-Type-Options, COOP/CORP, and a minimal Permissions-Policy.
- Static routes fallback to `index.html` for SPA behavior.

## Development

- Lint: `npm run lint`
- Format: `npm run format`
- Clean: `npm run clean`
- Build: `npm run build`
- Preview: `npm run dev` (serves the compiled app on `APP_PORT`)

## Integration Notes

- This client expects the Gateway to expose `/auth` and `/tasks` routes and to be reachable as configured via `API_HOST` and `API_PORT`.
- Gateway should run with `COOKIE_IS_SECURE=true` in production.
- All services should join the shared `termdo-net` network for name resolution across Compose projects.

## License

MIT — see `LICENSE.md`.
