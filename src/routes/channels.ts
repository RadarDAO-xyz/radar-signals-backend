import { Router } from 'express';

export default function channels(channels: { id: string; name: string }[]) {
    const router = Router();

    router.get('/', (req, res) => {
        console.log(`${req.user.username}#${req.user.discriminator} is requesting the channel list`)
        res.json(channels);
    });

    return router;
}
