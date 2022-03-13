class Dot {
    protected readonly __brand_Pixel: undefined;

    public constructor(pixel: Dot);
    public constructor(color: Color);
    public constructor(input: Dot | Color) {
        if (input instanceof Dot) {
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
