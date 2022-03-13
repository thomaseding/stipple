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

    function identity<T>(x: T): T {
        return x;
    }

    function randomTile(palette: ColorPalette, blacklist: number[] = []): Patch {
        const randIndex = () => {
            let x: number;
            do {
                x = randomRangeInt(0, palette.colorCount());
            } while (blacklist.indexOf(x) >= 0);
            return x;
        };
        const a = randIndex();
        let b: number;
        do {
            b = randIndex();
        } while (b === a);
        const colorA = new IndexedColor(palette, a);
        const colorB = new IndexedColor(palette, b);
        const pattern = Dither.Bayer.patternFromRatio(Math.random());
        return new Patch(colorA, colorB, pattern);
    }

    const defaultTileExtent = Vector2d.square(24);

    function generateRandomTiles(palette: ColorPalette): Grid2d<Patch> {
        return Grid2d.build(defaultTileExtent, () => {
            const blacklist: number[] = [1];
            return randomTile(palette, blacklist);
        });
    }

    function generateTiles(colorA: Color, colorB: Color): Grid2d<Patch> {
        return Grid2d.build(defaultTileExtent, () => {
            return new Patch(colorA, colorB);
        });
    }

    let _cachedBackground: Grid2d<Patch> | null = null;
    function generateBackgroundTilesCached(palette: ColorPalette): Grid2d<Patch> {
        if (!_cachedBackground) {
            _cachedBackground = generateRandomTiles(palette);
        }
        return _cachedBackground;
    }

    let _cachedShape: Grid2d<A | B> | null = null;
    function generateShapeCached(): Grid2d<A | B> {
        if (_cachedShape === null) {
            _cachedShape = generateCircle(8 * 10, B);
        }
        return _cachedShape;
    }

    interface Layers {
        readonly background: Grid2d<Patch>;
        readonly shape: Grid2d<Patch>;
    }

    function generateLayers(palette: ColorPalette, shapePixelOffset = Vector2d.zero): Layers {
        const allTiles = generateBackgroundTilesCached(palette);
        const shape = generateShapeCached().setObjectCoord(shapePixelOffset);
        const shapeTiles = convertToTileGrid(palette, shape);
        //mergeIntoGrid(allTiles, shapeTiles, (tile) => tile.pattern().countOf(B) > 0);
        return {
            background: allTiles,
            shape: shapeTiles,
        };
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
                this.render(false);
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

        public render(redrawAll: boolean): void {
            const startTime = performance.now();
            const ls = this._layers;
            for (const canvas of [this._drawCanvas, this._ditheredCanvas]) {
                if (redrawAll) {
                    canvas.renderTileGrid(Coord2d.origin, ls.background);
                }
                else {
                    const s = ls.shape;
                    const _1 = Coord2d.unit;
                    const _2 = Coord2d.square(2);
                    const bg = ls.background.subgrid(s.position().subtract(_2).max(Coord2d.origin), s.extent().add(_2));
                    canvas.renderTileGrid(Coord2d.origin, bg);
                }
                let transform = canvas === this._drawCanvas ? identity : downscale;
                // canvas.renderTileGrid(Coord2d.origin, transform(ls.shape));
            }
            this._paletteCanvas.render();
            const endTime = performance.now();

            this._drawCanvas.commitRender();
            this._ditheredCanvas.commitRender();
            this._paletteCanvas.commitRender();

            console.log(endTime - startTime);
        }

        public doSomething(): void {
            let defaultLogicalPixelOffset = new Coord2d(2 * Patch.extent.x, 3 * Patch.extent.y);
            let logicalPixelOffset = defaultLogicalPixelOffset;

            const choices = [-1, 0, 1];
            const pixelMax = defaultTileExtent.scale(Patch.extent);
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

            this.render(true);
            setInterval(() => {
                const startTime = performance.now();
                this._layers = generateLayers(this._palette, logicalPixelOffset);
                logicalPixelOffset = new Coord2d(x, y);
                this.render(false);
                const endTime = performance.now();
                //console.log(endTime - startTime);
            }, 100);
        }

        private readonly _palette: ColorPalette = defaultPalette;
        private _prevLayers: Layers = generateLayers(this._palette);
        private _layers: Layers = this._prevLayers;
        private readonly _drawCanvas: DrawCanvas;
        private readonly _ditheredCanvas: DrawCanvas;
        private readonly _paletteCanvas: PaletteCanvas;
    }

    let _app: App | null = null;

    export function main(): void {
        if (_app) {
            throw Error();
        }
        _app = new App("draw-canvas", "dithered-canvas", "palette-canvas");
        _app.doSomething();
    }
}
