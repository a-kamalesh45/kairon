# KAIRON Terminal

Internal development README for the current KAIRON Engine workspace. This is a truth-first document: it records what is actually implemented, what is mocked, what is randomized, what is hardcoded, and what should not be treated as production-ready.

## What This Repository Really Is

KAIRON is a hybrid simulation stack:

- A C++ matching engine consumes Redis order queues and emits execution events.
- A Node backend stores some execution history in MongoDB and forwards trade updates over WebSocket.
- A Next.js frontend presents the terminal UI, charting, portfolio, auth, settings, and landing pages.
- Several UI surfaces and API routes are demo-only, random, or synthetic.
- There are also two Express gateways in the tree, which is a source of confusion and duplication.

The codebase is functional enough to look like a trading system, but many important behaviors are still staged, hardcoded, or simulated.

## High-Level Architecture

```text
Binance WebSockets
                    |
                    v
market_data/mirror_bot.js
     - subscribes to a fixed asset list
     - scales floats by 10000
     - pushes payloads into Redis lists
                    |
                    v
Redis
     - orders:<symbol>
     - trade-updates pub/sub
                    |
                    +-----------------------------+
                    |                             |
                    v                             v
engine/main.cpp                  backend/server.js
     - 8 fixed threads              - Mongo + WebSocket gateway
     - in-memory matching           - persists trade updates
     - RESYNC magic string          - rebroadcasts trade updates
                    |                             |
                    |                             v
                    |                      frontend/app/*
                    |                      - charts
                    |                      - portfolio
                    |                      - auth
                    |                      - settings
                    v
api_gateway/server.js
     - legacy/alternate Express gateway
     - duplicates part of the backend surface
```

## The Main Truth: Real vs Simulated

Some parts are real enough to matter:

- The C++ engine does consume Redis queues and emit trade JSON.
- The Node backend can persist trade events in MongoDB.
- The frontend can render live price movements and chart updates.
- `frontend/app/api/history/route.ts` does call Binance for historical candles.

Some parts are not real and should be treated as demo scaffolding:

- Authentication route handlers in the Next.js app are mocked.
- Order history, open orders, activity, API keys, cancel, and account reset routes in the Next.js app are synthetic.
- Dashboard and portfolio balances are seeded and then moved by random walk updates.
- Depth order books are generated with `Math.random()`.
- Landing page ticker prices are hardcoded.
- The settings page can toggle fake latency and fake reset flows.
- Settlement is not linked end-to-end to authenticated user ownership.

## Folder-by-Folder Audit

### `backend/`

This folder is the more serious backend path, but it still contains hardcoded assumptions and incomplete settlement behavior.

#### `backend/models/User.js`

- Every new user starts with `100000` USDT by default.
- The asset universe is fixed to BTC, ETH, BNB, SOL, DOGE, LINK, XRP, and LTC.
- Preferences are hardcoded defaults: dark theme, UTC timezone, and standard risk mode.
- This is fine for a simulator seed state, but it should not be presented as a live brokerage balance model.

#### `backend/controllers/authController.js`

- Session IDs are randomly generated, which is fine.
- JWTs are signed with `process.env.JWT_SECRET`, which is correct in principle, but there is no indication in this repo that the auth surface is production-hardened.
- The login and register flows depend on the user model defaults above, so the initial balance is still synthetic.

#### `backend/controllers/tradeController.js`

- Market orders are simulated with sentinel prices: buy orders fall back to `999999`, sell orders fall back to `1`.
- That means the order is not truly market-driven; it is a fake stand-in for “execute immediately”.
- The order payload sent to Redis does not include the user ID, which means the C++ engine cannot know who actually placed a fill.
- Balance locking is better than nothing because it checks available funds atomically, but the locked asset logic is still only as good as the symbol mapping.
- This controller is one of the most important places where the system looks real but is still partially synthetic.

#### `backend/workers/settlement.js`

- This is not real clearing-house logic.
- It ignores user identity and grabs the first user in MongoDB.
- It only processes trades where `trade.qty >= 0.5`, which is a heuristic for “UI trades” rather than a real settlement rule.
- It infers the asset from `trade.symbol` instead of using a proper fill ownership model.
- This worker should not be treated as production settlement; it is a demo bridge.

#### `backend/server.js`

- Redis is hardcoded to `redis://127.0.0.1:6379`.
- The HTTP port defaults to `3001`.
- The server wires Redis into requests and persists `trade-updates` into MongoDB before broadcasting them to WebSocket clients.
- The Redis and port values should be configuration-driven rather than baked into the code.

### `api_gateway/`

This folder is a second Express gateway and overlaps with `backend/server.js`.

- It also hardcodes Redis to localhost and binds to port `3001`.
- It exposes `/order` and `/resync` endpoints with simplified behavior.
- Order IDs are just `Date.now()` values.
- If both this server and `backend/server.js` are run as-is, they compete for the same port and duplicate responsibility.
- This folder should be treated as legacy or experimental until the duplicate gateway story is resolved.

### `engine/`

The C++ engine is the most real part of the stack, but it still contains fixed infrastructure and demo hooks.

#### `engine/main.cpp`

- The active symbol list is hardcoded to eight assets: BTC, ETH, BNB, SOL, DOGE, LINK, XRP, and LTC.
- The engine creates exactly one thread per asset, so the concurrency model is fixed.
- Redis host and port are hardcoded to `127.0.0.1:6379`.
- The payload parser assumes a strict CSV shape and silently swallows malformed messages.
- `RESYNC` is a magic string command that forces a resync path.
- The main loop never exits normally; it just sleeps forever.

#### `engine/OrderBook.hpp`

- The resync path pushes a synthetic JSON message: `{ "type":"sys","msg":"RESYNC" }`.
- That is a system control message, not a real market event.
- It is useful for debugging, but it should not be confused with actual exchange behavior.

### `market_data/`

This folder is a Binance-to-Redis bridge, but it is still heavily configured by hardcoded assumptions.

#### `market_data/mirror_bot.js`

- The asset list is hardcoded to eight streams.
- Redis is hardcoded to `redis://localhost:6379`.
- The worker assumes Binance is the source of truth for live external prices.
- It converts all incoming floats into integer-scaled payloads using a fixed `10000` multiplier.
- This is functional, but not general-purpose or config-driven.

### `frontend/`

The frontend contains the largest amount of demo logic, synthetic data, and UI-only behavior.

#### Session and auth storage

##### `frontend/context/AuthContext.tsx`

- Tokens are persisted in browser storage under `kairon_token`.
- User state is also persisted in browser storage under `kairon_user`.
- The code uses both `localStorage` and `sessionStorage` depending on the remember flag.
- This is convenient for a demo, but it is not the strongest production approach for auth credentials.

#### Mock API routes

These route handlers are the clearest place where the app is explicitly fake or placeholder-based.

##### `frontend/app/api/auth/login/route.ts`

- This is a mock login handler.
- It only accepts `demo@kairon.com` with password `demo1234`.
- It waits 500 ms to simulate database latency.
- It returns a base64-encoded JSON string as a pretend token.
- This is not real JWT issuance.

##### `frontend/app/api/auth/register/route.ts`

- This is also mock logic.
- It waits 700 ms to simulate database latency.
- It blocks a fixed list of demo emails such as `existing@kairon.com` and `demo@kairon.com`.
- It returns a base64-encoded pretend token instead of a signed JWT.

##### `frontend/app/api/order/route.ts`

- Mock order placement endpoint.
- Returns `FILLED` immediately.
- Uses hardcoded fill prices: `88077.50` for buy and `88076.50` for sell.
- This should not be mistaken for real execution logic.

##### `frontend/app/api/cancel/route.ts`

- Mock cancel endpoint.
- Immediately returns `CANCELLED`.
- No ownership or order-state verification exists.

##### `frontend/app/api/activity/recent/route.ts`

- Generates mock activity records.
- Uses random timestamps within the last seven days.
- Does not verify JWTs yet.
- This is synthetic account activity.

##### `frontend/app/api/trades/history/route.ts`

- Generates 50 mock trades.
- Uses random asset selection, quantity, price, fee, PnL, and timestamps.
- This is not sourced from MongoDB.

##### `frontend/app/api/orders/history/route.ts`

- Generates mock filled order history.
- Uses random prices, sizes, realized PnL, and timestamps.
- The response is presentation data, not persisted trade data.

##### `frontend/app/api/orders/open/route.ts`

- Generates mock open orders.
- Uses random fill percentages and timestamps.
- This is not derived from the C++ engine or the backend database.

##### `frontend/app/api/keys/generate/route.ts`

- Generates random API key and secret strings.
- The secrets are not actually stored or hashed here.
- The endpoint is a placeholder for real key management.

##### `frontend/app/api/keys/list/route.ts`

- Returns a fixed mock key list.
- This is synthetic and not backed by a real database lookup.

##### `frontend/app/api/keys/revoke/route.ts`

- Accepts a key ID and returns success after a delay.
- No real revocation state is updated.

##### `frontend/app/api/account/reset/route.ts`

- Pretends to reset the account.
- Waits 1 second and then reports success.
- Does not actually delete trades, orders, or wallet state.

##### `frontend/app/api/history/route.ts`

- This one is real-ish, but it is still hardcoded.
- It always calls Binance with `interval=1h`.
- It ignores the caller’s requested interval, which conflicts with the trade page’s `interval=1m` request.
- This mismatch is one of the most important technical problems in the UI.

##### `frontend/app/api/health/route.ts`

- This is a simple static health check.
- It returns `{ status: 'ok' }` and a timestamp.

#### Pages with hardcoded or random UI state

##### `frontend/app/dashboard/page.tsx`

- The starting portfolio holdings are fixed.
- The live price feed is not a real socket feed; it is a random walk driven by `Math.random()` every 2 seconds.
- USDT balance starts at `100000` and is locally mutated.
- The recent activity panel depends on the mock activity route above.
- The quick actions area explicitly says “Simulation Mode — Demo Funds Only”, which is accurate.

##### `frontend/app/portfolio/page.tsx`

- Like the dashboard, holdings are hardcoded and prices drift randomly.
- Trade history comes from the mock trades endpoint.
- There is a polling call to `checkAuth()` every 3 seconds, which is a UI-level refresh pattern rather than a robust account sync model.
- The page exports CSV from the synthetic trade list, so exported history is only as real as the mock data feeding it.

##### `frontend/app/status/page.tsx`

- The page starts every service in the `operational` state.
- Only the REST API health check is actually real.
- The other services get random response-time offsets and remain operational by default.
- This is a status dashboard veneer, not a full service monitor.

##### `frontend/app/markets/[symbol]/page.tsx`

- The crypto catalog is a fixed in-file lookup table.
- Candlestick data is generated with `Math.random()`.
- The timeframe selector only changes local state; it does not drive real history retrieval.
- This page is presentation-layer simulation, not market data replay.

##### `frontend/app/not-found.tsx`

- The not-found page is intentionally theatrical.
- It runs a scripted terminal-style diagnostic sequence.
- The snake mini-game uses random food placement.
- This is an easter egg / UX flourish, not application behavior.

##### `frontend/app/page.tsx`

- The landing page makes strong claims about deterministic ordering, Kafka event sourcing, LMAX-style architecture, microsecond accuracy, and no randomized fills.
- Those claims are not fully supported by the current codebase.
- The landing page should be treated as aspirational marketing copy unless the implementation is brought into alignment.

##### `frontend/app/settings/page.tsx`

- The API key management UI depends on the mock key routes above.
- The reset-account flow depends on the mock reset route above.
- The “artificial latency” toggle stores `kairon_latency` in localStorage and only simulates a delay indicator.
- This is a simulation control panel, not a real operations console.

##### `frontend/app/legal/terms/page.tsx`

- This page correctly states that the platform is a simulation and that orders, trades, and market data are simulated.
- That disclaimer is important because other parts of the site sometimes sound more production-grade than the code currently is.

##### `frontend/app/legal/privacy/page.tsx`

- The privacy policy says simulated orders, trades, and portfolio data are stored for continuity.
- It also claims JWT validation, encrypted API keys, and HTTPS/TLS security controls that are not uniformly demonstrated by the code in this repo.
- Treat it as policy text, not proof of implementation.

#### Trading terminal and charting

##### `frontend/app/trade/page.tsx`

This is one of the most important files in the repository, and it mixes real, fake, and hardcoded behavior.

- It loads history from `/api/history?symbol=...&interval=1m`, but the history route ignores the interval and always uses Binance `1h` candles.
- It opens a WebSocket to `ws://localhost:3001`, which depends on the Express gateway being up locally.
- It loads open orders and order history from the mock Next.js routes, not from MongoDB-backed production data.
- It submits live orders to `http://localhost:3001/order`, which is a different backend surface than the mock Next.js order route.
- The current order book depth is generated with `Math.random()` in `generateOrderBook`.
- Trade IDs are generated with `Math.random().toString(36)`.
- The page seeds a fixed favorites set and fixed fallback prices.
- The displayed available balance is hardcoded in the UI at one point, which is not a database truth source.
- The `RESYNC ENGINE` action is a special control path, not a real exchange feature.

##### `frontend/app/trade/hooks/useOrderBook.ts`

- Generates asks and bids with random quantities around a center price.
- This is fake liquidity used for display.

##### `frontend/app/trade/hooks/useWebSocket.ts`

- Generates random trade IDs for incoming events.
- The candle aggregation is fixed to minute boundaries.
- It assumes the live socket payload format is already valid.

##### `frontend/app/trade/page.backup.tsx`

- This backup copy contains the same class of random IDs, mock order book depth, and hardcoded trade-panel assumptions.
- If this file remains in the tree, it is easy for it to diverge from the real page and confuse maintenance.

#### Landing page components

##### `frontend/components/LandingPage/Ticker.tsx`

- The ticker is fully hardcoded.
- Prices and percentage changes do not come from live data.
- It includes a KAIRON easter egg entry.

##### `frontend/components/LandingPage/Globe.tsx`

- Hub coordinates are static, but their type and size are randomized on load.
- Route arc dash offsets and ring repeat periods are randomized.
- It fetches GeoJSON from a GitHub raw URL at runtime.
- This is a visual demo asset, not a reliable production data source.

##### `frontend/components/LandingPage/Globe2.tsx`

- The file exists alongside the main globe component and should be reviewed carefully if both are used.
- Any duplicated globe implementation increases the risk of divergence and stale effects.

#### Notifications and modals

##### `frontend/components/NotificationProvider.tsx`

- Notifications are simulated every 20 seconds when a token exists.
- Types and messages are randomly chosen from a fixed list.
- This is not a real event stream.

##### `frontend/components/AuthModal.tsx`

- The modal uses placeholder names and emails such as `Avery Morgan`, `kairon_ops`, and `trader@kairon.com`.
- These are presentation defaults, but they contribute to the demo feel of the app.

##### `frontend/components/CommandPalette.tsx`

- The command palette uses placeholder prompt text.
- This is fine as UX copy, but not a system truth source.

#### Generated frontend artifacts

- `frontend/.next/` is build output and should never be treated as source.
- `frontend/tsconfig.tsbuildinfo` is generated TypeScript build metadata.
- Anything under `.next` should be ignored for documentation and implementation truth.

## Mixed Backend Surfaces You Need To Know About

The frontend does not talk to one clean backend. It talks to multiple surfaces:

- Next.js route handlers under `frontend/app/api/*` for mock auth, mock account data, mock key management, and mock order lists.
- The Express backend under `backend/server.js` for live trade persistence and WebSocket broadcast.
- The legacy Express gateway under `api_gateway/server.js` for order and resync traffic.
- Binance directly for historical candles in `frontend/app/api/history/route.ts`.

This means two screens that look related may be backed by totally different data sources.

## The Biggest Things That Should Not Stay As-Is

1. Auth tokens are stored in browser storage. That is convenient for the demo, but not ideal for a hardened deployment.
2. There are two Express servers in the tree with overlapping responsibilities and the same default port.
3. Settlement does not preserve user ownership from order entry to fill to wallet update.
4. Several important UI panels use synthetic data that looks live but is not.
5. Historical candles and live chart aggregation are out of sync.
6. Redis, port numbers, asset lists, and fallback prices are hardcoded in multiple places.
7. The landing page and legal text sound more production-ready than the code actually is.

## Concrete Mismatches To Fix First

1. Align `frontend/app/api/history/route.ts` with the selected timeframe in `frontend/app/trade/page.tsx`.
2. Stop generating fake depth in `frontend/app/trade/hooks/useOrderBook.ts` unless it is explicitly labeled as simulation-only.
3. Thread user identity through `backend/controllers/tradeController.js`, the engine, and `backend/workers/settlement.js`.
4. Pick one backend gateway path and retire or isolate the duplicate.
5. Move Redis host/port and other infrastructure values to environment variables.
6. Replace mock auth, activity, orders, keys, and reset routes with real database-backed implementations or clearly label them as demo-only.
7. Remove generated build artifacts from source control and keep them out of the documentation path.

## Local Run Instructions

### 1. Compile The C++ Engine

From the `engine/` directory:

```bash
g++ -o kairon main.cpp OrderBook.cpp -lws2_32
```

### 2. Boot The Node Services

The repository currently has two Express servers. Do not assume they are interchangeable.

```bash
cd backend
npm install
node server.js
```

```bash
cd api_gateway
npm install
node server.js
```

If you start both without changing ports, they will compete for the same default port.

### 3. Start The Market Data Worker

```bash
cd market_data
npm install
node mirror_bot.js
```

### 4. Start The Frontend

```bash
cd frontend
npm install
npm run dev
```

## Final Notes

- This repository is production-shaped, not production-complete.
- Some parts are real infrastructure, some are demo scaffolding, and some are a mix of both.
- Treat every item listed above as implementation truth until it is explicitly replaced.
- If a page or API route looks authoritative but is listed here as synthetic, believe this README instead of the UI copy.