/// <reference path="tile.ts" />

function generateSquare(dim: number, ab: A | B): Grid2d<A | B> {
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (_coord: Coord2d) => {
        return ab;
    });
    return grid;
}

function generateTriangle(dim: number, ab: A | B): Grid2d<A | B> {
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (coord: Coord2d) => {
        return coord.x <= coord.y ? ab : flipAB(ab);
    });
    return grid;
}

function generateCircle(dim: number, ab: A | B): Grid2d<A | B> {
    const radius = dim / 2;
    const radiusSquared = radius * radius;
    const center = Coord2d.square(radius);
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (coord: Coord2d) => {
        const q = center.subtract(coord).map(Math.abs);
        return q.magnitudeSquared() <= radiusSquared ? ab : flipAB(ab);
    });
    return grid;
}

function generateRing(dim: number, ab: A | B): Grid2d<A | B> {
    const outerRadius = dim / 2;
    const innerRadius = Math.max(0, outerRadius - 1.5 * Tile.extent.magnitude());
    const outerRadiusSquared = outerRadius * outerRadius;
    const innerRadiusSquared = innerRadius * innerRadius;
    const center = Coord2d.square(outerRadius);
    const grid = Grid2d.build(Coord2d.origin, Coord2d.square(dim), (coord: Coord2d) => {
        const q = center.subtract(coord).map(Math.abs);
        const qq = q.magnitudeSquared();
        if (innerRadiusSquared <= qq && qq <= outerRadiusSquared) {
            return ab;
        }
        return flipAB(ab);
    });
    return grid;
}

function roundUpToMultipleOf(value: number, k: number): number;
function roundUpToMultipleOf(value: Coord2d, k: Coord2d): Coord2d;
function roundUpToMultipleOf(value: number | Coord2d, k: number | Coord2d) {
    if (typeof value === "number") {
        k = k as number;
        const m = value % k;
        return m === 0 ? value : (value + (k - m));
    }
    else {
        k = k as Coord2d;
        const x = roundUpToMultipleOf(value.x, k.x);
        const y = roundUpToMultipleOf(value.y, k.y);
        return new Coord2d(x, y);
    }
}

function prepareForTiling<T>(grid: Grid2d<T>, defaultValue: T): Grid2d<T> {
    if (grid.area() === 0) {
        return Grid2d.from1d(Coord2d.origin, Coord2d.origin, []);
    }
    if (Tile.extent.divides(grid.position()) && Tile.extent.divides(grid.extent())) {
        return grid;
    }

    const positionMod = grid.position().mod(Tile.extent);
    const positionDown = grid.position().subtract(positionMod);

    const extentMod = grid.extent().mod(Tile.extent);

    const pad1 = Tile.extent.subtract(extentMod);
    const pad2 = pad1.add(positionMod);
    const pad3 = roundUpToMultipleOf(pad2.mod(Tile.extent), Tile.extent);
    const padding = pad3;

    const fatExtent = grid.extent().add(padding);
    console.assert(Tile.extent.divides(fatExtent));
    const fatGrid = Grid2d.fill(positionDown, fatExtent, defaultValue);
    mergeIntoGrid(fatGrid, grid, () => true);
    return fatGrid;
}

function convertToTileGrid(palette: ColorPalette, abGrid: Grid2d<A | B>): Grid2d<Tile> {
    abGrid = prepareForTiling(abGrid, A);
    const tileGridPosition = abGrid.position().divide(Tile.extent).map(Math.floor);
    const tileGridExtent = abGrid.extent().divide(Tile.extent);
    return Grid2d.build(tileGridPosition, tileGridExtent, (tilePosition: Coord2d) => {
        const abPosition = tilePosition.scale(Tile.extent);
        const pattern = Grid2d.build(Coord2d.origin, TilePattern.extent, (offset: Coord2d) => {
            const ab = abGrid.getAt(abPosition.add(offset));
            return ab;
        });
        return new Tile(palette, new TilePattern(pattern));
    });
}

function downscale(grid: Grid2d<Tile>): Grid2d<Tile> {
    const inv = 1 / (Tile.extent.x * Tile.extent.y);
    return Grid2d.build(grid.position(), grid.extent(), (position: Coord2d) => {
        const tile = grid.getAt(position).clone();
        const fullResolution = tile.pattern();
        const ratio = fullResolution.countOf(B) * inv;
        const lowResolution = Dither.Bayer.patternFromRatio(ratio);
        tile.setPattern(lowResolution);
        return tile;
    });
}
