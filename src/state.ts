import { readState, saveState } from "./persistence";

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
}

export function getState(): ClientState {
    return ClientState;
}

export function setState(state: ClientState, persist: boolean = true): void {
    ClientState = { ...state };
    if (persist) {
        saveState(state);
    }
}

export function setTerserVersion(terserVersion: string): void {
    setState({ ...ClientState, terserVersion });
}

export function setInput(input: string): void {
    setState(ClientState = { ...ClientState, input });
}

export function setOptions(options: OptionsState): void {
    setState(ClientState = { ...ClientState, options });
}

let ClientState = {
    terserVersion: '5.3.8',
    input: '',
    options: {
        value: {}
    },
    initialized: false
};
