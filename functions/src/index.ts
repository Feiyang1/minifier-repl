import * as functions from 'firebase-functions';
import { spawn } from 'child-process-promise';
import * as cors from 'cors';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

export const getTerseVersions = functions.https.onRequest(async (request, response) => {
    const result = await spawn('npm', [
        'info',
        'terser',
        'versions'
    ], { capture: ['stdout', 'stderr'] });
    const versionsJson = result.stdout.replace(/'/g, '"');
    const versions = JSON.parse(versionsJson);

    cors({
        origin: true
    })(request, response, () => {
        response.send({
            data: versions
        });
    });
});
