interface CanvasInfo {
    readonly canvas: HTMLCanvasElement;
    readonly pixelScale: number;
    readonly redraw: () => void;
}

class Canvas {
    protected readonly __brand_Canvas: undefined;

    public constructor(info: CanvasInfo) {
        if (!Number.isInteger(info.pixelScale) || info.pixelScale <= 0) {
            throw Error();
        }
        this._canvas = info.canvas;
        const context = this._canvas.getContext("2d");
        if (context === null) {
            throw Error();
        }
        this._context = context;
        this._redraw = info.redraw;
        this._pixelScale = info.pixelScale;
    }

    public renderTileGrid(coord: Coord2d, tiles: Grid2d<Tile>): void {
        tiles.forEach((coord2: Coord2d, tile: Tile) => {
            const coord3 = coord.add(coord2.scale(Tile.extent));
            this.renderTile(coord3, tile);
        });
    }

    public renderTile(coord: Coord2d, tile: Tile): void {
        const grid = tile.toPixelGrid();
        this.renderPixelGrid(coord, grid);
        //this.strokeRect(coord.scale(this._pixelScale), grid.extent().scale(this._pixelScale), Color.gray);
    }

    public renderPixelGrid(coord: Coord2d, pixels: Grid2d<Pixel>): void {
        pixels.forEach((coord2: Coord2d, pixel: Pixel) => {
            const coord3 = coord.add(coord2);
            this.renderPixel(coord3, pixel);
        });
    }

    public renderPixel(coord: Coord2d, pixel: Pixel): void {
        const coord2 = coord.scale(this._pixelScale);
        const extent = new Coord2d(this._pixelScale, this._pixelScale);
        this.fillRect(coord2, extent, pixel.color);
    }

    public fillRect(coord: Coord2d, extent: Coord2d, color: Color): void {
        const rgb = color.toRgb();
        this._context.fillStyle = rgb.toString();
        this._renderRect(coord, extent, true);
    }

    public strokeRect(coord: Coord2d, extent: Coord2d, color: Color): void {
        const rgb = color.toRgb();
        this._context.strokeStyle = rgb.toString();
        this._renderRect(coord, extent, false);
    }

    private _renderRect(coord: Coord2d, extent: Coord2d, fill: boolean): void {
        const x = coord.x;
        const y = coord.y;
        const w = extent.x;
        const h = extent.y;
        if (fill) {
            this._context.fillRect(x, y, w, h);
        }
        else {
            this._context.strokeRect(x, y, w, h);
        }
    }

    public canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    protected readonly _canvas: HTMLCanvasElement;
    protected readonly _context: CanvasRenderingContext2D;
    protected readonly _redraw: () => void;
    protected readonly _pixelScale: number;
}
