import Transition from "./Transition.js";

export default class TransitionBox extends Transition {
	constructor(original, replacement) {
		super(original, replacement);
		var boundingBox = this.original.getBoundingClientRect();
		this.middle = { Y: boundingBox.width / 2, X: boundingBox.height / 2 };
		this.reverse = false;
		this.direction = 0; // E, N, W, S
	}
	start() {
		return ( "translateZ(-" + this.middle[this.axis] + "px) rotate" + this.axis + "(0deg)"
		);
	}
	end() {
		return ( "translateZ(-" + this.middle[this.axis] + "px) rotate" + this.axis + "(" + (this.reverse ^ (this.direction > 1) ? 90 : -90) + "deg)"
		);
	}
	cancel() {
		this.box.style.transition = "none";
	}
	prepare(resolve) {
		super.prepare();
		this.axis = this.direction % 2 ? "X" : "Y";
		var box = this.original.parentNode.appendChild(this.box3D());
		box.style.transform = this.start();
		box.parentNode.style.perspective = "12in";
		box.appendChild(this.original);
		box.appendChild(this.replacement);
		this.original.style.position = "absolute";
		this.original.style.transform =
			"rotate" +
			this.axis +
			"(0deg) translateZ(" +
			this.middle[this.axis] +
			"px)";
		this.replacement.style.position = "absolute";
		this.replacement.style.transform =
			"rotate" +
			this.axis +
			"(" +
			(this.reverse ^ (this.direction > 1) ? -90 : 90) +
			"deg) translateZ(" +
			this.middle[this.axis] +
			"px)";
		box.style.transitionDuration = this.duration + "ms";
		box.style.transitionProperty = "transform";
		this.box = box;
		this.evt_transitionend = e => {
			if (e.propertyName !== "transform") return;
			resolve(e);
		};
		["transitionend", "transitioncancel"].forEach(evt => {
			this.box.addEventListener(evt, this.evt_transitionend);
		});
	}
	clean() {
		super.clean();
		this.box.parentNode.appendChild(this.replacement);
		this.replacement.style.removeProperty("position");
		this.replacement.style.removeProperty("transform");
		this.box.remove();
	}
	async go() {
		this.Object.animations[this.id] = this;
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
			setTimeout(() => {
				this.box.style.transform = this.end();
			}, 10);
		}).then(e => {
			this.clean();
			delete this.Object.animations[this.id];
			return e;
		}));
	}
}
