import Plugin from "../";
import "./style.scss";
export default class Iframe extends Plugin {
	/**
	 * Name of the plugin.
	 * @type {string}
	 * @static
	*/
	static name = "Iframe";
	static init(Theophile) {
		super.init(Theophile);
		this.beforeCleanup(() => {
			this.log(`${this.name} : beforeCleanup`);
			this.processAllIframes(document.body);
		});
	}
	static processAllIframes(domain) {
		this.processSrcIframes(domain);
		this.processNoSrcIframes(domain);
	}
	static processSrcIframes(domain) {
		const elements = domain.querySelectorAll("iframe[src]:not(.th-no-figure)");
		elements.forEach(iframe => {
			this.processIframe(iframe);
		});
	}
	static processNoSrcIframes(domain) {
		const elements = domain.querySelectorAll("iframe:not([src])");
		elements.forEach(iframe => {
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
		figure.appendChild(this.figcaption(iframe));
		return figure;
	}
	static figcaption(iframe) {
		if (!iframe.title && !iframe.src) return document.createComment("");
		const result = document.createElement("figcaption");
		result.innerHTML = iframe.title;
		iframe.title = "";
		if (iframe.src) {
			const link = result.appendChild(document.createElement("a"));
			link.classList.add("open-in-new");
			link.target = "_blank";
			link.href = iframe.src;
			const span = link.appendChild(document.createElement("span"));
			//TODO : Localize
			link.title = span.innerHTML = "Ouvrir dans un nouvel onglet";
			result.appendChild(link);
		}
		return result;
	}
}
