/// <reference path="geom2d.ts" />

class TilePattern {
    protected readonly __brand_Pattern: undefined;

    public static readonly dim: number = 8;
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
        new Grid2d(Coord2d.origin, extent, (coord: Coord2d) => {
            coords.push(coord);
        });
        return coords;
    }

    private readonly _grid: Grid2d<A | B>;
}
