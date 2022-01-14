export default class Theophile {
    static async prepare() {
        await new Promise(resolve => {
            window.addEventListener("DOMContentLoaded", e => {
                console.log("Window loaded");
                this.ready = true;
                resolve();
            });
        });
        console.log("Theophile ready");
        const data = await Promise.all(this.plugins.map(plugin => plugin.prepare()));
        console.log("Plugins ready");
        return data;
    }
    static processHeadings() {
        var headings = document.querySelectorAll(this.headings);
        headings.forEach(heading => {
            if (heading.hasAttribute("id")) {
                return;
            }
            var str = heading.textContent;
            str = this.normalizeString(str);
            str = str.slice(0, 128);
            if (!document.getElementById(str)) {
                heading.setAttribute("id", str);
                return;
            }
            var n = 2;
            while (document.getElementById(str + "-" + n)) {
                n += 1;
            }
            heading.setAttribute("id", str + "-" + n);
        })
    }
    static normalizeString(str) {
        var result = str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9_\.\-]/g, "_")
            .replace(/_+/g, "_");
        return result;
    }
    static async mount() {
        this.processHeadings();
        // await new Promise(resolve => {
        //     resolve();
        // });
        console.log("Theophile mounted");
        const data = await Promise.all(this.plugins.map(plugin => plugin.mount()));
        console.log("Plugins mounted");
        return data;
    }
    static async clean() {
        console.log("Theophile cleaned");
        const data = await Promise.all(this.plugins.map(plugin => plugin.clean()));
        console.log("Plugins cleaned");
        return data;
    }
    static cssLink(name) {
        name = name || this.name.toLowerCase();
        var pathname = import.meta.url.slice(0, -15);   // 15 = "js/Theophile.js"
        pathname += "css/" + name + ".css";
        const link = document.head.appendChild(document.createElement("link"));
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", pathname);
        return link;
    }
    static register() {
        Array.from(arguments).forEach(plugin => {
            this[plugin.name] = plugin;
            plugin.Theophile = this;
        });
        this.plugins.push(...arguments);
    }
    static async init() {
        this.headings = "h1, h2, h3";
        this.ready = false;
        this.plugins = [];
        this.cssLink.call(this);
        await this.prepare();
        await this.mount();
        await this.clean();
    }
}
Theophile.init();
