import Transition from "./Transition.js";

export default class TransitionMask extends Transition {
	constructor(original, replacement) {
		super(original, replacement);
		this.direction = "s";
		this.gradientDirections = ["right", "bottom", "left", "top"];
		this.width = 50;
	}
	get direction() {
		return this._direction;
	}
	set direction(value) {
		if (typeof value === "string") {
			value = Math.max(["e", "s", "w", "n"].indexOf(value), 0);
		}
		this._direction = value;
	}
	cancel() {
		this.replacement.style.transition = "none";
	}
	start() {
		return (this.reverse ^ (this._direction >= 2)) ? 200 : -100;
	}
	end() {
		return (this.reverse ^ (this._direction >= 2)) ? 100 - this.width : this.width;
	}
	prepare(resolve) {
		super.prepare();
		this.axis = (this._direction % 2) ? "y" : "x";
		var gradientDirection = this.gradientDirections[(this._direction + (this.reverse ? 2 : 0) % 4)];
		this.replacement.style.position = "absolute";
		this.replacement.style.zIndex = "100";
		this.replacement.style.WebkitMaskImage = `linear-gradient(to ${gradientDirection}, transparent, black ${this.width / 2}%, black)`;
		this.replacement.style.WebkitMaskSize = "200% 200%";
		this.replacement.style[`-webkit-mask-position-${this.axis}`] = `${this.start()}%`;
		this.replacement.style.WebkitMaskRepeat = "no-repeat";

		this.replacement.style.transitionDuration = this.duration + "ms";
		this.replacement.style.transitionTimingFunction = "linear";
		this.replacement.style.transitionProperty = `-webkit-mask-position-${this.axis}, mask-position-${this.axis}`;
		this.evt_transitionend = e => {
			if (e.propertyName === "-webkit-mask-position-" + this.axis + "" || e.propertyName === "mask-position-" + this.axis + "") {
				resolve();
			}
		};
		["transitionend", "transitioncancel"].forEach(evt => {
			this.replacement.addEventListener(evt, this.evt_transitionend);
		});
	}
	clean() {
		super.clean();
		this.replacement.style.removeProperty("position");
		this.replacement.style.removeProperty("z-index");
		this.replacement.style.removeProperty("transition");
		this.replacement.style.removeProperty("mask");
		this.replacement.style.removeProperty("-webkit-mask");
		["transitionend", "transitioncancel"].forEach(evt => {
			this.replacement.removeEventListener(evt, this.evt_transitionend);
		});
	}
	async go() {
		this.Object.animations[this.id] = this;
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
			setTimeout(() => {
				this.replacement.style[`-webkit-mask-position-${this.axis}`] = `${this.end()}%`;
			}, 10);
		}).then(e => {
			this.clean();
			delete this.Object.animations[this.id];
			return e;
		}));
	}
}
