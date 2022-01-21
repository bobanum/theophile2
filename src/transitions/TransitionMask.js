import Transition from "./Transition.js";

export default class TransitionMask extends Transition {
	constructor(original, replacement) {
		super(original, replacement);
		this.width = 50;
	}
	cancel() {
		this.replacement.style.transition = "none";
	}
	start() {
		return (this.reverse) ? 200 : -100;
	}
	end() {
		return (this.reverse) ? 100 - this.width : this.width;
	}
	prepare(resolve) {
		super.prepare();
		console.log(this.reverse);
		this.replacement.style.position = "absolute";
		this.replacement.style.zIndex = "100";
		this.replacement.style.maskImage = `linear-gradient(to ${this.reverse ? "left" : "right"}, black, white ${this.width/2}%, white)`;
		this.replacement.style.maskSize = "200% auto";
		this.replacement.style.maskMode = "luminance";
		this.replacement.style.maskPositionX = `${this.start()}%`;
		this.replacement.style.maskRepeat = "no-repeat";

		this.replacement.style.transitionDuration = this.duration + "ms";
		this.replacement.style.transitionProperty = "mask-position";
		this.evt_transitionend = e => {
			if (e.propertyName === "mask-position-x") {
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
		["transitionend", "transitioncancel"].forEach(evt => {
			this.replacement.removeEventListener(evt, this.evt_transitionend);
		});
	}
	async go() {
		this.Object.animations[this.id] = this;
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
			setTimeout(() => {
				this.replacement.style.maskPositionX = `${this.end()}%`;
			}, 10);
		}).then(e => {
			this.clean();
			delete this.Object.animations[this.id];
			return e;
		}));
	}
}
