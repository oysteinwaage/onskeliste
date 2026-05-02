export interface PrisjaktProdukt {
  id: string;
  navn: string;
  url: string;
  bildeUrl: string;
  pris?: number;
}

const CORS_PROXY = 'https://corsproxy.io/?';
const PRISJAKT_SUGGESTIONS_URL = 'https://www.prisjakt.no/api/search-suggestions';

export async function sokPrisjakt(sokeord: string): Promise<PrisjaktProdukt[]> {
  if (!sokeord || sokeord.trim().length < 2) return [];

  try {
    const prisjaktUrl = `${PRISJAKT_SUGGESTIONS_URL}?q=${encodeURIComponent(sokeord.trim())}`;
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(prisjaktUrl)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return [];

    const data = await response.json();
    return parseSuggestions(data);
  } catch {
    return [];
  }
}

function parseSuggestions(data: any): PrisjaktProdukt[] {
  const liste: any[] = Array.isArray(data) ? data : [];

  return liste
    .slice(0, 10)
    .flatMap(item => {
      const type = item.suggestion;

      if (type === 'product') {
        const p = item.product ?? {};
        const id = String(p.id ?? '');
        const navn = p.name ?? p.title ?? item.text ?? '';
        if (!navn || !id) return [];
        return [{
          id,
          navn,
          url: `https://www.prisjakt.no/product.php?p=${id}`,
          bildeUrl: `https://pricespy-75b8.kxcdn.com/product/standard/280/${id}.jpg`,
          pris: p.lowestPrice ?? p.price,
        }];
      }

      return [];
    });
}
