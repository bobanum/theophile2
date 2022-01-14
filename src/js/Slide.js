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
        var ptr = this;
        while (ptr.previous) {
            ptr = ptr.previous;
        }
        return ptr;
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
        this.contents.forEach(content => {
            result.appendChild(content.cloneNode(true));
        });
        return result;
    }
    static html_backdrop() {
        const result = document.createElement("div");
        result.classList.add("th-slide-backdrop");
        const navigation = result.appendChild(document.createElement("div"));
        navigation.classList.add("th-slide-navigation");
        const previous = navigation.appendChild(document.createElement("div"));
        previous.classList.add("th-slide-previous");
        const next = navigation.appendChild(document.createElement("div"));
        next.classList.add("th-slide-next");
        const first = navigation.appendChild(document.createElement("div"));
        first.classList.add("th-slide-first");
        const last = navigation.appendChild(document.createElement("div"));
        last.classList.add("th-slide-last");
        var options = navigation.appendChild(document.createElement("div"));
        options.classList.add("th-slide-options");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-contactsheet");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-stopslideshow");
        var option = options.appendChild(document.createElement("span"));
        option.classList.add("th-option-print");
        return result;
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
        while(slide) {
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
    static async clean() {
        window.addEventListener("keydown", e => {
            console.log(e);
            if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
            if (e.code === "Space") {
                // var visible = this.getVisible();
                var state = document.body.classList.contains("th-slideshow");
                if (state) {
                    document.body.classList.remove("th-slideshow");
                    document.body.querySelector(".th-slide-backdrop").remove();
                } else {
                    document.body.classList.add("th-slideshow");
                    var backdrop = document.body.appendChild(this.html_backdrop());
                    console.log(this.slides);
                    console.log(this.slides[0]);
                    backdrop.appendChild(this.slides[0].html);
                    // console.log(visible);
                    // e.preventDefault();
                }
                e.stopPropagation();
                return false;
            }
        });
    }
    static init() {
        super.init();
        this.contactsheet = null;
        this.slides = [];
    }
}
Slide.init();