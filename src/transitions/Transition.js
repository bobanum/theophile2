export default class Transition {
    constructor(original, replacement) {
        this.id = "a" + new Date().getTime() + Math.random();
        this.original = original.html;
        this.replacement = replacement.html;
        this.duration = 500;
        this.Object = this.original.obj.constructor;
    }
    cancel() {
    }
    prepare() {
        this.original.parentNode.appendChild(this.replacement);
    }
    clean() {
        this.original.remove();
    }
    box3D() {
        var box = document.createElement("div");
        box.style.width = "100%";
        box.style.height = "100%";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.transformStyle = "preserve-3d";
        return box;
    }
    static init() {
        Promise.all([
            "Slide",
            "Fade",
            "Box",
            "Flip",
            // "Push",
            // "Scale",
        ].map(file => import(`./Transition${file}.js`))).then(data => {
            data.forEach(obj => {
                console.trace(`Transition ${obj.default.name} loaded`);
                this[obj.default.name.slice(10)] = obj.default;
            });
        });
    }
}
Transition.init();