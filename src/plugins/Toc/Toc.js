import Plugin from "../Plugin.js";
//TODO #23 When skipping headings (like h1+h3) collapsing doesn't work. Don't have the time to fix now
//TODO #24 Make scrolling smouth. For now, il scroll-behavious is smouth, page scrolls from top after ending slideshow.
export default class Toc extends Plugin {
    static async process() {
        await super.process();
        const headings = document.body.querySelectorAll("h1,h2,h3");
        this.hierarchy = this.getHierarchy(headings);
    }
    static async afterMount() {
        await super.afterMount();
        const tocContainer = document.querySelector("#th-toc");
        if (!tocContainer) return;
        tocContainer.appendChild(this.html);
    }
    static get html() {
        return this.html_ul(this.hierarchy);
    }
    static html_ul(group, level = 1) {
        const result = document.createElement("ul");
        group.forEach(headingObject => {
            const li = result.appendChild(document.createElement("li"));
            li.classList.add("th-toc-level-" + level);
            if (headingObject.heading) {
                const div = li.appendChild(document.createElement("div"));
                const a = div.appendChild(document.createElement("a"));
                a.href = "#" + headingObject.heading.id;
                a.innerHTML = headingObject.heading.innerText;
            }
            if (headingObject.group.length) {
                li.appendChild(this.html_ul(headingObject.group, level + 1));
            }
        });
        return result;
    }
    static getHierarchy(nodeList) {
        const result = [];
        var currentLevel = 0;
        var currentGroup = result;
        const path = [];
        nodeList.forEach(heading => {
            let level = parseInt(heading.tagName[1]);
            const headingObject = { heading: heading, group: [] };
            while (level > currentLevel + 1) {
                const empty = { heading: null, group: [] };
                currentGroup.push(empty);
                path[currentLevel] = currentGroup;
                currentGroup = empty.group;
                currentLevel += 1;
            }
            if (level === currentLevel) {
                currentGroup.push(headingObject);
                path[currentLevel] = headingObject.group;
            } else if (level < currentLevel) {
                currentLevel = level;
                currentGroup = path[currentLevel - 1];
                currentGroup.push(headingObject);
                path[currentLevel] = headingObject.group;
            } else if (level === currentLevel + 1) {
                currentGroup.push(headingObject);
                path[currentLevel] = currentGroup;
                currentGroup = headingObject.group;
                currentLevel = level;
            }
        });
        return result;
    }
}
