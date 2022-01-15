import Slide from "./Slide.js";
import Transition from "./Transition.js";

export default class TransitionFade extends Transition {
    constructor(original, replacement) {
        super(original, replacement);
    }
    prepare(reverse) {
        this.original.parentNode.appendChild(this.replacement);
        this.original.style.position = "absolute";
        this.replacement.style.position = "absolute";
        if (reverse) {
            this.replacement.style.zIndex = "100";
            this.replacement.style.opacity = "0";
        } else {
            this.replacement.style.zIndex = "100";
            this.replacement.style.opacity = "0";
        }
        this.replacement.style.transitionDuration = this.duration + "ms";
        this.replacement.style.transitionProperty = "opacity";
    }
    clean(reverse) {
        this.replacement.style.position = "";
        this.replacement.style.zIndex = "";
        this.replacement.style.transitionDuration = "";
        this.replacement.style.transitionProperty = "";
        if (reverse) {
            this.replacement.opacity = "";
        } else {
            this.replacement.opacity = "";
        }

    }
    async go(reverse = false) {
        Slide.animations[this.id] = this;
        return this.promise = new Promise(resolve => {
            // var direction = (reverse) ? this.direction : (this.direction + 4) % 8;
            // var props = this.directions[direction];
            this.prepare(reverse);
            setTimeout(() => {
                this.replacement.style.opacity = "1";
            }, 10);
            this.replacement.addEventListener("transitionend", e => {
                if (e.propertyName !== "opacity") return;
                this.clean(reverse);
                this.original.remove();
                delete Slide.animations[this.id];
                resolve(e.currentTarget);
            });
        });
    }
}