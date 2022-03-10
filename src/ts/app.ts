/// <reference path="color.ts" />
/// <reference path="geom2d.ts" />
/// <reference path="symbols.ts" />

namespace Stipple {
    function _getCanvas(canvasId: string): HTMLCanvasElement {
        const canvas = document.getElementById(canvasId);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw Error();
        }
        return canvas;
    }

    function clamp(min: number, max: number, value: number): number {
        return Math.min(max, Math.max(min, value));
    }

    function randomTile(palette: ColorPalette): Tile {
        const randIndex = () => randomRangeInt(0, palette.colorCount());
        const tile = new Tile(palette);
        const a = randIndex();
        let b: number;
        do {
            b = randIndex();
        } while (b === a);
        tile.setPaletteIndex(a, A);
        tile.setPaletteIndex(b, B);
        tile.setPattern(Dither.Bayer.patternFromRatio(Math.random()));
        return tile;
    }

    const defaultTileExtent = Coord2d.square(24);

    function generateRandomTiles(palette: ColorPalette): Grid2d<Tile> {
        return Grid2d.build(Coord2d.origin, defaultTileExtent, () => {
            return randomTile(palette);
        });
    }

    function generateBlackTiles(palette: ColorPalette): Grid2d<Tile> {
        return Grid2d.build(Coord2d.origin, defaultTileExtent, () => {
            return new Tile(palette);
        });
    }

    let _cachedBackground: Grid2d<Tile> | null = null;
    function generateBackgroundTilesCached(palette: ColorPalette): Grid2d<Tile> {
        if (!_cachedBackground) {
            _cachedBackground = generateRandomTiles(palette);
        }
        return _cachedBackground.setObjectCoord(Coord2d.origin);
    }

    let _cachedShape: Grid2d<A | B> | null = null;
    function generateShapeCached(): Grid2d<A | B> {
        if (_cachedShape === null) {
            _cachedShape = generateTriangle(8 * 5, B);
        }
        return _cachedShape;
    }

    function generateTiles(palette: ColorPalette, shapePixelOffset = Coord2d.origin): Grid2d<Tile> {
        const allTiles = generateBackgroundTilesCached(palette);
        const shape = generateShapeCached().setObjectCoord(shapePixelOffset);
        const shapeTiles = convertToTileGrid(palette, shape);
        mergeIntoGrid(allTiles, shapeTiles, (tile) => tile.pattern().countOf(B) > 0);
        return allTiles;
    }

    const standardPalette = new ColorPalette([
        Color.black,
        Color.red,
        Color.green,
        Color.blue,
        Color.white,
        Color.mageneta,
        Color.yellow,
        Color.cyan,
    ]);

    const autumnPalette = new ColorPalette([
        new RgbColor(0, 0, 0),
        new RgbColor(128, 128, 0),
        new RgbColor(0, 255, 0),
        new RgbColor(255, 128, 0),
        new RgbColor(64, 0, 0),
        new RgbColor(128, 0, 0),
        new RgbColor(255, 255, 0),
        new RgbColor(255, 0, 0),
    ]);

    const blueSkyPalette = new ColorPalette([
        new RgbColor(0, 0, 236),
        new RgbColor(255, 255, 128),
        new RgbColor(0, 128, 255),
        new RgbColor(128, 255, 255),
        new RgbColor(192, 192, 192),
        new RgbColor(111, 111, 255),
        new RgbColor(128, 0, 255),
        new RgbColor(255, 0, 255),
    ]);

    const defaultPalette = blueSkyPalette;
    const drawScale = 3;

    class App {
        public constructor(drawCanvasId: string, ditheredCanvasId: string, paletteCanvasId: string) {
            const redraw = () => {
                this.render();
            };
            this._drawCanvas = new DrawCanvas({
                canvas: _getCanvas(drawCanvasId),
                pixelScale: drawScale,
                redraw: redraw,
            });
            this._ditheredCanvas = new DrawCanvas({
                canvas: _getCanvas(ditheredCanvasId),
                pixelScale: drawScale,
                redraw: redraw,
            });
            this._paletteCanvas = new PaletteCanvas({
                canvas: _getCanvas(paletteCanvasId),
                pixelScale: 8,
                redraw: redraw,
                palette: this._palette,
            });
        }

        public render() {
            this._drawCanvas.renderTileGrid(Coord2d.origin, this._tiles);
            this._ditheredCanvas.renderTileGrid(Coord2d.origin, downscale(this._tiles));
            this._paletteCanvas.render();
            this._drawCanvas.commitRender();
            this._ditheredCanvas.commitRender();
            this._paletteCanvas.commitRender();
        }

        public doSomething() {
            let defaultLogicalPixelOffset = new Coord2d(2 * Tile.extent.x, 3 * Tile.extent.y);
            let logicalPixelOffset = defaultLogicalPixelOffset;

            const choices = [-1, 0, 1];
            const pixelMax = defaultTileExtent.scale(Tile.extent);
            const rect = this._drawCanvas.canvas().getBoundingClientRect();
            const k = 0.5 * drawScale;
            const left = rect.left + k * _cachedShape!.extent().x;
            const top = rect.top + k * _cachedShape!.extent().y;
            const invDrawScale = 1 / drawScale;

            let x: number = 0;
            let y: number = 0;
            this._drawCanvas.canvas().addEventListener("mousemove", (e: MouseEvent) => {
                let pos = new Coord2d(e.clientX - left, e.clientY - top);
                pos = pos.scale(invDrawScale);
                pos = pos.map(Math.floor);
                x = pos.x;
                y = pos.y;
                x = clamp(0, pixelMax.x, x);
                y = clamp(0, pixelMax.y, y);
            });

            setInterval(() => {
                this._tiles = generateTiles(this._palette, logicalPixelOffset);
                logicalPixelOffset = new Coord2d(x, y);
                this.render();
            }, 100);

            this.render();
        }

        private readonly _palette: ColorPalette = defaultPalette;
        private _tiles: Grid2d<Tile> = generateTiles(this._palette);
        private readonly _drawCanvas: DrawCanvas;
        private readonly _ditheredCanvas: DrawCanvas;
        private readonly _paletteCanvas: PaletteCanvas;
    }

    let _app: App | null = null;

    export function main() {
        if (_app) {
            throw Error();
        }
        _app = new App("draw-canvas", "dithered-canvas", "palette-canvas");
        _app.doSomething();
    }
}
