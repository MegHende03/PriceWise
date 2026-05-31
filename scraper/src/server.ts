import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { runScrape } from './scrape';
import type { ScrapeRequest } from './types';

const app = express();
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.post('/scrape', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Partial<ScrapeRequest>;

    if (typeof body.url !== 'string' || typeof body.priceSelector !== 'string') {
        res.status(400).json({
            success: false,
            error: 'Both "url" and "priceSelector" are required',
            errorType: 'error',
        });
        return;
    }

    try {
        const result = await runScrape({
            url: body.url,
            priceSelector: body.priceSelector,
            availabilitySelector:
                typeof body.availabilitySelector === 'string' && body.availabilitySelector.trim()
                    ? body.availabilitySelector
                    : undefined,
            waitTimeMs: typeof body.waitTimeMs === 'number' ? body.waitTimeMs : undefined,
            proxyEnabled: Boolean(body.proxyEnabled),
        });
        res.status(result.success ? 200 : 502).json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ success: false, error: message, errorType: 'error' });
    }
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`PriceWise scraper listening on http://localhost:${port}`);
});
