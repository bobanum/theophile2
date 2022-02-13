import Plugin from "../Plugin.js";
import Transition from "../../transitions/Transition.js";
import Theophile from "../../Theophile.js";
//TODO ratio
/**
 * @export
 * @class Slide
 * @extends {Plugin}
 */
export default class Slide extends Plugin {
	static async init(Theophile) {
		await super.init(Theophile);
		this.transitionPromises = [Transition.init(this)];
		this.include = this.include || "h1,h2,h3";
		this.split = this.split || "br,.th-slide-split";
		this.exclude = this.exclude || "h1:not(.th-slide-full)+h2, h2:not(.th-slide-full)+h3, h1:not(.th-slide-full)+h3, .th-slide-skip";
		this.nlines = parseFloat(this.nlines) || 20;
		this.ratio = this.parseRatio(this.ratio, [16, 9]);
		this.footertext = this.footertext || "";
		this.transition = this.transition || {name: "Fade", duration: 500,};
		this.contactsheet = null;
		this.slides = [];
		this.animations = {};
		this.timestamp = null;
		this.timestampSlide = null;
	}
	/**
	 * Creates an instance of Slide.
	 * @memberof Slide
	 */
	constructor(heading) {
		super();
		/**
		 * id of the slide
		 */
		this.id = "";
		/**
		 * Previous Slide
		 * @type Slide
		 */
		this.previous = null;
		/**
		 * Next Slide
		 * @type Slide
		 */
		this.next = null;
		/**
		 * Slide contents without title
		 * @type {HTMLElement[]}
		 */
		this.contents = [];
		/**
		 * Le dom HTML créé pour la slide
		 * @type HTMLElement
		 * @private
		 */
		this._html = null;
		this.zoom = "auto";	// "auto", "none", "enlarge", "reduce", "1", "[1,1]"
		this.zoomRatio = undefined;	// Will be defined on render
		this.idx = this.constructor.slides.length;
		this.constructor.slides.push(this);
		heading.slide = this;
		this.footertext = this.constructor.footertext;
		this.heading = heading;
		this.styles = [];
		if (heading.matches(Slide.split)) {
			this.continued = true;
		} else {
			this.id = heading.getAttribute("id");
		}
		this.parseOptions(heading);
	}
	/**
	 *
	 *
	 * @readonly
	 * @memberof Slide
	 */
	get first() {
		if (!this.previous) return this;
		return this.previous.first;
	}
	get last() {
		if (!this.next) return this;
		return this.next.last;
	}
	get html() {
		if (!this._html) {
			this._html = this.html_create();
		}
		return this._html;
	}
	static parseRatio(ratio, def) {
		if (ratio instanceof Array) return ratio;
		if (!isNaN(ratio)) 
			return [Math.round(parseFloat(ratio) * 1000), 1000];
		var parts;
		if ((parts = ratio.trim().match(/\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]/))) 
			return parts.slice(1).map(n => parseFloat(n));
		if ((parts = ratio.trim().match(/([0-9.]+)\s*\/\s*([0-9.]+)/))) 
			return parts.slice(1).map(n => parseFloat(n));
		return def;
	}
	html_create() {
		const slide = document.createElement("div");
		slide.classList.add("th-slide");
		slide.classList.add(...this.heading.classList);
		this.styles.forEach(style => {
			slide.appendChild(style);
		});
		slide.id = "slide_" + this.heading.id;
		slide.appendChild(this.html_header());
		slide.appendChild(this.html_footer());
		var body = slide.appendChild(this.html_body());
		this.parseElementStyle(this.heading, body);
		this.heading.classList.remove(...this.heading.classList);
		if (this.continued) {
			slide.classList.add("th-slide-continued");
		}
		slide.obj = this;
		return slide;
	}
	html_body() {
		const body = document.createElement("div");
		body.classList.add("th-slide-body");
		if (this.heading.matches(".th-slide-full")) {
			body.appendChild(this.heading.cloneNode(true));
		}
		this.contents.forEach(content => {
			body.appendChild(content.cloneNode(true));
		});
		this.applyStyles(body);
		body.querySelectorAll("iframe:not([src^='http']):not([src^='data:']), object").forEach(element => {
			element.addEventListener("load", e => {
				["touchstart", "touchmove", "touchend", "touchcancel"].forEach(name => {
					e.target.contentWindow.addEventListener(name, e => {
						let e2 = new e.constructor(e.type, e);
						e2.objectTarget = element;
						body.dispatchEvent(e2);
					});
				});
			});
		});
		return body;
	}
	applyStyles(container) {
		container.querySelectorAll("[data-th-slide-style]").forEach(element => {
			this.parseElementStyle(element);
		});
		return this;
	}
	parseElementStyle(from, to) {
		if (!to) {
			to = from;
		}
		Slide.applyStyle(from.getAttribute("data-th-slide-style"), to);
		from.removeAttribute("data-th-slide-style");
		return this;
	}
	static html_backdrop(navigation = true) {
		const backdrop = document.createElement("div");
		backdrop.classList.add("th-slide-backdrop");
		backdrop.tabIndex = "0";
		if (navigation) {
			backdrop.appendChild(this.html_navigation());
			this.addKeydownEvents(backdrop);
			this.addTouchEvents(backdrop);
		}
		const config = { attributes: false, childList: true, subtree: false };
		const callback = (mutationsList, _observer) => {
			const mutations = mutationsList.filter(mutation => mutation.addedNodes.length > 0);
			var slides = mutations.reduce((compil, mutation) => {
				compil.push(...Array.from(mutation.addedNodes).filter(node => node.matches(".th-slide")));
				return compil;
			}, []);
			if (slides.length) {
				slides[0].querySelector("footer").appendChild(this.html_status);
			}
		};
		const observer = new MutationObserver(callback);
		observer.observe(backdrop, config);
		backdrop.Slide = this;
		return backdrop;
	}
	static html_navigation() {
		const navigation = document.createElement("div");
		navigation.classList.add("th-slide-navigation");
		const previous = navigation.appendChild(document.createElement("div"));
		previous.classList.add("th-slide-previous");
		previous.addEventListener("click", _e => this.showPrevious());
		const next = navigation.appendChild(document.createElement("div"));
		next.classList.add("th-slide-next");
		next.addEventListener("click", _e => this.showNext());
		const first = navigation.appendChild(document.createElement("div"));
		first.classList.add("th-slide-first");
		first.addEventListener("click", _e => this.showFirst());
		const last = navigation.appendChild(document.createElement("div"));
		last.classList.add("th-slide-last");
		last.addEventListener("click", _e => this.showLast());
		navigation.appendChild(this.html_options());
		return navigation;
	}
	static html_options() {
		const options = document.createElement("div");
		options.classList.add("th-slide-options");
		var menu = options.appendChild(document.createElement("span"));
		menu.classList.add("th-option-menu");
		var contactsheet = options.appendChild(document.createElement("span"));
		contactsheet.classList.add("th-option-contactsheet");
		contactsheet.addEventListener("click", _e => {
			this.showContactsheet();
		});
		var slideshow = options.appendChild(document.createElement("span"));
		slideshow.classList.add("th-option-slideshow");
		var continous = options.appendChild(document.createElement("span"));
		continous.classList.add("th-option-continous");
		var print = options.appendChild(document.createElement("span"));
		print.classList.add("th-option-print");
		var stop = options.appendChild(document.createElement("span"));
		stop.classList.add("th-option-stopslideshow");
		stop.addEventListener("click", _e => {
			this.stopSlideshow();
		});
		return options;
	}
	static showContactsheet() {
		document.documentElement.classList.add("th-contactsheet");
		var contactsheet = document.body.appendChild(this.html_contactsheet());
		this.highlightThumbnail(this.backdrop.slide);
		contactsheet.querySelector(".th-contactsheet-grid").focus();
	}
	static hideContactsheet(showSlide) {
		document.documentElement.classList.remove("th-contactsheet");
		document.getElementById("th-contactsheet").remove();
		if (showSlide) {
			this.showSlide(showSlide);
		}
		this.backdrop.focus();
	}
	static highlightThumbnail(slide) {
		document.querySelectorAll(".th-contactsheet-current").forEach(thumbnail => {
			thumbnail.classList.remove("th-contactsheet-current");
		});
		slide.contactsheetThumbnail.classList.add("th-contactsheet-current");
		setTimeout(() => {
			slide.contactsheetThumbnail.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
		}, 10);
		this.contactsheetCurrent = slide;
	}
	static html_contactsheet() {
		if (this._contactsheet) return this._contactsheet;
		const contactsheet = document.createElement("div");
		contactsheet.id = "th-contactsheet";
		contactsheet.addEventListener("click", e => {
			if (e.target === e.currentTarget) {
				this.hideContactsheet();
			}
		});
		const btnExit = contactsheet.appendChild(document.createElement("span"));
		btnExit.classList.add("th-contactsheet-exit-btn");
		btnExit.addEventListener("click", _e => {
			this.hideContactsheet();
		});
		const container = contactsheet.appendChild(document.createElement("div"));
		container.classList.add("th-contactsheet-container");
		const grid = container.appendChild(document.createElement("div"));
		grid.classList.add("th-contactsheet-grid");
		this.slides.forEach(slide => {
			grid.appendChild(slide.contactsheetThumbnail);
		});
		grid.tabIndex = "0";
		grid.addEventListener("keydown", e => {
			// e.preventDefault();
			// e.stopPropagation();
			if (e.key === "Control" || e.key === "Alt" || e.key === "Shift" || e.key === "Meta") return;
			var prefix = "";
			if (e.altKey) prefix += "Alt-";
			if (e.ctrlKey || e.metaKey) prefix += "Ctrl-";
			if (e.shiftKey) prefix += "Shift-";
			var key = prefix + e.key;
			// var code = prefix + e.code;
			var stop = false;
			switch (key) {
				case "ArrowLeft": 
				case "PageUp": 
				case "Shift-Tab": {
					stop = true;
					let previous = this.contactsheetCurrent.previous;
					if (previous) {
						this.highlightThumbnail(previous);
					}
					break;
				}
				case "ArrowDown": {
					stop = true;
					this.contactsheetCurrent.contactsheetThumbnail.classList.remove("th-contactsheet-current");
					let pos = Math.round(this.contactsheetCurrent.contactsheetThumbnail.getBoundingClientRect().x);
					let next = this.contactsheetCurrent;
					while (next.next) {
						next = next.next;
						if (pos === Math.round(next.contactsheetThumbnail.getBoundingClientRect().x)) {
							break;
						}
					}
					this.highlightThumbnail(next);
					break;
				}
				case "ArrowUp": {
					stop = true;
					this.contactsheetCurrent.contactsheetThumbnail.classList.remove("th-contactsheet-current");
					let pos = Math.round(this.contactsheetCurrent.contactsheetThumbnail.getBoundingClientRect().x);
					let previous = this.contactsheetCurrent;
					while (previous.previous) {
						previous = previous.previous;
						if (pos === Math.round(previous.contactsheetThumbnail.getBoundingClientRect().x)) {
							break;
						}
					}
					this.highlightThumbnail(previous);
					break;
				}
				case "ArrowRight": 
				case "PageDown": {
					stop = true;
					let next = this.contactsheetCurrent.next;
					if (next) {
						this.highlightThumbnail(next);
					}
					break;
				}
				case "Home": {
					stop = true;
					this.highlightThumbnail(this.slides[0]);
					break;
				}
				case "End": {
					stop = true;
					this.highlightThumbnail(this.slides.slice(-1)[0]);
					break;
				}
				case "Tab":
				case "Enter": {
					stop = true;
					this.hideContactsheet(this.contactsheetCurrent);
					break;
				}
				case "Escape": 
				case "#": {
					stop = true;
					this.hideContactsheet();
					break;
				}
			}
			if (stop) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
		this._contactsheet = contactsheet;
		return contactsheet;
	}
	get contactsheetThumbnail() {
		if (this._contactsheetThumbnail) return this._contactsheetThumbnail;
		const thumbnail = document.createElement("div");
		thumbnail.classList.add("th-contactsheet-thumbnail");
		thumbnail.appendChild(this.html.cloneNode(true));
		if (this.heading.tagName === "H1") {
			thumbnail.classList.add("th-contactsheet-group");
		}
		const number = thumbnail.appendChild(document.createElement("div"));
		number.classList.add("th-contactsheet-number");
		number.innerHTML = this.idx + 1;
		const caption = thumbnail.appendChild(document.createElement("div"));
		caption.classList.add("th-contactsheet-caption");
		const title = caption.appendChild(document.createElement("div"));
		title.classList.add("th-contactsheet-title");
		title.innerHTML = this.heading.innerText;
		thumbnail.addEventListener("click", _e => {
			Slide.hideContactsheet(this);
		});
		this._contactsheetThumbnail = thumbnail;
		return thumbnail;
	}
	static addKeydownEvents(backdrop) {
		backdrop.addEventListener("keydown", e => {
			if (e.key === "Control" || e.key === "Alt" || e.key === "Shift" || e.key === "Meta") return;
			var prefix = "";
			if (e.altKey) prefix += "Alt-";
			if (e.ctrlKey || e.metaKey) prefix += "Ctrl-";
			if (e.shiftKey) prefix += "Shift-";
			var key = prefix + e.key;
			// var code = prefix + e.code;
			console.log(key);
			switch (key) {
				case "ArrowRight":
				case "ArrowDown":
				case "PageUp":
				case "+":
					this.showNext();
					break;
				case "ArrowLeft":
				case "ArrowUp":
				case "PageDown":
				case "-":
					this.showPrevious();
					break;
				case "Home":
					this.showFirst();
					break;
				case "End":
					this.showLast();
					break;
				case " ":
				case "Escape":
				case "Tab":
					e.preventDefault();
					if (Object.values(this.animations).length > 0) {
						this.cancelAnimations();
					} else {
						this.stopSlideshow();
					}
					break;
				case "#":
				case "Enter":
					e.preventDefault();
					this.showContactsheet();
					break;
			}
			e.stopPropagation();
		});
	}
	static point(e) {
		var result = {
			x: (e.touches[0] || e.changedTouches[0]).clientX,
			y: (e.touches[0] || e.changedTouches[0]).clientY,
		};
		let target = e.objectTarget;
		while (target) {
			result.x += target.offsetLeft;
			result.y += target.offsetTop;
			target = target.offsetParent;
		}
		return result;
	}
	static addTouchEvents(backdrop) {
		var start = null;
		const feedback = document.createElement("div");
		feedback.classList.add("th-slide-feedback");
		backdrop.addEventListener("touchstart", e => {
			start = this.point(e);
			backdrop.appendChild(feedback);
			feedback.style.left = start.x + "px";
			feedback.style.top = start.y + "px";
			feedback.style.width = "0px";
			feedback.style.height = "0px";
		});
		backdrop.addEventListener("touchend", e => {
			var point = this.point(e);
			var w = feedback.clientWidth;
			var h = feedback.clientHeight;
			feedback.remove();
			var distance = point.x - start.x;
			start = null;
			if (w < h * 4) return;
			// if (Math.abs(distance) < window.innerWidth / 10) return;
			if (distance < 0) {
				this.showNext();
			} else {
				this.showPrevious();
			}
		});
		backdrop.addEventListener("touchmove", e => {
			if (!start) return;
			var point = this.point(e);
			var w = Math.abs(point.x - start.x);
			var h = Math.abs(point.y - start.y);
			if (w / h < this.ratio[0] / this.ratio[1]) {	// Vertical
				feedback.style.width = "0px";
				feedback.style.height = `${h}px`;
				feedback.style.left = `${start.x}px`;
				feedback.style.top = `${(Math.min(point.y, start.y))}px`;
			} else {
				feedback.style.height = "0px";
				feedback.style.width = `${w}px`;
				feedback.style.top = `${start.y}px`;
				feedback.style.left = `${(Math.min(point.x, start.x))}px`;
			}
		});
		backdrop.addEventListener("touchcancel", _e => {
			feedback.remove();
			start = null;
		});
	}
	static async showSlide(slide, transition = true) {
		if (slide === this.backdrop.slide) return;
		sessionStorage.currentSlide = slide.id;
		Slide.timestampSlide = new Date().getTime();
		if (!slide.zoomRatio) {
			slide.ajustZoom();
		}
		if (transition && this.backdrop) {
			let objTransition = Transition.fromConfig(this.backdrop.slide, slide);

			objTransition.reverse = slide.idx < this.backdrop.slide.idx;
			await objTransition.go();
		} else {
			if (this.backdrop.slide) {
				this.backdrop.slide.html.remove();
			}
			this.backdrop.appendChild(slide.html);
		}
		this.backdrop.slide = slide;
		this.backdrop.focus();
	}
	static async cancelAnimations() {
		Object.values(this.animations).forEach(animation => animation.cancel());
		return await Promise.all(
			Object.values(this.animations).map(animation => animation.promise)
		);
	}
	static async waitTransitions(cancel = true) {
		if (cancel) {
			Object.values(this.animations).forEach(animation =>
				animation.cancel()
			);
		}
		return Promise.all(
			Object.values(this.animations).map(animation => animation.promise)
		);
	}
	static async showNext(n = 1) {
		await this.waitTransitions();
		var slide = this.backdrop.slide;
		while (n > 0 && slide.next) {
			slide = slide.next;
			n -= 1;
		}
		this.showSlide(slide);
	}
	static async showPrevious(n = 1) {
		await this.waitTransitions();
		var slide = this.backdrop.slide;
		while (n > 0 && slide.previous) {
			slide = slide.previous;
			n -= 1;
		}
		this.showSlide(slide);
	}
	static async showLast() {
		await this.waitTransitions();
		var slide = this.backdrop.slide.last;
		this.showSlide(slide);
	}
	static async showFirst() {
		await this.waitTransitions();
		var slide = this.backdrop.slide.first;
		this.showSlide(slide);
	}
	html_header() {
		if (this.continued) {
			let ptr = this;
			while (ptr.continued) {
				ptr = ptr.previous;
			}
			this.heading = ptr.heading.cloneNode(true);
		}
		const result = document.createElement("header");
		result.appendChild(this.heading.cloneNode(true));
		return result;
	}
	html_footer() {
		const footer = document.createElement("footer");
		var copyright = footer.appendChild(document.createElement("div"));
		copyright.innerHTML = this.footertext;
		footer.appendChild(this.html_slideNumber());
		return footer;
	}
	static get html_status() {
		if (!this._html_status) {
			var status = document.createElement("div");
			status.classList.add("th-slide-status");
			status.appendChild(this.html_clock());
			status.appendChild(this.html_timeSlide());
			status.appendChild(this.html_timeSlideshow());
			status.addEventListener("click", e => {
				var next = (e.target.nextSibling || e.currentTarget.firstChild);
				e.target.style.display = "none";
				next.style.display = "";
			});
			Array.from(status.children).forEach(element => element.style.display = "none");
			status.firstChild.style.display = "";
			this._html_status = status;
		}
		return this._html_status;
	}
	html_slideNumber() {
		var slideNumber = document.createElement("div");
		slideNumber.classList.add("th-slide-number");
		var number = slideNumber.appendChild(document.createElement("span"));
		number.innerHTML = this.idx + 1;
		slideNumber.append("/");
		var length = slideNumber.appendChild(document.createElement("span"));
		length.innerHTML = Slide.slides.length;
		return slideNumber;
	}
	static html_clock() {
		var result = document.createElement("div");
		result.classList.add("th-slide-clock");
		var update = () => {
			var time = new Date();
			result.innerHTML = time.toTimeString().split(" ")[0].slice(0, -3);
		};
		setInterval(update, 1000);
		update();
		return result;
	}
	static html_timeSlide() {
		var result = document.createElement("div");
		result.classList.add("th-slide-time");
		var update = () => {
			var time = new Date(new Date().getTime() - this.timestampSlide + new Date().getTimezoneOffset() * 60000);
			result.innerHTML = time.toTimeString().split(" ")[0].slice(3);
		};
		setInterval(update, 1000);
		return result;
	}
	static html_timeSlideshow() {
		var result = document.createElement("div");
		result.classList.add("th-slideshow-time");
		var update = () => {
			var time = new Date(new Date().getTime() - this.timestamp + new Date().getTimezoneOffset() * 60000);
			result.innerHTML = time.toTimeString().split(" ")[0].slice(3);
		};
		setInterval(update, 1000);
		update();
		return result;
	}
	/**
	 *
	 *
	 * @static
	 * @returns {Slide}
	 * @memberof Slide
	 */
	static addElement(slide, element) {
		if (!slide && element.nodeType === HTMLElement.TEXT_NODE) {
			return undefined;
		}
		if (element.nodeType === HTMLElement.TEXT_NODE) {
			slide.contents.push(element);
			return slide;
		}
		if (element.nodeType !== HTMLElement.ELEMENT_NODE) {
			return slide;
		}
		if (!element.matches(this.include + "," + this.split) || element.matches(this.exclude)) {
			if (!slide) {
				return undefined;
			}
			slide.contents.push(element);
			return slide;
		}
		if (slide) {
			slide.next = new this(element);
			slide.next.previous = slide;
			slide = slide.next;
		} else {
			slide = new this(element);
		}
		if (element.matches(this.split)) {
			slide.contents.push(element);
		}
		return slide;
	}
	parseOptions(element) {
		var options = Theophile.parseConfigString(element.getAttribute("data-th"));
		options = Theophile.parseConfigString(element.getAttribute("data-th-slide", options.slide));
		element.removeAttribute("data-th-slide");
		for (const property in options) {
			if (Object.hasOwnProperty.call(options, property)) {
				if (property.slice(0, 6) === "slide-") {
					this[property.slice(6)] = options[property];
				}
			}
		}
		var data = Theophile.loadDataSet(element);
		for (const property in data) {
			if (Object.hasOwnProperty.call(data, property)) {
				if (property.slice(0, 5) === "slide") {
					this[property.slice(5, 6).toLowerCase() + property.slice(6)] = data[property];
				}
			}
		}
	}
	static async prepare() {
		await super.prepare();
		document.body.querySelectorAll("script").forEach(script => {
			if (script.innerHTML.indexOf("For SVG support") >= 0) {
				script.remove();
			}
		});
	}
	static async process() {
		await super.process();
		const ratio = this.ratio[0] / this.ratio[1];
		document.documentElement.style.setProperty("--th-slide-nlines", this.nlines);
		document.documentElement.style.setProperty("--th-slide-ratio", Math.round(ratio * 1000) / 1000);
		var style = document.head.appendChild(document.createElement("style"));
		var innerHTML = "";
		innerHTML += `@media (min-aspect-ratio: ${Math.round(ratio * 1000)} / 1000) {.th-slideshow .th-slide {--font-size: calc(100vh / var(--th-slide-nlines));}}`;
		innerHTML += `@media (min-aspect-ratio: ${Math.round(ratio * 1200)} / 1000) {.th-slide-navigation > .th-slide-previous, .th-slide-navigation > .th-slide-next {opacity:.5;background:none}}`;
		innerHTML += `@media (max-aspect-ratio: ${Math.round(ratio * 900)} / 1000) {.th-slide-navigation > .th-slide-options {opacity:1;background:none;}}`;
		style.innerHTML = innerHTML;
		var slide;
		var ptr = document.body.firstChild;
		while (ptr) {
			let next = ptr.nextSibling;
			if (ptr.tagName === "STYLE" && slide) {
				slide.processStyle(ptr);
				ptr.remove();
			} else {
				slide = this.addElement(slide, ptr);
			}
			ptr = next;
		}
		this.first = slide.first;
		return this.slides;
	}
	processStyle(style) {
		var cssText = this.processRules(style.sheet.cssRules);
		if (style.media) {
			cssText = `@media ${style.media} {${cssText}}`;
		}
		var result = document.createElement("style");
		result.innerHTML = cssText;
		this.styles.push(result);
		return this;
	}
	processRules(rules) {
		rules = Array.from(rules);
		var result = rules.map(rule => {
			if (rule instanceof CSSMediaRule) {
				return `@media ${rule.conditionText} {${this.processRules(rule.cssRules)}}`;
			} else if (rule instanceof CSSStyleRule) {
				rule = rule.cssText.split(/\s*\{/);
				rule[0] = this.processSelector(rule[0]);
				rule = rule.join("{");
				return rule;
			} else {
				console.warn(rule.constructor.name + " not implemented");
				return rule.cssText;
			}
		});
		result = result.join(" ");
		return result;
	}
	processSelector(selector) {
		selector = selector.selectorText || selector;
		var selectors = selector.trim().split(/\s*,\s*/);
		var domain = "#slide_" + this.heading.id;
		selectors = selectors.map(function (s) {
			if (s.match(/^slide/)) {
				return s.replace(/^slide/, domain);
			}
			return domain + " " + s;
		});
		return selectors.join(", ");
	}
	static get state() {
		return document.body.classList.contains("th-slideshow");
	}
	static findVisibleSlide() {
		if (sessionStorage.currentSlide) {
			var slide = this.slides.find(slide => slide.id === sessionStorage.currentSlide);
			if (slide) return slide;
		}
		var headings = this.slides.map(slide => {
			return [slide, slide.heading.getBoundingClientRect().y];
		}).sort((a, b) => (a[1] < b[1] ? -1 : 1));
		var last = headings.slice(-1)[0];
		headings = headings.filter(heading => heading[1] >= 0);
		return (headings[0] || last)[0];
	}
	ajustZoom() {
		if (this.zoomRatio !== undefined) {
			return this.zoomRatio;
		}
		if (this.zoom === "none") {
			return this.zoomRatio = 1;
		}
		var backdrop = document.body.appendChild(
			this.constructor.html_backdrop()
		);
		backdrop.appendChild(this.html);
		var body = this.html.querySelector(".th-slide-body");
		body.style.position = "relative";
		var backupProperties = ["align-self", "justify-self", "overflow"];
		var backup = backupProperties.reduce((compil, property) => {
			compil[property] = body.style.getPropertyValue(property);
			body.style.removeProperty(property);
			return compil;
		}, {});
		body.style.alignSelf = "auto";
		body.style.justifySelf = "auto";
		var relativeRect = body.getBoundingClientRect();
		body.style.position = "absolute";
		var absoluteRect = body.getBoundingClientRect();
		body.style.removeProperty("position");
		if (relativeRect.width === absoluteRect.width) {
			var zoom = 1;
			body.style.overflow = "hidden";
			body.style.alignSelf = "start";
			let count = 0;
			if (body.scrollHeight < relativeRect.height) {
				count = 0;
				while (body.scrollHeight < relativeRect.height) {
					zoom += 0.05;
					body.style.fontSize = zoom + "em";
					if (count++ > 10) break;
				}

				count = 0;
				while (body.scrollHeight > relativeRect.height) {
					zoom -= 0.01;
					body.style.fontSize = zoom + "em";
					if (count++ > 10) break;
				}
			} else {
				count = 0;
				while (body.scrollHeight > relativeRect.height) {
					//TOFIX Makes an infinite loop when Theophile is on github.io, but not local. Could be caused by unscalable contents.
					zoom -= 0.05;
					body.style.fontSize = zoom + "em";
					if (count++ > 10) break;
				}

				count = 0;
				while (body.scrollHeight < relativeRect.height) {
					zoom += 0.01;
					body.style.fontSize = zoom + "em";
					if (count++ > 10) break;
				}
			}
			body.style.removeProperty("overflow");
		} else {
			zoom = Math.min(relativeRect.width / absoluteRect.width, relativeRect.height / absoluteRect.height);
		}
		//TOFIX Some zoom is miscalculated. This line makes sure contents fits in.
		zoom -= 0.02;
		body.style.removeProperty("align-self");
		body.style.removeProperty("justify-self");
		for (let property in backup) {
			body.style.setProperty(property, backup[property]);
		}
		let parts;
		if (this.zoom === "auto") {
			this.zoomRatio = zoom;
		} else if (this.zoom === "enlarge") {
			this.zoomRatio = Math.max(1, zoom);
		} else if (this.zoom === "reduce") {
			this.zoomRatio = Math.min(1, zoom);
		} else if ((parts = this.zoom.trim().match(/^[0-9.]+$/))) {
			this.zoomRatio = parseFloat(parts) || 1;
		} else if ((parts = this.zoom.match(/^\[([0-9.]+),\s*([0-9.]+)\]$/))) {
			let min = parseFloat(parts[1]) || 1;
			let max = parseFloat(parts[2]) || 1;
			if (min > max) {
				[min, max] = [max, min];
			}
			this.zoomRatio = Math.min(Math.max(zoom, min), max);
		} else {
			this.zoomRatio = 1;
		}
		body.style.fontSize = this.zoomRatio + "em";
		backdrop.remove();
		return this;
	}
	static startSlideshow(state = true) {
		if (state) {
			console.trace("Starting Slideshow");
			this.timestamp = new Date().getTime();
			const slide = this.findVisibleSlide();
			sessionStorage.currentSlide = slide.id;
			if (!slide.zoomRatio) {
				slide.ajustZoom();
			}
			this.timestampSlide = new Date().getTime();
			sessionStorage.slideshow = "true";
			document.body.classList.add("th-slideshow");
			this.backdrop = document.body.appendChild(this.html_backdrop());
			this.showSlide(slide, false);
			// setTimeout(() => {
			// 	this.backdrop.focus();
			// 	return;
			// }, 10);
		} else {
			return this.stopSlideshow();
		}
		return this;
	}
	scrollTo(offset = 0) {
		var pos = this.heading.offsetTop;
		window.scroll(0, pos + offset);
	}
	static stopSlideshow() {
		document.body.classList.remove("th-slideshow");
		this.backdrop.slide.scrollTo();
		this.backdrop.remove();
		delete this.backdrop;
		delete sessionStorage.currentSlide;
		sessionStorage.slideshow = "false";
	}
	static async clean() {
		super.clean();
		await Promise.all(this.transitionPromises);
		window.addEventListener("keydown", e => {
			if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
			if (e.code === "Space" || e.code === "Tab") {
				// var visible = this.getVisible();
				if (this.backdrop) {
					return;
				}
				e.stopPropagation();
				e.preventDefault();
				this.startSlideshow();

				return false;
			}
		});
		document.querySelectorAll(".th-slide-start").forEach(element => {
			element.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				this.startSlideshow();
				this.backdrop.requestFullscreen();
			});
		});
		if (sessionStorage.slideshow === "true") {
			setTimeout(() => {
				this.startSlideshow();
			}, 100);
		}
	}
}
