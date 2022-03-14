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

    //const defaultTileExtent = Vector2d.square(24);
    const defaultTileExtent = Vector2d.square(1);

    function generateRandomQuilt(palette: ColorPalette): Quilt {
        const patches = Grid2d.build(defaultTileExtent, () => {
            const blacklist: number[] = [1];
            return randomTile(palette, blacklist);
        });
        return new Quilt(patches);
    }

    function generateSimpleQuilt(colorA: Color, colorB: Color): Quilt {
        const patches = Grid2d.build(defaultTileExtent, () => {
            return new Patch(colorA, colorB);
        });
        return new Quilt(patches);
    }

    let _cachedBackground: Quilt | null = null;
    function generateBackgroundQuiltCached(palette: ColorPalette): Quilt {
        if (!_cachedBackground) {
            _cachedBackground = generateRandomQuilt(palette);
        }
        return _cachedBackground;
    }

    let _cachedShape: Grid2d<A | B> | null = null;
    function generateShapeCached(): Grid2d<A | B> {
        if (_cachedShape === null) {
            //_cachedShape = generateCircle(8 * 10, B);
            _cachedShape = generateSquare(8 * 1, B);
        }
        return _cachedShape;
    }

    interface Layers {
        readonly background: SceneNode<Quilt>;
        readonly shape: SceneNode<Quilt>;
    }

    function generateBackgroundLayer(palette: ColorPalette): SceneNode<Quilt> {
        const bg = generateBackgroundQuiltCached(palette);
        const node = new SceneNode<Quilt>();
        node.objects.push(bg);
        node.setLocalTransform(Transform2d.scaleBy(Vector2d.square(drawScale)));
        return node;
    }

    function generateShapeLayer(palette: ColorPalette, shapeDotOffset: Vector2d): SceneNode<Quilt> {
        const buildInfo: BuildQuiltInfo = {
            abGrid: generateShapeCached(),
            abGridDotOffset: shapeDotOffset,
            colorA: new IndexedColor(palette, 0),
            colorB: new IndexedColor(palette, 1),
        };
        const shapePixelOffset = shapeDotOffset.scale(drawScale);
        const shape = buildQuilt(buildInfo);
        const node = new SceneNode<Quilt>();
        node.objects.push(shape);
        node.setLocalTransform(Transform2d.scaleBy(Vector2d.square(drawScale)).then(Transform2d.translateBy(shapePixelOffset)));
        return node;
    }

    function generateLayers(palette: ColorPalette, shapePixelOffset = Vector2d.zero): Layers {
        const startTime = performance.now();
        const shapeDotOffset = shapePixelOffset.divide(Patch.extent).map(Math.floor);
        const layers: Layers = {
            background: generateBackgroundLayer(palette),
            shape: generateShapeLayer(palette, shapeDotOffset),
        };
        const endTime = performance.now();
        console.log("generateLayers", endTime - startTime);
        return layers;
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
            this._sceneCanvas = new SceneCanvas({
                canvas: _getCanvas(drawCanvasId),
                pixelScale: drawScale,
                redraw: redraw,
            });
            this._ditheredCanvas = new SceneCanvas({
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
            redrawAll = true; // TODO
            const startTime = performance.now();
            const ls = this._layers;
            //for (const canvas of [this._sceneCanvas, this._ditheredCanvas]) {
            for (const canvas of [this._sceneCanvas]) {
                const context = canvas.newRenderContext();

                const xform = Transform2d.sequence([
                    Transform2d.translateBy(new Vector2d(1, 4)),
                    Transform2d.scaleBy(Vector2d.square(3)),
                ]);

                const patch1 = new Patch(Color.yellow, Color.black, Dither.Bayer.patternFromRatio(0.5));
                const patch2 = new Patch(Color.blue, Color.white, Dither.Bayer.patternFromRatio(0.5));
                const patchGrid = Grid2d.from2d([[patch1, patch2]]);
                const quilt = new Quilt(patchGrid);
                quilt.renderTo(context, xform);

                if (redrawAll) {
                    //ls.background.renderTo(context, Transform2d.identity);
                    //if (canvas === this._ditheredCanvas) {
                    //ls.shape.objects[0] = bayerizeQuilt(ls.shape.objects[0]!);
                    //}
                    //ls.shape.renderTo(context, Transform2d.identity);
                }
                else {
                    throw Error("todo");
                }
                canvas.commit(context);
            }
            this._paletteCanvas.render();
            const endTime = performance.now();
            console.log("App.render", endTime - startTime);
        }

        public doSomething(): void {
            let defaultLogicalPixelOffset = new Vector2d(2 * Patch.extent.x, 3 * Patch.extent.y);
            let logicalPixelOffset = defaultLogicalPixelOffset;

            const choices = [-1, 0, 1];
            const pixelMax = defaultTileExtent.multiply(Patch.extent);
            const rect = this._sceneCanvas.canvas().getBoundingClientRect();
            const k = 0.5 * drawScale;
            const left = rect.left + k * _cachedShape!.extent().x;
            const top = rect.top + k * _cachedShape!.extent().y;
            const invDrawScale = 1 / drawScale;

            let x: number = 0;
            let y: number = 0;
            this._sceneCanvas.canvas().addEventListener("mousemove", (e: MouseEvent) => {
                let offset = new Vector2d(e.clientX - left, e.clientY - top);
                offset = offset.scale(invDrawScale);
                offset = offset.map(Math.floor);
                x = offset.x;
                y = offset.y;
                x = clamp(0, pixelMax.x, x);
                y = clamp(0, pixelMax.y, y);
            });

            this.render(true);
            setInterval(() => {
                this._layers = generateLayers(this._palette, logicalPixelOffset);
                logicalPixelOffset = new Vector2d(x, y);
                this.render(false);
            }, 100);
        }

        private readonly _palette: ColorPalette = defaultPalette;
        private _prevLayers: Layers = generateLayers(this._palette);
        private _layers: Layers = this._prevLayers;
        private readonly _sceneCanvas: SceneCanvas;
        private readonly _ditheredCanvas: SceneCanvas;
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
