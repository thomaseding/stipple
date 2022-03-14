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
            _cachedShape = generateCircle(8 * 10, B);
            //_cachedShape = generateTriangle(8 * 3, B);
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

    interface ShapeOffset {
        pixel: Vector2d,
        dot: Vector2d,
    }

    function generateShapeLayer(palette: ColorPalette, shapeOffset: ShapeOffset): SceneNode<Quilt> {
        //console.log(shapeOffset);
        const abGrid = new OffsetGrid2d(generateShapeCached(), shapeOffset.dot.mod(Patch.extent));
        const buildInfo: BuildQuiltInfo = {
            abGrid: abGrid,
            colorA: new IndexedColor(palette, 0),
            colorB: new IndexedColor(palette, 1),
        };
        //console.log(shapePixelOffset);
        const shape = buildQuilt(buildInfo);
        const node = new SceneNode<Quilt>();
        node.objects.push(shape);
        const xform = Transform2d.sequence([
            Transform2d.translateBy(shapeOffset.dot.divide(Patch.extent).map(Math.floor).multiply(Patch.extent)),
            Transform2d.scaleBy(Vector2d.square(drawScale)),
        ]);
        node.setLocalTransform(xform);
        return node;
    }

    function generateLayers(palette: ColorPalette, shapeOffset: ShapeOffset): Layers {
        const startTime = performance.now();
        const layers: Layers = {
            background: generateBackgroundLayer(palette),
            shape: generateShapeLayer(palette, shapeOffset),
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
            for (const canvas of [this._sceneCanvas, this._ditheredCanvas]) {
                const context = canvas.newRenderContext();

                if (redrawAll) {
                    ls.background.renderTo(context, Transform2d.identity);
                    if (canvas === this._ditheredCanvas) {
                        ls.shape.objects[0] = bayerizeQuilt(ls.shape.objects[0]!);
                    }
                    ls.shape.renderTo(context, Transform2d.identity);
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
            const rect = this._sceneCanvas.canvas().getBoundingClientRect();
            const invDrawScale = 1 / drawScale;
            let pixelOffset = new Vector2d(1, 0).scale(drawScale);

            const pixelOffsetToDotOffset = () => {
                return pixelOffset.scale(invDrawScale).map(Math.floor);
            };
            this._layers = generateLayers(this._palette, {
                pixel: pixelOffset,
                dot: pixelOffsetToDotOffset(),
            });
            this.render(true);

            this._sceneCanvas.canvas().addEventListener("mousemove", (e: MouseEvent) => {
                pixelOffset = new Vector2d(
                    clamp(0, rect.width, e.clientX - rect.left),
                    clamp(0, rect.height, e.clientY - rect.top))
                    .map(Math.floor);
            });

            setInterval(() => {
                this._layers = generateLayers(this._palette, {
                    pixel: pixelOffset,
                    dot: pixelOffsetToDotOffset(),
                });
                this.render(false);
            }, 100);
        }

        private readonly _palette: ColorPalette = defaultPalette;
        private _layers: Layers = {} as Layers;
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
