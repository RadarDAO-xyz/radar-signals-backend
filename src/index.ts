import express from 'express';
import channelsRoute from './routes/channels';
import submit from './routes/submit';
import cors from 'cors';
import { auth } from './utils/auth';
import { loadEnv } from './utils/loadEnv';
import { loadFlags } from './utils/loadFlags';

process.on('unhandledRejection', (reason, promise) => {
    console.error(reason, promise)
})

try {
    // Shouldn't throw since envs might be defined through console/os
    loadEnv();
} catch (e) {
    console.warn(e);
}

loadFlags();

const channels = require(process.flags.dev ? '../dev.channels.json' : '../channels.json');
console.log(channels.length, 'channels loaded');

const app = express();

app.use(express.json());

app.use(cors());
app.use(auth());

app.use('/channels', channelsRoute(channels));
app.use('/submit', submit(channels));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Express app listening on port ${port}`));
