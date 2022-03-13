class Dot implements SceneObject {
    protected readonly __brand_Pixel: undefined;

    public constructor(color: Color) {
        this.color = color;
    }

    public renderTo(context: RenderContext, transform: Transform2d, zIndex: number): void {
        const rgb = this.color.toRgb();
        const t = transform.translation();
        const s = transform.scale();
        for (let x = 0; x < s.x; ++x) {
            for (let y = 0; y < s.y; ++y) {
                context.renderPixel(x + t.x, y + t.y, zIndex, rgb);
            }
        }
    }

    public readonly color: Color;
}