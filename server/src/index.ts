import express, { Request, Response } from "express";
import './env';
import { connectDb } from './lib/db';
import { routes } from './routes';

const cfg = {
    port: process.env.PORT || 3033
};

function appRoutes(app: express.Application) {
    app.use(routes)
}

async function createServer() {
    try {
        await connectDb();

        const app = express();

        app.disable('x-powered-by');

        // middleware(app);

        appRoutes(app);

        app.listen(cfg.port, () => {
            console.log(`Example app listening at http://localhost:${cfg.port}`);
        });
    } catch (err) {
        console.error(err);
    }
}

createServer();
