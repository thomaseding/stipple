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
        this.colorA = colorA;
        this.colorB = colorB;
    }

    public static readonly black: Patch = new Patch(Color.black, Color.black);

    public pattern(): PatchPattern {
        return this._pattern;
    }

    public updatePattern(pattern: PatchPattern): Patch {
        return new Patch(this.colorA, this.colorB, pattern);
    }

    public colorAt(index: Point2d | Vector2d): Color {
        const ab = this._pattern.at(index);
        const color = ab === A ? this.colorA : this.colorB;
        return color;
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        for (const dotOffset of Patch.localOffsets) {
            const color = this.colorAt(dotOffset);
            const dot = new Dot(color);
            const dotTransform = Transform2d.translateBy(dotOffset).then(transform);
            dot.renderTo(context, dotTransform);
        }
    }

    private _pattern: PatchPattern;
    public readonly colorA: Color;
    public readonly colorB: Color;
}

class Quilt implements SceneObject {
    public constructor(grid: ReadonlyGrid2d<Patch>) {
        this._patchGrid = grid;
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        const patchExtent = this._patchGrid.extent();
        for (let x = 0; x < patchExtent.x; ++x) {
            for (let y = 0; y < patchExtent.y; ++y) {
                const patchOffset = new Vector2d(x, y);
                const patch = this._patchGrid.getAt(patchOffset);
                const patchTransform = Transform2d.translateBy(patchOffset.multiply(Patch.extent)).then(transform);
                patch.renderTo(context, patchTransform);
            }
        }
    }

    public patchGrid(): ReadonlyGrid2d<Patch> {
        return this._patchGrid;
    }

    private readonly _patchGrid: ReadonlyGrid2d<Patch>;
}
