export default class Theophile {
    static prepare() {
        return new Promise(resolve => {
            window.addEventListener("load", _e => {
                console.log("Window loaded");
                this.ready = true;
                resolve();
            })
        }).then(() => {
            console.log("Theophile ready");
            return Promise.all(this.plugins.map(plugin => plugin.prepare())).then(data => {
                console.log("Plugins ready");
            });
        });
    }
    static processHeadings() {
        var headings = document.querySelectorAll("h1, h2, h3");
        headings.forEach(heading => {
            if (heading.hasAttribute("id")) {
                return;
            }
            var str = heading.textContent;
            str = this.normalizeString(str);
            str = str.substr(0, 128);
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
    static mount() {
        return new Promise(resolve => {
            this.processHeadings();
            resolve();
        }).then(() => {
            console.log("Theophile mounted");
            return Promise.all(this.plugins.map(plugin => plugin.mount()));
        });
    }
    static async init() {
        this.ready = false;
        this.plugins = [];
        await this.prepare();
        await this.mount();
    }
    static register(plugin) {
        this.plugins.push(plugin);
    }
}
Theophile.init();
