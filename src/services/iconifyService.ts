const API_BASE = import.meta.env.VITE_ICONIFY_API_BASE;
const SEARCH_LIMIT = import.meta.env.VITE_ICONIFY_SEARCH_LIMIT;
const PREFIXES = import.meta.env.VITE_ICONIFY_PREFIXES;

export interface IconifySearchResult {
  icons: string[];
  total: number;
}

export async function searchIconifyIcons(query: string): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const url = `${API_BASE}/search?query=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}&prefixes=${PREFIXES}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Iconify API error: ${response.status}`);
    }

    const data: IconifySearchResult = await response.json();
    return data.icons || [];
  } catch (error) {
    console.error('Error searching Iconify icons:', error);
    return [];
  }
}

export function getIconifyIconUrl(iconId: string, color: string = 'c9a962'): string {
  return `${API_BASE}/${iconId}.svg?color=%23${color.replace('#', '')}`;
}
