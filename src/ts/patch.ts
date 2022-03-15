/// <reference path="pattern.ts" />
/// <reference path="dither/bayer.ts" />

class Patch implements SceneObject {
    protected readonly __brand_Tile: undefined;

    public static readonly extent: Vector2d = PatchPattern.extent;
    public static readonly localOffsets: Vector2d[] = PatchPattern.coords.map(p => p.toVector());

    public constructor(colorA: Color | null, colorB: Color | null, pattern?: PatchPattern) {
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

    public colorAt(index: Point2d | Vector2d): Color | null {
        const ab = this._pattern.at(index);
        const color = ab === A ? this.colorA : this.colorB;
        return color;
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        for (const dotOffset of Patch.localOffsets) {
            const color = this.colorAt(dotOffset)!;
            if (color) {
                const dot = new Dot(color);
                const dotTransform = Transform2d.translateBy(dotOffset).then(transform);
                dot.renderTo(context, dotTransform);
            }
        }
    }

    public mostProminentColor(): Color | null {
        return this.pattern().countOf(A) <= 32 ? this.colorB : this.colorA;
    }

    private _pattern: PatchPattern;
    public readonly colorA: Color | null;
    public readonly colorB: Color | null;
}

class Quilt implements SceneObject {
    public constructor(grid: Grid2d<Patch>) {
        this._grid = grid;
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        const patchExtent = this._grid.extent();
        for (let x = 0; x < patchExtent.x; ++x) {
            for (let y = 0; y < patchExtent.y; ++y) {
                const patchOffset = new Vector2d(x, y);
                const patch = this._grid.getAt(patchOffset);
                const patchTransform = Transform2d.translateBy(patchOffset.multiply(Patch.extent)).then(transform);
                patch.renderTo(context, patchTransform);
            }
        }
    }

    public grid(): Grid2d<Patch> {
        return this._grid;
    }

    private readonly _grid: Grid2d<Patch>;
}

class OffsetQuilt implements SceneObject {
    public constructor(quilt: Quilt, offset: Vector2d) {
        this._quilt = quilt;
        this._box = new Box2d(offset.toPoint(), quilt.grid().extent());
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        const xform = Transform2d.translateBy(this._box.min().toVector().multiply(Patch.extent)).then(transform);
        this._quilt.renderTo(context, xform);
    }

    public box(): Box2d {
        return this._box;
    }

    public withoutOffset(): Quilt {
        return this._quilt;
    }

    public overlayWith(other: OffsetQuilt): void {
        const otherGrid = other._grid();
        const thisGrid = this._grid();
        thisGrid.overlayWith(otherGrid, OffsetQuilt._patchCombine);
    }

    private static _patchCombine(oldPatch: Patch, newPatch: Patch): Patch {
        if (newPatch.colorA) {
            if (newPatch.colorB) {
                return newPatch;
            }
            const color = oldPatch.mostProminentColor();
            return new Patch(newPatch.colorA, color, newPatch.pattern());
        }
        if (!newPatch.colorB) {
            return oldPatch;
        }
        const color = oldPatch.mostProminentColor();
        return new Patch(color, newPatch.colorB, newPatch.pattern());
    }

    private _grid(): OffsetGrid2d<Patch> {
        return new OffsetGrid2d<Patch>(this._quilt.grid(), this._box.min().toVector());
    }

    private readonly _quilt: Quilt;
    private readonly _box: Box2d;
}
