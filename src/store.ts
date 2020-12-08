import { readState, saveState } from "./persistence";
import { writable } from 'svelte/store';

export interface AppState {
    terserVersion: string;
    input: string;
    options: OptionsState;
}

export interface ClientState extends AppState {
    initialized: boolean;
}

export interface OptionsState {
    error?: string;
    value: Record<string, unknown>;
    rawString: string;
}

function createClientState() {
    const { subscribe, set, update} = writable({
        terserVersion: '5.3.8',
        input: '',
        options: {
            value: {},
            rawString: '{}'
        },
        initialized: false
    });

    type Params<T> = T extends (arg1: infer U) => any ? U : never
    // persist state on update
    function withPersist(updater: Params<typeof update>) {
        return currentState => {
            const nextState = updater(currentState);
            saveState(nextState);
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
        }
    }
}

export const clientState = createClientState();

// init state from persistence
(async () => {
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

function getAppState(state: ClientState): AppState {
    return {
        terserVersion: state.terserVersion,
        input: state.input,
        options: state.options
    };
}
