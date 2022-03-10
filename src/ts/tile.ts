/// <reference path="pattern.ts" />

class Tile {
    protected readonly __brand_Tile: undefined;

    public static readonly extent: Coord2d = TilePattern.extent;
    public static readonly localCoords: Coord2d[] = TilePattern.coords;

    public constructor(palette: ColorPalette, pattern?: TilePattern);
    public constructor(palette: ColorPalette, pattern: TilePattern, indexA: number, indexB: number);
    public constructor(palette: ColorPalette, pattern?: TilePattern, indexA?: number, indexB?: number) {
        if (!pattern) {
            pattern = Dither.Bayer.patternFromDensity(Dither.Bayer.Density64._0);
        }
        this._palette = palette;
        this._pattern = pattern;
        this._indexA = indexA === undefined ? 0 : indexA;
        this._indexB = indexB === undefined ? 1 : indexB;
        console.assert(this._indexA < this._palette.colorCount());
        console.assert(this._indexB < this._palette.colorCount());
    }

    public setPaletteIndex(index: number, ab: A | B): void {
        console.assert(index < this._palette.colorCount());
        switch (ab) {
            case A:
                this._indexA = index;
                break;
            case B:
                this._indexB = index;
                break;
            default:
                throw Error();
        }
    }

    public toPixelGrid(): Grid2d<Pixel> {
        const position = Coord2d.origin;
        const extent = Tile.extent;
        return Grid2d.build(position, extent, (coord: Coord2d) => {
            const color = this._colorAt(coord);
            return new Pixel(color);
        });
    }

    public pattern(): TilePattern {
        return this._pattern;
    }

    public setPattern(pattern: TilePattern): void {
        this._pattern = pattern;
    }

    public palette(): ColorPalette {
        return this._palette;
    }

    public clone(): Tile {
        return new Tile(this._palette, this._pattern, this._indexA, this._indexB);
    }

    private _colorAt(localCoord: Coord2d): Color {
        const ab = this._pattern.at(localCoord);
        const index = ab === A ? this._indexA : this._indexB;
        const color = new IndexedColor(this._palette, index);
        return color;
    }

    private readonly _palette: ColorPalette;
    private _pattern: TilePattern;
    private _indexA: number;
    private _indexB: number;
}
