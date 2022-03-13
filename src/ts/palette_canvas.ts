interface PaletteCanvasInfo extends CanvasInfo {
    palette: ColorPalette;
}

class PaletteCanvas extends Canvas {
    protected readonly __brand_PaletteCanvas: undefined;

    public constructor(info: PaletteCanvasInfo) {
        super(info);
        this._palette = info.palette;
        this._canvas.addEventListener("click", (e: MouseEvent) => this._onclick(e));

        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const dim = 4;
            const x = i % dim;
            const y = Math.floor(i / dim);
            const pos = Point2d.origin.add(new Vector2d(x, y).scale(this._colorPixelExtent));
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
        this._canvas.parentElement!.appendChild(this._picker);
    }

    public render(): void {
        const lineWidth = this._context.lineWidth;
        this._context.lineWidth *= 5;

        const outlineColor = Color.white.toRgb().scale(0.2);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const color = this._palette.color(i);
            const coord = this._colorPixelPositions[i]!;
            this.fillRect(coord, this._colorPixelExtent, color);
            this.strokeRect(coord, this._colorPixelExtent, outlineColor);
        }

        this._context.lineWidth = lineWidth;
    }

    private _onclick(e: MouseEvent) {
        const rect = this._canvas.getBoundingClientRect();
        const pos = new Point2d(e.clientX - rect.left, e.clientY - rect.top);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const box = new Box2d(this._colorPixelPositions[i]!, this._colorPixelExtent);
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

    private readonly _palette: ColorPalette;
    private readonly _colorPixelDim: number = 60;
    private readonly _colorPixelExtent: Vector2d = Vector2d.square(this._colorPixelDim);
    private readonly _colorPixelPositions: Point2d[] = [];
    private readonly _picker: HTMLInputElement;
    private _onPick: (() => void) | null = null;
}
