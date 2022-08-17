import dotenv from 'dotenv';
import path from 'path';

export function loadEnv() {
    const output1 = dotenv.config({ path: path.resolve(__dirname, `../../.env`) });
    if (output1.error) {
        const output2 = dotenv.config();
        if (output2.error) {
            throw 'No ENV files found';
        }
    }

    return true;
}
