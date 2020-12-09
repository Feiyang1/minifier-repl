import { readState, saveState } from "./persistence";
import { writable } from 'svelte/store';
import { firebase } from './firebase';

/**
 * Locally persisted state
 */
export interface AppState {
    terserVersion: string;
    input: string;
    options: OptionsState;
    shared: boolean;
    shareId?: string;
}

/**
 * State used for sharing REPL
 */
export type ShareState = Omit<AppState, 'shared' | 'shareId'>

export interface ClientState extends AppState {
    initialized: boolean;
}

export interface OptionsState {
    error?: string;
    value: Record<string, unknown>;
    rawString: string;
}

function createClientState() {

    const initState: ClientState = {
        terserVersion: '5.3.8',
        input: '',
        options: {
            value: {},
            rawString: '{}'
        },
        initialized: false,
        shared: false
    };

    const { subscribe, set, update } = writable(initState);

    type Params<T> = T extends (arg1: infer U) => any ? U : never
    // persist state on update
    function withPersist(updater: Params<typeof update>) {
        return currentState => {
            const nextState = updater(currentState);
            saveState(getAppState(nextState));
            return nextState;
        }
    }

    return {
        subscribe,
        setTerserVersion(terserVersion: string): void {
            update(withPersist(currentState => ({ ...currentState, terserVersion })));
        },
        setInput(input: string): void {
            console.log('setting input')
            update(withPersist(currentState => ({ ...currentState, input })));
        },
        setOptions(options: OptionsState): void {
            update(withPersist(currentState => ({ ...currentState, options })));
        },
        set,
        setInitialized(initialized: boolean): void {
            update(currentState => ({ ...currentState, initialized }));
        },
        setShared(shared: boolean, shareId?: string): void {
            update(withPersist(currentState => ({ ...currentState, shared, shareId })));
        }
    }
}

export const clientState = createClientState();

// init state from firestore if it is a shared link, other init state from persistence
(async () => {

    const shareId = getShareId(window.location.pathname);
    if (shareId) {
        const docRef = await firebase.firestore().collection('shared').doc(shareId).get();
        if (docRef.exists) {
            const sharedState: AppState = docRef.data() as AppState;
            clientState.set({ ...sharedState, initialized: true, shared: true, shareId });
            return;
        }
    }

    try {
        const persistedState = await readState();
        if (persistedState) {
            clientState.set({ ...persistedState, initialized: true });
        }
    } catch (e) {
        console.warn("unable to read persisted state");
        clientState.setInitialized(true);
    }
})();

export function getAppState(state: ClientState): AppState {
    return {
        terserVersion: state.terserVersion,
        input: state.input,
        options: state.options,
        shared: state.shared,
        shareId: state.shareId
    };
}

export function getShareState(state: ClientState): ShareState {
    return {
        terserVersion: state.terserVersion,
        input: state.input,
        options: state.options
    };
}

/**
 * 
 * @param pathName - The part of url after the host name. For example, if the url is http://localhost:5000/waejrlkwejalrk, the pathName is /waejrlkwejalrk.
 * @returns the first part in the pathName, which should be the shareId - the document id in firestore 
 */
function getShareId(pathName: string): string | undefined {
    return pathName.split("/")[1];
}