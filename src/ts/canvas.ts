interface CanvasInfo {
    readonly canvas: HTMLCanvasElement;
    readonly pixelScale: number;
    readonly redraw: () => void;
}

abstract class Canvas {
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

    public fillRect(min: Point2d, extent: Vector2d, color: Color): void {
        const rgb = color.toRgb();
        this._context.fillStyle = rgb.toString();
        this._context.fillRect(min.x, min.y, extent.x, extent.y);
    }

    public strokeRect(min: Point2d, extent: Vector2d, color: Color): void {
        const rgb = color.toRgb();
        this._context.strokeStyle = rgb.toString();
        this._context.strokeRect(min.x, min.y, extent.x, extent.y);
    }

    public canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public newRenderContext(): RenderContext {
        return new RenderContext(this._imageData);
    }

    protected readonly _canvas: HTMLCanvasElement;
    protected readonly _context: CanvasRenderingContext2D;
    protected readonly _imageData: ImageData;
    protected readonly _redraw: () => void;
    protected readonly _pixelScale: number;
}
