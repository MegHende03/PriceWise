const CURRENCY_SYMBOLS: ReadonlyArray<[string, string]> = [
    ['$', 'USD'],
    ['£', 'GBP'],
    ['€', 'EUR'],
    ['¥', 'JPY'],
    ['₹', 'INR'],
    ['₩', 'KRW'],
    ['R$', 'BRL'],
    ['₽', 'RUB'],
];

const ISO_CODE = /\b(USD|EUR|GBP|JPY|CAD|AUD|INR|KRW|BRL|RUB|CHF|CNY|MXN)\b/i;

/**
 * Best-effort extraction of a numeric price and currency from arbitrary price text
 * such as "$1,299.99", "1.299,99 €" or "USD 49.00". Returns value=null when no number
 * can be recovered. Thousands/decimal separators are disambiguated by position.
 */
export function parsePrice(raw: string): { value: number | null; currency: string | null } {
    const text = (raw ?? '').trim();
    if (!text) return { value: null, currency: null };

    let currency: string | null = null;
    for (const [symbol, code] of CURRENCY_SYMBOLS) {
        if (text.includes(symbol)) {
            currency = code;
            break;
        }
    }
    if (!currency) {
        const iso = text.match(ISO_CODE);
        if (iso) currency = iso[1].toUpperCase();
    }

    // Keep only digits and separators.
    let num = text.replace(/[^0-9.,]/g, '');
    if (!num) return { value: null, currency };

    const hasComma = num.includes(',');
    const hasDot = num.includes('.');

    if (hasComma && hasDot) {
        // The right-most separator is the decimal one.
        if (num.lastIndexOf(',') > num.lastIndexOf('.')) {
            num = num.replace(/\./g, '').replace(',', '.'); // 1.299,99 -> 1299.99
        } else {
            num = num.replace(/,/g, ''); // 1,299.99 -> 1299.99
        }
    } else if (hasComma) {
        const parts = num.split(',');
        // "1299,99" (decimal) vs "1,299" / "1,299,000" (thousands)
        if (parts.length === 2 && parts[1].length === 2) {
            num = `${parts[0]}.${parts[1]}`;
        } else {
            num = num.replace(/,/g, '');
        }
    }

    const value = Number.parseFloat(num);
    return { value: Number.isFinite(value) ? value : null, currency };
}
