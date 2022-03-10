class Pixel {
    protected readonly __brand_Pixel: undefined;

    public constructor(pixel: Pixel);
    public constructor(color: Color);
    public constructor(input: Pixel | Color) {
        if (input instanceof Pixel) {
            const pixel = input;
            this.color = pixel.color;
        }
        else {
            const color = input;
            this.color = color;
        }
    }

    public readonly color: Color;
}
