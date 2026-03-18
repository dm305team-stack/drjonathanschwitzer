import { NextRequest, NextResponse } from 'next/server';

const PLACES_API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { query, placeId } = await req.json();

        if (!PLACES_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'Google API key not configured. Add GOOGLE_API_KEY to your environment variables in the Vercel dashboard.' },
                { status: 503 }
            );
        }

        let resolvedPlaceId = placeId;

        // If no placeId, search for it by name/address
        if (!resolvedPlaceId && query) {
            const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name&key=${PLACES_API_KEY}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.candidates && searchData.candidates.length > 0) {
                resolvedPlaceId = searchData.candidates[0].place_id;
            } else {
                return NextResponse.json({ success: false, error: 'Business not found. Try a more specific name or address.' }, { status: 404 });
            }
        }

        if (!resolvedPlaceId) {
            return NextResponse.json({ success: false, error: 'Provide a business name or Place ID.' }, { status: 400 });
        }

        // Fetch full place details
        const fields = [
            'place_id', 'name', 'formatted_address', 'formatted_phone_number',
            'website', 'rating', 'user_ratings_total', 'types',
            'opening_hours', 'photos', 'reviews', 'price_level',
            'geometry', 'business_status',
        ].join(',');

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${resolvedPlaceId}&fields=${fields}&key=${PLACES_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        if (!detailsData.result) {
            return NextResponse.json({ success: false, error: 'Failed to get business details from Google.' }, { status: 500 });
        }

        const place = detailsData.result;

        // Parse hours
        const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const hours = (place.opening_hours?.periods || []).map((period: {
            open?: { day?: number; time?: string };
            close?: { day?: number; time?: string };
        }) => {
            const fmt = (t?: string) => t ? `${t.slice(0, 2)}:${t.slice(2)}` : '--:--';
            return {
                day: DAYS[period.open?.day ?? 0],
                openTime: fmt(period.open?.time),
                closeTime: fmt(period.close?.time),
                isClosed: false,
            };
        });

        // Photos — build URL via Places Photo API
        const photos = (place.photos || []).slice(0, 8).map((photo: {
            photo_reference: string;
            width?: number;
            height?: number;
        }) => ({
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photo.photo_reference}&key=${PLACES_API_KEY}`,
            width: photo.width,
            height: photo.height,
        }));

        // Reviews
        const reviews = (place.reviews || []).map((review: {
            author_name: string;
            rating: number;
            text: string;
            time: number;
            profile_photo_url?: string;
        }) => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            date: new Date(review.time * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            profilePhoto: review.profile_photo_url,
        }));

        // Categories — humanize snake_case
        const categories = (place.types || [])
            .filter((t: string) => !['establishment', 'point_of_interest'].includes(t))
            .map((t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()));

        const data = {
            placeId: resolvedPlaceId,
            name: place.name,
            address: place.formatted_address,
            phone: place.formatted_phone_number,
            website: place.website,
            rating: place.rating ?? 0,
            reviewCount: place.user_ratings_total ?? 0,
            categories,
            hours,
            photos,
            reviews,
            isOpen: place.opening_hours?.open_now,
            priceLevel: place.price_level,
            coordinates: place.geometry?.location,
        };

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch business data';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
