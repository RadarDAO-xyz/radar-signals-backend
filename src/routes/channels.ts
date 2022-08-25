import { Router } from 'express';

export default function channels(channels: { id: string; name: string }[]) {
    const router = Router();

    router.get('/', (req, res) => {
        res.json(channels);
    });

    return router;
}
