/// <reference path="geom2d.ts" />

class PatchPattern {
    protected readonly __brand_Pattern: undefined;

    private static readonly dim: number = 8;
    public static readonly extent: Vector2d = Vector2d.square(this.dim);
    public static readonly coords: Point2d[] = this._generateCoords(this.extent);

    public constructor(grid: Grid2d<A | B>) {
        if (!grid.extent().equals(PatchPattern.extent)) {
            throw Error();
        }
        this._grid = grid;
    }

    public at(position: Point2d | Vector2d): A | B {
        return this._grid.getAt(position);
    }

    public forEach(action: (index: Point2d, ab: A | B) => void): void {
        const box = new Box2d(Point2d.origin, this._grid.extent());
        box.forEachPosition((position: Point2d) => {
            const ab = this._grid.getAt(position);
            action(position, ab);
        });
    }

    public countOf(ab: A | B): number {
        let count = 0;
        this.forEach((_: Point2d, value: A | B) => {
            if (value === ab) {
                ++count;
            }
        });
        return count;
    }

    private static _generateCoords(extent: Vector2d): Point2d[] {
        const coords: Point2d[] = [];
        const box = new Box2d(Point2d.origin, extent);
        box.forEachPosition((coord: Point2d) => {
            coords.push(coord);
        });
        return coords;
    }

    private readonly _grid: Grid2d<A | B>;
}
