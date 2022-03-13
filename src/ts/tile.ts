/// <reference path="pattern.ts" />

class Tile {
    protected readonly __brand_Tile: undefined;

    public static readonly extent: Vector2d = TilePattern.extent;
    public static readonly localCoords: Point2d[] = TilePattern.coords;

    public constructor(colorA: Color, colorB: Color, pattern?: TilePattern) {
        if (!pattern) {
            pattern = Dither.Bayer.patternFromDensity(Dither.Bayer.Density64._0);
        }
        this._pattern = pattern;
        this._colorA = colorA;
        this._colorB = colorB;
    }

    public pattern(): TilePattern {
        return this._pattern;
    }

    public newTile(pattern: TilePattern): Tile {
        return new Tile(this._colorA, this._colorB, pattern);
    }

    public colorAt(index: Point2d): Color {
        const ab = this._pattern.at(index);
        const color = ab === A ? this._colorA : this._colorB;
        return color;
    }

    private _pattern: TilePattern;
    private _colorA: Color;
    private _colorB: Color;
}
