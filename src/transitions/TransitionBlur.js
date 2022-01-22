import Transition from "./Transition.js";

export default class TransitionBlur extends Transition {
	constructor(original, replacement) {
		super(original, replacement);
		this.blur = 1;
	}
	get filter() {
		return `blur(${this.blur}em) contrast(0.5) saturate(2) brightness(.6)`;
	}
	cancel() {
		this.replacement.style.transition = "none";
		this.original.style.transition = "none";
	}
	prepare(resolve) {
		super.prepare();
		this.replacement.style.position = "absolute";
		this.replacement.style.zIndex = "0";
		this.replacement.style.filter = this.filter;
		this.replacement.style.opacity = 0;

		this.original.style.position = "absolute";
		this.original.style.zIndex = "100";

		this.original.style.transitionDuration = (this.duration / 2) + "ms";
		this.original.style.transitionTimingFunction = "linear";
		this.original.style.transitionProperty = "filter";

		this.replacement.style.transitionDuration = (this.duration / 2) + "ms";
		this.replacement.style.transitionTimingFunction = "linear";
		this.replacement.style.transitionProperty = "filter";
		this.evt_transitionend_on = e => {
			if (e.propertyName === "filter") {
				this.original.style.opacity = 0;
				this.replacement.style.opacity = 1;
				this.replacement.style.filter = "none";
				if (e.type === "transitioncancel") {
					resolve();
				}
			}
		};
		["transitionend", "transitioncancel"].forEach(evt => {
			this.original.addEventListener(evt, this.evt_transitionend_on);
		});
		this.evt_transitionend_off = e => {
			if (e.propertyName === "filter") {
				resolve();
			}
		};
		["transitionend", "transitioncancel"].forEach(evt => {
			this.replacement.addEventListener(evt, this.evt_transitionend_off);
		});
	}
	clean() {
		super.clean();
		this.replacement.style.removeProperty("position");
		this.replacement.style.removeProperty("z-index");
		this.replacement.style.removeProperty("transition");
		this.replacement.style.removeProperty("filter");
		this.replacement.style.removeProperty("opacity");
		this.original.style.removeProperty("position");
		this.original.style.removeProperty("z-index");
		this.original.style.removeProperty("transition");
		this.original.style.removeProperty("filter");
		this.original.style.removeProperty("opacity");
		["transitionend", "transitioncancel"].forEach(evt => {
			this.original.removeEventListener(evt, this.evt_transitionend_on);
			this.replacement.removeEventListener(evt, this.evt_transitionend_off);
		});
	}
	async go() {
		this.Object.animations[this.id] = this;
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
			setTimeout(() => {
				this.original.style.filter = this.filter;
			}, 10);
		}).then(e => {
			this.clean();
			delete this.Object.animations[this.id];
			return e;
		}));
	}
}
