import type {
    SerpData,
    KeywordsData,
    DomainAnalyticsData,
    LabsData,
    BacklinksSummary,
    OnPageData,
    ContentData,
    MerchantData,
    AppData,
    BusinessData,
    AppendixData,
    AiOptimizationData,
    AiReportData,
    TrendsData,
} from '@/types';

/**
 * Simple deterministic hash for a domain string.
 * Returns a float between 0 and 1 so every domain gets
 * reproducible but *different* mock stats.
 */
function hashDomain(domain: string): number {
    let h = 0;
    for (let i = 0; i < domain.length; i++) {
        h = ((h << 5) - h + domain.charCodeAt(i)) | 0;
    }
    return Math.abs(h % 1000) / 1000;          // 0 → 0.999
}

/** Vary a base value ±40 % based on domain hash */
function vary(base: number, seed: number): number {
    return Math.round(base * (0.6 + seed * 0.8));  // range: 60 %–140 %
}

export function getMockSerpData(domain: string): SerpData {
    return {
        results: [
            { position: 1, title: `${domain} — Official Website`, url: `https://${domain}`, snippet: `Welcome to ${domain}. We provide industry-leading solutions for businesses worldwide.` },
            { position: 2, title: `${domain} Reviews 2024`, url: `https://www.trustpilot.com/review/${domain}`, snippet: `Read trusted customer reviews of ${domain}. Rated 4.5/5 stars based on 1,200+ reviews.` },
            { position: 3, title: `${domain} — Wikipedia`, url: `https://en.wikipedia.org/wiki/${domain}`, snippet: `${domain} is a technology company founded in 2010, specializing in digital solutions.` },
            { position: 4, title: `${domain} vs Competitors — Full Comparison`, url: `https://www.g2.com/products/${domain}`, snippet: `Compare ${domain} with top alternatives. See features, pricing, and user reviews side by side.` },
            { position: 5, title: `${domain} Pricing Plans & Features`, url: `https://${domain}/pricing`, snippet: `Explore ${domain} pricing tiers. Free trial available. Enterprise plans starting at $99/mo.` },
            { position: 6, title: `Is ${domain} Worth It? In-Depth Review`, url: `https://www.pcmag.com/reviews/${domain}`, snippet: `Our experts tested ${domain} for 3 months. Here's everything you need to know.` },
            { position: 7, title: `${domain} Blog — Industry Insights`, url: `https://${domain}/blog`, snippet: `Latest articles and insights from ${domain}. Stay updated with industry trends.` },
            { position: 8, title: `${domain} LinkedIn`, url: `https://www.linkedin.com/company/${domain}`, snippet: `${domain} | 5,200 followers on LinkedIn. Innovation meets excellence.` },
            { position: 9, title: `${domain} — Crunchbase`, url: `https://www.crunchbase.com/organization/${domain}`, snippet: `${domain} has raised $45M in funding. Last round: Series B in 2023.` },
            { position: 10, title: `${domain} Support & Help Center`, url: `https://${domain}/support`, snippet: `Get help with ${domain}. FAQ, documentation, and live chat support available 24/7.` },
        ],
        features: [
            { type: 'featured_snippet', present: true },
            { type: 'knowledge_panel', present: true },
            { type: 'people_also_ask', present: true },
            { type: 'local_pack', present: false },
            { type: 'image_pack', present: true },
            { type: 'video_carousel', present: false },
            { type: 'site_links', present: true },
            { type: 'top_stories', present: false },
            { type: 'shopping_results', present: false },
            { type: 'twitter_carousel', present: true },
        ],
    };
}

export function getMockKeywordsData(domain: string): KeywordsData {
    const s = hashDomain(domain);
    return {
        totalKeywords: vary(3847, s),
        avgDifficulty: Math.round(25 + s * 40),
        keywords: [
            { keyword: `${domain.split('.')[0]} login`, searchVolume: vary(14800, s), cpc: +(2.45 + s * 3).toFixed(2), competition: 0.15, competitionLevel: 'Low', keywordDifficulty: Math.round(20 + s * 15), position: 1 },
            { keyword: `${domain.split('.')[0]} pricing`, searchVolume: vary(9900, s), cpc: +(4.80 + s * 2).toFixed(2), competition: 0.45, competitionLevel: 'Medium', keywordDifficulty: Math.round(30 + s * 20), position: 2 },
            { keyword: `${domain.split('.')[0]} review`, searchVolume: vary(8100, s), cpc: +(3.20 + s * 2).toFixed(2), competition: 0.42, competitionLevel: 'Medium', keywordDifficulty: Math.round(35 + s * 20), position: 3 },
            { keyword: `best ${domain.split('.')[0]} alternatives`, searchVolume: vary(6600, s), cpc: +(5.10 + s * 2).toFixed(2), competition: 0.78, competitionLevel: 'High', keywordDifficulty: Math.round(50 + s * 20), position: Math.round(3 + s * 5) },
            { keyword: `${domain.split('.')[0]} features`, searchVolume: vary(5400, s), cpc: +(3.90 + s * 2).toFixed(2), competition: 0.38, competitionLevel: 'Medium', keywordDifficulty: Math.round(28 + s * 20), position: 4 },
            { keyword: `${domain.split('.')[0]} free trial`, searchVolume: vary(4200, s), cpc: +(6.30 + s * 2).toFixed(2), competition: 0.72, competitionLevel: 'High', keywordDifficulty: Math.round(45 + s * 20), position: Math.round(4 + s * 5) },
            { keyword: `${domain.split('.')[0]} api`, searchVolume: vary(3800, s), cpc: +(2.10 + s * 2).toFixed(2), competition: 0.22, competitionLevel: 'Low', keywordDifficulty: Math.round(20 + s * 20), position: Math.round(5 + s * 5) },
            { keyword: `${domain.split('.')[0]} tutorial`, searchVolume: vary(3200, s), cpc: +(1.80 + s * 2).toFixed(2), competition: 0.18, competitionLevel: 'Low', keywordDifficulty: Math.round(15 + s * 20), position: Math.round(6 + s * 5) },
            { keyword: `${domain.split('.')[0]} integrations`, searchVolume: vary(2800, s), cpc: +(4.50 + s * 2).toFixed(2), competition: 0.48, competitionLevel: 'Medium', keywordDifficulty: Math.round(30 + s * 20), position: Math.round(7 + s * 5) },
            { keyword: `${domain.split('.')[0]} support`, searchVolume: vary(2400, s), cpc: +(1.50 + s * 2).toFixed(2), competition: 0.12, competitionLevel: 'Low', keywordDifficulty: Math.round(12 + s * 15), position: Math.round(8 + s * 5) },
            { keyword: `${domain.split('.')[0]} vs competitor`, searchVolume: vary(2100, s), cpc: +(5.80 + s * 2).toFixed(2), competition: 0.82, competitionLevel: 'High', keywordDifficulty: Math.round(48 + s * 20), position: Math.round(10 + s * 5) },
            { keyword: `${domain.split('.')[0]} enterprise`, searchVolume: vary(1800, s), cpc: +(8.20 + s * 2).toFixed(2), competition: 0.88, competitionLevel: 'High', keywordDifficulty: Math.round(55 + s * 20), position: Math.round(12 + s * 5) },
        ],
        topKeywords: [],
    };
}

export function getMockDomainAnalyticsData(domain: string): DomainAnalyticsData {
    const s = hashDomain(domain);
    return {
        domainRank: Math.round(30 + s * 60),
        organicTraffic: vary(156420, s),
        paidTraffic: vary(8340, s),
        organicKeywords: vary(3847, s),
        paidKeywords: vary(124, s),
        backlinks: vary(42680, s),
        referringDomains: vary(1893, s),
        authorityScore: Math.round(25 + s * 60),
    };
}

/**
 * Generate plausible-looking competitor domains derived from the target domain.
 * Uses the domain name + common industry TLD patterns so results look realistic.
 */
function deriveCompetitorDomains(domain: string, seed: number): string[] {
    const name = domain.split('.')[0].toLowerCase();
    const tld = domain.includes('.') ? domain.split('.').slice(1).join('.') : 'com';

    // Pools of suffixes/prefixes that look like real SaaS / brand competitors
    const suffixPool = ['hub', 'pro', 'hq', 'app', 'io', 'ly', 'ify', 'base', 'desk', 'suite', 'lab', 'ai'];
    const prefixPool = ['get', 'try', 'use', 'go', 'my', 'the', 'one', 'all', 'team'];
    const altTldPool = ['io', 'co', 'app', 'ai', 'dev', 'net', 'org', 'com'];

    // Deterministically pick from pools using seed offsets
    const pick = <T>(arr: T[], offset: number): T => arr[Math.abs(Math.round(seed * 1000 + offset)) % arr.length];

    return [
        `${name}${pick(suffixPool, 0)}.${tld}`,
        `${pick(prefixPool, 1)}${name}.${tld}`,
        `${name}${pick(suffixPool, 2)}.${pick(altTldPool, 3)}`,
        `${pick(prefixPool, 4)}${name}${pick(suffixPool, 5)}.${tld}`,
        `${name}-${pick(suffixPool, 6)}.${pick(altTldPool, 7)}`,
    ];
}

export function getMockLabsData(domain: string): LabsData {
    const s = hashDomain(domain);
    const competitorDomains = deriveCompetitorDomains(domain, s);
    return {
        estimatedTraffic: vary(156420, s),
        competitors: [
            { domain: competitorDomains[0], organicTraffic: vary(234500, s), organicKeywords: vary(5200, s), rank: Math.round(60 + s * 20), commonKeywords: vary(1200, s) },
            { domain: competitorDomains[1], organicTraffic: vary(189300, s), organicKeywords: vary(4100, s), rank: Math.round(50 + s * 25), commonKeywords: vary(980, s) },
            { domain: competitorDomains[2], organicTraffic: vary(145600, s), organicKeywords: vary(3800, s), rank: Math.round(45 + s * 25), commonKeywords: vary(750, s) },
            { domain: competitorDomains[3], organicTraffic: vary(98700, s), organicKeywords: vary(2900, s), rank: Math.round(40 + s * 25), commonKeywords: vary(520, s) },
            { domain: competitorDomains[4], organicTraffic: vary(312000, s), organicKeywords: vary(8400, s), rank: Math.round(70 + s * 20), commonKeywords: vary(1800, s) },
        ],
    };
}

export function getMockBacklinksData(domain: string): BacklinksSummary {
    const s = hashDomain(domain);
    return {
        totalBacklinks: vary(42680, s),
        referringDomains: vary(1893, s),
        domainRank: Math.round(30 + s * 60),
        dofollow: vary(31200, s),
        nofollow: vary(11480, s),
        topReferringDomains: [
            { domain: 'techcrunch.com', backlinks: vary(342, s), rank: 92 },
            { domain: 'forbes.com', backlinks: vary(218, s), rank: 95 },
            { domain: 'medium.com', backlinks: vary(186, s), rank: 88 },
            { domain: 'github.com', backlinks: vary(145, s), rank: 90 },
            { domain: 'producthunt.com', backlinks: vary(120, s), rank: 82 },
            { domain: 'reddit.com', backlinks: vary(98, s), rank: 91 },
            { domain: 'stackoverflow.com', backlinks: vary(87, s), rank: 89 },
            { domain: 'youtube.com', backlinks: vary(76, s), rank: 98 },
        ],
        topAnchors: [
            { anchor: domain, count: vary(520, s) },
            { anchor: `${domain} reviews`, count: vary(180, s) },
            { anchor: 'click here', count: vary(95, s) },
            { anchor: `visit ${domain.split('.')[0]}`, count: vary(72, s) },
            { anchor: `${domain.split('.')[0]} official`, count: vary(58, s) },
        ],
    };
}

export function getMockOnPageData(domain: string): OnPageData {
    const s = hashDomain(domain);
    return {
        totalPages: vary(248, s),
        onPageScore: Math.round(40 + s * 55),
        criticalCount: Math.round(1 + s * 6),
        warningCount: Math.round(4 + s * 18),
        noticeCount: Math.round(2 + s * 10),
        crawledPages: vary(248, s),
        issues: [
            { type: 'Missing meta descriptions', count: vary(18, s), severity: 'warning' as const, description: 'Pages without meta description tags may have lower CTR in search results.' },
            { type: 'Duplicate title tags', count: vary(5, s), severity: 'critical' as const, description: 'Multiple pages share the same title tag, causing ranking conflicts.' },
            { type: 'Broken internal links (4xx)', count: vary(8, s), severity: 'critical' as const, description: 'Internal links pointing to non-existent pages hurt crawlability and UX.' },
            { type: 'Images without alt attributes', count: vary(34, s), severity: 'warning' as const, description: 'Images missing alt text reduce accessibility and image search visibility.' },
            { type: 'Pages with low word count', count: vary(12, s), severity: 'warning' as const, description: 'Thin content pages with < 300 words may not rank well.' },
            { type: 'Missing H1 tags', count: vary(3, s), severity: 'critical' as const, description: 'Pages without an H1 heading lack a clear primary topic signal.' },
            { type: 'Slow page load (>3s)', count: vary(7, s), severity: 'warning' as const, description: 'Pages taking over 3 seconds to load lead to higher bounce rates.' },
            { type: 'Missing canonical tags', count: vary(9, s), severity: 'warning' as const, description: 'Pages without canonical tags risk duplicate content issues.' },
            { type: 'Non-HTTPS resources', count: vary(2, s), severity: 'warning' as const, description: 'Mixed content warnings reduce trust and may block resources.' },
        ],
    };
}

export function getMockContentData(domain: string): ContentData {
    const s = hashDomain(domain);
    return {
        contentScore: Math.round(35 + s * 60),
        totalContent: vary(186, s),
        duplicateWarnings: Math.round(1 + s * 8),
        readabilityScore: Math.round(45 + s * 45),
        topContent: [
            { title: 'Getting Started Guide', url: `https://${domain}/docs/getting-started`, score: Math.round(80 + s * 15), wordCount: vary(2400, s) },
            { title: 'Product Features Overview', url: `https://${domain}/features`, score: Math.round(75 + s * 18), wordCount: vary(1800, s) },
            { title: 'Industry Best Practices Blog', url: `https://${domain}/blog/best-practices`, score: Math.round(70 + s * 20), wordCount: vary(3200, s) },
            { title: 'API Documentation', url: `https://${domain}/docs/api`, score: Math.round(68 + s * 22), wordCount: vary(5600, s) },
            { title: 'Customer Success Stories', url: `https://${domain}/case-studies`, score: Math.round(60 + s * 25), wordCount: vary(1500, s) },
        ],
    };
}

export function getMockMerchantData(): MerchantData {
    return {
        hasPresence: false,
        products: [],
    };
}

export function getMockAppData(): AppData {
    return {
        hasApp: false,
        apps: [],
    };
}

export function getMockBusinessData(domain: string): BusinessData {
    return {
        hasProfile: true,
        name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
        rating: 4.3,
        reviewCount: 847,
        category: 'Technology Company',
        address: '123 Innovation Drive, San Francisco, CA 94105',
        phone: '+1 (415) 555-0123',
        website: `https://${domain}`,
        reviews: [
            { author: 'Sarah M.', rating: 5, text: 'Excellent service and support. The platform has helped us grow our organic traffic by 150% in 6 months.' },
            { author: 'James T.', rating: 4, text: 'Great tool with lots of features. The learning curve is a bit steep but worth it.' },
            { author: 'Maria L.', rating: 5, text: 'Best investment we made for our marketing team. The AI reports are incredibly insightful.' },
            { author: 'David K.', rating: 3, text: 'Good product overall. Would like to see more integrations with third-party tools.' },
            { author: 'Emily R.', rating: 5, text: 'The competitive analysis feature alone is worth the price. Highly recommend!' },
        ],
    };
}

export function getMockAppendixData(): AppendixData {
    return {
        totalApiCalls: 12,
        responseTimes: [
            { module: 'SERP', timeMs: 1240 },
            { module: 'Keywords', timeMs: 2100 },
            { module: 'Domain Analytics', timeMs: 890 },
            { module: 'Labs', timeMs: 1560 },
            { module: 'Backlinks', timeMs: 1890 },
            { module: 'On-Page', timeMs: 4200 },
            { module: 'Content', timeMs: 1100 },
            { module: 'Merchant', timeMs: 320 },
            { module: 'App Data', timeMs: 280 },
            { module: 'Business', timeMs: 980 },
            { module: 'Appendix', timeMs: 150 },
            { module: 'AI Optimization', timeMs: 1780 },
        ],
        rawData: { note: 'Demo mode — showing sample data' },
        dataTimestamps: [
            { module: 'SERP', timestamp: new Date().toISOString() },
            { module: 'Keywords', timestamp: new Date().toISOString() },
            { module: 'Domain Analytics', timestamp: new Date().toISOString() },
            { module: 'Labs', timestamp: new Date().toISOString() },
            { module: 'Backlinks', timestamp: new Date().toISOString() },
            { module: 'On-Page', timestamp: new Date().toISOString() },
            { module: 'Content', timestamp: new Date().toISOString() },
            { module: 'Business', timestamp: new Date().toISOString() },
            { module: 'AI Optimization', timestamp: new Date().toISOString() },
            { module: 'Trends', timestamp: new Date().toISOString() },
        ],
    };
}

export function getMockAiOptimizationData(domain: string): AiOptimizationData {
    return {
        optimizationTips: [
            `Improve page load speed — 7 pages on ${domain} take over 3 seconds to load. Compress images and enable lazy loading.`,
            'Add structured data (Schema.org) to product pages and blog posts to enable rich snippets in search results.',
            'Create a comprehensive internal linking strategy — top-performing pages have an average of 8 internal links.',
            `Target long-tail keywords with lower difficulty (KD < 30) to build topical authority in your niche.`,
            'Optimize meta descriptions for CTR — 18 pages are missing descriptions, which hurts click-through rates.',
            'Build more dofollow backlinks from high-authority domains (DA > 60) to strengthen domain authority.',
        ],
        keywordSuggestions: [
            { keyword: `best ${domain.split('.')[0]} tools 2024`, searchVolume: 4800, difficulty: 32 },
            { keyword: `${domain.split('.')[0]} for small business`, searchVolume: 3200, difficulty: 28 },
            { keyword: `how to use ${domain.split('.')[0]}`, searchVolume: 2900, difficulty: 18 },
            { keyword: `${domain.split('.')[0]} alternatives free`, searchVolume: 2400, difficulty: 35 },
            { keyword: `${domain.split('.')[0]} roi calculator`, searchVolume: 1800, difficulty: 22 },
            { keyword: `${domain.split('.')[0]} case studies`, searchVolume: 1500, difficulty: 25 },
        ],
        sentimentAnalysis: {
            score: 78,
            overall: 'Positive',
            breakdown: [
                { aspect: 'Product Quality', sentiment: 'Positive', score: 85 },
                { aspect: 'Customer Support', sentiment: 'Positive', score: 78 },
                { aspect: 'Pricing', sentiment: 'Neutral', score: 62 },
                { aspect: 'Ease of Use', sentiment: 'Positive', score: 80 },
                { aspect: 'Documentation', sentiment: 'Positive', score: 72 },
            ],
        },
    };
}

export function getMockTrendsData(domain: string): TrendsData {
    const keyword = domain.split('.')[0];
    const months = ['2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'];
    const values = [42, 48, 55, 62, 58, 71, 68, 75, 82, 78, 85, 91];
    return {
        keyword,
        interestOverTime: months.map((m, i) => ({ date: `${m}-01`, value: values[i] })),
        interestByRegion: [
            { region: 'California', value: 100, geoCode: 'US-CA' },
            { region: 'New York', value: 88, geoCode: 'US-NY' },
            { region: 'Texas', value: 76, geoCode: 'US-TX' },
            { region: 'Florida', value: 72, geoCode: 'US-FL' },
            { region: 'Illinois', value: 65, geoCode: 'US-IL' },
            { region: 'Washington', value: 61, geoCode: 'US-WA' },
            { region: 'Massachusetts', value: 58, geoCode: 'US-MA' },
            { region: 'Colorado', value: 52, geoCode: 'US-CO' },
        ],
        relatedQueries: [
            { query: `${keyword} pricing`, value: 100 },
            { query: `${keyword} review`, value: 85 },
            { query: `${keyword} vs competitor`, value: 72 },
            { query: `${keyword} tutorial`, value: 68 },
            { query: `${keyword} api`, value: 55 },
            { query: `${keyword} login`, value: 48 },
        ],
        risingQueries: [
            { query: `${keyword} ai features`, value: 5000, rising: true },
            { query: `${keyword} 2026 update`, value: 3200, rising: true },
            { query: `best ${keyword} alternatives`, value: 450, rising: true },
            { query: `${keyword} enterprise plan`, value: 280, rising: true },
            { query: `${keyword} integration guide`, value: 180, rising: true },
        ],
        relatedTopics: [
            { query: 'SEO Tools', value: 100 },
            { query: 'Digital Marketing', value: 78 },
            { query: 'Content Strategy', value: 62 },
        ],
        averageInterest: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        peakInterest: { date: '2026-02-01', value: 91 },
        trendDirection: 'rising',
    };
}

export function getMockAiReport(domain: string): AiReportData {
    return {
        report: `# SEO Analysis Report for ${domain}\n\n## Executive Summary\n${domain} demonstrates strong organic presence with 156,420 monthly organic visitors and 3,847 ranked keywords. The domain authority score of 58/100 places it in the upper-mid range of its competitive landscape. However, there are several critical areas requiring immediate attention.\n\n## Key Strengths\n- Strong backlink profile with 42,680 total backlinks from 1,893 referring domains\n- Top 3 rankings for several high-volume branded keywords\n- Featured snippet ownership for primary search queries\n- Positive business reviews (4.3/5 stars from 847 reviews)\n\n## Critical Issues\n1. **Duplicate Title Tags (5 pages)** — This dilutes ranking potential and confuses search engines\n2. **Broken Internal Links (8 links)** — 404 errors waste crawl budget and harm user experience\n3. **Missing H1 Tags (3 pages)** — Core pages lack proper heading hierarchy\n\n## Priority Actions\n1. Fix all broken internal links within the next 7 days\n2. Resolve duplicate title tags — ensure each page has a unique, descriptive title\n3. Add H1 tags to all pages missing them\n4. Optimize the 18 pages missing meta descriptions\n5. Compress images and implement lazy loading to improve page speed\n6. Build structured data for product and blog content\n\n## Traffic Growth Opportunity\nBy addressing the critical issues and targeting the suggested long-tail keywords, ${domain} could see a 25-40% increase in organic traffic within 3-6 months.`,
        sections: [
            {
                title: 'Executive Summary',
                content: `${domain} demonstrates strong organic presence with 156,420 monthly organic visitors and 3,847 ranked keywords. The domain authority score of 58/100 places it in the upper-mid range of its competitive landscape. However, there are several critical areas requiring immediate attention to maximize growth potential.`,
            },
            {
                title: 'Key Strengths',
                content: `• Strong backlink profile with 42,680 total backlinks from 1,893 referring domains\n• Top 3 rankings for several high-volume branded keywords\n• Featured snippet ownership for primary search queries\n• Positive business reviews (4.3/5 stars from 847 reviews)\n• Good content depth with 186 indexed pages`,
            },
            {
                title: 'Critical Issues Requiring Immediate Action',
                content: `1. Duplicate Title Tags (5 pages) — This dilutes ranking potential and confuses search engines about which page to rank.\n2. Broken Internal Links (8 links) — 404 errors waste crawl budget and create poor user experience.\n3. Missing H1 Tags (3 pages) — Core landing pages lack proper heading hierarchy, impacting accessibility and SEO.`,
            },
            {
                title: 'Priority Action Plan',
                content: `Week 1: Fix all broken internal links and resolve duplicate title tags\nWeek 2: Add H1 tags and optimize the 18 pages missing meta descriptions\nWeek 3: Implement image compression and lazy loading across the site\nWeek 4: Build structured data (Schema.org) for product and blog content\nOngoing: Target suggested long-tail keywords and build high-quality backlinks`,
            },
            {
                title: 'Traffic Growth Forecast',
                content: `By addressing the critical issues and targeting the suggested long-tail keywords, ${domain} could see a 25-40% increase in organic traffic within 3-6 months. The estimated additional monthly traffic could reach 40,000-60,000 organic visits based on current keyword opportunity gap analysis.`,
            },
        ],
    };
}

export function getAllMockData(domain: string) {
    return {
        serp: getMockSerpData(domain),
        keywords: getMockKeywordsData(domain),
        domainAnalytics: getMockDomainAnalyticsData(domain),
        labs: getMockLabsData(domain),
        backlinks: getMockBacklinksData(domain),
        onPage: getMockOnPageData(domain),
        content: getMockContentData(domain),
        merchant: getMockMerchantData(),
        appData: getMockAppData(),
        business: getMockBusinessData(domain),
        appendix: getMockAppendixData(),
        aiOptimization: getMockAiOptimizationData(domain),
        trends: getMockTrendsData(domain),
    };
}
