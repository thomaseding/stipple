
class Assets {
    private constructor() {
        this._cache = {};
    }

    public getImageData(path: string): ImageData {
        const image = this._cache[path];
        if (image instanceof ImageData) {
            return image;
        }
        throw Error("todo");
    }

    private static readonly _this = new Assets();
    private readonly _cache: Record<string, object>;
}

