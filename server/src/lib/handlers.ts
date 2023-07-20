import { Request, Response } from "express";
import * as db from './db';

interface City {
    id: number;
    name: string;
    events_count: number;
}

interface Event {
    id: number;
    title: string;
    date: string;
    category: string;
    web_tag_groups: string[];
    age: string;
}
interface EventDetail extends Event {
    description: string;
    url: string;
    region: string;
    venue: string;
    address: string;
    min_price: number;
    max_price: number;
}

const getCities = async (req: Request, res: Response) => {
    try {
        const cities = await db.getCities() as City[];
        res.json(cities);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getEvents = async (req: Request, res: Response) => {
    const cityId = req.params.cityid;
    if (!cityId) {
        res.status(400).json({ error: 'missing cityId parameter' });
    } else if (isNaN(Number(cityId))) {
        res.status(400).json({ error: 'parameter cityId must be a number' });
    } else {
        try {
            const events = await db.getEvents({ cityId }) as Event[];
            res.json(events);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

const getEvent = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: 'missing event id parameter' });
    } else if (isNaN(Number(id))) {
        res.status(400).json({ error: 'parameter event id must be a number' });
    } else {
        try {
            const event = await db.getEvent({ eventId: id }) as EventDetail;
            res.json(event);
        } catch (error) {
            res.status(500).json(error);
        }
    }
}
export const handlers = {
    getCities, getEvents, getEvent,
}
