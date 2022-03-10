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
        this._canvas.parentElement!.appendChild(this._picker);
    }

    public render(): void {
        const lineWidth = this._context.lineWidth;
        this._context.lineWidth *= 5;

        const outlineColor = Color.white.toRgb().scale(0.2);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const color = this._palette.color(i);
            const coord = this._colorPositions[i]!;
            this.fillRect(coord, this._colorExtent, color);
            this.strokeRect(coord, this._colorExtent, outlineColor);
        }

        this._context.lineWidth = lineWidth;
    }

    private _onclick(e: MouseEvent) {
        const rect = this._canvas.getBoundingClientRect();
        const pos = new Coord2d(e.clientX - rect.left, e.clientY - rect.top);
        for (let i = 0; i < this._palette.colorCount(); ++i) {
            const coord = this._colorPositions[i]!;
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

    private readonly _palette: ColorPalette;
    private readonly _colorExtentScale: number = 60;
    private readonly _colorExtent: Coord2d = Coord2d.square(this._colorExtentScale);
    private readonly _colorPositions: Coord2d[] = [];
    private readonly _picker: HTMLInputElement;
    private _onPick: (() => void) | null = null;
}
