/// <reference path="promise.ts" />

namespace Mains {
    export type Entrypoint = "stipple" | "webworker-demo";

    export function main(entry: Entrypoint): void {
        switch (entry) {
            case "stipple":
                newThread("webworker-demo");
                return Stipple.main();
            case "webworker-demo":
                return WebWorkerDemo.main();
            default:
                assertNever(entry);
        }
    }

    export async function newThread(entry: Entrypoint): Promise<Worker> {
        const ready = new OpenPromise<Worker>();
        const worker = new Worker("compiled.js");
        worker.onmessage = () => {
            worker.onmessage = null;
            ready.resolve(worker);
        };
        worker.postMessage(entry);
        return ready;
    }

    const _isWorkerThread = !("Window" in globalThis);
    if (_isWorkerThread) {
        globalThis.onmessage = (e: MessageEvent<Entrypoint>) => {
            globalThis.onmessage = null;
            main(e.data);
        };
    }
}
