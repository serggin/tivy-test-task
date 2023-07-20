import { Client, QueryResult } from 'pg';
import dotenv from 'dotenv';
import dataJson from '../../export.json';
import { exit } from 'process';
import { Resolver } from 'dns';
dotenv.config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT)
});

const connectDb = async () => {
    try {
        await client.connect();
        console.log('connected');
    } catch (error) {
        console.error(error);
    }
};

const createScript = `
CREATE TABLE IF NOT EXISTS public.cities (
    id SERIAL PRIMARY KEY,
    name character varying(64) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "cities-name" UNIQUE (name)
);
CREATE TABLE IF NOT EXISTS venues (
    id integer NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    address character varying(255) COLLATE pg_catalog."default" NOT NULL,
    latitude numeric(8,5),
    longitude numeric(8,5),
    alias character varying(255) COLLATE pg_catalog."default",
    city_id integer NOT NULL,
    CONSTRAINT venues_pkey PRIMARY KEY (id),
    CONSTRAINT cities_fkey FOREIGN KEY (city_id)
        REFERENCES public.cities (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
CREATE TABLE IF NOT EXISTS public.events
(
    id integer NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    date timestamp without time zone NOT NULL,
    image character varying(255) COLLATE pg_catalog."default",
    venue_id integer NOT NULL,
    url character varying(1024) COLLATE pg_catalog."default" NOT NULL,
    category character varying(16) COLLATE pg_catalog."default" NOT NULL,
    web_tag_groups character varying(255)[] COLLATE pg_catalog."default" NOT NULL,
    date_type character varying(16) COLLATE pg_catalog."default" NOT NULL,
    min_price integer,
    max_price integer,
    age smallint,
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT venues_ukey UNIQUE (title, date, venue_id, url),
    CONSTRAINT venues_fkey FOREIGN KEY (venue_id)
        REFERENCES public.venues (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
`;

const createTables = async () => {
    const res = await client.query(createScript);
};

async function getTableCount(table: string): Promise<number> {
    const { rows } = await client.query(`SELECT count(*) FROM ${table}`);
    return Number(rows[0].count);
}

interface City {
    id: number;
    name: string;
}
type Cities = { [key: string]: number };
let cities: Cities;

async function seedCities() {
    console.log('length', dataJson.subevents.subevent.length);
    cities = dataJson.subevents.subevent.reduce<Cities>((acc: Cities, cur: any) => {
        const region = cur.region.trim();
        if (!acc[region])
            acc = { ...acc, [region]: 0 };
        return acc;
    }, {} as Cities);
    if (await getTableCount('cities') === 0) {
        const values: string[] = [];
        for (const key in cities)
            values.push(`('${key}')`);
        try {
            const result = await client.query('INSERT INTO public.cities (name) VALUES ' + values.join(','));
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
    const { rows } = await client.query('SELECT name, id FROM cities');
    rows.forEach((row) => {
        cities[row.name] = row.id;
    });
}

type Venue = {
    id: number;
    name: string;
    address: string;
    latitude: string | null;
    longitude: string | null;
    alias: string;
    city_id: number;
}
type Venues = { [key: number]: Venue };
let venues: Venues;

function parseGoogleAddress(ga: string): (string | null)[] {
    const regexp = /(\S+)\s+(\S+)/;
    const res = regexp.exec(ga);
    if (res && res.length === 3) {
        const latitude = isNaN(parseFloat(res[1])) ? null : res[1];
        const longitude = isNaN(parseFloat(res[2])) ? null : res[2];
        return [latitude, longitude];
    } else
        return [null, null];
}

async function seedVenues() {
    venues = dataJson.subevents.subevent.reduce<Venues>((acc: Venues, cur: any) => {
        const id = Number(cur.venue_id);
        if (!acc[id]) {
            const [latitude, longitude] = parseGoogleAddress(cur.google_address);
            const city_id = cities[cur.region];
            acc = { ...acc, [id]: { id, name: cur.venue, address: cur.venue_address, latitude, longitude, alias: cur.venue_alias, city_id } }
        }
        return acc;
    }, {} as Venues);
    if (await getTableCount('venues') === 0) {
        const values: any[][] = [];
        for (const key in venues) {
            const { id, name, address, latitude, longitude, alias, city_id } = venues[key];
            values.push([id, name, address, latitude, longitude, alias, city_id]);
        }
        const query = {
            name: 'insert-venues',
            text: 'INSERT INTO public.venues(id, name, address, latitude, longitude, alias, city_id) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        };
        try {
            for (let i = 0; i < values.length; i++) {
                const result = await client.query(query, values[i]);
            }
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
}

function formatWebTagGroups(value: string): string {
    return '{' + value.split(',').map((item: string) => `"${item.trim()}"`).join(',') + '}';
}

async function seedEvents() {
    if (await getTableCount('events') === 0) {
        const query = {
            name: 'insert-events',
            text: `INSERT INTO public.events(id, title, description, date, image, url, category, age, web_tag_groups, date_type, min_price, max_price, venue_id) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`
        }
        let cur_id = 0;
        try {
            let cnt = 0;
            for (const cur of dataJson.subevents.subevent) {
                const { id, title, description, date, image, url, category, age, date_type, venue_id } = cur;
                let min_price: any, max_price: any;
                ({ min_price, max_price } = cur);
                if (!(Number(min_price) > 0))
                    min_price = null;
                if (!(Number(max_price) > 0))
                    max_price = null;
                cur_id = id;
                const web_tag_groups = formatWebTagGroups(cur.web_tag_groups);
                const result = await client.query(query, [id, title, description, date, image, url, category, age, web_tag_groups, date_type, min_price, max_price, venue_id]);
                if (++cnt % 1000 === 0)
                    console.log('inserted events: ', cnt);
            }
        } catch (error) {
            console.error(cur_id, error);
            return Promise.reject(error);
        }
    }
}

(async () => {
    try {
        await connectDb();
        await createTables();
        await seedCities();
        await seedVenues();
        await seedEvents();
    } catch (error) {
        console.error(error);
        exit(1);
    }
    exit(0);
})();
