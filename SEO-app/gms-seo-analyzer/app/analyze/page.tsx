'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import BrowserApiSection from '@/components/sections/BrowserApiSection';
import SerpApiSection from '@/components/sections/SerpApiSection';
import UnlockerApiSection from '@/components/sections/UnlockerApiSection';
import CrawlApiSection from '@/components/sections/CrawlApiSection';
import WebScraperSection from '@/components/sections/WebScraperSection';
import DeepLookupSection from '@/components/sections/DeepLookupSection';
import WebArchiveSection from '@/components/sections/WebArchiveSection';
import ComingSoonSection from '@/components/sections/ComingSoonSection';
import LocalBusinessSection from '@/components/sections/LocalBusinessSection';
import type { BrightDataModuleName, BrightDataModuleStatus, BrowserApiData, WebScraperResult, DeepLookupPreview, DeepLookupRequest, WebArchiveResult, LocalBusinessData } from '@/types';
import type { SerpSearchResult } from '@/lib/brightdata-serp';
import type { UnlockerResult } from '@/lib/brightdata-unlocker';
import type { CrawlSnapshotResult } from '@/lib/brightdata-crawl';

const MODULE_METADATA: Record<BrightDataModuleName, { label: string; icon: string; description: string }> = {
    'serp-api': { label: 'SERP', icon: '🔍', description: 'Search engine results & rankings by keyword, country, city, and device' },
    'browser-api': { label: 'Browser', icon: '🌐', description: 'Live page analysis with JavaScript rendering' },
    'unlocker-api': { label: 'Unlocker', icon: '🔓', description: 'Access blocked sites — bypass CAPTCHAs & anti-bots' },
    'crawl-api': { label: 'Crawl', icon: '🕷️', description: 'Large-scale URL crawling for SEO datasets' },
    'web-scraper-api': { label: 'Web Scraper', icon: '📦', description: 'Pre-built scrapers for structured data extraction' },
    'deep-lookup': { label: 'Deep Lookup', icon: '🔎', description: 'Entity & competitor discovery by geography' },
    'web-archive': { label: 'Web Archive', icon: '📚', description: 'Historical snapshots of web pages' },
    'local-business': { label: 'Local Business', icon: '🗺️', description: 'Google My Business profile, hours, photos, reviews & performance metrics' },
};

const COMING_SOON_MODULES: BrightDataModuleName[] = [];

function AnalyzeContent() {
    const searchParams = useSearchParams();
    const domain = searchParams.get('domain') || '';

    const [activeModule, setActiveModule] = useState<BrightDataModuleName>('browser-api');
    const [modulesStatus, setModulesStatus] = useState<Partial<Record<BrightDataModuleName, BrightDataModuleStatus>>>(() => {
        const initial: Partial<Record<BrightDataModuleName, BrightDataModuleStatus>> = {};
        COMING_SOON_MODULES.forEach((m) => { initial[m] = 'coming-soon'; });
        return initial;
    });

    // Browser API state
    const [browserData, setBrowserData] = useState<BrowserApiData | null>(null);
    const [browserError, setBrowserError] = useState<string | undefined>();

    // SERP API state
    const [serpData, setSerpData] = useState<SerpSearchResult | null>(null);
    const [serpError, setSerpError] = useState<string | undefined>();

    // Unlocker API state
    const [unlockerData, setUnlockerData] = useState<UnlockerResult | null>(null);
    const [unlockerError, setUnlockerError] = useState<string | undefined>();

    // Crawl API state
    const [crawlData, setCrawlData] = useState<CrawlSnapshotResult | null>(null);
    const [crawlError, setCrawlError] = useState<string | undefined>();
    const [crawlSnapshotId, setCrawlSnapshotId] = useState<string | undefined>();

    // Web Scraper API state
    const [scraperData, setScraperData] = useState<WebScraperResult | null>(null);
    const [scraperError, setScraperError] = useState<string | undefined>();
    const [scraperSnapshotId, setScraperSnapshotId] = useState<string | undefined>();

    // Deep Lookup state
    const [deepLookupPreview, setDeepLookupPreview] = useState<DeepLookupPreview | null>(null);
    const [deepLookupRequest, setDeepLookupRequest] = useState<DeepLookupRequest | null>(null);
    const [deepLookupError, setDeepLookupError] = useState<string | undefined>();

    // Web Archive state
    const [archiveData, setArchiveData] = useState<WebArchiveResult | null>(null);
    const [archiveError, setArchiveError] = useState<string | undefined>();
    const [archiveSearchId, setArchiveSearchId] = useState<string | undefined>();

    // Local Business state
    const [localBusinessData, setLocalBusinessData] = useState<LocalBusinessData | null>(null);
    const [localBusinessError, setLocalBusinessError] = useState<string | undefined>();
    const [localBusinessInsightsLoading, setLocalBusinessInsightsLoading] = useState(false);

    // PDF loading
    const [pdfLoading, setPdfLoading] = useState(false);

    const handleModuleClick = useCallback((module: BrightDataModuleName) => {
        setActiveModule(module);
    }, []);

    // === Browser API ===
    const handleBrowserAnalyze = useCallback(async (url: string, options: { country?: string; device?: string }) => {
        setModulesStatus((prev) => ({ ...prev, 'browser-api': 'loading' }));
        setBrowserData(null);
        setBrowserError(undefined);

        try {
            const res = await axios.post('/api/brightdata/browser', {
                url,
                country: options.country,
                device: options.device,
            });

            if (res.data.success) {
                setBrowserData(res.data.data);
                setModulesStatus((prev) => ({ ...prev, 'browser-api': 'success' }));
            } else {
                throw new Error(res.data.error || 'Analysis failed');
            }
        } catch (err) {
            // Extract server-side error message from axios response body when available
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const axiosError = err as any;
            const message = axiosError?.response?.data?.error || (err instanceof Error ? err.message : 'Analysis failed. Please try again.');
            setBrowserError(message);
            setModulesStatus((prev) => ({ ...prev, 'browser-api': 'error' }));
        }
    }, []);

    // Auto-trigger Browser API when domain is present in URL
    const hasAutoTriggered = useRef(false);
    useEffect(() => {
        if (domain && !hasAutoTriggered.current) {
            hasAutoTriggered.current = true;
            const url = domain.startsWith('http') ? domain : `https://${domain}`;
            handleBrowserAnalyze(url, { device: 'desktop' });
        }
    }, [domain, handleBrowserAnalyze]);

    // === SERP API ===
    const handleSerpSearch = useCallback(async (keyword: string, options: { country?: string; language?: string; device?: string }) => {
        setModulesStatus((prev) => ({ ...prev, 'serp-api': 'loading' }));
        setSerpData(null);
        setSerpError(undefined);

        try {
            const res = await axios.post('/api/brightdata/serp', {
                keyword,
                country: options.country,
                language: options.language,
                device: options.device,
            });

            if (res.data.success) {
                setSerpData(res.data.data);
                setModulesStatus((prev) => ({ ...prev, 'serp-api': 'success' }));
            } else {
                throw new Error(res.data.error || 'Search failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Search failed. Please try again.');
            setSerpError(message);
            setModulesStatus((prev) => ({ ...prev, 'serp-api': 'error' }));
        }
    }, []);

    // === Unlocker API ===
    const handleUnlock = useCallback(async (url: string, options: { country?: string }) => {
        setModulesStatus((prev) => ({ ...prev, 'unlocker-api': 'loading' }));
        setUnlockerData(null);
        setUnlockerError(undefined);

        try {
            const res = await axios.post('/api/brightdata/unlocker', {
                url,
                country: options.country,
            });

            if (res.data.success) {
                setUnlockerData(res.data.data);
                setModulesStatus((prev) => ({ ...prev, 'unlocker-api': 'success' }));
            } else {
                throw new Error(res.data.error || 'Unlock failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Unlock failed. Please try again.');
            setUnlockerError(message);
            setModulesStatus((prev) => ({ ...prev, 'unlocker-api': 'error' }));
        }
    }, []);

    // === Crawl API ===
    const handleCrawlTrigger = useCallback(async (urls: string[]) => {
        setModulesStatus((prev) => ({ ...prev, 'crawl-api': 'loading' }));
        setCrawlData(null);
        setCrawlError(undefined);
        setCrawlSnapshotId(undefined);

        try {
            const res = await axios.post('/api/brightdata/crawl', {
                action: 'trigger',
                urls,
            });

            if (res.data.success) {
                const { snapshotId } = res.data.data;
                setCrawlSnapshotId(snapshotId);
                setCrawlData({ snapshotId, status: 'running' });
                setModulesStatus((prev) => ({ ...prev, 'crawl-api': 'success' }));
            } else {
                throw new Error(res.data.error || 'Crawl trigger failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Crawl trigger failed. Please try again.');
            setCrawlError(message);
            setModulesStatus((prev) => ({ ...prev, 'crawl-api': 'error' }));
        }
    }, []);

    const handleCrawlPollSnapshot = useCallback(async (snapshotId: string) => {
        try {
            const res = await axios.post('/api/brightdata/crawl', {
                action: 'snapshot',
                snapshotId,
            });

            if (res.data.success) {
                setCrawlData(res.data.data);
                if (res.data.data.status === 'ready') {
                    setModulesStatus((prev) => ({ ...prev, 'crawl-api': 'success' }));
                }
            }
        } catch (err) {
            console.error('Snapshot poll error:', err);
        }
    }, []);

    // === Web Scraper API ===
    const handleScraperScrape = useCallback(async (datasetId: string, items: { url: string }[], mode: 'sync' | 'async') => {
        setModulesStatus((prev) => ({ ...prev, 'web-scraper-api': 'loading' }));
        setScraperData(null);
        setScraperError(undefined);
        setScraperSnapshotId(undefined);

        try {
            const res = await axios.post('/api/brightdata/scraper', {
                action: mode === 'async' ? 'async' : undefined,
                datasetId,
                items,
            });
            if (res.data.success) {
                const result = res.data.data;
                setScraperData(result);
                if (result.snapshotId) setScraperSnapshotId(result.snapshotId);
                setModulesStatus((prev) => ({ ...prev, 'web-scraper-api': result.status === 'running' ? 'loading' : 'success' }));
            } else {
                throw new Error(res.data.error || 'Scrape failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Scrape failed.');
            setScraperError(message);
            setModulesStatus((prev) => ({ ...prev, 'web-scraper-api': 'error' }));
        }
    }, []);

    const handleScraperPollSnapshot = useCallback(async (snapshotId: string) => {
        try {
            const res = await axios.post('/api/brightdata/scraper', { action: 'snapshot', snapshotId });
            if (res.data.success) {
                setScraperData(res.data.data);
                if (res.data.data.status === 'ready') {
                    setModulesStatus((prev) => ({ ...prev, 'web-scraper-api': 'success' }));
                }
            }
        } catch (err) { console.error('Scraper poll error:', err); }
    }, []);

    // === Deep Lookup ===
    const handleDeepLookupPreview = useCallback(async (query: string, options: { country?: string; city?: string; category?: string }) => {
        setModulesStatus((prev) => ({ ...prev, 'deep-lookup': 'loading' }));
        setDeepLookupPreview(null);
        setDeepLookupRequest(null);
        setDeepLookupError(undefined);

        try {
            const res = await axios.post('/api/brightdata/deeplookup', { action: 'preview', query, ...options });
            if (res.data.success) {
                setDeepLookupPreview(res.data.data.preview);
                setModulesStatus((prev) => ({ ...prev, 'deep-lookup': res.data.data.preview.status === 'ready' ? 'success' : 'loading' }));
            } else {
                throw new Error(res.data.error || 'Preview failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Preview failed.');
            setDeepLookupError(message);
            setModulesStatus((prev) => ({ ...prev, 'deep-lookup': 'error' }));
        }
    }, []);

    const handleDeepLookupPollPreview = useCallback(async (previewId: string) => {
        try {
            const res = await axios.post('/api/brightdata/deeplookup', { action: 'poll-preview', previewId });
            if (res.data.success) {
                setDeepLookupPreview(res.data.data.preview);
                if (res.data.data.preview.status === 'ready') {
                    setModulesStatus((prev) => ({ ...prev, 'deep-lookup': 'success' }));
                }
            }
        } catch (err) { console.error('Preview poll error:', err); }
    }, []);

    const handleDeepLookupRequest = useCallback(async (query: string, options: { country?: string; city?: string; category?: string }) => {
        setModulesStatus((prev) => ({ ...prev, 'deep-lookup': 'loading' }));
        try {
            const res = await axios.post('/api/brightdata/deeplookup', { action: 'request', query, ...options });
            if (res.data.success) {
                setDeepLookupRequest(res.data.data.request);
            } else {
                throw new Error(res.data.error || 'Request failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Request failed.');
            setDeepLookupError(message);
            setModulesStatus((prev) => ({ ...prev, 'deep-lookup': 'error' }));
        }
    }, []);

    const handleDeepLookupDownload = useCallback(async (requestId: string) => {
        try {
            const res = await axios.post('/api/brightdata/deeplookup', { action: 'download', requestId });
            if (res.data.success) {
                setDeepLookupRequest(res.data.data.request);
                if (res.data.data.request.status === 'ready') {
                    setModulesStatus((prev) => ({ ...prev, 'deep-lookup': 'success' }));
                }
            }
        } catch (err) { console.error('Download poll error:', err); }
    }, []);

    // === Web Archive ===
    const handleArchiveSearch = useCallback(async (url: string, options: { fromDate?: string; toDate?: string; limit?: number }) => {
        setModulesStatus((prev) => ({ ...prev, 'web-archive': 'loading' }));
        setArchiveData(null);
        setArchiveError(undefined);
        setArchiveSearchId(undefined);

        try {
            const res = await axios.post('/api/brightdata/webarchive', {
                action: 'search',
                url,
                fromDate: options.fromDate,
                toDate: options.toDate,
                limit: options.limit,
            });
            if (res.data.success) {
                const result = res.data.data;
                setArchiveData(result);
                if (result.searchId) setArchiveSearchId(result.searchId);
                setModulesStatus((prev) => ({ ...prev, 'web-archive': result.status === 'ready' ? 'success' : 'loading' }));
            } else {
                throw new Error(res.data.error || 'Search failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Search failed.');
            setArchiveError(message);
            setModulesStatus((prev) => ({ ...prev, 'web-archive': 'error' }));
        }
    }, []);

    const handleArchivePollStatus = useCallback(async (searchId: string) => {
        try {
            const res = await axios.post('/api/brightdata/webarchive', { action: 'status', searchId });
            if (res.data.success) {
                setArchiveData(res.data.data);
                if (res.data.data.status === 'ready') {
                    setModulesStatus((prev) => ({ ...prev, 'web-archive': 'success' }));
                }
            }
        } catch (err) { console.error('Archive poll error:', err); }
    }, []);

    // === Local Business ===
    const handleLocalBusinessSearch = useCallback(async (query: string) => {
        setModulesStatus((prev) => ({ ...prev, 'local-business': 'loading' }));
        setLocalBusinessData(null);
        setLocalBusinessError(undefined);
        try {
            const res = await axios.post('/api/google/places', { query });
            if (res.data.success) {
                setLocalBusinessData(res.data.data);
                setModulesStatus((prev) => ({ ...prev, 'local-business': 'success' }));
            } else {
                throw new Error(res.data.error || 'Search failed');
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any)?.response?.data?.error || (err instanceof Error ? err.message : 'Search failed. Please try again.');
            setLocalBusinessError(message);
            setModulesStatus((prev) => ({ ...prev, 'local-business': 'error' }));
        }
    }, []);

    const handleLocalBusinessInsights = useCallback(async (locationId: string, accessToken: string) => {
        setLocalBusinessInsightsLoading(true);
        try {
            const res = await axios.post('/api/google/business-insights', { locationId, accessToken });
            if (res.data.success) {
                setLocalBusinessData((prev) => prev ? { ...prev, metrics: res.data.data } : prev);
            } else {
                setLocalBusinessData((prev) => prev ? { ...prev, metricsError: res.data.error } : prev);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch insights.';
            setLocalBusinessData((prev) => prev ? { ...prev, metricsError: message } : prev);
        } finally {
            setLocalBusinessInsightsLoading(false);
        }
    }, []);

    // === PDF Download ===
    const handleDownloadReport = useCallback(async () => {
        if (!browserData) return;
        setPdfLoading(true);

        try {
            const { pdf } = await import('@react-pdf/renderer');
            const { default: BrowserReportPDF } = await import('@/components/pdf/BrowserReportPDF');

            const PdfDoc = BrowserReportPDF({ url: browserData.url, data: browserData });
            const blob = await pdf(PdfDoc).toBlob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            const urlHost = new URL(browserData.finalUrl).hostname;
            a.download = `${urlHost}-browser-api-report-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('PDF generation error:', err);
        } finally {
            setPdfLoading(false);
        }
    }, [browserData]);

    const renderActiveSection = () => {
        switch (activeModule) {
            case 'serp-api':
                return (
                    <SerpApiSection
                        data={serpData}
                        loading={modulesStatus['serp-api'] === 'loading'}
                        error={serpError}
                        onSearch={handleSerpSearch}
                    />
                );
            case 'browser-api':
                return (
                    <BrowserApiSection
                        data={browserData}
                        loading={modulesStatus['browser-api'] === 'loading'}
                        error={browserError}
                        onAnalyze={handleBrowserAnalyze}
                        initialUrl={domain ? (domain.startsWith('http') ? domain : `https://${domain}`) : undefined}
                    />
                );
            case 'unlocker-api':
                return (
                    <UnlockerApiSection
                        data={unlockerData}
                        loading={modulesStatus['unlocker-api'] === 'loading'}
                        error={unlockerError}
                        onUnlock={handleUnlock}
                    />
                );
            case 'crawl-api':
                return (
                    <CrawlApiSection
                        data={crawlData}
                        loading={modulesStatus['crawl-api'] === 'loading'}
                        error={crawlError}
                        onTrigger={handleCrawlTrigger}
                        onPollSnapshot={handleCrawlPollSnapshot}
                        snapshotId={crawlSnapshotId}
                    />
                );
            case 'web-scraper-api':
                return (
                    <WebScraperSection
                        data={scraperData}
                        loading={modulesStatus['web-scraper-api'] === 'loading'}
                        error={scraperError}
                        onScrape={handleScraperScrape}
                        onPollSnapshot={handleScraperPollSnapshot}
                        snapshotId={scraperSnapshotId}
                    />
                );
            case 'deep-lookup':
                return (
                    <DeepLookupSection
                        preview={deepLookupPreview}
                        request={deepLookupRequest}
                        loading={modulesStatus['deep-lookup'] === 'loading'}
                        error={deepLookupError}
                        onPreview={handleDeepLookupPreview}
                        onPollPreview={handleDeepLookupPollPreview}
                        onRequest={handleDeepLookupRequest}
                        onDownload={handleDeepLookupDownload}
                    />
                );
            case 'web-archive':
                return (
                    <WebArchiveSection
                        data={archiveData}
                        loading={modulesStatus['web-archive'] === 'loading'}
                        error={archiveError}
                        onSearch={handleArchiveSearch}
                        onPollStatus={handleArchivePollStatus}
                        searchId={archiveSearchId}
                    />
                );
            case 'local-business':
                return (
                    <LocalBusinessSection
                        data={localBusinessData}
                        loading={modulesStatus['local-business'] === 'loading'}
                        error={localBusinessError}
                        onSearch={handleLocalBusinessSearch}
                        onFetchInsights={handleLocalBusinessInsights}
                        insightsLoading={localBusinessInsightsLoading}
                    />
                );
            default: {
                const mod = activeModule as BrightDataModuleName;
                const meta = MODULE_METADATA[mod];
                return (
                    <ComingSoonSection
                        moduleId={mod}
                        label={meta.label}
                        icon={meta.icon}
                        description={meta.description}
                    />
                );
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                domain={domain || undefined}
                showDownloadReport={!!browserData}
                onDownloadReport={handleDownloadReport}
                isReportLoading={pdfLoading}
            />

            <div className="flex-1 flex max-w-[1440px] mx-auto w-full">
                <Sidebar
                    activeModule={activeModule}
                    modulesStatus={modulesStatus}
                    onModuleClick={handleModuleClick}
                />

                <main className="flex-1 p-6 overflow-hidden">
                    {renderActiveSection()}
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="loading-bar w-40" /></div>}>
            <AnalyzeContent />
        </Suspense>
    );
}
