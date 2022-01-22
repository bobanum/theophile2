export default class Plugin {
	static async prepare() {
		this.cssLink();
		console.trace("Plugin " + this.name + " ready");
		return Promise.resolve();
	}
	static async process() {
		console.trace("Plugin " + this.name + " processed");
		return Promise.resolve();
	}
	static async mount() {
		console.trace("Plugin " + this.name + " mounted");
		return Promise.resolve();
	}
	static async clean() {
		console.trace("Plugin " + this.name + " cleaned");
		return Promise.resolve();
	}
	static cssLink(name) {
		var url = this.Theophile.appURL(`src/plugins/${this.name}/style.css`);

		const link = document.head.appendChild(document.createElement("link"));
		link.id = `th-${this.name}-style`;
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", url);
		return link;
	}
	static init(Theophile) {
		this.Theophile = Theophile;
	}
	static parseStyle(style = {}) {
		if (style === null) {
			return {};
		}
		if (typeof style === "object") {
			return style;
		}
		if (typeof style === "string") {
			style = style.replace(/\s*;\s*$/, "").split(/\s*;\s*/);
		}
		if (style instanceof Array) {
			style = style.reduce((compil, property) => {
				if (typeof property === "string") {
					var property = property.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
					if (!property) return compil;
					property = property.slice(1);
				}
				compil[property[0]] = property[1];
				return compil;
			}, {});
		}
		return style;
	}
	static applyStyle(style, element) {
		style = this.parseStyle(style);
		for (const property in style) {
			if (Object.hasOwnProperty.call(style, property)) {
				element.style.setProperty(property, style[property]);
			}
		}
		return this;
	}
}
