import express from 'express';
import submit from './routes/submit';
import { auth } from './utils/auth';
import { loadEnv } from './utils/loadEnv';

try {
    // Shouldn't throw since envs might be defined through console/os
    loadEnv();
} catch (e) {
    console.warn(e);
}

const app = express();

app.use(express.json());

app.use(auth());

app.use('/submit', submit);

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});
