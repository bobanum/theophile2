import Plugin from "../Plugin.js";
export default class Template extends Plugin {
	static async init(Theophile) {
		await super.init(Theophile);
		this.processiframes = (this.processiframes === undefined) ? true : this.processiframes;
	}
	static get url() {
		return this.Theophile.siteURL("template.html");
	}
	static async load(url = this.url) {
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", url);
			xhr.responseType = "document";
			xhr.addEventListener("load", e => {
				if (e.target.status !== 200) {
					return resolve(false);
				}
				console.trace("Template loaded from " + url);
				return resolve(e.target.response);
			});
			xhr.send();
		});
	}
	static async prepare() {
		await super.prepare();
		this.template = await this.load();
		if (this.template) {
			this.adaptUrl(this.template, url => this.Theophile.siteURL(url));
			return this.template;
		}
		console.warn("Template not found. Using default template");
		this.template = await this.load(this.Theophile.appURL("defaults/template.html"));
		this.adaptUrl(this.template, url => this.Theophile.appURL(`defaults/${url}`));
		return this.template;
		// this.template
		// 	.querySelectorAll("[src],[href],[data]")
		// 	.forEach(element => {

		// 		console.log(element);
		// 		["src", "href", "data"].forEach(name => {
		// 			const url = element.getAttribute(name);
		// 			if (url) {
		// 				element.setAttribute(name, this.Theophile.siteURL(url));
		// 			}
		// 		});
		// 	});
	}
	static adaptUrl(template, urlFn) {
		template
			.querySelectorAll("[src],[href],[data]")
			.forEach(element => {
				["src", "href", "data"].forEach(name => {
					const url = element.getAttribute(name);
					if (url) {
						element.setAttribute(name, urlFn(url));
					}
				});
			});
	}
	static async process() {
		await super.process();
		this.processAllIframes(document.body);
	}
	static async mount() {
		await super.mount();
		var promises = Array.from(this.template.querySelectorAll("link"), link => {
			return new Promise(resolve => {
				link.addEventListener("load", e => {
					resolve(e);
				});
			});
		});
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
		//TODO : Never been tested... TEST!
		this.template.querySelectorAll("link,style,script").forEach(element => {
			document.head.appendChild(element);
		});
		// return 
		Promise.all(promises);
	}
	static async clean() {
		await super.clean();
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
	static processAllIframes(domain) {
		// Escaping html code in pre>code>iframe and removine iframe
		domain.querySelectorAll("pre>code>iframe").forEach(iframe => {
			iframe.parentNode.textContent = iframe.textContent;
		});

		if (this.processiframes) {
			domain.querySelectorAll("iframe[src]:not(.th-no-figure)").forEach(iframe => {
				this.processIframe(iframe);
			});
		}
		domain.querySelectorAll("iframe:not([src])").forEach(iframe => {
			this.processIframe(iframe);
			var src = `data:text/html,<!DOCTYPE html><meta charset="UTF-8"><html><body>${iframe.textContent.replace(/#/g, "%23")}</body></html>`;
			iframe.setAttribute("src", src);
			iframe.setAttribute("scrolling", "no");
			iframe.style.overflow = "hidden";
			iframe.classList.add("th-no-figure");
		});
	}
	static processIframe(iframe) {
		var figure = document.createElement("figure");
		figure.classList.add("iframe");
		if (iframe.style.width) {
			figure.style.width = iframe.style.width;
		} else {
			//TODO Is it OK?
			var style = window.getComputedStyle(iframe);
			figure.style.width = style.width;
		}
		iframe.parentNode.insertBefore(figure, iframe);
		figure.appendChild(iframe);
		var figcaption = figure.appendChild(document.createElement("figcaption"));
		figcaption.innerHTML = iframe.title;
		iframe.title = "";
		var a = figcaption.appendChild(document.createElement("a"));
		a.classList.add("open-in-new");
		a.target = "_blank";
		a.href = iframe.src;
		var span = a.appendChild(document.createElement("span"));
		//TODO : Localize
		a.title = span.innerHTML = "Ouvrir dans un nouvel onglet";
		return figure;
	}
}
