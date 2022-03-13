/// <reference path="pattern.ts" />

class Patch {
    protected readonly __brand_Tile: undefined;

    public static readonly extent: Vector2d = PatchPattern.extent;
    public static readonly localCoords: Point2d[] = PatchPattern.coords;

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

    public colorAt(index: Point2d): Color {
        const ab = this._pattern.at(index);
        const color = ab === A ? this._colorA : this._colorB;
        return color;
    }

    private _pattern: PatchPattern;
    private _colorA: Color;
    private _colorB: Color;
}

type Quilt = Grid2d<Patch>;
