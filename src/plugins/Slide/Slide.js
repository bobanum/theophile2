import Plugin from "../Plugin.js";
import Transition from "../../transitions/Transition.js";
import Properties from "./Properties.js";
/**
 * @export
 * @class Slide
 * @extends {Plugin}
 */
export default class Slide extends Plugin {
	static init(Theophile) {
		super.init(Theophile);
		this.include = "h1,h2";
		this.split = "br,.th-slide-split";
		this.exclude = "h1+h2, .th-slide-skip";
		this.nlines = 20;
		this.ratio = 16 / 9;
		this.transition = "Fade";
		this.transitionDuration = 500;
		this.transitionOptions = {};
		this.contactsheet = null;
		this.slides = [];
		this.animations = {};
		this.timestamp = null;
		this.timestampSlide = null;
		Properties.defineProperties.call(this);
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
		this.footerText = "I'm the footer";
		heading.slide = this;
		this.trigger = heading;
		if (heading.matches("br, .th-slide-split")) {
			this.continued = true;
		} else {
			this.heading = heading;
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
	html_create() {
		const html = document.createElement("div");
		html.classList.add("th-slide");
		html.appendChild(this.html_header());
		html.appendChild(this.html_footer());
		html.appendChild(this.html_body());
		html.obj = this;
		return html;
	}
	html_body() {
		const body = document.createElement("div");
		body.classList.add("th-slide-body");
		this.contents.forEach(content => {
			body.appendChild(content.cloneNode(true));
		});
		return body;
	}
	static html_backdrop() {
		const backdrop = document.createElement("div");
		backdrop.classList.add("th-slide-backdrop");
		const navigation = backdrop.appendChild(document.createElement("div"));
		navigation.classList.add("th-slide-navigation");
		const previous = navigation.appendChild(document.createElement("div"));
		previous.classList.add("th-slide-previous");
		previous.addEventListener("click", e => this.showPrevious());
		const next = navigation.appendChild(document.createElement("div"));
		next.classList.add("th-slide-next");
		next.addEventListener("click", e => this.showNext());
		const first = navigation.appendChild(document.createElement("div"));
		first.classList.add("th-slide-first");
		first.addEventListener("click", e => this.showFirst());
		const last = navigation.appendChild(document.createElement("div"));
		last.classList.add("th-slide-last");
		last.addEventListener("click", e => this.showLast());
		navigation.appendChild(this.html_options());
		this.addKeydownEvents(backdrop);
		const config = { attributes: false, childList: true, subtree: false };
		const callback = (mutationsList, observer) => {
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
	static html_options() {
		const options = document.createElement("div");
		options.classList.add("th-slide-options");
		var menu = options.appendChild(document.createElement("span"));
		menu.classList.add("th-option-menu");
		var contactsheet = options.appendChild(document.createElement("span"));
		contactsheet.classList.add("th-option-contactsheet");
		var slideshow = options.appendChild(document.createElement("span"));
		slideshow.classList.add("th-option-slideshow");
		var continous = options.appendChild(document.createElement("span"));
		continous.classList.add("th-option-continous");
		var print = options.appendChild(document.createElement("span"));
		print.classList.add("th-option-print");
		var stop = options.appendChild(document.createElement("span"));
		stop.classList.add("th-option-stopslideshow");
		stop.addEventListener("click", e => {
			this.stopSlideshow();
		});
		return options;
	}
	static addKeydownEvents(backdrop) {
		backdrop.tabIndex = "0";
		backdrop.addEventListener("keydown", e => {
			if (
				e.key === "Control" ||
				e.key === "Alt" ||
				e.key === "Shift" ||
				e.key === "Meta"
			) {
				return;
			}
			var prefix = "";
			if (e.altKey) prefix += "Alt-";
			if (e.ctrlKey || e.metaKey) prefix += "Ctrl-";
			if (e.shiftKey) prefix += "Shift-";
			var key = prefix + e.key;
			// var code = prefix + e.code;
			// console.log(key);
			switch (key) {
				case "ArrowRight":
				case "ArrowDown":
				case "PageDown":
				case "+":
				case "Enter":
					this.showNext();
					break;
				case "ArrowLeft":
				case "ArrowUp":
				case "PageUp":
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
					e.preventDefault();
					if (Object.values(this.animations).length > 0) {
						this.cancelAnimations();
					} else {
						this.stopSlideshow();
					}
			}
			e.stopPropagation();
		});
	}
	static async showSlide(slide) {
		if (slide === this.backdrop.slide) return;
		Slide.timestampSlide = new Date().getTime();
		if (!slide.zoomRatio) {
			slide.ajustZoom();
		}

		var transition = new Transition[this.transition](
			this.backdrop.slide,
			slide
		);
		transition.reverse = slide.idx < this.backdrop.slide.idx;
		transition.options = this.transitionOptions;
		transition.duration = this.transitionDuration;
		transition.go().then(data => {
			this.backdrop.slide = slide;
		});
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
		var ptr = this;
		if (ptr.continued) {
			while (!ptr.heading && ptr.previous) {
				ptr = ptr.previous;
			}
		}
		if (!ptr.heading) {
			return document.createTextNode("");
		}
		const result = document.createElement("header");
		result.appendChild(ptr.heading.cloneNode(true));
		if (this.continued) {
			result.append("...suite");
		}
		return result;
	}
	html_footer() {
		const footer = document.createElement("footer");
		var copyright = footer.appendChild(document.createElement("div"));
		copyright.innerHTML = Slide.footerText;
		var slideNumber = footer.appendChild(this.html_slideNumber());
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
			console.log(time.toTimeString());
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
	 * @returns
	 * @memberof Slide
	 */
	static addElement(slide, element) {
		if (!slide && element.nodeType === 3) {
			if (element.textContent.trim() === "") {
				return slide;
			} else {
				slide = new this();
				element.slide = slide;
			}
		}
		if (element.nodeType === 3) {
			slide.contents.push(element);
			return slide;
		}
		if (element.nodeType !== 1) {
			return slide;
		}
		if (element.matches(this.include + "," + this.split)) {
			if (element.matches(this.exclude)) {
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
			return slide;
		}
		if (!slide) {
			slide = new this();
			element.slide = slide;
		}
		slide.contents.push(element);
		return slide;
	}
	parseOptions(element) {
		var options = element.getAttribute("data-th");
		if (!options) return {};
		options = options.split(/;/).reduce((result, option) => {
			var parts = option.match(/\s*slide-([a-zA-z_-][a-zA-z0-9_-]*)\s*:\s*(.*)\s*/);
			if (parts) {
				result[parts[1]] = parts[2];
			}
			return result;
		}, {});
		for (const property in options) {
			if (Object.hasOwnProperty.call(options, property)) {
				this[property] = options[property];
			}
		}
	}
	static html_contactsheet() {
		if (this.contactsheet) return this.contactsheet;
		var contactsheet = document.createElement("section");
		contactsheet.classList.add("th-contactsheet");
		var slide = this.first;
		while (slide) {
			contactsheet.appendChild(slide.html.cloneNode(true));
			slide = slide.next;
		}
		contactsheet.obj = this;
		this.contactsheet = contactsheet;
		return this.contactsheet;
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
		document.documentElement.style.setProperty(
			"--th-slide-nlines",
			this.nlines
		);
		document.documentElement.style.setProperty(
			"--th-slide-ratio",
			this.ratio
		);
		var style = document.head.appendChild(document.createElement("style"));
		style.media = `(min-aspect-ratio: ${this.ratio} / 1)`;
		style.innerHTML =
			".th-slide {--font-size: calc(100vh / var(--th-slide-nlines));}";
		var slide;
		var ptr = document.body.firstChild;
		while (ptr) {
			slide = this.addElement(slide, ptr);
			ptr = ptr.nextSibling;
		}
		this.first = slide.first;
		// document.body.insertBefore(this.html_contactsheet(), document.body.firstChild);
		// slide = slide.first;
		// while(slide) {
		//     document.body.appendChild(slide.html);
		//     slide = slide.next;
		// }
		return this.slides;
	}
	static get state() {
		return document.body.classList.contains("th-slideshow");
	}
	static findVisibleSlide() {
		var triggers = this.slides
			.map(slide => {
				return [slide, slide.trigger.getBoundingClientRect().y];
			})
			.sort((a, b) => (a[1] < b[1] ? -1 : 1));
		var last = triggers.slice(-1)[0];
		triggers = triggers.filter(trigger => trigger[1] >= 0);
		return (triggers[0] || last)[0];
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
		var relativeRect = body.getBoundingClientRect();
		body.style.position = "absolute";
		var absoluteRect = body.getBoundingClientRect();
		body.style.removeProperty("position");
		if (relativeRect.width === absoluteRect.width) {
			var zoom = 1;
			body.style.alignSelf = "start";
			body.style.overflow = "hidden";
			if (body.scrollHeight < relativeRect.height) {
				while (body.scrollHeight < relativeRect.height) {
					zoom += 0.05;
					body.style.fontSize = zoom + "em";
				}
				while (body.scrollHeight > relativeRect.height) {
					zoom -= 0.01;
					body.style.fontSize = zoom + "em";
				}
			} else {
				while (body.scrollHeight > relativeRect.height) {
					zoom -= 0.05;
					body.style.fontSize = zoom + "em";
				}

				while (body.scrollHeight < relativeRect.height) {
					zoom += 0.01;
					body.style.fontSize = zoom + "em";
				}
				zoom -= 0.01;
			}
			body.style.removeProperty("align-self");
			body.style.removeProperty("overflow");
		} else {
			zoom = Math.min(
				relativeRect.width / absoluteRect.width,
				relativeRect.height / absoluteRect.height
			);
		}
		let parts;
		if (this.zoom === "auto") {
			this.zoomRatio = zoom;
		} else if (this.zoom === "enlarge") {
			this.zoomRatio = Math.max(1, zoom);
		} else if (this.zoom === "reduce") {
			this.zoomRatio = Math.min(1, zoom);
		} else if (parts = this.zoom.trim().match(/^[0-9\.]+$/)) {
			this.zoomRatio = parseFloat(parts) || 1;
		} else if (parts = this.zoom.match(/^\[([0-9\.]+),\s*([0-9\.]+)\]$/)) {
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
			this.timestamp = new Date().getTime();
			const slide = this.findVisibleSlide();
			if (!slide.zoomRatio) {
				slide.ajustZoom();
			}
			this.timestampSlide = new Date().getTime();
			localStorage.slideshow = "true";
			document.body.classList.add("th-slideshow");
			this.backdrop = document.body.appendChild(this.html_backdrop());
			this.backdrop.slide = slide;
			this.backdrop.appendChild(this.backdrop.slide.html);
			setTimeout(() => {
				this.backdrop.focus();
				return;
			}, 1000);
		} else {
			return this.stopSlideshow();
		}
		return this;
	}
	static stopSlideshow() {
		document.body.classList.remove("th-slideshow");
		var pos = this.backdrop.slide.trigger.offsetTop;
		window.scroll(0, pos - 10);
		this.backdrop.remove();
		delete this.backdrop;
		localStorage.slideshow = "false";
	}
	static async clean() {
		super.clean();
		window.addEventListener("keydown", e => {
			if (
				e.key === "Shift" ||
				e.key === "Control" ||
				e.key === "Alt" ||
				e.key === "Meta"
			)
				return;
			if (e.code === "Space") {
				// var visible = this.getVisible();
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
			});
		});
		if (localStorage.slideshow === "true") {
			setTimeout(() => {
				this.startSlideshow();
			}, 100);
		}
	}
}
