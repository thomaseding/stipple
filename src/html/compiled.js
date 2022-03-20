"use strict";
function hexByte(byte) {
    let hex = byte.toString(16);
    if (hex.length === 1) {
        hex = "0" + hex;
    }
    return hex;
}
class RgbColor {
    constructor(red = 0, green = 0, blue = 0) {
        if (typeof red === "number") {
            this.red = red;
            this.green = green;
            this.blue = blue;
        }
        else {
            const rgb = red.toRgb();
            this.red = rgb.red;
            this.green = rgb.green;
            this.blue = rgb.blue;
        }
    }
    static parseHex(hex) {
        const regex = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
        const result = regex.exec(hex);
        if (result === null) {
            return null;
        }
        const r = Number.parseInt(result[1], 16);
        const g = Number.parseInt(result[2], 16);
        const b = Number.parseInt(result[3], 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return null;
        }
        return new RgbColor(r, g, b);
    }
    toRgb() {
        return this;
    }
    toString() {
        const r = hexByte(this.red);
        const g = hexByte(this.green);
        const b = hexByte(this.blue);
        return `#${r}${g}${b}`;
    }
    scale(k) {
        const r = Math.floor(k * this.red);
        const g = Math.floor(k * this.green);
        const b = Math.floor(k * this.blue);
        const color = new RgbColor(r, g, b);
        return color;
    }
}
var Color;
(function (Color) {
    Color.black = new RgbColor(0x00, 0x00, 0x00);
    Color.white = new RgbColor(0xFF, 0xFF, 0xFF);
    Color.gray = new RgbColor(0x80, 0x80, 0x80);
    Color.red = new RgbColor(0xFF, 0x00, 0x00);
    Color.green = new RgbColor(0x00, 0xFF, 0x00);
    Color.blue = new RgbColor(0x00, 0x00, 0xFF);
    Color.yellow = new RgbColor(0xFF, 0xFF, 0x00);
    Color.cyan = new RgbColor(0x00, 0xFF, 0xFF);
    Color.mageneta = new RgbColor(0xFF, 0x00, 0xFF);
})(Color || (Color = {}));
class ColorPalette {
    constructor(input) {
        if (typeof input === "number") {
            const colorCount = input;
            this._colors = [];
            for (let i = 0; i < colorCount; ++i) {
                this._colors.push(new RgbColor());
            }
        }
        else {
            const colors = input;
            this._colors = colors.slice();
        }
        console.assert(this._colors.length >= 2);
    }
    colorCount() {
        return this._colors.length;
    }
    color(index) {
        const color = this._colors[index];
        if (color === undefined) {
            throw Error();
        }
        return color;
    }
    setColor(index, color) {
        if (index >= this._colors.length) {
            throw Error();
        }
        this._colors[index] = color;
    }
}
class IndexedColor {
    constructor(palette, index) {
        this._palette = palette;
        this._index = index;
    }
    get() {
        return this._palette.color(this._index);
    }
    toRgb() {
        return this.get().toRgb();
    }
    index() {
        return this._index;
    }
    toString() {
        return `indexed-${this.toRgb()}@${this._index}`;
    }
}
class CoordImpl {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    isInteger() {
        return Number.isInteger(this.x) && Number.isInteger(this.y);
    }
}
class Point2d extends CoordImpl {
    constructor(x, y) {
        super(x, y);
    }
    toPoint() {
        return this;
    }
    toVector() {
        return new Vector2d(this.x, this.y);
    }
    add(other) {
        return new Point2d(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Point2d(this.x - other.x, this.y - other.y);
    }
    map(func) {
        return new Point2d(func(this.x), func(this.y));
    }
    zipWith(other, func) {
        return new Point2d(func(this.x, other.x), func(this.y, other.y));
    }
    min(other) {
        return new Point2d(Math.min(this.x, other.x), Math.min(this.y, other.y));
    }
    max(other) {
        return new Point2d(Math.max(this.x, other.x), Math.max(this.y, other.y));
    }
}
Point2d.origin = new Point2d(0, 0);
class Vector2d extends CoordImpl {
    constructor(x, y) {
        super(x, y);
    }
    static square(dim) {
        return new Vector2d(dim, dim);
    }
    static fromTo(from, to) {
        return new Vector2d(to.x - from.x, to.y - from.y);
    }
    toPoint() {
        return new Point2d(this.x, this.y);
    }
    scale(k) {
        return new Vector2d(k * this.x, k * this.y);
    }
    negate() {
        return new Vector2d(-1 * this.x, -1 * this.y);
    }
    multiply(other) {
        return new Vector2d(other.x * this.x, other.y * this.y);
    }
    add(other) {
        return new Vector2d(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Vector2d(this.x - other.x, this.y - other.y);
    }
    divide(other) {
        return new Vector2d(this.x / other.x, this.y / other.y);
    }
    mod(other) {
        return new Vector2d(this.x % other.x, this.y % other.y);
    }
    divides(other) {
        return other.divide(this).isInteger();
    }
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }
    magnitude() {
        return Math.sqrt(this.magnitudeSquared());
    }
    area() {
        return this.x * this.y;
    }
    map(func) {
        return new Vector2d(func(this.x), func(this.y));
    }
    zipWith(other, func) {
        return new Vector2d(func(this.x, other.x), func(this.y, other.y));
    }
    min(other) {
        return new Vector2d(Math.min(this.x, other.x), Math.min(this.y, other.y));
    }
    max(other) {
        return new Vector2d(Math.max(this.x, other.x), Math.max(this.y, other.y));
    }
}
Vector2d.zero = new Vector2d(0, 0);
Vector2d.unit = new Vector2d(1, 1);
class Box2d {
    constructor(position, extent) {
        this._min = position;
        this._extent = extent;
    }
    forEachPosition(action) {
        for (let y = 0; y < this._extent.y; ++y) {
            for (let x = 0; x < this._extent.x; ++x) {
                action(this._min.add(new Vector2d(x, y)));
            }
        }
    }
    min() {
        return this._min;
    }
    max() {
        return this._min.add(this._extent);
    }
    extent() {
        return this._extent;
    }
    area() {
        return this._extent.area();
    }
    containsPoint(point) {
        const min = this._min;
        const max = this.max();
        return min.x <= point.x && point.x < max.x
            && min.y <= point.y && point.y < max.y;
    }
    isDegenerate() {
        return this._extent.x < 0 || this._extent.y < 0;
    }
    containsBox(other) {
        return this.containsPoint(other._min)
            && this.containsPoint(other.max().subtract(Vector2d.unit));
    }
    intersect(other) {
        const min = this._min.zipWith(other._min, Math.max);
        const max = this.max().zipWith(other.max(), Math.min);
        return new Box2d(min, Vector2d.fromTo(min, max));
    }
}
class ReadonlyGrid2d {
    constructor(extent, arg2) {
        this._extent = extent;
        if (Array.isArray(arg2)) {
            const linearGrid = arg2;
            this._linearGrid = linearGrid;
        }
        else {
            const initialValue = arg2;
            this._linearGrid = [];
            const box = new Box2d(Point2d.origin, extent);
            box.forEachPosition((position) => {
                this._linearGrid.push(initialValue(position));
            });
        }
        if (this._extent.area() !== this._linearGrid.length) {
            throw Error();
        }
    }
    extent() {
        return this._extent;
    }
    getAt(index) {
        const linear = this._linearize(index);
        const value = this._linearGrid[linear];
        if (value === undefined) {
            throw Error();
        }
        return value;
    }
    _linearize(index) {
        if (index.x >= this._extent.x) {
            throw Error();
        }
        if (index.y >= this._extent.y) {
            throw Error();
        }
        return index.y * this._extent.x + index.x;
    }
}
class Grid2d extends ReadonlyGrid2d {
    static build(extent, initialValue) {
        return new Grid2d(extent, initialValue);
    }
    static fill(extent, initialValue) {
        const linearGrid = Array(extent.x * extent.y).fill(initialValue);
        return new Grid2d(extent, linearGrid);
    }
    static from1d(extent, linearGrid) {
        return new Grid2d(extent, linearGrid.slice());
    }
    static from2d(grid) {
        const linearGrid = [];
        const height = grid.length;
        const width = grid[0]?.length || 0;
        const consistent = grid.every((lane) => {
            return lane.length === width;
        });
        if (!consistent) {
            throw Error();
        }
        grid.forEach((xs) => {
            xs.forEach((x) => {
                linearGrid.push(x);
            });
        });
        const extent = new Vector2d(width, height);
        return new Grid2d(extent, linearGrid);
    }
    setAt(index, value) {
        const linear = this._linearize(index);
        if (this._linearGrid.length <= linear) {
            throw Error();
        }
        this._linearGrid[linear] = value;
    }
}
class OffsetGrid2d {
    constructor(grid, offset) {
        this._grid = grid;
        this._box = new Box2d(offset.toPoint(), grid.extent());
    }
    applyAdditionalOffset(offset) {
        const newOffset = this._box.min().add(offset).toVector();
        return new OffsetGrid2d(this._grid, newOffset);
    }
    getAt(pos) {
        if (this._box.containsPoint(pos.toPoint())) {
            const i = pos.subtract(this._box.min().toVector());
            return this._grid.getAt(i);
        }
        return undefined;
    }
    setAt(pos, value) {
        if (this._box.containsPoint(pos.toPoint())) {
            const i = pos.subtract(this._box.min().toVector());
            this._grid.setAt(i, value);
        }
    }
    box() {
        return this._box;
    }
    offset() {
        return this._box.min().toVector();
    }
    overlayWith(other, combine) {
        const iBox = this._box.intersect(other._box);
        if (iBox.isDegenerate()) {
            return;
        }
        const iExtent = iBox.extent();
        const offsetTI = Vector2d.fromTo(this._box.min(), iBox.min());
        for (let y = 0; y < iExtent.y; ++y) {
            for (let x = 0; x < iExtent.x; ++x) {
                const globalPos = new Point2d(x, y).add(offsetTI);
                const newValue = other.getAt(globalPos);
                const oldValue = this.getAt(globalPos);
                if (!newValue || !oldValue) {
                    throw Error();
                }
                const combinedValue = combine(oldValue, newValue);
                this.setAt(globalPos, combinedValue);
            }
        }
    }
}
class Transform2d {
    constructor(translation, scale) {
        this._translation = translation;
        this._scale = scale;
    }
    static translateBy(translation) {
        return new Transform2d(translation, Vector2d.unit);
    }
    static scaleBy(scale) {
        console.assert(scale.x >= 0, "use 3x3 matrices at this point if needed");
        console.assert(scale.y >= 0, "use 3x3 matrices at this point if needed");
        return new Transform2d(Vector2d.zero, scale);
    }
    static sequence(transforms) {
        let total = Transform2d.identity;
        for (const transform of transforms) {
            total = total.then(transform);
        }
        return total;
    }
    then(next) {
        return new Transform2d(this._translation.multiply(next._scale).add(next._translation), this._scale.multiply(next._scale));
    }
    applyToPoint(p) {
        const t = this._translation;
        const s = this._scale;
        return new Point2d(s.x * p.x + t.x, s.y * p.y + t.y);
    }
    translation() {
        return this._translation;
    }
    scale() {
        return this._scale;
    }
}
Transform2d.identity = new Transform2d(Vector2d.zero, Vector2d.unit);
const A = { __brand_A: "A" };
const B = { __brand_B: "B" };
function flipAB(ab) {
    return ab === A ? B : A;
}
const Dim1 = { __brand_Dim1: "Dim1" };
const Dim2 = { __brand_Dim2: "Dim2" };
/// <reference path="color.ts" />
/// <reference path="geom2d.ts" />
/// <reference path="symbols.ts" />
var Stipple;
(function (Stipple) {
    function _getCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw Error();
        }
        return canvas;
    }
    function randomTile(palette, blacklist = []) {
        const randIndex = () => {
            let x;
            do {
                x = randomRangeInt(0, palette.colorCount());
            } while (blacklist.indexOf(x) >= 0);
            return x;
        };
        const a = randIndex();
        let b;
        do {
            b = randIndex();
        } while (b === a);
        const colorA = new IndexedColor(palette, a);
        const colorB = new IndexedColor(palette, b);
        const pattern = Dither.Bayer.patternFromRatio(Math.random());
        return new Patch(colorA, colorB, pattern);
    }
    const backgroundTileExtent = Vector2d.square(24);
    function generateRandomQuilt(palette) {
        const patches = Grid2d.build(backgroundTileExtent, () => {
            const blacklist = [1];
            return randomTile(palette, blacklist);
        });
        return new Quilt(patches);
    }
    function generateSimpleQuilt(colorA, colorB) {
        const patches = Grid2d.build(backgroundTileExtent, () => {
            return new Patch(colorA, colorB);
        });
        return new Quilt(patches);
    }
    let _cachedBackground = null;
    function generateBackgroundQuiltCached(palette) {
        if (!_cachedBackground) {
            _cachedBackground = generateRandomQuilt(palette);
        }
        return _cachedBackground;
    }
    let _cachedShape = null;
    function generateShapeCached() {
        if (_cachedShape === null) {
            _cachedShape = generateCircle(8 * 10, B);
            //_cachedShape = generateTriangle(8 * 3, B);
        }
        return _cachedShape;
    }
    function generateBackgroundLayer(palette) {
        return new OffsetQuilt(generateBackgroundQuiltCached(palette), Vector2d.zero);
    }
    function generateShapeLayer(palette, shapeOffset) {
        const bg = generateBackgroundQuiltCached(palette).grid();
        const shapeMinPatchOffset = shapeOffset.dot.divide(Patch.extent).map(Math.floor);
        const abGrid = new OffsetGrid2d(generateShapeCached(), shapeOffset.dot.mod(Patch.extent));
        const buildInfo = {
            abGrid: abGrid,
            colorB: new IndexedColor(palette, 1),
        };
        const shape = buildQuilt(buildInfo);
        return new OffsetQuilt(shape, shapeMinPatchOffset);
    }
    function generateLayers(palette, shapeOffset) {
        const layers = {
            background: generateBackgroundLayer(palette),
            shape: generateShapeLayer(palette, shapeOffset),
        };
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
        constructor(drawCanvasId, ditheredCanvasId, paletteCanvasId) {
            this._palette = defaultPalette;
            this._layers = {};
            this._composite = new OffsetQuilt(new Quilt(Grid2d.fill(backgroundTileExtent, Patch.black)), Vector2d.zero);
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
        render(redrawAll) {
            redrawAll = true; // TODO
            const startTime = performance.now();
            const ls = this._layers;
            const drawTransform = Transform2d.scaleBy(Vector2d.square(drawScale));
            for (const canvas of [this._sceneCanvas, this._ditheredCanvas]) {
                if (redrawAll) {
                    this._composite.overlayWith(ls.background);
                }
                else {
                    throw Error("todo");
                }
                let shape = ls.shape;
                if (canvas === this._ditheredCanvas) {
                    shape = bayerizeQuilt(shape);
                }
                this._composite.overlayWith(shape);
                const context = canvas.newRenderContext();
                this._composite.renderTo(context, drawTransform);
                canvas.commit(context);
            }
            this._paletteCanvas.render();
            const endTime = performance.now();
            console.log("App.render", endTime - startTime);
        }
        doSomething() {
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
            const shape = generateShapeCached();
            const k = drawScale * 0.5;
            const left = rect.left + k * shape.extent().x;
            const top = rect.top + k * shape.extent().y;
            this._sceneCanvas.canvas().addEventListener("mousemove", (e) => {
                //pixelOffset = new Vector2d(
                //    clamp(0, rect.width, e.clientX - left),
                //    clamp(0, rect.height, e.clientY - top))
                //    .map(Math.floor);
                pixelOffset = new Vector2d(e.clientX - left, e.clientY - top)
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
    }
    let _app = null;
    function main() {
        if (_app) {
            throw Error();
        }
        _app = new App("draw-canvas", "dithered-canvas", "palette-canvas");
        _app.doSomething();
    }
    Stipple.main = main;
})(Stipple || (Stipple = {}));
class Assets {
    constructor() {
        this._cache = {};
    }
    getImageData(path) {
        const image = this._cache[path];
        if (image instanceof ImageData) {
            return image;
        }
        throw Error("todo");
    }
}
Assets._this = new Assets();
class Canvas {
    constructor(info) {
        if (!Number.isInteger(info.pixelScale) || info.pixelScale <= 0) {
            throw Error();
        }
        this._canvas = info.canvas;
        const context = this._canvas.getContext("2d");
        if (context === null) {
            throw Error();
        }
        this._context = context;
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._redraw = info.redraw;
        this._pixelScale = info.pixelScale;
    }
    fillRect(min, extent, color) {
        const rgb = color.toRgb();
        this._context.fillStyle = rgb.toString();
        this._context.fillRect(min.x, min.y, extent.x, extent.y);
    }
    strokeRect(min, extent, color) {
        const rgb = color.toRgb();
        this._context.strokeStyle = rgb.toString();
        this._context.strokeRect(min.x, min.y, extent.x, extent.y);
    }
    canvas() {
        return this._canvas;
    }
    newRenderContext() {
        return new RenderContext(this._imageData);
    }
    commit(context) {
        if (this._imageData !== context._imageData) {
            throw Error();
        }
        this._context.putImageData(this._imageData, 0, 0);
    }
}
function clamp(min, max, value) {
    return Math.min(max, Math.max(min, value));
}
function identity(x) {
    return x;
}
function assertNever(_) {
    throw Error();
}
class Dot {
    constructor(color) {
        this.color = color;
    }
    renderTo(context, transform) {
        const rgb = this.color.toRgb();
        const t = transform.translation();
        const s = transform.scale();
        for (let x = 0; x < s.x; ++x) {
            for (let y = 0; y < s.y; ++y) {
                context.renderPixel(x + t.x, y + t.y, rgb);
            }
        }
    }
}
class OpenPromise {
    constructor() {
        this._resolve = null;
        this._reject = null;
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
    then(onfulfilled, onrejected) {
        return this._promise.then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this._promise.catch(onrejected);
    }
    finally(onfinally) {
        return this._promise.finally(onfinally);
    }
    resolve(value) {
        if (!this._resolve) {
            throw Error();
        }
        this._resolve(value);
        this._complete();
    }
    reject(reason) {
        if (!this._reject) {
            throw Error();
        }
        this._reject(reason);
        this._complete();
    }
    isComplete() {
        return this._resolve === null;
    }
    _complete() {
        this._resolve = null;
        this._reject = null;
    }
}
Symbol.toStringTag;
/// <reference path="promise.ts" />
var Mains;
(function (Mains) {
    function main(entry) {
        console.log(globalThis);
        switch (entry) {
            case "stipple":
                newThread("webworker-demo");
                return Stipple.main();
            case "webworker-demo":
                return WebWorkerDemo.main();
            default:
                assertNever(entry);
        }
    }
    Mains.main = main;
    async function newThread(entry) {
        const ready = new OpenPromise();
        const worker = new Worker("compiled.js");
        worker.onmessage = () => {
            worker.onmessage = null;
            ready.resolve(worker);
        };
        worker.postMessage(entry);
        return ready;
    }
    Mains.newThread = newThread;
    const _isWorkerThread = !("Window" in globalThis);
    if (_isWorkerThread) {
        globalThis.onmessage = (e) => {
            globalThis.onmessage = null;
            main(e.data);
        };
    }
})(Mains || (Mains = {}));
/// <reference path="geom2d.ts" />
var _a;
class PatchPattern {
    constructor(grid) {
        if (!grid.extent().equals(PatchPattern.extent)) {
            throw Error();
        }
        this._grid = grid;
    }
    at(position) {
        return this._grid.getAt(position);
    }
    forEach(action) {
        const box = new Box2d(Point2d.origin, this._grid.extent());
        box.forEachPosition((position) => {
            const ab = this._grid.getAt(position);
            action(position, ab);
        });
    }
    countOf(ab) {
        let count = 0;
        this.forEach((_, value) => {
            if (value === ab) {
                ++count;
            }
        });
        return count;
    }
    static _generateCoords(extent) {
        const coords = [];
        const box = new Box2d(Point2d.origin, extent);
        box.forEachPosition((coord) => {
            coords.push(coord);
        });
        return coords;
    }
}
_a = PatchPattern;
PatchPattern.dim = 8;
PatchPattern.extent = Vector2d.square(_a.dim);
PatchPattern.coords = _a._generateCoords(_a.extent);
/// <reference path="../pattern.ts" />
var Dither;
(function (Dither) {
    var Bayer;
    (function (Bayer) {
        let Density64;
        (function (Density64) {
            Density64[Density64["_0"] = 0] = "_0";
            Density64[Density64["_1"] = 1] = "_1";
            Density64[Density64["_2"] = 2] = "_2";
            Density64[Density64["_4"] = 3] = "_4";
            Density64[Density64["_8"] = 4] = "_8";
            Density64[Density64["_10"] = 5] = "_10";
            Density64[Density64["_16"] = 6] = "_16";
            Density64[Density64["_20"] = 7] = "_20";
            Density64[Density64["_24"] = 8] = "_24";
            Density64[Density64["_28"] = 9] = "_28";
            Density64[Density64["_32"] = 10] = "_32";
            Density64[Density64["_36"] = 11] = "_36";
            Density64[Density64["_40"] = 12] = "_40";
            Density64[Density64["_44"] = 13] = "_44";
            Density64[Density64["_48"] = 14] = "_48";
            Density64[Density64["_54"] = 15] = "_54";
            Density64[Density64["_56"] = 16] = "_56";
            Density64[Density64["_60"] = 17] = "_60";
            Density64[Density64["_62"] = 18] = "_62";
            Density64[Density64["_63"] = 19] = "_63";
            Density64[Density64["_64"] = 20] = "_64";
        })(Density64 = Bayer.Density64 || (Bayer.Density64 = {}));
        function patternFromDensity(density) {
            let pattern = _patterns[density];
            if (pattern === undefined) {
                throw Error();
            }
            return pattern;
        }
        Bayer.patternFromDensity = patternFromDensity;
        function patternFromRatio(ratio) {
            if (ratio < 0 || ratio > 1) {
                throw Error();
            }
            const n = _ratios.length - 1;
            for (let i = 0; i < n; ++i) {
                const low = _ratios[i];
                const high = _ratios[i + 1];
                if (low <= ratio && ratio <= high) {
                    const deltaLow = Math.abs(ratio - low);
                    const deltaHigh = Math.abs(ratio - high);
                    const densityIndex = deltaLow <= deltaHigh ? i : i + 1;
                    const density = _densityToEnum(_densities[densityIndex]);
                    return patternFromDensity(density);
                }
            }
            throw Error();
        }
        Bayer.patternFromRatio = patternFromRatio;
        function _densityToEnum(density) {
            switch (density) {
                case 0: return Density64._0;
                case 1: return Density64._1;
                case 2: return Density64._2;
                case 4: return Density64._4;
                case 8: return Density64._8;
                case 10: return Density64._10;
                case 16: return Density64._16;
                case 20: return Density64._20;
                case 24: return Density64._24;
                case 28: return Density64._28;
                case 32: return Density64._32;
                case 36: return Density64._36;
                case 40: return Density64._40;
                case 44: return Density64._44;
                case 48: return Density64._48;
                case 54: return Density64._54;
                case 56: return Density64._56;
                case 60: return Density64._60;
                case 62: return Density64._62;
                case 63: return Density64._63;
                case 64: return Density64._64;
                default: throw Error();
            }
        }
        const _densities = [
            0,
            1,
            2,
            4,
            8,
            10,
            16,
            20,
            24,
            28,
            32,
            36,
            40,
            44,
            48,
            54,
            56,
            60,
            62,
            63,
            64,
        ];
        const _ratios = _densities.map((d) => d / 64);
        function _convert(c) {
            switch (c) {
                case '.': return A;
                case 'X': return B;
                default: throw Error();
            }
        }
        function makePattern(encoding) {
            const gridArray = [];
            for (const lane of encoding) {
                const converted = lane.split("").map(_convert);
                gridArray.push(converted);
            }
            const grid = Grid2d.from2d(gridArray);
            return new PatchPattern(grid);
        }
        const _patterns = [
            // 0
            makePattern([
                "........",
                "........",
                "........",
                "........",
                "........",
                "........",
                "........",
                "........",
            ]),
            // 1
            makePattern([
                "........",
                "........",
                "........",
                "........",
                "........",
                ".....X..",
                "........",
                "........",
            ]),
            // 2
            makePattern([
                "........",
                ".X......",
                "........",
                "........",
                "........",
                ".....X..",
                "........",
                "........",
            ]),
            // 3
            makePattern([
                "........",
                ".X...X..",
                "........",
                "........",
                "........",
                ".X...X..",
                "........",
                "........",
            ]),
            // 4
            makePattern([
                "........",
                "X...X...",
                "........",
                "..X...X.",
                "........",
                "X...X...",
                "........",
                "..X...X.",
            ]),
            // 5
            makePattern([
                "........",
                "X...X.X.",
                "........",
                "..X...X.",
                "........",
                "X.X.X...",
                "........",
                "..X...X.",
            ]),
            // 6
            makePattern([
                "........",
                "X.X.X.X.",
                "........",
                "X.X.X.X.",
                "........",
                "X.X.X.X.",
                "........",
                "X.X.X.X.",
            ]),
            // 7
            makePattern([
                "........",
                "X.X.X.X.",
                ".X...X..",
                "X.X.X.X.",
                "........",
                "X.X.X.X.",
                ".X...X..",
                "X.X.X.X.",
            ]),
            // 8
            makePattern([
                ".X...X..",
                "X.X.X.X.",
                "...X...X",
                "X.X.X.X.",
                ".X...X..",
                "X.X.X.X.",
                "...X...X",
                "X.X.X.X.",
            ]),
            // 9
            makePattern([
                ".X...X..",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
                ".X...X..",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
            ]),
            // 10
            makePattern([
                ".X.X.X.X",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
            ]),
            // 11
            makePattern([
                "XX.XXX.X",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
                "XX.XXX.X",
                "X.X.X.X.",
                ".X.X.X.X",
                "X.X.X.X.",
            ]),
            // 12
            makePattern([
                "XX.XXX.X",
                "X.X.X.X.",
                ".XXX.XXX",
                "X.X.X.X.",
                "XX.XXX.X",
                "X.X.X.X.",
                ".XXX.XXX",
                "X.X.X.X.",
            ]),
            // 13
            makePattern([
                "XXXXXXXX",
                "X.X.X.X.",
                "XX.XXX.X",
                "X.X.X.X.",
                "XXXXXXXX",
                "X.X.X.X.",
                "XX.XXX.X",
                "X.X.X.X.",
            ]),
            // 14
            makePattern([
                "XXXXXXXX",
                "X.X.X.X.",
                "XXXXXXXX",
                "X.X.X.X.",
                "XXXXXXXX",
                "X.X.X.X.",
                "XXXXXXXX",
                "X.X.X.X.",
            ]),
            // 15
            makePattern([
                "XXXXXXXX",
                "X.X.XXX.",
                "XXXXXXXX",
                "X.XXX.XX",
                "XXXXXXXX",
                "XXX.X.X.",
                "XXXXXXXX",
                "X.XXX.XX",
            ]),
            // 16
            makePattern([
                "XXXXXXXX",
                "XXX.XXX.",
                "XXXXXXXX",
                "X.XXX.XX",
                "XXXXXXXX",
                "XXX.XXX.",
                "XXXXXXXX",
                "X.XXX.XX",
            ]),
            // 17
            makePattern([
                "XXXXXXXX",
                "XX.XXX.X",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XX.XXX.X",
                "XXXXXXXX",
                "XXXXXXXX",
            ]),
            // 18
            makePattern([
                "XXXXXXXX",
                "XXXXXX.X",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XX.XXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
            ]),
            // 19
            makePattern([
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XX.XXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
            ]),
            // 20
            makePattern([
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
                "XXXXXXXX",
            ]),
        ];
    })(Bayer = Dither.Bayer || (Dither.Bayer = {}));
})(Dither || (Dither = {}));
/// <reference path="pattern.ts" />
/// <reference path="dither/bayer.ts" />
class Patch {
    constructor(colorA, colorB, pattern) {
        if (!pattern) {
            pattern = Dither.Bayer.patternFromDensity(Dither.Bayer.Density64._0);
        }
        this._pattern = pattern;
        this.colorA = colorA;
        this.colorB = colorB;
    }
    pattern() {
        return this._pattern;
    }
    updatePattern(pattern) {
        return new Patch(this.colorA, this.colorB, pattern);
    }
    colorAt(index) {
        const ab = this._pattern.at(index);
        const color = ab === A ? this.colorA : this.colorB;
        return color;
    }
    renderTo(context, transform) {
        for (const dotOffset of Patch.localOffsets) {
            const color = this.colorAt(dotOffset);
            if (color) {
                const dot = new Dot(color);
                const dotTransform = Transform2d.translateBy(dotOffset).then(transform);
                dot.renderTo(context, dotTransform);
            }
        }
    }
    mostProminentColor() {
        return this.pattern().countOf(A) <= 32 ? this.colorB : this.colorA;
    }
}
Patch.extent = PatchPattern.extent;
Patch.localOffsets = PatchPattern.coords.map(p => p.toVector());
Patch.black = new Patch(Color.black, Color.black);
class Quilt {
    constructor(grid) {
        this._grid = grid;
    }
    renderTo(context, transform) {
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
    grid() {
        return this._grid;
    }
}
class OffsetQuilt {
    constructor(quilt, offset) {
        this._quilt = quilt;
        this._box = new Box2d(offset.toPoint(), quilt.grid().extent());
    }
    renderTo(context, transform) {
        const xform = Transform2d.translateBy(this._box.min().toVector().multiply(Patch.extent)).then(transform);
        this._quilt.renderTo(context, xform);
    }
    box() {
        return this._box;
    }
    withoutOffset() {
        return this._quilt;
    }
    overlayWith(other) {
        const otherGrid = other._grid();
        const thisGrid = this._grid();
        thisGrid.overlayWith(otherGrid, OffsetQuilt._patchCombine);
    }
    static _patchCombine(oldPatch, newPatch) {
        if (newPatch.colorA) {
            if (newPatch.colorB) {
                return newPatch;
            }
            if (newPatch.pattern().countOf(A) === 0) {
                return oldPatch;
            }
            const color = oldPatch.mostProminentColor();
            return new Patch(newPatch.colorA, color, newPatch.pattern());
        }
        if (!newPatch.colorB) {
            return oldPatch;
        }
        if (newPatch.pattern().countOf(B) === 0) {
            return oldPatch;
        }
        const color = oldPatch.mostProminentColor();
        return new Patch(color, newPatch.colorB, newPatch.pattern());
    }
    _grid() {
        return new OffsetGrid2d(this._quilt.grid(), this._box.min().toVector());
    }
}
/// <reference path="patch.ts" />
function generateSquare(dim, ab) {
    const grid = Grid2d.build(Vector2d.square(dim), () => {
        return ab;
    });
    return grid;
}
function generateTriangle(dim, ab) {
    const grid = Grid2d.build(Vector2d.square(dim), (pos) => {
        return pos.x <= pos.y ? ab : flipAB(ab);
    });
    return grid;
}
function generateCircle(dim, ab) {
    const radius = dim / 2;
    const radiusSquared = radius * radius;
    const centerOffset = Vector2d.square(radius);
    const grid = Grid2d.build(Vector2d.square(dim), (pos) => {
        const q = pos.subtract(centerOffset).map(Math.abs).toVector();
        return q.magnitudeSquared() <= radiusSquared ? ab : flipAB(ab);
    });
    return grid;
}
function generateRing(dim, ab) {
    const outerRadius = dim / 2;
    const innerRadius = Math.max(0, outerRadius - 1.5 * Patch.extent.magnitude());
    const outerRadiusSquared = outerRadius * outerRadius;
    const innerRadiusSquared = innerRadius * innerRadius;
    const centerOffset = Vector2d.square(outerRadius);
    const grid = Grid2d.build(Vector2d.square(dim), (pos) => {
        const q = pos.subtract(centerOffset).map(Math.abs).toVector();
        const qq = q.magnitudeSquared();
        if (innerRadiusSquared <= qq && qq <= outerRadiusSquared) {
            return ab;
        }
        return flipAB(ab);
    });
    return grid;
}
function roundUpToMultipleOf(value, k) {
    k = k;
    const m = value % k;
    return m === 0 ? value : (value + (k - m));
}
function buildPatch(info) {
    const patchMinDotOffset = info.patchOffsetWithinQuilt.multiply(Patch.extent);
    const patchGrid = Grid2d.fill(Patch.extent, A);
    for (const localDotOffset of Patch.localOffsets) {
        const ab = info.abGrid.getAt(patchMinDotOffset.add(localDotOffset)) || A;
        patchGrid.setAt(localDotOffset, ab);
    }
    const pattern = new PatchPattern(patchGrid);
    return new Patch(null, info.colorB, pattern);
}
function buildQuilt(info) {
    let quiltExtent = info.abGrid.box().extent().divide(Patch.extent).map(Math.ceil);
    const wideExtent = info.abGrid.box().min().add(info.abGrid.box().extent()).toVector().mod(Patch.extent);
    if (wideExtent.x > 0) {
        quiltExtent = new Vector2d(quiltExtent.x + 1, quiltExtent.y);
    }
    if (wideExtent.y > 0) {
        quiltExtent = new Vector2d(quiltExtent.x, quiltExtent.y + 1);
    }
    const quiltGrid = Grid2d.fill(quiltExtent, Patch.black);
    for (let y = 0; y < quiltExtent.y; ++y) {
        for (let x = 0; x < quiltExtent.x; ++x) {
            const patchOffset = new Vector2d(x, y);
            const patchInfo = {
                abGrid: info.abGrid,
                colorB: info.colorB,
                patchOffsetWithinQuilt: patchOffset,
            };
            const patch = buildPatch(patchInfo);
            quiltGrid.setAt(patchOffset, patch);
        }
    }
    const quilt = new Quilt(quiltGrid);
    return quilt;
}
function bayerizePatchGrid(grid) {
    const inv = 1 / Patch.extent.area();
    return Grid2d.build(grid.extent(), (position) => {
        const patch = grid.getAt(position);
        const fullResolution = patch.pattern();
        const ratio = fullResolution.countOf(B) * inv;
        const lowResolution = Dither.Bayer.patternFromRatio(ratio);
        return patch.updatePattern(lowResolution);
    });
}
function bayerizeQuilt(quilt) {
    if (quilt instanceof Quilt) {
        return new Quilt(bayerizePatchGrid(quilt.grid()));
    }
    else {
        const bayer = bayerizeQuilt(quilt.withoutOffset());
        const offset = quilt.box().min().toVector();
        return new OffsetQuilt(bayer, offset);
    }
}
class PaletteCanvas extends Canvas {
    constructor(info) {
        super(info);
        this._colorPixelDim = 60;
        this._colorPixelExtent = Vector2d.square(this._colorPixelDim);
        this._colorPixelPositions = [];
        this._onPick = null;
        this._palette = info.palette;
        this._canvas.addEventListener("click", (e) => this._onclick(e));
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const dim = 4;
            const x = i % dim;
            const y = Math.floor(i / dim);
            const pos = Point2d.origin.add(new Vector2d(x, y).multiply(this._colorPixelExtent));
            this._colorPixelPositions.push(pos);
        }
        this._picker = document.createElement("input");
        this._picker.style.display = "none";
        this._picker.value = "#000000";
        this._picker.type = "color";
        this._picker.onchange = () => {
            if (this._onPick) {
                this._onPick();
            }
            this._onPick = null;
        };
        this._canvas.parentElement.appendChild(this._picker);
    }
    render() {
        const lineWidth = this._context.lineWidth;
        this._context.lineWidth *= 5;
        const outlineColor = Color.white.toRgb().scale(0.2);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const color = this._palette.color(i);
            const coord = this._colorPixelPositions[i];
            this.fillRect(coord, this._colorPixelExtent, color);
            this.strokeRect(coord, this._colorPixelExtent, outlineColor);
        }
        this._context.lineWidth = lineWidth;
    }
    _onclick(e) {
        const rect = this._canvas.getBoundingClientRect();
        const pos = new Point2d(e.clientX - rect.left, e.clientY - rect.top);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const box = new Box2d(this._colorPixelPositions[i], this._colorPixelExtent);
            console.assert(false, "TODO: convert to box to pixel space");
            if (!box.containsPoint(pos)) {
                continue;
            }
            const color = this._palette.color(i);
            this._picker.value = color.toRgb().toString();
            this._onPick = () => {
                const hex = this._picker.value;
                const newColor = RgbColor.parseHex(hex);
                if (newColor) {
                    this._palette.setColor(i, newColor);
                    this._redraw();
                }
            };
            this._picker.click();
            break;
        }
    }
}
function randomRangeFloat(begin, end) {
    console.assert(begin < end);
    return Math.random() * (end - begin) + begin;
}
function randomRangeInt(begin, end) {
    console.assert(Number.isInteger(begin));
    console.assert(Number.isInteger(end));
    console.assert(begin < end);
    return Math.floor(Math.random() * (end - begin) + begin);
}
function randomChoice(items) {
    const i = randomRangeInt(0, items.length);
    return items[i];
}
class RenderContext {
    constructor(imageData) {
        this._imageData = imageData;
    }
    renderPixel(x, y, rgb) {
        const i = y * this._imageData.width + x;
        const j = 4 * i;
        this._imageData.data[j + 0] = rgb.red;
        this._imageData.data[j + 1] = rgb.green;
        this._imageData.data[j + 2] = rgb.blue;
        this._imageData.data[j + 3] = 0xFF;
    }
}
class SceneNode {
    constructor() {
        this._localTransform = Transform2d.identity;
        this.objects = [];
        this.childNodes = [];
    }
    localTransform() {
        return this._localTransform;
    }
    setLocalTransform(t) {
        this._localTransform = t;
    }
    renderTo(context, transform) {
        const t = transform.then(this._localTransform);
        for (const o of this.objects) {
            o.renderTo(context, t);
        }
        for (const child of this.childNodes) {
            child.renderTo(context, t);
        }
    }
}
class Scene {
    constructor() {
        this._rootNode = new SceneNode();
    }
    renderTo(context, transform) {
        this._rootNode.renderTo(context, transform);
    }
}
class SceneCanvas extends Canvas {
}
var WebWorkerDemo;
(function (WebWorkerDemo) {
    function main() {
        console.log("hello from web worker demo");
    }
    WebWorkerDemo.main = main;
})(WebWorkerDemo || (WebWorkerDemo = {}));
