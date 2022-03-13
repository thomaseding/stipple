/// <reference path="patch.ts" />

function generateSquare(dim: number, ab: A | B): Grid2d<A | B> {
    const grid = Grid2d.build(Vector2d.square(dim), () => {
        return ab;
    });
    return grid;
}

function generateTriangle(dim: number, ab: A | B): Grid2d<A | B> {
    const grid = Grid2d.build(Vector2d.square(dim), (pos: Point2d) => {
        return pos.x <= pos.y ? ab : flipAB(ab);
    });
    return grid;
}

function generateCircle(dim: number, ab: A | B): Grid2d<A | B> {
    const radius = dim / 2;
    const radiusSquared = radius * radius;
    const centerOffset = Vector2d.square(radius);
    const grid = Grid2d.build(Vector2d.square(dim), (pos: Point2d) => {
        const q = pos.subtract(centerOffset).map(Math.abs).toVector();
        return q.magnitudeSquared() <= radiusSquared ? ab : flipAB(ab);
    });
    return grid;
}

function generateRing(dim: number, ab: A | B): Grid2d<A | B> {
    const outerRadius = dim / 2;
    const innerRadius = Math.max(0, outerRadius - 1.5 * Patch.extent.magnitude());
    const outerRadiusSquared = outerRadius * outerRadius;
    const innerRadiusSquared = innerRadius * innerRadius;
    const centerOffset = Vector2d.square(outerRadius);
    const grid = Grid2d.build(Vector2d.square(dim), (pos: Point2d) => {
        const q = pos.subtract(centerOffset).map(Math.abs).toVector();
        const qq = q.magnitudeSquared();
        if (innerRadiusSquared <= qq && qq <= outerRadiusSquared) {
            return ab;
        }
        return flipAB(ab);
    });
    return grid;
}

function roundUpToMultipleOf(value: number, k: number): number {
    k = k as number;
    const m = value % k;
    return m === 0 ? value : (value + (k - m));
}

interface BuildQuiltInfo {
    readonly abGridDotOffset: Vector2d;
    readonly abGrid: Grid2d<A | B>;
    readonly colorA: Color;
    readonly colorB: Color;
}

function buildPatch(info: BuildQuiltInfo, patchOffset: Vector2d): Patch {
    const patchGrid = Grid2d.fill<A | B>(Patch.extent, A);
    for (const localOffset of Patch.localOffsets) {
        const patchDotOffset = patchOffset.add(localOffset).multiply(Patch.extent);
        const dotOffset = info.abGridDotOffset.subtract(patchDotOffset);
        const ab = info.abGrid.getAt(dotOffset);
        patchGrid.setAt(localOffset, ab);
    }
    const pattern = new PatchPattern(patchGrid);
    return new Patch(info.colorA, info.colorB, pattern);
}

function buildQuilt(info: BuildQuiltInfo): Quilt {
    const dotPaddingProto = info.abGridDotOffset.mod(Patch.extent);
    const dotPadding = dotPaddingProto.equals(Vector2d.zero) ? Vector2d.zero : Patch.extent.subtract(dotPaddingProto);
    const quiltExtent = info.abGrid.extent().add(dotPadding).zipWith(Patch.extent, roundUpToMultipleOf).divide(Patch.extent);
    const quiltGrid = Grid2d.fill<Patch>(quiltExtent, Patch.black);
    const info2: BuildQuiltInfo = {
        abGridDotOffset: info.abGridDotOffset.subtract(dotPadding),
        abGrid: info.abGrid,
        colorA: info.colorA,
        colorB: info.colorB,
    };
    for (let x = 0; x < quiltExtent.x; ++x) {
        for (let y = 0; y < quiltExtent.y; ++y) {
            const patchOffset = new Vector2d(x, y);
            const patch = buildPatch(info2, patchOffset);
            quiltGrid.setAt(patchOffset, patch);
        }
    }
    return new Quilt(quiltGrid);
}

function downscale(grid: Grid2d<Patch>): Grid2d<Patch> {
    const inv = 1 / Patch.extent.area();
    return Grid2d.build(grid.extent(), (position: Point2d) => {
        const patch = grid.getAt(position);
        const fullResolution = patch.pattern();
        const ratio = fullResolution.countOf(B) * inv;
        const lowResolution = Dither.Bayer.patternFromRatio(ratio);
        return patch.updatePattern(lowResolution);
    });
}
