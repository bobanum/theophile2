export default class Transition {
	static async init(Slide) {
		this.Slide = Slide;
		this.loadConfig();
		const data = await Promise.all(
			[
				"None",
				"Slide",
				"Fade",
				"Box",
				"Flip",
				"Mask",
				"Blur",
				"Clip"
				// "Push",
				// "Scale",
			].map(file => import(`./Transition${file}.js`))
		);
		data.forEach(obj => {
			console.trace(`Transition ${obj.default.name} loaded`);
			this[obj.default.name.slice(10)] = obj.default;
		});
	}
	constructor(original, replacement, type = "") {
		this.id = "a" + new Date().getTime() + Math.random();
		this.original = original.html;
		this.replacement = replacement.html;
		this.duration = parseInt(this.duration) || 500;
		this.type = type.toLowerCase();
		this.Object = this.original.obj.constructor;
	}
	get options() {
		return {};
	}
	set options(value) {
		for (const property in value) {
			if (Object.hasOwnProperty.call(value, property)) {
				this[property] = value[property];
			}
		}
	}
	static loadConfig() {
		if (!this.Slide.transition) return;
		const config = this.Slide.transition;
		const transitionParts = config.name.split("-");
		config._name = transitionParts[0][0].toUpperCase() + transitionParts[0].slice(1);
		config.type = transitionParts.slice(1).join("-");
		delete config.name;
		this.config = config;
		for (let property in config) {
			this[property] = config[property];
			this.prototype[property] = config[property];
		}
		this.prototype.test = 999;
	}
	static fromConfig(original, replacement) {
		return new this[this._name](original, replacement, this.type);
	}
	cancel() {}
	prepare() {
		this.original.parentNode.appendChild(this.replacement);
	}
	clean() {
		this.original.remove();
	}
	box3D() {
		var box = document.createElement("div");
		box.style.width = "100%";
		box.style.height = "100%";
		box.style.display = "flex";
		box.style.alignItems = "center";
		box.style.justifyContent = "center";
		box.style.transformStyle = "preserve-3d";
		return box;
	}
	pick(value, choices, def = 0) {
		if (!isNaN(value)) {
			value = parseInt(value);
		} else if (typeof value === "string") {
			value = choices.indexOf(value);
			if (value < 0) {
				value = def;
			}
			return value;
		} else {
			return 0;
		}
		return (value % choices.length + choices.length) % choices.length;
	}
	value(value, min, max, def = 0) {
		if (isNaN(value)) return def;
		value = parseFloat(value);
		if (min !== undefined && value < min) return min;
		if (max !== undefined && value > max) return max;
		return value;
	}
}
