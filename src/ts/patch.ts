/// <reference path="pattern.ts" />

class Patch implements SceneObject {
    protected readonly __brand_Tile: undefined;

    public static readonly extent: Vector2d = PatchPattern.extent;
    public static readonly localOffsets: Vector2d[] = PatchPattern.coords.map(p => p.toVector());

    public constructor(colorA: Color, colorB: Color, pattern?: PatchPattern) {
        if (!pattern) {
            pattern = Dither.Bayer.patternFromDensity(Dither.Bayer.Density64._0);
        }
        this._pattern = pattern;
        this._colorA = colorA;
        this._colorB = colorB;
    }

    public pattern(): PatchPattern {
        return this._pattern;
    }

    public newTile(pattern: PatchPattern): Patch {
        return new Patch(this._colorA, this._colorB, pattern);
    }

    public colorAt(index: Point2d | Vector2d): Color {
        const ab = this._pattern.at(index);
        const color = ab === A ? this._colorA : this._colorB;
        return color;
    }

    public renderTo(context: RenderContext, transform: Transform2d, zIndex: number): void {
        for (const localOffset of Patch.localOffsets) {
            const color = this.colorAt(localOffset);
            const dot = new Dot(color);
            const dotTransform = Transform2d.translateBy(localOffset).then(transform);
            dot.renderTo(context, dotTransform, zIndex);
        }
    }

    private _pattern: PatchPattern;
    private _colorA: Color;
    private _colorB: Color;
}

class Quilt implements SceneObject {
    public constructor(grid: Grid2d<Patch>) {
        this._grid = grid;
    }

    public renderTo(context: RenderContext, transform: Transform2d, zIndex: number): void {
        const extent = this._grid.extent();
        for (let x = 0; x < extent.x; ++x) {
            for (let y = 0; y < extent.y; ++y) {
                const localOffset = new Vector2d(x, y);
                const patch = this._grid.getAt(localOffset);
                const patchTransform = Transform2d.translateBy(localOffset).then(transform);
                patch.renderTo(context, patchTransform, zIndex);
            }
        }
    }

    private readonly _grid: Grid2d<Patch>;
}
