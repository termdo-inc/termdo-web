# Termdo Web

Terminal‑styled React web client for Termdo. It talks only to the public Gateway API under `/api`, which then proxies to the internal Auth and Tasks microservices. The production image serves a static build via Nginx and forwards `/api/*` to the gateway.

## Related Repositories

- termdo-gateway-api: Public API gateway and auth flow
- termdo-auth-api: Authentication and JWT issuance
- termdo-tasks-api: Task CRUD API
- termdo-db: PostgreSQL backing store (used by APIs)
- termdo-compose: Local multi‑service Docker Compose for the full stack
- termdo-chart / termdo-ci-chart: Helm charts for k8s deployment and CI

## Features

- Terminal UI: xterm.js with a custom theme and sizing (fit addon)
- Auth flows: login, signup, refresh, logout through the Gateway
- Tasks: list, view, create, edit, delete with rich table rendering
- Browser‑aware auth: gateway stores JWT in an HTTP‑only cookie for browser clients and strips it from the JSON body
- Debuggability: logs an aggregated `hostnames` object from gateway/auth/tasks
- Hardened static serving: Nginx adds CSP and other security headers

## Architecture

Browser → Nginx (serves SPA, proxies `/api/*`) → Gateway API → Auth API / Tasks API → PostgreSQL

The Gateway handles: cookie‑based browser auth (`X-Client-Browser: 1`), token forwarding, logout, and `hostnames` aggregation.

## Tech Stack

- UI: React 19, TypeScript, Vite 7
- Terminal: `@xterm/xterm` and `@xterm/addon-fit`
- Prod runtime: Nginx (Alpine), `/usr/share/nginx/html` + `/api` proxy
- Tooling: ESLint + Prettier, TypeScript project refs, Docker multi‑stage

## Repository Layout

- `source/components/`: React components (`Terminal`, `Main`, `Footer`, `App`)
- `source/app/`: Client logic (commands, services, helpers, config)
- `source/common/`: Shared API models and schemas (`ApiResponse`, `Hostnames`)
- `public/`: Static assets (fonts, favicon)
- `server/nginx.conf.template`: Nginx config (static + `/api` proxy and headers)
- `vite.config.ts`: Vite build/preview/server with `outDir=out`

## Environment

Copy `.env.example` to `.env` and set:

- `APP_PORT`: Port for Vite dev/preview (e.g., `5173`, `8080`) — used by Vite config
- `PUBLIC_APP_ENV`: Build‑time environment label shown in the footer (e.g., `local`, `staging`, `prod`). If unset, defaults to `local`. Embedded into the bundle at build time; changing it requires a rebuild.
- `PUBLIC_APP_VER`: Build‑time version string shown in the footer (e.g., `1.2.3`, git SHA). If unset, defaults to `latest`. Embedded into the bundle at build time; changing it requires a rebuild.
- `API_HOST`: Hostname for the Gateway (used by Nginx in container)
- `API_PORT`: Port for the Gateway (used by Nginx in container)

Note: Only variables prefixed with `PUBLIC_` are exposed to the client bundle (per `envPrefix` in `vite.config.ts`) and are embedded at build time into the static files. The app only calls `/api/*`; when running via Docker, Nginx uses `API_HOST`/`API_PORT` to reach the gateway. The Vite dev server does not proxy `/api` by default.

Build arguments: `PUBLIC_APP_ENV` and `PUBLIC_APP_VER`
- Purpose: Both values are displayed in the footer via `AppConfig` to indicate the deployment environment and version of the web client.
- Build‑time only: These are read during the Vite build. Updating them requires rebuilding the app (they cannot be changed at runtime of the Nginx container).
- Dockerfile: They are declared as `ARG` and forwarded to `ENV` so Vite can read them during `npm run build`.

Examples
- With Docker Compose (recommended): set them in `.env` and rebuild.
  - `.env`:
    - `PUBLIC_APP_ENV=prod`
    - `PUBLIC_APP_VER=1.2.3`
  - `docker compose build --no-cache && docker compose up`
- With `docker build` directly:
  - `docker build --build-arg PUBLIC_APP_ENV=staging --build-arg PUBLIC_APP_VER=$(git rev-parse --short HEAD) -t termdo-web:staging .`
- Local Vite (no Docker): place them in `.env` so the dev server and `npm run build` can read them, e.g. `PUBLIC_APP_ENV=local`, `PUBLIC_APP_VER=dev`.

## Quick Start

### Option A — Full Stack via termdo-compose (recommended)

Use the sibling `termdo-compose` repo to launch DB, Auth, Tasks, Gateway, and this Web app together on the shared `termdo-net` network.

1) Follow termdo-compose’s README to create env files and start the stack:

   - Web UI on `http://localhost:8000`
   - Gateway on `http://localhost:3000`

2) In this repo, no extra steps are required; Compose builds and runs the web image.

### Option B — This repo’s Compose

This builds the SPA and serves it through Nginx with `/api` proxying to the gateway.

```bash
docker compose up --build
```

Defaults:
- Web served on `http://localhost:8000`
- `/api/*` is proxied to `http://${API_HOST}:${API_PORT}`
- Header `X-Client-Browser: 1` is added by Nginx so the gateway stores JWT in an HTTP‑only cookie

Ensure `termdo-gateway-api` is running and reachable on the same Docker network. If both projects use `name: termdo`, set `API_HOST=gateway-api` and they will discover each other via `termdo-net`.

### Option C — Docker without Compose

```bash
npm ci
npm run build
docker build -t termdo-web:local .
docker run --rm \
  -e API_HOST=localhost -e API_PORT=3000 \
  -p 8000:80 termdo-web:local
```

Run the gateway separately on port `3000`.

### Option D — Local Development (Vite)

```bash
npm ci
cp .env.example .env   # set APP_PORT
npm run watch          # dev server on APP_PORT
```

Notes:
- The Vite dev server does not proxy `/api`. For end‑to‑end flows, prefer Docker (Nginx) or add a Vite proxy for `/api` pointing to the gateway.
- `npm run dev` runs `vite preview` (serves the built SPA from `out`); run `npm run build` first.

## Terminal Commands

Built‑in commands are shown by `help` and include:

- `help`: List commands
- `echo <text>`: Print text
- `whoami`: Current username (`root` by default)
- `which <cmd>`: Show a fake path for demo
- `history`: Show command history
- `date`: ISO timestamp
- `su <username> [password]`: Login (use `su root` to return to root)
- `adduser <username> <password>`: Create a user and login
- `exit`: Logout current user
- `ls [--sort <field>] [--order <asc|desc>] [--completed <true|false>]`: List tasks
- `touch "<title>" "<description>" [--completed]`: Create task
- `cat <task-id>`: Show task details
- `edit <task-id> "<title>" "<description>" [--completed <true|false>]`: Edit task
- `rm <task-id>`: Delete task

Authentication‑gated commands require a non‑root session (login or signup first).

## Nginx Behavior

- Serves static files and SPA fallback (`try_files ... /index.html`)
- Security headers: CSP, Referrer‑Policy, X‑Content‑Type‑Options, COOP/CORP, Permissions‑Policy
- Proxies `/api/*` to `http://${API_HOST}:${API_PORT}/` and adds `X-Client-Browser: 1`

## Development Scripts

- `npm run lint`: ESLint
- `npm run format`: Prettier
- `npm run clean`: Remove `out`
- `npm run build`: Type‑check then Vite build to `out`
- `npm run watch`: Vite dev server (`--host`) on `APP_PORT`
- `npm run dev`: Vite preview on `APP_PORT` (serves `out`)

## Integration Notes

- The web client only calls `/api/*`; the gateway must expose `/auth/*` and `/tasks/*` and be reachable from the web container.
- Gateway runs best with `COOKIE_IS_SECURE=true` behind HTTPS in production.
- For multi‑container local dev, run everything on the `termdo-net` network (as in `termdo-compose`).

## Troubleshooting

- 401/Session expired: login again (`su <user> <pass>`), confirm gateway reachable, and that the browser cookie domain/path matches.
- No `/api` in dev: use Docker (Nginx) or add a Vite proxy for `/api`.
- Port conflicts: change `APP_PORT` (dev/preview) or `ports` in Compose.

## License

MIT — see `LICENSE.md`.
