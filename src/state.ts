import { readState, saveState } from "./persistence";

export interface AppState {
    terserVersion: string;
    input: string;
    options: OptionsState;
}

export interface OptionsState {
    error?: string;
    value: Record<string, unknown>;
}

export function getState(): AppState {
    return AppState;
}

export function setState(state: AppState): void {
    AppState = { ...state };
    saveState(state);
}

export function setTerserVersion(terserVersion: string): void {
    setState({ ...AppState, terserVersion });
}

export function setInput(input: string): void {
    setState(AppState = { ...AppState, input });
}

export function setOptions(options: OptionsState): void {
    setState(AppState = { ...AppState, options });
}

let AppState = {
    terserVersion: '5.3.8',
    input: '',
    options: {
        value: {}
    }
};

// init state from persistence
(async () => {
    try {
        const persistedState = await readState();
        if (persistedState) {
            AppState = persistedState;
        }
    } catch (e) {
        console.warn('unable to read persisted state')
    }
})()