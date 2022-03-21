/// <reference path="promise.ts" />

namespace Mains {
    export type Entrypoint = "stipple" | "render-thread";

    export async function main(entry: Entrypoint): Promise<void> {
        console.log("Mains.main", entry);
        switch (entry) {
            case "stipple":
                await Stipple.main();
                break;
            case "render-thread":
                await RenderThread.main();
                break;
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
        globalThis.onmessage = async (e: MessageEvent<Entrypoint>) => {
            globalThis.onmessage = null;
            await main(e.data);
            globalThis.postMessage(null);
        };
    }
}
