type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;
type OnFulfilled<T, TResult = T> = (value: T) => TResult | PromiseLike<TResult>;
type OnRejected<TResult = never> = (reason: any) => TResult | PromiseLike<TResult>;
type OnFinally = () => void;

class OpenPromise<T> implements Promise<T> {
    protected readonly __brand_OpenPromise: undefined;

    public constructor() {
        this._promise = new Promise((resolve: Resolve<T>, reject: Reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    public then<TResult1 = T, TResult2 = never>(
        onfulfilled?: OnFulfilled<T, TResult1> | null,
        onrejected?: OnRejected<TResult2> | null)
        : Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(onrejected?: OnRejected<TResult> | null): Promise<T | TResult> {
        return this._promise.catch(onrejected);
    }

    public finally(onfinally?: OnFinally | null): Promise<T> {
        return this._promise.finally(onfinally);
    }

    public resolve(this: OpenPromise<void>): void;
    public resolve(value: T | PromiseLike<T>): void;
    public resolve(value?: T | PromiseLike<T>): void {
        if (!this._resolve) {
            throw Error();
        }
        this._resolve(value!);
        this._complete();
    }

    public reject(reason: any): void {
        if (!this._reject) {
            throw Error();
        }
        this._reject(reason);
        this._complete();
    }

    public isComplete(): boolean {
        return this._resolve === null;
    }

    private _complete(): void {
        this._resolve = null;
        this._reject = null;
    }

    public [Symbol.toStringTag]: string;
    private _promise: Promise<T>;
    private _resolve: Resolve<T> | null = null;
    private _reject: Reject | null = null;
}
