import { Router } from 'express';
const channels = require('../../channels.json');

const router = Router();

router.get('/', (req, res) => {
    res.json(channels);
});

export default router;
