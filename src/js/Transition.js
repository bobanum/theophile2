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
    static init() {
        Promise.all([
            "Slide",
            "Fade",
            "Box",
        ].map(file => import(`./Transition${file}.js`))).then(data => {
            data.forEach(obj => {
                this[obj.default.name.slice(10)] = obj.default;
            });
        });
    }
}
Transition.init();