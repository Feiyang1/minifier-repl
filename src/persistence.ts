import type { AppState } from "./store";

const DATABASE_NAME = 'TERSER_REPL_DB';
const STORE_NAME = 'STATE_STORE'
const APP_STATE_KEY = 'app-state'
const VERSION = 1;

const dbPromise = openDatabase();

export async function saveState(state: AppState): Promise<void> {
    const db = await dbPromise;

    const transaction = db.transaction([STORE_NAME], 'readwrite');

    console.log('writing')
    const writeRequest = transaction.objectStore(STORE_NAME).put(state, APP_STATE_KEY);

    return new Promise((resolve, reject) => {
        writeRequest.onsuccess = function(event) {
            console.log('write success')
            resolve();
        }

        writeRequest.onerror = function(event: any) {
            console.log('write failed')
            reject(event.target.errorCode);
        }
    });
}

export async function readState(): Promise<AppState | undefined> {
    const db = await dbPromise;

    const transaction = db.transaction([STORE_NAME]);

    const readRequest = transaction.objectStore(STORE_NAME).get(APP_STATE_KEY);

    return new Promise((resolve, reject) => {
        readRequest.onsuccess = function(event: any) {
            console.log('read success', event.target.result);
            resolve(event.target.result)
        }
    
        readRequest.onerror = function(event: any) {
            reject(event.target.errorCode);
        }
    });
}

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, VERSION);

        request.onerror = function(event: any) {
            console.warn("can't open indexedDB", event);
            reject(event.target.errorCode)
        };

        request.onsuccess = function(event: any) {
            resolve(event.target.result);
        };

        request.onupgradeneeded = function(event: any){
            const db: IDBDatabase = event.target.result;
            db.createObjectStore(STORE_NAME)
        }
    });
}