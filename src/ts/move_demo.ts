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
    readonly abGrid: OffsetGrid2d<A | B>;
    readonly colorA: Color;
    readonly colorB: Color;
}

interface BuildPatchInfo {
    readonly abGrid: OffsetGrid2d<A | B>;
    readonly colorA: Color;
    readonly colorB: Color;
    readonly patchOffsetWithinQuilt: Vector2d;
}

function buildPatch(info: BuildPatchInfo): Patch {
    const patchMinDotOffset = info.patchOffsetWithinQuilt.multiply(Patch.extent);
    const patchGrid = Grid2d.fill<A | B>(Patch.extent, A);
    for (const localDotOffset of Patch.localOffsets) {
        const ab = info.abGrid.getAt(patchMinDotOffset.add(localDotOffset)) || A;
        patchGrid.setAt(localDotOffset, ab);
    }
    const pattern = new PatchPattern(patchGrid);
    return new Patch(info.colorA, info.colorB, pattern);
}

function buildQuilt(info: BuildQuiltInfo): Quilt {
    //console.log(info.abGrid.box().min());
    const modPatchExtent = info.abGrid.box().min().toVector().mod(Patch.extent);
    const abGrid = info.abGrid;//.applyAdditionalOffset(modPatchExtent);
    const quiltExtent = info.abGrid.box().extent().divide(Patch.extent).map(Math.ceil).add(Vector2d.unit);
    const quiltGrid = Grid2d.fill<Patch>(quiltExtent, Patch.black);
    for (let y = 0; y < quiltExtent.y; ++y) {
        for (let x = 0; x < quiltExtent.x; ++x) {
            const patchOffset = new Vector2d(x, y);
            const patchInfo: BuildPatchInfo = {
                abGrid: abGrid,
                colorA: info.colorA,
                colorB: info.colorB,
                patchOffsetWithinQuilt: patchOffset,
            };
            //console.log("patchInfo", patchInfo);
            const patch = buildPatch(patchInfo);
            //console.log("patch", patch);
            quiltGrid.setAt(patchOffset, patch);
        }
    }
    const quilt = new Quilt(quiltGrid);
    return quilt;
}

function bayerizePatchGrid(grid: ReadonlyGrid2d<Patch>): Grid2d<Patch> {
    const inv = 1 / Patch.extent.area();
    return Grid2d.build(grid.extent(), (position: Point2d) => {
        const patch = grid.getAt(position);
        const fullResolution = patch.pattern();
        const ratio = fullResolution.countOf(B) * inv;
        const lowResolution = Dither.Bayer.patternFromRatio(ratio);
        return patch.updatePattern(lowResolution);
    });
}

function bayerizeQuilt(quilt: Quilt): Quilt {
    return new Quilt(bayerizePatchGrid(quilt.patchGrid()));
}
