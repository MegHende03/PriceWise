# PriceWise scraper service

A small HTTP wrapper around a [Crawlee](https://crawlee.dev) `PlaywrightCrawler`. The
Spring Boot backend calls this service to run on-demand and scheduled scrapes; it owns no
database of its own.

## Setup

```bash
npm install
npm run install:browser   # downloads the Chromium build Playwright drives (~150 MB)
cp .env.example .env       # then edit if you want a proxy pool / different port
```

## Run

```bash
npm run dev     # watch mode
npm start       # one-off
```

Listens on `http://localhost:4000` by default (`PORT` to change).

## API

`GET /health` → `{ "status": "ok" }`

`POST /scrape`

```json
{
  "url": "https://example.com/product",
  "priceSelector": ".price",
  "availabilitySelector": "#availability",
  "waitTimeMs": 10000,
  "proxyEnabled": false
}
```

Success (`200`):

```json
{
  "success": true,
  "price": 1299.99,
  "priceRaw": "$1,299.99",
  "currency": "USD",
  "availability": "In stock",
  "title": "Some Product",
  "url": "https://example.com/product",
  "scrapedAt": "2026-05-31T12:00:00.000Z",
  "proxyUsed": false
}
```

Failure (`502`): `success:false` with `errorType` one of
`selector_not_found | blocked | timeout | navigation | error`.

## Proxies (optional)

Scrapes run from your own IP by default — the right choice for low-volume tracking. Leave
`PROXY_URLS` empty and a tracker's `proxyEnabled` flag is a no-op.

Only add proxies for high volume or a site that persistently blocks you, and use **residential
rotating** proxies (not datacenter). Set `PROXY_URLS` to a comma-separated list — typically a
single rotating gateway URL, e.g. `http://user:pass@gateway.provider.com:7777`. Crawlee rotates
through the list with session management. See the root README's "Avoiding IP blocks" for the full
rationale.
