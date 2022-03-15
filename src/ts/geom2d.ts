class CoordImpl<Derived extends CoordImpl<Derived>> {
    protected constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equals(other: Derived): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public isInteger(): boolean {
        return Number.isInteger(this.x) && Number.isInteger(this.y);
    }

    public readonly x: number;
    public readonly y: number;
}

class Point2d extends CoordImpl<Point2d> {
    protected readonly __brand_Point2d: undefined;

    public constructor(x: number, y: number) {
        super(x, y);
    }

    public static readonly origin = new Point2d(0, 0);

    public toPoint(): Point2d {
        return this;
    }

    public toVector(): Vector2d {
        return new Vector2d(this.x, this.y);
    }

    public add(other: Vector2d): Point2d {
        return new Point2d(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Vector2d): Point2d {
        return new Point2d(this.x - other.x, this.y - other.y);
    }

    public map(func: (u: number) => number): Point2d {
        return new Point2d(func(this.x), func(this.y));
    }

    public zipWith(other: Point2d, func: (u: number, v: number) => number): Point2d {
        return new Point2d(func(this.x, other.x), func(this.y, other.y));
    }

    public min(other: Point2d): Point2d {
        return new Point2d(
            Math.min(this.x, other.x),
            Math.min(this.y, other.y));
    }

    public max(other: Point2d): Point2d {
        return new Point2d(
            Math.max(this.x, other.x),
            Math.max(this.y, other.y));
    }
}

class Vector2d extends CoordImpl<Vector2d> {
    protected readonly __brand_Vector2d: undefined;

    public constructor(x: number, y: number) {
        super(x, y);
    }

    public static readonly zero = new Vector2d(0, 0);
    public static readonly unit = new Vector2d(1, 1);

    public static square(dim: number): Vector2d {
        return new Vector2d(dim, dim);
    }

    public static fromTo(from: Point2d, to: Point2d): Vector2d {
        return new Vector2d(to.x - from.x, to.y - from.y);
    }

    public toPoint(): Point2d {
        return new Point2d(this.x, this.y);
    }

    public scale(k: number): Vector2d {
        return new Vector2d(k * this.x, k * this.y);
    }

    public negate(): Vector2d {
        return new Vector2d(-1 * this.x, -1 * this.y);
    }

    public multiply(other: Vector2d): Vector2d {
        return new Vector2d(other.x * this.x, other.y * this.y);
    }
    public add(other: Vector2d): Vector2d {
        return new Vector2d(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Vector2d): Vector2d {
        return new Vector2d(this.x - other.x, this.y - other.y);
    }

    public divide(other: Vector2d): Vector2d {
        return new Vector2d(this.x / other.x, this.y / other.y);
    }

    public mod(other: Vector2d): Vector2d {
        return new Vector2d(this.x % other.x, this.y % other.y);
    }

    public divides(other: Vector2d): boolean {
        return other.divide(this).isInteger();
    }

    public magnitudeSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    public magnitude(): number {
        return Math.sqrt(this.magnitudeSquared());
    }

    public area(): number {
        return this.x * this.y;
    }

    public map(func: (u: number) => number): Vector2d {
        return new Vector2d(func(this.x), func(this.y));
    }

    public zipWith(other: Vector2d, func: (u: number, v: number) => number): Vector2d {
        return new Vector2d(func(this.x, other.x), func(this.y, other.y));
    }

    public min(other: Vector2d): Vector2d {
        return new Vector2d(
            Math.min(this.x, other.x),
            Math.min(this.y, other.y));
    }

    public max(other: Vector2d): Vector2d {
        return new Vector2d(
            Math.max(this.x, other.x),
            Math.max(this.y, other.y));
    }
}

class Box2d {
    public constructor(position: Point2d, extent: Vector2d) {
        this._min = position;
        this._extent = extent;
    }

    public forEachPosition(action: (position: Point2d) => void): void {
        for (let y = 0; y < this._extent.y; ++y) {
            for (let x = 0; x < this._extent.x; ++x) {
                action(this._min.add(new Vector2d(x, y)));
            }
        }
    }

    public min(): Point2d {
        return this._min;
    }

    public max(): Point2d {
        return this._min.add(this._extent);
    }

    public extent(): Vector2d {
        return this._extent;
    }

    public area(): number {
        return this._extent.area();
    }

    public containsPoint(point: Point2d): boolean {
        const min = this._min;
        const max = this.max();
        return min.x <= point.x && point.x < max.x
            && min.y <= point.y && point.y < max.y;
    }

    public containsBox(other: Box2d): boolean {
        return this.containsPoint(other._min)
            && this.containsPoint(other.max().subtract(Vector2d.unit));
    }

    private readonly _min: Point2d;
    private readonly _extent: Vector2d;
}

class ReadonlyGrid2d<T> {
    protected readonly __brand_ReadonlyGrid2d: undefined;

    protected constructor(extent: Vector2d, linearGrid: T[]);
    protected constructor(extent: Vector2d, initialValue: (position: Point2d) => T);
    protected constructor(extent: Vector2d, arg2: T[] | ((position: Point2d) => T)) {
        this._extent = extent;
        if (Array.isArray(arg2)) {
            const linearGrid = arg2;
            this._linearGrid = linearGrid;
        }
        else {
            const initialValue = arg2;
            this._linearGrid = [];
            const box = new Box2d(Point2d.origin, extent);
            box.forEachPosition((position: Point2d) => {
                this._linearGrid.push(initialValue(position));
            });
        }
        if (this._extent.area() !== this._linearGrid.length) {
            throw Error();
        }
    }

    public extent(): Vector2d {
        return this._extent;
    }

    public getAt(index: Point2d | Vector2d): T {
        const linear = this._linearize(index);
        const value = this._linearGrid[linear];
        if (value === undefined) {
            throw Error();
        }
        return value;
    }

    protected _linearize(index: Point2d | Vector2d): number {
        if (index.x >= this._extent.x) {
            throw Error();
        }
        if (index.y >= this._extent.y) {
            throw Error();
        }
        return index.y * this._extent.x + index.x;
    }

    protected readonly _linearGrid: T[];
    protected readonly _extent: Vector2d;
}

class Grid2d<T> extends ReadonlyGrid2d<T> {
    protected readonly __brand_Grid2d: undefined;

    public static build<T>(extent: Vector2d, initialValue: (position: Point2d) => T): Grid2d<T> {
        return new Grid2d(extent, initialValue);
    }

    public static fill<T>(extent: Vector2d, initialValue: T): Grid2d<T> {
        const linearGrid = Array(extent.x * extent.y).fill(initialValue);
        return new Grid2d(extent, linearGrid);
    }

    public static from1d<T>(extent: Vector2d, linearGrid: T[]): Grid2d<T> {
        return new Grid2d(extent, linearGrid.slice());
    }

    public static from2d<T>(grid: T[][]): Grid2d<T> {
        const linearGrid: T[] = [];
        const height = grid.length;
        const width = grid[0]?.length || 0;
        const consistent = grid.every((lane: T[]) => {
            return lane.length === width;
        });
        if (!consistent) {
            throw Error();
        }
        grid.forEach((xs) => {
            xs.forEach((x) => {
                linearGrid.push(x);
            });
        });
        const extent = new Vector2d(width, height);
        return new Grid2d(extent, linearGrid);
    }

    public setAt(index: Point2d | Vector2d, value: T): void {
        const linear = this._linearize(index);
        if (this._linearGrid.length <= linear) {
            throw Error();
        }
        this._linearGrid[linear] = value;
    }
}

class OffsetGrid2d<T> {
    public constructor(grid: Grid2d<T>, offset: Vector2d) {
        this._grid = grid;
        this._box = new Box2d(offset.toPoint(), grid.extent());
    }

    public applyAdditionalOffset(offset: Vector2d): OffsetGrid2d<T> {
        const newOffset = this._box.min().add(offset).toVector();
        return new OffsetGrid2d(this._grid, newOffset);
    }

    public getAt(index: Point2d | Vector2d): T | undefined {
        if (this._box.containsPoint(index.toPoint())) {
            const i = index.subtract(this._box.min().toVector());
            return this._grid.getAt(i);
        }
        return undefined;
    }

    public box(): Box2d {
        return this._box;
    }

    public offset(): Vector2d {
        return this._box.min().toVector();
    }

    public overlayWith(other: OffsetGrid2d<T>, combine: (oldValue: T, newValue: T) => T): void {
        if (!this._box.containsBox(other._box)) {
            throw Error();
        }
        const offset = Vector2d.fromTo(this._box.min(), other._box.min());
        const otherExtent = other._box.extent();
        for (let y = 0; y < otherExtent.y; ++y) {
            for (let x = 0; x < otherExtent.x; ++x) {
                const otherPosLocal = new Point2d(x, y);
                const index = otherPosLocal.add(offset);
                const newValue = other._grid.getAt(otherPosLocal);
                const oldValue = this._grid.getAt(index);
                const combinedValue = combine(oldValue, newValue);
                this._grid.setAt(index, combinedValue);
            }
        }
    }

    private readonly _grid: Grid2d<T>;
    private readonly _box: Box2d;
}

class Transform2d {
    protected readonly __brand_Transform2d: undefined;

    private constructor(translation: Vector2d, scale: Vector2d) {
        this._translation = translation;
        this._scale = scale;
    }

    public static readonly identity = new Transform2d(Vector2d.zero, Vector2d.unit);

    public static translateBy(translation: Vector2d) {
        return new Transform2d(translation, Vector2d.unit);
    }

    public static scaleBy(scale: Vector2d) {
        console.assert(scale.x >= 0, "use 3x3 matrices at this point if needed");
        console.assert(scale.y >= 0, "use 3x3 matrices at this point if needed");
        return new Transform2d(Vector2d.zero, scale);
    }

    public static sequence(transforms: Transform2d[]): Transform2d {
        let total = Transform2d.identity;
        for (const transform of transforms) {
            total = total.then(transform);
        }
        return total;
    }

    public then(next: Transform2d): Transform2d {
        return new Transform2d(
            this._translation.multiply(next._scale).add(next._translation),
            this._scale.multiply(next._scale));
    }

    public applyToPoint(p: Point2d): Point2d {
        const t = this._translation;
        const s = this._scale;
        return new Point2d(
            s.x * p.x + t.x,
            s.y * p.y + t.y);
    }

    public translation(): Vector2d {
        return this._translation;
    }

    public scale(): Vector2d {
        return this._scale;
    }

    private readonly _translation: Vector2d;
    private readonly _scale: Vector2d;
}
