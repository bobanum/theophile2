import Plugin from "../Plugin.js";
export default class Template extends Plugin {
	static get url() {
		return this.Theophile.siteURL("template.html");
	}
	static async load() {
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", this.url);
			xhr.responseType = "document";
			xhr.addEventListener("load", e => {
				resolve(e.target.response);
			});
			xhr.send();
		});
	}
	static async prepare() {
		this.template = await this.load();
		// this.template.querySelectorAll("script").forEach(script => {
		//     if (script.innerHTML.indexOf('For SVG support') >= 0) {
		//         script.remove();
		//     }
		// });
		this.template
			.querySelectorAll("[src],[href],[data]")
			.forEach(element => {
				["src", "href", "data"].forEach(name => {
					const url = element.getAttribute(name);
					if (url) {
						element.setAttribute(name, this.Theophile.siteURL(url));
					}
				});
			});
	}
	static async mount() {
		const containers = this.template.querySelectorAll(".container");
		containers.forEach(container => {
			var selector = container.getAttribute("data-selector");
			var contents = document.querySelector(selector);
			if (!contents) return false;
			while (container.firstChild) {
				container.firstChild.remove();
			}
			while (contents.firstChild) {
				// TOFIX: To remove scripts added by VSCode's Live Server, but removes all contents's script
				if (contents.firstChild.tagName === "SCRIPT") {
					contents.firstChild.remove();
				} else {
					container.appendChild(contents.firstChild);
				}
			}
		});
		while (this.template.body.firstChild) {
			// TOFIX: To remove scripts added by VSCode's Live Server, but removes all template's script
			if (this.template.body.firstChild.tagName === "SCRIPT") {
				this.template.body.firstChild.remove();
			} else {
				document.body.appendChild(this.template.body.firstChild);
			}
		}
		this.template.querySelectorAll("link,style,script").forEach(element => {
			document.head.appendChild(element);
		});
	}
	static async clean() {
		document.querySelectorAll(".th-contrast").forEach(element => {
			element.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				document.querySelectorAll(".main").forEach(element => {
					var style = window.getComputedStyle(element);
					var color = style.color;
					var backgroundColor = style.backgroundColor;
					element.style.color = backgroundColor;
					element.style.backgroundColor = color;
				});
			});
		});
		document.querySelectorAll(".th-size").forEach(element => {
			element.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				document.querySelectorAll(".main").forEach(element => {
					if (e.ctrlKey) {
						element.style.removeProperty("font-size");
						return;
					}
					var size = parseFloat(element.style.fontSize) || 1;
					size += e.shiftKey ? -0.5 : 0.5;
					if (size > 2) {
						size = 0.5;
					}
					if (size < 0.5) {
						size = 2;
					}
					element.style.fontSize = size + "em";
				});
			});
		});
	}
}
