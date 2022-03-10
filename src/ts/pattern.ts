/// <reference path="geom2d.ts" />

class TilePattern {
    protected readonly __brand_Pattern: undefined;

    private static readonly dim: number = 8;
    public static readonly extent: Coord2d = Coord2d.square(this.dim);
    public static readonly coords: Coord2d[] = this._generateCoords(this.extent);

    public constructor(grid: Grid2d<A | B>) {
        if (!grid.position().equals(Coord2d.origin)) {
            throw Error();
        }
        if (!grid.extent().equals(TilePattern.extent)) {
            throw Error();
        }
        this._grid = grid;
    }

    public at(offset: Coord2d): A | B {
        return this._grid.indexedGet(offset);
    }

    public forEach(action: (coord: Coord2d, ab: A | B) => void): void {
        this._grid.forEach(action);
    }

    public countOf(ab: A | B): number {
        let count = 0;
        this.forEach((_coord: Coord2d, value: A | B) => {
            if (value === ab) {
                ++count;
            }
        });
        return count;
    }

    private static _generateCoords(extent: Coord2d): Coord2d[] {
        const coords: Coord2d[] = [];
        for (let x = 0; x < extent.x; ++x) {
            for (let y = 0; y < extent.y; ++y) {
                const coord = new Coord2d(x, y);
                coords.push(coord);
            }
        }
        return coords;
    }

    private readonly _grid: Grid2d<A | B>;
}
