import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});

export const connectDb = async () => {
    try {
        await client.connect();
        console.log('connected');
    } catch (error) {
        console.error(error);
    }
};


export async function getCities(): Promise<any[]> {
    const sql = `
SELECT c.*, count(e.*) as events_count
FROM cities c
JOIN venues v ON v.city_id = c.id
JOIN events e ON e.venue_id=v.id 
GROUP BY c.id ORDER BY c.name
    `;
    const { rows } = await client.query(sql);
    return rows;
}

export async function getEvents({ cityId }: { cityId: string }): Promise<any[]> {
    const sql = `
SELECT e.id, e.title, e.date, e.category, e.web_tag_groups, e.age 
FROM events e 
JOIN venues v ON e.venue_id=v.id 
WHERE v.city_id=$1 
ORDER BY date DESC`;
    const { rows } = await client.query(sql, [cityId]);
    return rows;
}

export async function getEvent({ eventId }: { eventId: string }): Promise<any> {
    const sql = `
SELECT e.id, e.title, e.date, e.category, e.web_tag_groups, e.age,
    c.name as region, v.name as venue, v.address,
    e.description, e.url, e.min_price, e.max_price
FROM events e 
JOIN venues v ON e.venue_id=v.id 
JOIN cities c ON v.city_id=c.id
WHERE e.id=$1
    `;
    const { rows } = await client.query(sql, [eventId]);
    return rows[0];
}