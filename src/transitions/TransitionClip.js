import Transition from "./Transition.js";

export default class TransitionClip extends Transition {
	constructor(original, replacement, type) {
		super(original, replacement, type);
		this.type = this.type || "square";
		this.reverse = false;
		var circleRadius = 0.5 * Math.sqrt(this.original.clientWidth * this.original.clientWidth + this.original.clientWidth * this.original.clientWidth);
		console.log(this.original);
		this.values = {
			square: ["inset(50%)", "inset(0%)"],
			horizontal: ["inset(50% 0)", "inset(0% 0)"],
			vertical: ["inset(0 50%)", "inset(0 0%)"],
			circle: ["circle(0%)", "circle(" + circleRadius + "px)"],
			ellipse: ["ellipse(0% 0%)", "ellipse(100% 100%)"],
			diamond: ["polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)"],
		};
	}
	cancel() {
		this.replacement.style.transition = "none";
	}
	prepare(resolve) {
		super.prepare();
		this.front = (this.reverse) ? this.original : this.replacement;
		if (this.reverse) {
			this.values[this.type].reverse();
		}
		this.front.style.position = "absolute";
		this.front.style.zIndex = "100";
		this.front.style.clipPath = this.values[this.type][0];
		this.front.style.transitionDuration = this.duration + "ms";
		this.front.style.transitionProperty = "clip-path";
		this.evt_transitionend = e => {
			if (e.propertyName === "clip-path") {
				resolve();
			}
		};
		["transitionend", "transitioncancel"].forEach(evt => {
			this.front.addEventListener(evt, this.evt_transitionend);
		});
	}
	clean() {
		super.clean();
		this.front.style.removeProperty("position");
		this.front.style.removeProperty("z-index");
		this.front.style.removeProperty("transition");
		this.front.style.removeProperty("clip-path");
		["transitionend", "transitioncancel"].forEach(evt => {
			this.front.removeEventListener(evt, this.evt_transitionend);
		});
	}
	async go() {
		this.Object.animations[this.id] = this;
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
			setTimeout(() => {
				this.front.style.clipPath = this.values[this.type][1];
			}, 10);
		}).then(e => {
			this.clean();
			delete this.Object.animations[this.id];
			return e;
		}));
	}
}
