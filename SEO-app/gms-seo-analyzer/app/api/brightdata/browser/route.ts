import { NextRequest, NextResponse } from 'next/server';
import { analyzePage } from '@/lib/brightdata';

export async function POST(request: NextRequest) {
    try {
        // Verify at least one Bright Data browser endpoint is configured
        const hasBrowserCredentials =
            !!process.env.BRIGHTDATA_SCRAPING_BROWSER_WSS ||
            !!process.env.BRIGHTDATA_BROWSER_WSS;
        if (!hasBrowserCredentials) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Browser API not configured. Add BRIGHTDATA_SCRAPING_BROWSER_WSS (or BRIGHTDATA_BROWSER_WSS) to your environment variables in the Vercel dashboard.',
                },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { url, country, city, device } = body;

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const result = await analyzePage({
            url: parsedUrl.href,
            country,
            city,
            device: device || 'desktop',
            timeout: 45000,
        });

        return NextResponse.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Browser API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'An unexpected error occurred',
            },
            { status: 500 }
        );
    }
}
