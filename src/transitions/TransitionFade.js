import Transition from "./Transition.js";

export default class TransitionFade extends Transition {
    constructor(original, replacement) {
        super(original, replacement);
    }
    cancel() {
        this.replacement.style.transition = "none";
    }
    prepare(resolve) {
        super.prepare();
        this.replacement.style.position = "absolute";
        this.replacement.style.zIndex = "100";
        this.replacement.style.opacity = "0";
        this.replacement.style.transitionDuration = this.duration + "ms";
        this.replacement.style.transitionProperty = "opacity"; 
        this.evt_transitionend = e => {
            if (e.propertyName === "opacity") {
                resolve();
            }
        };
        ["transitionend", "transitioncancel"].forEach(evt => {
            this.replacement.addEventListener(evt, this.evt_transitionend);
        });
    }
    clean() {
        super.clean();
        this.replacement.style.removeProperty('position');
        this.replacement.style.removeProperty('z-index');
        this.replacement.style.removeProperty('transition');
        this.replacement.style.removeProperty('opacity');
        ["transitionend", "transitioncancel"].forEach(evt => {
            this.replacement.removeEventListener(evt, this.evt_transitionend);
        });
    }
    async go() {
        this.Object.animations[this.id] = this;
        return this.promise = new Promise(resolve => {
            this.prepare(resolve);
            setTimeout(() => {
                this.replacement.style.opacity = "1";
            }, 10);
        }).then(e => {
            this.clean();
            delete this.Object.animations[this.id];
            return e;
        });
    }
}