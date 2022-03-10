/// <reference path="color.ts" />
/// <reference path="geom2d.ts" />

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

    const disable: boolean = false;

    const defaultTileExtent = Coord2d.square(50);

    function generateRandomTiles(palette: ColorPalette): Grid2d<Tile> {
        return new Grid2d(Coord2d.origin, defaultTileExtent, () => {
            return randomTile(palette);
        });
    }

    function generateBlackTiles(palette: ColorPalette): Grid2d<Tile> {
        return new Grid2d(Coord2d.origin, defaultTileExtent, () => {
            return new Tile(palette);
        });
    }

    function generateTiles(palette: ColorPalette, shapeOffset = Coord2d.origin): Grid2d<Tile> {
        const allTiles = generateBlackTiles(palette);
        let shape = generateTriangle(80, B);
        shape = shape.setObjectCoord(shapeOffset);
        const shapeTiles = convertToTileGrid(palette, shape);
        mergeIntoGrid(allTiles, shapeTiles);
        return allTiles;
    }

    const defaultPalette = new ColorPalette([
        Color.black,
        Color.red,
        Color.green,
        Color.blue,
        Color.white,
        Color.mageneta,
        Color.yellow,
        Color.cyan,
    ]);

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
        }

        public doSomething() {
            let pixelOffset = Coord2d.square(55);

            const choices = [-1, 0, 1];
            const pixelMax = defaultTileExtent.scale(Tile.extent);
            const rect = this._drawCanvas.canvas().getBoundingClientRect();
            const scale = 1 / drawScale;

            let x: number = 0;
            let y: number = 0;
            this._drawCanvas.canvas().addEventListener("mousemove", (e: MouseEvent) => {
                let pos = new Coord2d(e.clientX - rect.left, e.clientY - rect.top);
                pos = pos.scale(scale);
                pos = pos.map(Math.floor);
                x = pos.x;
                y = pos.y;
                x = clamp(0, pixelMax.x, x);
                y = clamp(0, pixelMax.y, y);
            });

            setInterval(() => {
                this._tiles = generateTiles(this._palette, pixelOffset);
                pixelOffset = new Coord2d(x, y);
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
