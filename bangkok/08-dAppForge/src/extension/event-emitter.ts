import { EventEmitter } from 'vscode';

export class GlobalStateWatcher {
    private static instance: GlobalStateWatcher;
    private emitter: EventEmitter<string>;

    private constructor() {
        this.emitter = new EventEmitter<string>();
    }

    public static getInstance(): GlobalStateWatcher {
        if (!GlobalStateWatcher.instance) {
            GlobalStateWatcher.instance = new GlobalStateWatcher();
        }
        return GlobalStateWatcher.instance;
    }

    public onDidChangeGlobalState(listener: (key: string) => void): void {
        this.emitter.event(listener);
    }

    public triggerGlobalStateChange(key: string): void {
        this.emitter.fire(key);
    }
}