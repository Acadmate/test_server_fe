import { SitemapStream, streamToPromise } from 'sitemap';
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://acadmate.in';

export async function GET(req: NextRequest) {
    const links = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/attendance', changefreq: 'daily', priority: 0.9 },
        { url: '/calender', changefreq: 'weekly', priority: 0.8 },
        { url: '/gpacalc', changefreq: 'monthly', priority: 0.7 },
        { url: '/links', changefreq: 'weekly', priority: 0.7 },
        { url: '/login', changefreq: 'daily', priority: 0.9 },
        { url: '/maintenance', changefreq: 'weekly', priority: 0.7 },
        { url: '/messmenu', changefreq: 'monthly', priority: 0.9 },
        { url: '/supadocs', changefreq: 'weekly', priority: 0.8 },
        { url: '/timetable', changefreq: 'daily', priority: 0.9 },
    ];


    const sitemap = new SitemapStream({ hostname: BASE_URL });

    links.forEach((link) => sitemap.write(link));
    sitemap.end();

    const sitemapOutput = await streamToPromise(sitemap);

    return new NextResponse(sitemapOutput.toString(), {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
