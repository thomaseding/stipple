type RenderInput = "submarine" | "boat";
type RenderOutput = "kite" | "glider";

namespace RenderThread {
    function post(output: RenderOutput): void {
        globalThis.postMessage(output);
    }

    export async function main(): Promise<void> {
        globalThis.onmessage = (e: MessageEvent<RenderInput>) => {
            console.log("RenderThread.onmessage", e.data);
            post(randomChoice(["kite", "glider"]));
        };
    }
}

class RenderWorker {
    protected readonly __brand_RenderWorker: undefined;

    public static async create(): Promise<RenderWorker> {
        console.log("RenderWorker.create");
        const worker = await Mains.newThread("render-thread");
        const renderWorker = new RenderWorker(worker);
        return renderWorker;
    }

    private constructor(worker: Worker) {
        this._worker = worker;
        this._worker.onmessage = (e: MessageEvent<RenderOutput>) => {
            console.log("RenderWorker.onmessage", e.data);
            if (this._renderOutput === null) {
                throw Error();
            }
            const p = this._renderOutput;
            this._renderOutput = null;
            p.resolve(e.data);
        };
    }

    public async render(input: RenderInput): Promise<RenderOutput> {
        if (this._renderOutput !== null) {
            throw Error();
        }
        this._renderOutput = new OpenPromise<RenderOutput>();
        this._post(input);
        const renderOutput = await this._renderOutput;
        console.assert(this._renderOutput === null);
        return renderOutput;
    }

    public isRendering(): boolean {
        return this._renderOutput !== null;
    }

    private _post(input: RenderInput): void {
        this._worker.postMessage(input);
    }

    private readonly _worker: Worker;
    private _renderOutput: OpenPromise<RenderOutput> | null = null;
}
