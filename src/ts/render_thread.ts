type RenderInput = "submarine" | "boat";
type RenderOutput = "kite" | "glider";
type RenderId = number;

interface RenderData<T> {
    id: RenderId;
    data: T;
}

namespace RenderThread {
    function post(output: RenderData<RenderOutput>): void {
        globalThis.postMessage(output);
    }

    export async function main(): Promise<void> {
        globalThis.onmessage = (e: MessageEvent<RenderData<RenderInput>>) => {
            console.log("RenderThread.onmessage", e.data);
            post({
                id: e.data.id,
                data: randomChoice(["kite", "glider"]),
            });
        };
    }
}

interface RenderCancelled { __brand_RenderCancelled: string; }
const RenderCancelled: RenderCancelled = { __brand_RenderCancelled: "RenderCancelled" };

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
        this._worker.onmessage = (e: MessageEvent<RenderData<RenderOutput>>) => {
            console.log("RenderWorker.onmessage", e.data);
            console.log("returning", e.data.id, this._activeId);
            if (this._renderOutput === null) {
                throw Error();
            }
            if (e.data.id !== this._activeId) {
                console.assert(e.data.id !== this._pendingRenderInput?.id);
                return;
            }
            const p = this._renderOutput;
            this._activeId = 0;
            this._renderOutput = this._pendingRenderOutput;
            if (this._pendingRenderInput) {
                this._pendingRenderOutput = null;
                this._activeId = this._pendingRenderInput.id;
                this._post(this._pendingRenderInput);
                this._pendingRenderInput = null;
            }
            p.resolve(e.data.data);
        };
    }

    public async render(renderInput: RenderInput): Promise<RenderOutput> {
        if (this._renderOutput !== null) {
            this._pendingRenderInput = {
                id: ++this._renderIdSource,
                data: renderInput,
            };
            console.log("rejecting..");
            if (this._pendingRenderOutput !== null) {
                this._pendingRenderOutput.reject(RenderCancelled);
            }
            this._pendingRenderOutput = new OpenPromise<RenderOutput>();
            return this._pendingRenderOutput;
        }
        const renderOutput = new OpenPromise<RenderOutput>();
        this._activeId = ++this._renderIdSource;
        await this._render({
            id: this._activeId,
            data: renderInput,
        }, renderOutput);
        return renderOutput;
    }

    private async _render(renderInput: RenderData<RenderInput>, renderOutput: OpenPromise<RenderOutput>): Promise<void> {
        this._renderOutput = renderOutput;
        this._post(renderInput);
        await this._renderOutput;
        console.assert(this._renderOutput === null);
    }

    public isRendering(): boolean {
        return this._renderOutput !== null;
    }

    private _post(renderInput: RenderData<RenderInput>): void {
        this._worker.postMessage(renderInput);
    }

    private readonly _worker: Worker;
    private _renderOutput: OpenPromise<RenderOutput> | null = null;
    private _pendingRenderOutput: OpenPromise<RenderOutput> | null = null;
    private _pendingRenderInput: RenderData<RenderInput> | null = null;
    private _renderIdSource: RenderId = 0;
    private _activeId: RenderId = 0;
}
