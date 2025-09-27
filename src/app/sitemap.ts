import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    return [
        { url: '/',  priority: 1.0 },
        { url: '/attendance',  priority: 0.9 },
        { url: '/calender',  priority: 0.8 },
        { url: '/gpacalc',  priority: 0.7 },
        { url: '/links',  priority: 0.7 },
        { url: '/login',  priority: 0.9 },
        { url: '/maintenance',  priority: 0.7 },
        { url: '/messmenu',  priority: 0.9 },
        { url: '/supadocs',  priority: 0.8 },
        { url: '/timetable',  priority: 0.9 },
    ];
}
