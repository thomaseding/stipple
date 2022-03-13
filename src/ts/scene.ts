class RenderContext {
    public constructor(imageData: ImageData) {
        this._imageData = imageData;
    }

    public renderPixel(x: number, y: number, rgb: RgbColor): void {
        const i = y * this._imageData.width + x;
        const j = 4 * i;
        this._imageData.data[j + 0] = rgb.red;
        this._imageData.data[j + 1] = rgb.green;
        this._imageData.data[j + 2] = rgb.blue;
        this._imageData.data[j + 3] = 0xFF;
    }

    private readonly _imageData: ImageData;
}

interface Renderable {
    renderTo(context: RenderContext, transform: Transform2d): void;
}

interface SceneObject extends Renderable {
}

class SceneNode<T extends SceneObject> implements Renderable {
    public constructor() { }

    public setLocalTransform(t: Transform2d): void {
        this._localTransform = t;
    }

    public renderTo(context: RenderContext, transform: Transform2d): void {
        const t = transform.then(this._localTransform);
        for (const o of this.objects) {
            o.renderTo(context, t);
        }
        for (const child of this.childNodes) {
            child.renderTo(context, t);
        }
    }

    private _localTransform: Transform2d = Transform2d.identity;
    public readonly objects: T[] = [];
    public readonly childNodes: SceneNode<T>[] = [];
}

class Scene<T extends SceneObject> implements Renderable {
    public renderTo(context: RenderContext, transform: Transform2d): void {
        this._rootNode.renderTo(context, transform);
    }

    private readonly _rootNode: SceneNode<T> = new SceneNode<T>();
}




