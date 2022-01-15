import Slide from "./Slide.js";
import Transition from "./Transition.js";

export default class TransitionSlide extends Transition {
    constructor(original, replacement) {
        super(original, replacement);
        var boundingBox = this.original.getBoundingClientRect();
        this.box = {
            left: boundingBox.left,
            right: document.documentElement.clientWidth - boundingBox.right,
            top: boundingBox.top,
            bottom: document.documentElement.clientHeight - boundingBox.bottom,
        };
        this.direction = 0;
        this.directions = [
            ["left"],
            ["left", "top"],
            ["top"],
            ["top", "right"],
            ["right"],
            ["right", "bottom"],
            ["bottom"],
            ["bottom", "left"],
        ];
    }
    prepare(props) {
        this.original.parentNode.appendChild(this.replacement);
        this.replacement.style.position = "absolute";
        this.replacement.style.zIndex = "100";
        this.replacement.style.transitionDuration = this.duration + "ms";
        this.replacement.style.transitionProperty = props.join(",");
        props.forEach(prop => {
            this.replacement.style[prop] = "100%";
        });
    }
    clean(props) {
        this.replacement.style.position = "";
        this.replacement.style.zIndex = "";
        this.replacement.style.transitionDuration = "";
        this.replacement.style.transitionProperty = "";
        props.forEach(prop => {
            this.replacement.style[prop] = "";
        });
    }
    async go(reverse = false) {
        Slide.animations[this.id] = this;
        return this.promise = new Promise(resolve => {
            var direction = (reverse) ? this.direction : (this.direction + 4) % 8;
            var props = this.directions[direction];
            this.prepare(props);
            setTimeout(() => {
                props.forEach(prop => {
                    this.replacement.style[prop] = this.box[prop] + "px";
                });
            }, 10);
            this.replacement.addEventListener("transitionend", e => {
                if (props.indexOf(e.propertyName) < 0) return;
                this.clean(props);
                this.original.remove();
                delete Slide.animations[this.id];
                resolve(e.currentTarget);
            });
        });
    }
}