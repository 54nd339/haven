import ogs from 'open-graph-scraper';

interface OgData {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
}

export async function scrapeOgData(url: string): Promise<OgData | null> {
  try {
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          'User-Agent': 'HavenBot/1.0 (+https://haven.social)',
          Accept: 'text/html',
        },
      },
    });

    if (!result.success) return null;

    const imageUrl = result.ogImage && result.ogImage.length > 0 ? result.ogImage[0].url : null;

    return {
      url,
      title: result.ogTitle?.slice(0, 200) ?? null,
      description: result.ogDescription?.slice(0, 500) ?? null,
      imageUrl: imageUrl ?? null,
      siteName: result.ogSiteName?.slice(0, 100) ?? null,
    };
  } catch {
    return null;
  }
}
