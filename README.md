# PriceWise

A price-tracking web scraper. Add a product URL plus a price selector, and PriceWise
periodically scrapes the page, records a price history, and shows everything in a grid with
per-item history charts.

## Architecture

Three services in one monorepo:

| Folder      | Stack                                   | Port | Responsibility                                   |
|-------------|-----------------------------------------|------|--------------------------------------------------|
| `frontend/` | React 19 + Vite + TypeScript, Ag Grid   | 5173 | Grid UI, Add/Edit form, price-history charts     |
| `backend/`  | Spring Boot 4 (Java 25) + JPA/MySQL      | 8080 | REST API, persistence, scheduled checks          |
| `scraper/`  | Node + TypeScript, Crawlee + Playwright | 4000 | `POST /scrape` — runs a headless-browser scrape  |

Crawlee + Playwright is Node-only, so scraping lives in its own service. The backend owns the
database and the scheduler, and calls the scraper over HTTP. Data flow:

```
React (5173) ──REST──▶ Spring Boot (8080) ──HTTP──▶ Node scraper (4000) ──Playwright──▶ website
                              │
                              └── MySQL: tracked_product, price_history
```

## Prerequisites

- Java 25 (the installed JDK; `backend/pom.xml` targets `java.version=25`)
- Node 18+ and npm
- A local MySQL 8 instance

## Run it (3 terminals)

### 1. Scraper

```powershell
cd scraper
npm install
npm run install:browser   # one-time: downloads Chromium for Playwright
npm start                 # http://localhost:4000
```

By default the scraper runs from your own IP with no proxy — the right choice for low-volume
tracking (see [Avoiding IP blocks](#avoiding-ip-blocks-free-approach)). A proxy pool is optional:
copy `.env.example` to `.env` and set `PROXY_URLS`.

### 2. Backend

> ⚠️ **This machine already has `SPRING_DATASOURCE_*` environment variables that point at a
> different project's database (`notes_app`), and in Spring Boot env vars override
> `application.properties`.** Set them explicitly for PriceWise (the URL auto-creates the
> `pricewise` schema):

```powershell
cd backend
$env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/pricewise?createDatabaseIfNotExist=true&serverTimezone=UTC'
$env:SPRING_DATASOURCE_USERNAME = 'youruser'
$env:SPRING_DATASOURCE_PASSWORD = 'yourpassword'
./mvnw.cmd spring-boot:run   # http://localhost:8080
```

Hibernate (`ddl-auto=update`) creates `tracked_product` and `price_history` on first boot.

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev   # http://localhost:5173
```

CORS is preconfigured for `http://localhost:5173`. Override the API base with
`VITE_API_BASE_URL` if needed.

## How it works

- **Add tracker** → fill in the form, click **Test tracker** to run a live scrape and see the
  JSON. Saving is gated on a successful test so broken selectors can't be saved.
- The backend schedules each tracker by its **check frequency**; a sweep runs due checks,
  records a `price_history` row on success, and updates the row's current price/status.
- **Status**: `ACTIVE`, `PAUSED`, `FAILED` (last scrape failed), `BLOCKED` (anti-bot/403/429).
- **Actions** per row: Edit, Test scrape, Pause/Resume, Delete.

## Avoiding IP blocks (free approach)

Price tracking is low-volume, so for personal use **you don't need paid proxies** — and shouldn't
rush to add them. Recommended setup:

- **Leave the proxy toggle off.** Your home (residential ISP) IP is the most trusted kind, and the
  scraper drives a real, fingerprinted Chromium. That combination scrapes most retailer pages fine
  on its own.
- **Keep retail check frequency at 6–24h.** That's far below any rate-limit threshold. The
  scheduler also adds ±15% random jitter to each next-check time, so requests don't fire at exact,
  robotic intervals.
- **Expect the occasional `BLOCKED` on the toughest sites** (Amazon, Best Buy, Walmart). They use
  per-request behavioral/CAPTCHA detection that *no* proxy — free or paid — reliably defeats. When
  it happens, the tracker just goes `BLOCKED` and stops auto-checking until you resume it; nothing
  breaks.

### Frequency vs. blocking
Two different mechanisms get conflated:
- **Rate-limiting** (too many requests too fast) — 6+ hours apart is nowhere near this.
- **Per-request bot detection** — runs on every request regardless of frequency, so lowering the
  frequency doesn't prevent it; your IP reputation and browser fingerprint matter more.

So 6h frequency is plenty for the rate-limit side; the behavioral side is handled — as well as it
can be — by the residential IP + real browser, not by how often you check.

### ⚠️ Don't use "free proxy lists"
Public free proxies from a web search are the one genuinely bad option: most are malicious or
honeypots (a security risk to route your traffic through), and their IPs are already blacklisted by
every major retailer, so they *increase* blocks. Your own residential IP is the better free "proxy".

### When paid proxies are actually worth it
Only once you're doing real volume (many products and/or frequent checks) or an important site
blocks your IP persistently. Then use **residential rotating** proxies — not datacenter ones, which
are blocked faster than your home IP — e.g. Bright Data, Oxylabs, Smartproxy/Decodo, or IPRoyal.
They bill per-GB and a product page is only a few MB, so low-volume cost is small.

To enable later with zero rework: set `PROXY_URLS` in `scraper/.env` (comma-separated; a single
rotating gateway URL like `http://user:pass@gateway.provider.com:7777` is typical) and flip a
tracker's proxy toggle on. Existing trackers keep working — nothing needs recreating.

## Caveats

Retailer markup and selectors change often, so a selector that works today may need updating later.
The **Test tracker** button (and the per-row **Test scrape** action) let you catch that quickly.

## Tests

```powershell
cd backend; ./mvnw.cmd test      # context load + JSON mapping, on in-memory H2 (no MySQL needed)
cd scraper; npm run typecheck
cd frontend; npm run build
```
