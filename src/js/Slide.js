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
         * Le id de la slide
         */
        this.id = "";
        /**
         * La Slide précédent
         * @type Slide
         */
        this.previous = null;
        /**
         * La Slide suivante
         * @type Slide
         */
        this.next = null;
        /**
         * Le contenu sans le titre
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
            this._html = this.create_html();
            this._html.slide = this;
        }
        return this._html;
    }
    create_html() {
        const result = document.createElement("div");
        result.classList.add("th-slide");
        result.classList.add("th-slide-backdrop");
        const scene = result.appendChild(document.createElement("div"));
        scene.classList.add("th-slide-scene");
        scene.appendChild(this.create_header());
        scene.appendChild(this.create_footer());
        this.contents.forEach(content => {
            scene.appendChild(content.cloneNode(true));
        });
        return result;
    }
    create_header() {
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
    create_footer() {
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
        var cs = document.createElement("section");
        cs.classList.add("th-contactsheet");
        var slide = this.first;
        while(slide) {
            cs.appendChild(slide.html.cloneNode(true));
            slide = slide.next;
        }
        return cs;
    }
    static mount() {
        var slide;
        var ptr = document.body.firstChild;
        this.slides = [];
        while (ptr) {
            slide = this.addElement(slide, ptr);
            if (slide) {
                slide.idx = this.slides.length;
                this.slides.push(this.slides);
            }
            ptr = ptr.nextSibling;
        }
        this.first = slide.first;
        document.body.insertBefore(this.html_contactsheet(), document.body.firstChild);
        // slide = slide.first;
        // while(slide) {
        //     document.body.appendChild(slide.html);
        //     slide = slide.next;
        // }
        return Promise.resolve();
    }
}
Slide.init();