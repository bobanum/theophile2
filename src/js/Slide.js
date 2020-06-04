import Plugin from "./Plugin.js";
export default class Slide extends Plugin {
    constructor() {
        super();
        this.previous = null;
        this.next = null;
        this.contents = [];
        this._html = null;
    }
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
        result.classList.add("th-slide-backdrop");
        result.innerHTML = "SLIDE";
        const scene = result.appendChild(document.createElement("div"));
        scene.classList.add("th-slide-scene");
        scene.innerHTML = "scene";
        scene.appendChild(this.create_header());
        scene.appendChild(this.create_footer());
        this.contents.forEach(content => {
            scene.appendChild(content.cloneNode(true));
        })
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
        return result;
    }
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

    static mount() {
        var slide;
        var ptr = document.body.firstChild;
        while (ptr) {
            slide = this.addElement(slide, ptr);
            ptr = ptr.nextSibling;
        }
        slide = slide.first;
        while(slide) {
            document.body.appendChild(slide.html);
            slide = slide.next;
        }
        return Promise.resolve();
    }
}
Slide.init();