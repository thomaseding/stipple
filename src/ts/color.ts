type Byte = number;

function hexByte(byte: Byte): string {
    let hex = byte.toString(16);
    if (hex.length === 1) {
        hex = "0" + hex;
    }
    return hex;
}

class RgbColor implements Color {
    protected readonly __brand_RgbColor: undefined;

    public constructor();
    public constructor(color: Color);
    public constructor(red: Byte, green: Byte, blue: Byte);
    public constructor(red: Color | Byte = 0, green: Byte = 0, blue: Byte = 0) {
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

    public static parseHex(hex: string): RgbColor | null {
        const regex = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
        const result = regex.exec(hex);
        if (result === null) {
            return null;
        }
        const r = Number.parseInt(result[1]!, 16);
        const g = Number.parseInt(result[2]!, 16);
        const b = Number.parseInt(result[3]!, 16);
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return null;
        }
        return new RgbColor(r, g, b);
    }

    public toRgb(): RgbColor {
        return this;
    }

    public toString(): string {
        const r = hexByte(this.red);
        const g = hexByte(this.green);
        const b = hexByte(this.blue);
        return `#${r}${g}${b}`;
    }

    public scale(k: number): RgbColor {
        const r = Math.floor(k * this.red);
        const g = Math.floor(k * this.green);
        const b = Math.floor(k * this.blue);
        const color = new RgbColor(r, g, b);
        return color;
    }

    public readonly red: Byte;
    public readonly green: Byte;
    public readonly blue: Byte;
}

interface Color {
    toRgb(): RgbColor;
}

namespace Color {
    export const black: Color = new RgbColor(0x00, 0x00, 0x00);
    export const white: Color = new RgbColor(0xFF, 0xFF, 0xFF);
    export const gray: Color = new RgbColor(0x80, 0x80, 0x80);
    export const red: Color = new RgbColor(0xFF, 0x00, 0x00);
    export const green: Color = new RgbColor(0x00, 0xFF, 0x00);
    export const blue: Color = new RgbColor(0x00, 0x00, 0xFF);
    export const yellow: Color = new RgbColor(0xFF, 0xFF, 0x00);
    export const cyan: Color = new RgbColor(0x00, 0xFF, 0xFF);
    export const mageneta: Color = new RgbColor(0xFF, 0x00, 0xFF);
}

class ColorPalette {
    protected readonly __brand_ColorPalette: undefined;

    public constructor(colors: Color[]);
    public constructor(colorCount: number);
    public constructor(input: Color[] | number) {
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

    public colorCount(): number {
        return this._colors.length;
    }

    public color(index: number): Color {
        const color = this._colors[index];
        if (color === undefined) {
            throw Error();
        }
        return color;
    }

    public setColor(index: number, color: Color): void {
        if (index >= this._colors.length) {
            throw Error();
        }
        this._colors[index] = color;
    }

    private readonly _colors: Color[];
}

class IndexedColor implements Color {
    protected readonly __brand_IndexedColor: undefined;

    public constructor(palette: ColorPalette, index: number) {
        this._palette = palette;
        this._index = index;
    }

    public get(): Color {
        return this._palette.color(this._index);
    }

    public toRgb(): RgbColor {
        return this.get().toRgb();
    }

    public index(): number {
        return this._index;
    }

    public toString(): string {
        return `indexed-${this.toRgb()}@${this._index}`;
    }

    private readonly _palette: ColorPalette;
    private readonly _index: number;
}
