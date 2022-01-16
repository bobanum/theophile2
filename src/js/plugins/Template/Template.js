import Plugin from "../Plugin.js";
export default class Template extends Plugin {
    static get url() {
        var url = new URL(location);
        if (this.Theophile.root[0] === "/") {
            var path = this.Theophile.root.split("/");
        } else {
            var path = url.pathname.split("/").slice(0, -1);
            path.push(this.Theophile.root);
        }
        path.push("template.html");
        url.pathname = path.join("/");
        return url.href;
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
        return this.template = await this.load();
    }
    static async mount() {
        const template = await this.load();
        const containers = template.querySelectorAll(".container");
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
        while (template.body.firstChild) {
            document.body.appendChild(template.body.firstChild);
        }
        template.querySelectorAll("link,style,script").forEach(element => {
            document.head.appendChild(element);
        });
    }
}
