import { Client } from '@googlemaps/google-maps-services-js';
import { NextApiRequest, NextApiResponse } from 'next';


// takes in latlong array
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query: { locations }, method } = req;
    // convert locations string to array of latlong objects
    const locationsArray = JSON.parse(locations as string);
    const client = new Client({})
    const { data } = await client.elevation({
        params: {
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
            locations: locationsArray
        }
    })
    console.log(data);
    res.status(200).json(data);
}

/*
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
    ) {
    const client = new Client({});
    const loc = [
        { lat: 39.7391536, lng: -104.9847034 },
        { lat: 36.455556, lng: -116.866667 },
        { lat: 36.114647, lng: -115.172813 },
        { lat: 36.175, lng: -115.136389 },
    ];
    console.log(typeof loc);
    const { data } = await client.elevation({
        params: {
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        locations: loc,
        },
    });
    console.log(data);
    res.status(200).json(data);
}
*/