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
class Coord2d {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    getObjectCoord() {
        return this;
    }
    setObjectCoord(coord) {
        return coord;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    map(func) {
        return new Coord2d(func(this.x), func(this.y));
    }
    add(other) {
        return new Coord2d(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new Coord2d(this.x - other.x, this.y - other.y);
    }
    scale(k) {
        if (typeof k === "number") {
            return new Coord2d(k * this.x, k * this.y);
        }
        else {
            return new Coord2d(k.x * this.x, k.y * this.y);
        }
    }
    static square(dim) {
        return new Coord2d(dim, dim);
    }
    divide(other) {
        return new Coord2d(this.x / other.x, this.y / other.y);
    }
    mod(other) {
        return new Coord2d(this.x % other.x, this.y % other.y);
    }
    isInteger() {
        return Number.isInteger(this.x) && Number.isInteger(this.y);
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
}
Coord2d.origin = new Coord2d(0, 0);
Coord2d.unit = new Coord2d(1, 1);
var Object2d;
(function (Object2d) {
    function translate(o, delta) {
        const c = o.getObjectCoord();
        const x = c.x + delta.x;
        const y = c.y + delta.y;
        return o.setObjectCoord(new Coord2d(x, y));
    }
    Object2d.translate = translate;
})(Object2d || (Object2d = {}));
class Grid2d {
    constructor(position, extent, arg2) {
        this._position = position;
        this._extent = extent;
        if (Array.isArray(arg2)) {
            const linearGrid = arg2;
            this._linearGrid = linearGrid;
        }
        else {
            const initialValue = arg2;
            this._linearGrid = [];
            for (let y = 0; y < this._extent.y; ++y) {
                for (let x = 0; x < this._extent.x; ++x) {
                    const coord = new Coord2d(position.x + x, position.y + y);
                    this._linearGrid.push(initialValue(coord));
                }
            }
        }
    }
    static build(position, extent, initialValue) {
        return new Grid2d(position, extent, initialValue);
    }
    static fill(position, extent, initialValue) {
        const linearGrid = Array(extent.x * extent.y).fill(initialValue);
        return new Grid2d(position, extent, linearGrid);
    }
    static from1d(position, extent, linearGrid) {
        return new Grid2d(position, extent, linearGrid.slice());
    }
    static from2d(position, grid) {
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
        const extent = new Coord2d(width, height);
        return new Grid2d(position, extent, linearGrid);
    }
    getObjectCoord() {
        return this._position;
    }
    setObjectCoord(position) {
        return Grid2d.from1d(position, this._extent, this._linearGrid);
    }
    indexedGet(index) {
        const linear = this._linearize(index);
        const value = this._linearGrid[linear];
        if (value === undefined) {
            throw Error();
        }
        return value;
    }
    getAt(position) {
        const index = position.subtract(this._position);
        return this.indexedGet(index);
    }
    indexedSet(index, value) {
        const linear = this._linearize(index);
        if (this._linearGrid.length <= linear) {
            throw Error();
        }
        this._linearGrid[linear] = value;
    }
    setAt(position, value) {
        const index = position.subtract(this._position);
        this.indexedSet(index, value);
    }
    forEach(action) {
        for (let x = 0; x < this._extent.x; ++x) {
            for (let y = 0; y < this._extent.y; ++y) {
                const offset = new Coord2d(x, y);
                const value = this.indexedGet(offset);
                action(offset, value);
            }
        }
    }
    position() {
        return this._position;
    }
    extent() {
        return this._extent;
    }
    area() {
        return this._extent.x * this._extent.y;
    }
    _linearize(index) {
        return index.y * this._extent.x + index.x;
    }
}
function rectContains(min, max, needle) {
    return min.x <= needle.x && needle.x < max.x
        && min.y <= needle.y && needle.y < max.y;
}
function gridContainsCoord(self, other) {
    return rectContains(self.position(), self.position().add(self.extent()), other);
}
function gridContainsGrid(self, other) {
    return gridContainsCoord(self, other.position())
        && gridContainsCoord(self, other.position().add(other.extent()).subtract(Coord2d.unit));
}
function mergeIntoGrid(self, other, predicate) {
    other.forEach((offset, value) => {
        const pos = other.position().add(offset);
        if (gridContainsCoord(self, pos) && predicate(value)) {
            self.setAt(pos, value);
        }
    });
}
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
    function clamp(min, max, value) {
        return Math.min(max, Math.max(min, value));
    }
    function randomTile(palette, blacklist = []) {
        const randIndex = () => {
            let x;
            do {
                x = randomRangeInt(0, palette.colorCount());
            } while (blacklist.indexOf(x) >= 0);
            return x;
        };
        const tile = new Tile(palette);
        const a = randIndex();
        let b;
        do {
            b = randIndex();
        } while (b === a);
        tile.setPaletteIndex(a, A);
        tile.setPaletteIndex(b, B);
        tile.setPattern(Dither.Bayer.patternFromRatio(Math.random()));
        return tile;
    }
    const defaultTileExtent = Coord2d.square(24);
    function generateRandomTiles(palette) {
        return Grid2d.build(Coord2d.origin, defaultTileExtent, () => {
            const blacklist = [1];
            return randomTile(palette, blacklist);
        });
    }
    function generateBlackTiles(palette) {
        return Grid2d.build(Coord2d.origin, defaultTileExtent, () => {
            return new Tile(palette);
        });
    }
    let _cachedBackground = null;
    function generateBackgroundTilesCached(palette) {
        if (!_cachedBackground) {
            _cachedBackground = generateRandomTiles(palette);
        }
        return _cachedBackground.setObjectCoord(Coord2d.origin);
    }
    let _cachedShape = null;
    function generateShapeCached() {
        if (_cachedShape === null) {
            _cachedShape = generateCircle(8 * 10, B);
        }
        return _cachedShape;
    }
    function generateTiles(palette, shapePixelOffset = Coord2d.origin) {
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
        constructor(drawCanvasId, ditheredCanvasId, paletteCanvasId) {
            this._palette = defaultPalette;
            this._tiles = generateTiles(this._palette);
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
        render() {
            this._drawCanvas.renderTileGrid(Coord2d.origin, this._tiles);
            this._ditheredCanvas.renderTileGrid(Coord2d.origin, downscale(this._tiles));
            this._paletteCanvas.render();
            this._drawCanvas.commitRender();
            this._ditheredCanvas.commitRender();
            this._paletteCanvas.commitRender();
        }
        doSomething() {
            let defaultLogicalPixelOffset = new Coord2d(2 * Tile.extent.x, 3 * Tile.extent.y);
            let logicalPixelOffset = defaultLogicalPixelOffset;
            const choices = [-1, 0, 1];
            const pixelMax = defaultTileExtent.scale(Tile.extent);
            const rect = this._drawCanvas.canvas().getBoundingClientRect();
            const k = 0.5 * drawScale;
            const left = rect.left + k * _cachedShape.extent().x;
            const top = rect.top + k * _cachedShape.extent().y;
            const invDrawScale = 1 / drawScale;
            let x = 0;
            let y = 0;
            this._drawCanvas.canvas().addEventListener("mousemove", (e) => {
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
    renderTileGrid(pixelOffset, grid) {
        grid.forEach((tileOffset, tile) => {
            const tilePos = grid.position().add(tileOffset).scale(Tile.extent).add(pixelOffset);
            this.renderTile(tilePos, tile);
        });
        this.strokeRect(pixelOffset, grid.extent().scale(this._pixelScale), Color.gray);
    }
    renderTile(pixelOffset, tile) {
        const grid = tile.toPixelGrid();
        this.renderPixelGrid(pixelOffset, grid);
    }
    renderPixelGrid(coord, pixels) {
        pixels.forEach((coord2, pixel) => {
            const coord3 = coord.add(coord2);
            this.renderPixel(coord3, pixel);
        });
    }
    renderPixel(pixelOffset, pixel) {
        this.fillLogicalPixel(pixelOffset.x, pixelOffset.y, pixel.color.toRgb());
    }
    fillRect(coord, extent, color) {
        const rgb = color.toRgb();
        for (let w = 0; w < extent.x; ++w) {
            for (let h = 0; h < extent.y; ++h) {
                const x = coord.x + w;
                const y = coord.y + h;
                this.fillPhysicalPixel(x, y, rgb);
            }
        }
    }
    strokeRect(coord, extent, color) {
        const rgb = color.toRgb();
        for (let w = 0; w < extent.x; ++w) {
            for (let h = 0; h < extent.y; ++h) {
                const x = coord.x + w;
                const y = coord.y + h;
                const border = w === 0 || h === 0 || w === extent.x - 1 || h === extent.y - 1;
                if (border) {
                    this.fillPhysicalPixel(x, y, rgb);
                }
            }
        }
    }
    fillLogicalPixel(x, y, rgb) {
        x *= this._pixelScale;
        y *= this._pixelScale;
        for (let dx = 0; dx < this._pixelScale; ++dx) {
            for (let dy = 0; dy < this._pixelScale; ++dy) {
                this.fillPhysicalPixel(x + dx, y + dy, rgb);
            }
        }
    }
    fillPhysicalPixel(x, y, rgb) {
        const i = 4 * (y * this._imageData.width + x);
        this._imageData.data[i + 0] = rgb.red;
        this._imageData.data[i + 1] = rgb.green;
        this._imageData.data[i + 2] = rgb.blue;
        this._imageData.data[i + 3] = 0xFF;
    }
    canvas() {
        return this._canvas;
    }
    commitRender() {
        this._context.putImageData(this._imageData, 0, 0);
    }
}
class DrawCanvas extends Canvas {
}
/// <reference path="geom2d.ts" />
var _a;
class TilePattern {
    constructor(grid) {
        if (!grid.position().equals(Coord2d.origin)) {
            throw Error();
        }
        if (!grid.extent().equals(TilePattern.extent)) {
            throw Error();
        }
        this._grid = grid;
    }
    at(offset) {
        return this._grid.indexedGet(offset);
    }
    forEach(action) {
        this._grid.forEach(action);
    }
    countOf(ab) {
        let count = 0;
        this.forEach((_coord, value) => {
            if (value === ab) {
                ++count;
            }
        });
        return count;
    }
    static _generateCoords(extent) {
        const coords = [];
        for (let x = 0; x < extent.x; ++x) {
            for (let y = 0; y < extent.y; ++y) {
                const coord = new Coord2d(x, y);
                coords.push(coord);
            }
        }
        return coords;
    }
}
_a = TilePattern;
TilePattern.dim = 8;
TilePattern.extent = Coord2d.square(_a.dim);
TilePattern.coords = _a._generateCoords(_a.extent);
/// <reference path="pattern.ts" />
class Tile {
    constructor(palette, pattern, indexA, indexB) {
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
    setPaletteIndex(index, ab) {
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
    toPixelGrid() {
        const position = Coord2d.origin;
        const extent = Tile.extent;
        return Grid2d.build(position, extent, (coord) => {
            const color = this._colorAt(coord);
            return new Pixel(color);
        });
    }
    pattern() {
        return this._pattern;
    }
    setPattern(pattern) {
        this._pattern = pattern;
    }
    palette() {
        return this._palette;
    }
    clone() {
        return new Tile(this._palette, this._pattern, this._indexA, this._indexB);
    }
    _colorAt(localCoord) {
        const ab = this._pattern.at(localCoord);
        const index = ab === A ? this._indexA : this._indexB;
        const color = new IndexedColor(this._palette, index);
        return color;
    }
}
Tile.extent = TilePattern.extent;
Tile.localCoords = TilePattern.coords;
/// <reference path="tile.ts" />
function generateSquare(dim, ab) {
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (_coord) => {
        return ab;
    });
    return grid;
}
function generateTriangle(dim, ab) {
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (coord) => {
        return coord.x <= coord.y ? ab : flipAB(ab);
    });
    return grid;
}
function generateCircle(dim, ab) {
    const radius = dim / 2;
    const radiusSquared = radius * radius;
    const center = Coord2d.square(radius);
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (coord) => {
        const q = center.subtract(coord).map(Math.abs);
        return q.magnitudeSquared() <= radiusSquared ? ab : flipAB(ab);
    });
    return grid;
}
function generateRing(dim, ab) {
    const outerRadius = dim / 2;
    const innerRadius = Math.max(0, outerRadius - 1.5 * Tile.extent.magnitude());
    const outerRadiusSquared = outerRadius * outerRadius;
    const innerRadiusSquared = innerRadius * innerRadius;
    const center = Coord2d.square(outerRadius);
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (coord) => {
        const q = center.subtract(coord).map(Math.abs);
        const qq = q.magnitudeSquared();
        if (innerRadiusSquared <= qq && qq <= outerRadiusSquared) {
            return ab;
        }
        return flipAB(ab);
    });
    return grid;
}
function roundUpToMultipleOf(value, k) {
    if (typeof value === "number") {
        k = k;
        const m = value % k;
        return m === 0 ? value : (value + (k - m));
    }
    else {
        k = k;
        const x = roundUpToMultipleOf(value.x, k.x);
        const y = roundUpToMultipleOf(value.y, k.y);
        return new Coord2d(x, y);
    }
}
function prepareForTiling(grid, defaultValue) {
    if (grid.area() === 0) {
        return Grid2d.from1d(Coord2d.origin, Coord2d.origin, []);
    }
    if (Tile.extent.divides(grid.position()) && Tile.extent.divides(grid.extent())) {
        return grid;
    }
    const positionMod = grid.position().mod(Tile.extent);
    const positionDown = grid.position().subtract(positionMod);
    const extentMod = grid.extent().mod(Tile.extent);
    const pad1 = Tile.extent.subtract(extentMod);
    const pad2 = pad1.add(positionMod);
    const pad3 = roundUpToMultipleOf(pad2.mod(Tile.extent), Tile.extent);
    const padding = pad3;
    const fatExtent = grid.extent().add(padding);
    console.assert(Tile.extent.divides(fatExtent));
    const fatGrid = Grid2d.fill(positionDown, fatExtent, defaultValue);
    mergeIntoGrid(fatGrid, grid, () => true);
    return fatGrid;
}
function convertToTileGrid(palette, abGrid) {
    abGrid = prepareForTiling(abGrid, A);
    const tileGridPosition = abGrid.position().divide(Tile.extent).map(Math.floor);
    const tileGridExtent = abGrid.extent().divide(Tile.extent);
    return Grid2d.build(tileGridPosition, tileGridExtent, (tilePosition) => {
        const abPosition = tilePosition.scale(Tile.extent);
        const pattern = Grid2d.build(Coord2d.origin, TilePattern.extent, (offset) => {
            const ab = abGrid.getAt(abPosition.add(offset));
            return ab;
        });
        return new Tile(palette, new TilePattern(pattern));
    });
}
function downscale(grid) {
    const inv = 1 / (Tile.extent.x * Tile.extent.y);
    return Grid2d.build(grid.position(), grid.extent(), (position) => {
        const tile = grid.getAt(position).clone();
        const fullResolution = tile.pattern();
        const ratio = fullResolution.countOf(B) * inv;
        const lowResolution = Dither.Bayer.patternFromRatio(ratio);
        tile.setPattern(lowResolution);
        return tile;
    });
}
class PaletteCanvas extends Canvas {
    constructor(info) {
        super(info);
        this._colorExtentScale = 60;
        this._colorExtent = Coord2d.square(this._colorExtentScale);
        this._colorPositions = [];
        this._onPick = null;
        this._palette = info.palette;
        this._canvas.addEventListener("click", (e) => this._onclick(e));
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const dim = 4;
            const x = i % dim;
            const y = Math.floor(i / dim);
            const coord = new Coord2d(x, y).scale(this._colorExtent);
            this._colorPositions.push(coord);
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
            const coord = this._colorPositions[i];
            this.fillRect(coord, this._colorExtent, color);
            this.strokeRect(coord, this._colorExtent, outlineColor);
        }
        this._context.lineWidth = lineWidth;
    }
    _onclick(e) {
        const rect = this._canvas.getBoundingClientRect();
        const pos = new Coord2d(e.clientX - rect.left, e.clientY - rect.top);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const coord = this._colorPositions[i];
            if (!rectContains(coord, coord.add(this._colorExtent), pos)) {
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
class Pixel {
    constructor(input) {
        if (input instanceof Pixel) {
            const pixel = input;
            this.color = pixel.color;
        }
        else {
            const color = input;
            this.color = color;
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
            const grid = Grid2d.from2d(Coord2d.origin, gridArray);
            return new TilePattern(grid);
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