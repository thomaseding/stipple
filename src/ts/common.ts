function clamp(min: number, max: number, value: number): number {
    return Math.min(max, Math.max(min, value));
}

function identity<T>(x: T): T {
    return x;
}

function assertNever(_: never): never {
    throw Error();
}
