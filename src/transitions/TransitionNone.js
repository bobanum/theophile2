import Transition from "./Transition.js";

export default class TransitionNone extends Transition {
	constructor(original, replacement) {
		super(original, replacement);
	}
	cancel() {
	}
	prepare(resolve) {
		super.prepare();
		this.replacement.style.position = "absolute";
		this.original.style.position = "absolute";
		resolve();
	}
	clean() {
		super.clean();
		this.replacement.style.removeProperty("position");
		this.original.style.removeProperty("position");
	}
	async go() {
		return (this.promise = new Promise(resolve => {
			this.prepare(resolve);
		}).then(e => {
			this.clean();
			return e;
		}));
	}
}
