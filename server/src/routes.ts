import { Request, Response, NextFunction, Router } from 'express';
import { handlers } from './lib/handlers';

export const routes = Router();

const notFound = (req: Request, res: Response) => res.status(404).json({});
const serverError = (err: Error, req: Request, res: Response, next: NextFunction) => res.status(500).json(err);
const defaultHandler = async (req: Request, res: Response) => {
    res.json({"error": "not implemented"});
}

routes.get('/api/cities', handlers.getCities);
routes.get('/api/events/:cityid', handlers.getEvents);
routes.get('/api/event/:id', handlers.getEvent);

// custom 404 page
routes.use(notFound);

// custom 500 page
routes.use(serverError);