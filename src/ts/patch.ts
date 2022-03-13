/// <reference path="pattern.ts" />
/// <reference path="dither/bayer.ts" />

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

    public static readonly black: Patch = new Patch(Color.black, Color.black);

    public pattern(): PatchPattern {
        return this._pattern;
    }

    public updatePattern(pattern: PatchPattern): Patch {
        return new Patch(this._colorA, this._colorB, pattern);
    }

    public colorAt(index: Point2d | Vector2d): Color {
        const ab = this._pattern.at(index);
        const color = ab === A ? this._colorA : this._colorB;
        return color;
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        for (const localOffset of Patch.localOffsets) {
            const color = this.colorAt(localOffset);
            const dot = new Dot(color);
            const dotTransform = Transform2d.translateBy(localOffset).then(transform);
            dot.renderTo(context, dotTransform);
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

    public renderTo(context: RenderContext, transform: Transform2d): void {
        const extent = this._grid.extent();
        for (let x = 0; x < extent.x; ++x) {
            for (let y = 0; y < extent.y; ++y) {
                const localOffset = new Vector2d(x, y);
                const patch = this._grid.getAt(localOffset);
                const patchTransform = Transform2d.translateBy(localOffset).then(transform);
                patch.renderTo(context, patchTransform);
            }
        }
    }

    public patchGrid(): ReadonlyGrid2d<Patch> {
        return this._grid;
    }

    private readonly _grid: Grid2d<Patch>;
}
