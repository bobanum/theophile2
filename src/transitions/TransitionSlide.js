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
		this.mode = "stack";
		this.reverse = false;
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
	get props() {
		return this.directions[
			this.mode === "stack" ? this.direction : (this.direction + 4) % 8
		];
	}
	get direction() {
		return this._direction;
	}
	set direction(value) {
		if (typeof value === "string") {
			value = Math.max(["e", "se", "s", "sw", "w", "nw", "n", "ne"].indexOf(value), 0);
		}
		this._direction = value;
	}
	start(prop) {
		return !(this.reverse ^ (this.mode === "stack"))
			? this.box[prop] + "px"
			: "100%";
	}
	end(prop) {
		return this.reverse ^ (this.mode === "stack")
			? this.box[prop] + "px"
			: "100%";
	}
	cancel() {
		this.moving.style.transition = "none";
	}
	prepare(resolve) {
		super.prepare();
		this.moving = !(this.reverse ^ (this.mode === "stack"))
			? this.original
			: this.replacement;
		this.moving.style.position = "absolute";
		this.moving.style.zIndex = "100";
		this.moving.style.transitionDuration = this.duration + "ms";
		this.moving.style.transitionProperty = this.props.join(",");
		this.props.forEach(prop => {
			this.moving.style[prop] = this.start(prop);
		});
		this.evt_transitionend = e => {
			if (this.props.indexOf(e.propertyName) < 0) return;
			resolve(e);
		};
		["transitionend", "transitioncancel"].forEach(evt => {
			this.moving.addEventListener(evt, this.evt_transitionend);
		});
	}
	clean() {
		super.clean();
		this.moving.style.removeProperty("position");
		this.moving.style.removeProperty("z-index");
		this.moving.style.removeProperty("transition");
		this.props.forEach(prop => {
			this.moving.style.removeProperty(prop);
		});
		["transitionend", "transitioncancel"].forEach(evt => {
			this.moving.removeEventListener(evt, this.evt_transitionend);
		});
	}
	async go() {
		this.Object.animations[this.id] = this;
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
			setTimeout(() => {
				this.props.forEach(prop => {
					this.moving.style[prop] = this.end(prop);
				});
			}, 10);
		}).then(e => {
			this.clean();
			delete this.Object.animations[this.id];
			return e;
		}));
	}
}
