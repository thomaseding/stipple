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
        this._imageData = this._context.createImageData(this._canvas.width, this._canvas.height);
        this._redraw = info.redraw;
        this._pixelScale = info.pixelScale;
    }

    public renderTileGrid(pixelOffset: Coord2d, grid: Grid2d<Patch>): void {
        grid.forEach((logicalTilePos: Coord2d, tile: Patch) => {
            const pixelTilePos = logicalTilePos.scale(Patch.extent).add(pixelOffset);
            this.renderTile(pixelTilePos, tile);
        });
        //this.strokeRect(pixelOffset, grid.extent().scale(this._pixelScale), Color.gray);
    }

    public renderTile(pixelOffset: Coord2d, tile: Patch): void {
        const grid = tile.toPixelGrid();
        this.renderPixelGrid(pixelOffset, grid);
    }

    public renderPixelGrid(pixelOffset: Coord2d, pixels: Grid2d<Dot>): void {
        pixels.forEach((pos: Coord2d, pixel: Dot) => {
            const p = pixelOffset.add(pos);
            this.renderPixel(p, pixel);
        });
    }

    public renderPixel(pixelOffset: Coord2d, pixel: Dot): void {
        this.fillLogicalPixel(pixelOffset.x, pixelOffset.y, pixel.color.toRgb());
    }

    public fillRect(coord: Coord2d, extent: Coord2d, color: Color): void {
        const rgb = color.toRgb();
        for (let w = 0; w < extent.x; ++w) {
            for (let h = 0; h < extent.y; ++h) {
                const x = coord.x + w;
                const y = coord.y + h;
                this.fillPhysicalPixel(x, y, rgb);
            }
        }
    }

    public strokeRect(coord: Coord2d, extent: Coord2d, color: Color): void {
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

    public fillLogicalPixel(x: number, y: number, rgb: RgbColor): void {
        x *= this._pixelScale;
        y *= this._pixelScale;
        for (let dx = 0; dx < this._pixelScale; ++dx) {
            for (let dy = 0; dy < this._pixelScale; ++dy) {
                this.fillPhysicalPixel(x + dx, y + dy, rgb);
            }
        }
    }

    public fillPhysicalPixel(x: number, y: number, rgb: RgbColor): void {
        const i = 4 * (y * this._imageData.width + x);
        this._imageData.data[i + 0] = rgb.red;
        this._imageData.data[i + 1] = rgb.green;
        this._imageData.data[i + 2] = rgb.blue;
        this._imageData.data[i + 3] = 0xFF;
    }

    public canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public commitRender(): void {
        this._context.putImageData(this._imageData, 0, 0);
    }

    protected readonly _canvas: HTMLCanvasElement;
    protected readonly _context: CanvasRenderingContext2D;
    protected readonly _imageData: ImageData;
    protected readonly _redraw: () => void;
    protected readonly _pixelScale: number;
}
