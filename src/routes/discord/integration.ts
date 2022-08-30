import { Router, text } from 'express';

export function integration() {
    const router = Router();

    router.post('/', (req, res) => {
        if (req.body.type === 1) res.status(200).json({ type: 1 });
    });

    return router;
}
