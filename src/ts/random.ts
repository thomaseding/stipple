function randomRangeFloat(begin: number, end: number) {
    console.assert(begin < end);
    return Math.random() * (end - begin) + begin;
}

function randomRangeInt(begin: number, end: number) {
    console.assert(Number.isInteger(begin));
    console.assert(Number.isInteger(end));
    console.assert(begin < end);
    return Math.floor(Math.random() * (end - begin) + begin);
}

function randomChoice<T>(items: T[]): T {
    const i = randomRangeInt(0, items.length);
    return items[i]!;
}
