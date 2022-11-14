import { Client } from '@googlemaps/google-maps-services-js';
import { NextApiRequest, NextApiResponse } from 'next';


// takes in latlong array
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query: { locations }, method } = req;
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
