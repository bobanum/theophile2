import Slide from "./Slide.js";
import Transition from "./Transition.js";

export default class TransitionSlide extends Transition {
    constructor(original, replacement) {
        super(original, replacement);
        var boundingBox = this.original.getBoundingClientRect();
        console.log(window, document, document.body);
        this.box = {
            left: boundingBox.left,
            right: document.documentElement.clientWidth - boundingBox.right,
            top: boundingBox.top,
            bottom: document.documentElement.clientHeight - boundingBox.bottom,
        };
        console.log(this.box);
    }
    prepare(prop) {
        this.original.parentNode.appendChild(this.replacement);
        this.replacement.style.position = "absolute";
        this.replacement.style.zIndex = "100";
        this.replacement.style.transitionDuration = "1000ms";
        this.replacement.style[prop] = "80%";
        this.replacement.style.transitionProperty = prop;
    }
    clean(prop) {
        this.replacement.style.position = "";
        this.replacement.style.zIndex = "";
        this.replacement.style.transitionDuration = "";
        this.replacement.style.transitionProperty = "";
        this.replacement.style[prop] = "";
    }
    async go(reverse = false) {
        Slide.animations[this.id] = this;
        return this.promise = new Promise(resolve => {
            if (reverse) {
                var prop = "left";
            } else {
                var prop = "right"
            }
            this.prepare(prop);
            setTimeout(() => {
                this.replacement.style[prop] = "0";
            }, 10);
            this.replacement.addEventListener("transitionend", e => {
                if (e.propertyName !== prop) return;
                this.clean(prop);
                this.original.remove();
                delete Slide.animations[this.id];
                resolve(e.currentTarget);
            });
        });
    }
}