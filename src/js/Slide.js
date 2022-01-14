import Plugin from "./Plugin.js";
/**
 * @export
 * @class Slide
 * @extends {Plugin}
 */
export default class Slide extends Plugin {
    /**
     * Creates an instance of Slide.
     * @memberof Slide
     */
    constructor() {
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
            this._html.slide = this;
        }
        return this._html;
    }
    html_create() {
        const result = document.createElement("div");
        result.classList.add("th-slide");
        result.appendChild(this.html_header());
        result.appendChild(this.html_footer());
        result.appendChild(this.html_body());
        return result;
    }
    html_body() {
        const result = document.createElement("div");
        result.classList.add("th-slide-body");
        this.contents.forEach(content => {
            result.appendChild(content.cloneNode(true));
        });
        return result;
    }
    static html_backdrop() {
        const backdrop = document.createElement("div");
        backdrop.classList.add("th-slide-backdrop");
        const navigation = backdrop.appendChild(document.createElement("div"));
        navigation.classList.add("th-slide-navigation");
        const previous = navigation.appendChild(document.createElement("div"));
        previous.classList.add("th-slide-previous");
        previous.addEventListener("click", e => {
            const previous = backdrop.slide.previous;
            if (previous) {
                backdrop.appendChild(previous.html);
                backdrop.slide.html.remove();
                backdrop.slide = previous;
            }
        });
        const next = navigation.appendChild(document.createElement("div"));
        next.classList.add("th-slide-next");
        next.addEventListener("click", e => this.showNext());
        const first = navigation.appendChild(document.createElement("div"));
        first.classList.add("th-slide-first");
        first.addEventListener("click", e => {
            const first = backdrop.slide.first;
            if (first) {
                backdrop.appendChild(first.html);
                backdrop.slide.html.remove();
                backdrop.slide = first;
            }
        });
        const last = navigation.appendChild(document.createElement("div"));
        last.classList.add("th-slide-last");
        last.addEventListener("click", e => {
            const last = backdrop.slide.last;
            console.log(last);
            if (last) {
                backdrop.appendChild(last.html);
                backdrop.slide.html.remove();
                backdrop.slide = last;
            }
        });
        var options = navigation.appendChild(document.createElement("div"));
        options.classList.add("th-slide-options");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-menu");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-contactsheet");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-stopslideshow");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-print");
        this.keydown(backdrop);
        backdrop.Slide = this;
        return backdrop;
    }
    static keydown(backdrop) {
        backdrop.tabIndex = "0";
        backdrop.addEventListener("keydown", e => {
            if (e.key === "Control" || e.key === "Alt" || e.key === "Shift" || e.key === "Meta") {
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
                case "ArrowLeftt":
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
                    this.startSlideshow(false);
            }
            e.stopPropagation();
        });
    }
    static showSlide(slide) {
        if (slide === this.backdrop.slide) return;
        this.backdrop.appendChild(slide.html);
        this.backdrop.slide.html.remove();
        this.backdrop.slide = slide;
    }
    static showNext(n = 1) {
        var slide = this.backdrop.slide;
        while (n > 0 && slide.next) {
            slide = slide.next;
            n -= 1;
        }
        this.showSlide(slide);
    }
    static showPrevious(n = 1) {
        var slide = this.backdrop.slide;
        while (n > 0 && slide.previous) {
            slide = slide.previous;
            n -= 1;
        }
        this.showSlide(slide);
    }
    static showLast() {
        var slide = this.backdrop.slide.last;
        this.showSlide(slide);
    }
    static showFirst() {
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
        return result;
    }
    html_footer() {
        const result = document.createElement("footer");
        result.innerHTML = "&copy; 2038 My pretty course"
        return result;
    }
    /**
     * 
     *
     * @static
     * @returns
     * @memberof Slide
     */
    static prepare() {
        console.log("Slide ready");
        return Promise.resolve();
    }
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
        if (element.matches("h1,h2")) {
            if (slide) {
                slide.next = new this();
                slide.next.previous = slide;
                slide = slide.next;
            } else {
                slide = new this();
            }
            element.slide = slide;
            slide.heading = element;
            slide.id = element.getAttribute("id");
            return slide;
        }
        if (element.matches("br")) {
            if (slide) {
                slide.next = new this();
                slide.next.previous = slide;
                slide = slide.next;
            } else {
                slide = new this();
            }
            element.slide = slide;
            slide.continued = true;
            return slide;
        }
        if (!slide) {
            slide = new this();
            element.slide = slide
        }
        slide.contents.push(element);
        return slide;
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
    static async mount() {
        var slide;
        var ptr = document.body.firstChild;
        while (ptr) {
            slide = this.addElement(slide, ptr);
            if (slide) {
                slide.idx = this.slides.length;
                this.slides.push(slide);
            }
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
    static startSlideshow(state = true) {
        if (state) {
            document.body.classList.add("th-slideshow");
            this.backdrop = document.body.appendChild(this.html_backdrop());
            this.backdrop.slide = this.slides[0]
            this.backdrop.appendChild(this.backdrop.slide.html);
            localStorage.slideshow = "true";
            setTimeout(() => {
                this.backdrop.focus();
            }, 100);
        } else {
            document.body.classList.remove("th-slideshow");
            this.backdrop.remove();
            delete this.backdrop;
            localStorage.slideshow = "false";
        }
        return this;
    }
    static async clean() {
        window.addEventListener("keydown", e => {
            if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
            if (e.code === "Space") {
                // var visible = this.getVisible();
                this.startSlideshow();
                e.stopPropagation();
                return false;
            }
        });
        if (localStorage.slideshow === "true") {
            this.startSlideshow();
        }
    }
    static init() {
        super.init();
        this.contactsheet = null;
        this.slides = [];
    }
}
Slide.init();