import { GlobalStateWatcher } from './event-emitter';
import { getContext } from './context'

export function updateGlobalState(key: string, value: any) {
    const context = getContext();

    if (context)
        context.globalState.update(key, value).then(() => {
            // Trigger the event when the global state changes
            GlobalStateWatcher.getInstance().triggerGlobalStateChange(key);
        });
}

export function getGlobalState(key: string): any {
    const context = getContext();
    if (context)
        return context.globalState.get(key);
    else 
        return null
}