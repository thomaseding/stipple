class Coord2d implements Object2d<Coord2d> {
    protected readonly __brand_Coord2d: undefined;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static readonly origin = new Coord2d(0, 0);
    public static readonly unit = new Coord2d(1, 1);

    public getObjectCoord(): Coord2d {
        return this;
    }

    public setObjectCoord(coord: Coord2d): Coord2d {
        return coord;
    }

    public equals(other: Coord2d): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public map(func: (v: number) => number): Coord2d {
        return new Coord2d(func(this.x), func(this.y));
    }

    public add(other: Coord2d): Coord2d {
        return new Coord2d(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Coord2d): Coord2d {
        return new Coord2d(this.x - other.x, this.y - other.y);
    }

    public scale(k: number): Coord2d;
    public scale(k: Coord2d): Coord2d;
    public scale(k: Coord2d | number): Coord2d {
        if (typeof k === "number") {
            return new Coord2d(k * this.x, k * this.y);
        }
        else {
            return new Coord2d(k.x * this.x, k.y * this.y);
        }
    }

    public static square(dim: number): Coord2d {
        return new Coord2d(dim, dim);
    }

    public divide(other: Coord2d): Coord2d {
        return new Coord2d(this.x / other.x, this.y / other.y);
    }

    public mod(other: Coord2d): Coord2d {
        return new Coord2d(this.x % other.x, this.y % other.y);
    }

    public isInteger(): boolean {
        return Number.isInteger(this.x) && Number.isInteger(this.y);
    }

    public divides(other: Coord2d): boolean {
        return other.divide(this).isInteger();
    }

    public readonly x: number;
    public readonly y: number;
}

interface Object2d<T> {
    getObjectCoord(): Coord2d;
    setObjectCoord(coord: Coord2d): T;
}

namespace Object2d {
    export function translate<T>(o: Object2d<T>, delta: Coord2d): T {
        const c = o.getObjectCoord();
        const x = c.x + delta.x;
        const y = c.y + delta.y;
        return o.setObjectCoord(new Coord2d(x, y));
    }
}

class Grid2d<T> implements Object2d<Grid2d<T>> {
    protected readonly __brand_Grid2d: undefined;

    public constructor(position: Coord2d, grid: T[][]);
    public constructor(position: Coord2d, extent: Coord2d, initialValue: (position: Coord2d) => T);
    public constructor(position: Coord2d, arg1: T[][] | Coord2d, initialValue?: (position: Coord2d) => T) {
        this._position = position;
        if (arg1 instanceof Coord2d) {
            const extent = arg1;
            initialValue = initialValue!;
            this._grid = [];
            this._extent = extent!;
            for (let y = 0; y < this._extent.y; ++y) {
                const lane: T[] = [];
                for (let x = 0; x < this._extent.x; ++x) {
                    const coord = new Coord2d(position.x + x, position.y + y);
                    lane.push(initialValue(coord));
                }
                this._grid.push(lane);
            }
        }
        else {
            const grid = arg1;
            this._grid = grid.map(lane => lane.slice());
            const height = this._grid.length;
            const width = this._grid[0]?.length || 0;
            const consistent = this._grid.every((lane: T[]) => {
                return lane.length === width;
            });
            if (!consistent) {
                throw Error();
            }
            this._extent = new Coord2d(width, height);
        }
    }

    public getObjectCoord(): Coord2d {
        return this._position;
    }

    public setObjectCoord(newGridPosition: Coord2d): Grid2d<T> {
        const delta = newGridPosition.subtract(this._position);
        const grid = new Grid2d(newGridPosition, this._extent, (newValuePosition: Coord2d) => {
            const value = this.getAt(newValuePosition.subtract(delta));
            return value;
        });
        return grid;
    }

    public indexedGet(index: Coord2d): T {
        const lane = this._grid[index.y];
        if (lane === undefined) {
            throw Error();
        }
        const value = lane[index.x];
        if (value === undefined) {
            throw Error();
        }
        return value;
    }

    public getAt(position: Coord2d): T {
        const index = position.subtract(this._position);
        return this.indexedGet(index);
    }

    public indexedSet(index: Coord2d, value: T): void {
        const lane = this._grid[index.y];
        if (lane === undefined) {
            throw Error();
        }
        if (lane.length <= index.x) {
            throw Error();
        }
        lane[index.x] = value;
    }

    public setAt(position: Coord2d, value: T): void {
        const index = position.subtract(this._position);
        this.indexedSet(index, value);
    }

    public forEach(action: (offset: Coord2d, value: T) => void): void {
        for (let x = 0; x < this._extent.x; ++x) {
            for (let y = 0; y < this._extent.y; ++y) {
                const offset = new Coord2d(x, y);
                const value = this.indexedGet(offset);
                action(offset, value);
            }
        }
    }

    public position(): Coord2d {
        return this._position;
    }

    public extent(): Coord2d {
        return this._extent;
    }

    public area(): number {
        return this._extent.x * this._extent.y;
    }

    private readonly _grid: T[][];
    private readonly _position: Coord2d;
    private readonly _extent: Coord2d;
}

function rectContains(min: Coord2d, max: Coord2d, needle: Coord2d): boolean {
    return min.x <= needle.x && needle.x < max.x
        && min.y <= needle.y && needle.y < max.y;
}

function gridContainsCoord<T>(self: Grid2d<T>, other: Coord2d): boolean {
    return rectContains(self.position(), self.position().add(self.extent()), other);
}

function gridContainsGrid<T>(self: Grid2d<T>, other: Grid2d<T>): boolean {
    return gridContainsCoord(self, other.position())
        && gridContainsCoord(self, other.position().add(other.extent()).subtract(Coord2d.unit));
}

function mergeIntoGrid<T>(self: Grid2d<T>, other: Grid2d<T>): void {
    other.forEach((offset: Coord2d, value: T) => {
        const pos = other.position().add(offset);
        if (gridContainsCoord(self, pos)) {
            self.setAt(pos, value);
        }
    });
}
