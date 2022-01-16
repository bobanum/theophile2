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
        this.template.querySelectorAll("[src],[href],[data]").forEach(element => {
            ["src", "href", "data"].forEach(name => {
                const url = element.getAttribute(name);
                if(url) {
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
                container.appendChild(contents.firstChild);
            }
        });
        while (this.template.body.firstChild) {
            document.body.appendChild(this.template.body.firstChild);
        }
        this.template.querySelectorAll("link,style,script").forEach(element => {
            document.head.appendChild(element);
        });
    }
}
