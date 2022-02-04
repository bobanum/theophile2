import Plugin from "../Plugin.js";
//TODO #23 When skipping headings (like h1+h3) collapsing doesn't work. Don't have the time to fix now
//TODO #24 Make scrolling smouth. For now, il scroll-behavious is smouth, page scrolls from top after ending slideshow.
//TODO #25 Toc: Make it possible to pin TOC on the page
export default class Toc extends Plugin {
	static async process() {
		await super.process();
		this.headings = Array.from(document.body.querySelectorAll("h1,h2,h3"));
		this.hierarchy = this.getHierarchy(this.headings);
	}
	static async afterMount() {
		await super.afterMount();
		const tocContainer = document.querySelector("#th-toc");
		if (!tocContainer) return;
		const btnPin = tocContainer.appendChild(document.createElement("span"));
		btnPin.classList.add("th-toc-btn-pin");
		btnPin.addEventListener("click", _e => {
			document.documentElement.classList.toggle("th-toc-pin");
		});
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
				headingObject.heading.tocElement = li;
				li.destination = headingObject.heading;
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
		const path = [result];
		nodeList.forEach(heading => {
			let level = parseInt(heading.tagName[1]);
			const headingObject = { heading: heading, group: [] };
			while (level > currentLevel + 1) {
				const empty = { heading: null, group: [] };
				path[currentLevel].push(empty);
				currentLevel += 1;
				path[currentLevel] = empty.group;
			}
			if (level === currentLevel) {
				path[currentLevel - 1].push(headingObject);
				path[currentLevel] = headingObject.group;
			} else if (level < currentLevel) {
				currentLevel = level;
				path[currentLevel - 1].push(headingObject);
				path[currentLevel] = headingObject.group;
			} else if (level === currentLevel + 1) {
				path[currentLevel].push(headingObject);
				currentLevel = level;
				path[currentLevel] = headingObject.group;
			}
		});
		return result;
	}
	static findVisibleHeading() {
		var headings = this.headings.map(heading => {
			return [heading, heading.getBoundingClientRect().y];
		}).sort((a, b) => (a[1] < b[1] ? -1 : 1));
		var last = headings.slice(-1)[0];
		headings = headings.filter(heading => heading[1] >= 0);
		return (headings[0] || last)[0];
	}
	static async clean() {
		super.clean();
		delete this.hierarchy;
		window.addEventListener("scroll", _e => {
			const visible = this.findVisibleHeading();
			if (visible.tocElement.classList.contains("th-toc-current")) {
				return;
			}
			document.querySelectorAll(".th-toc-current, .th-toc-current-within").forEach(element => element.classList.remove("th-toc-current", "th-toc-current-within"));
			visible.tocElement.classList.add("th-toc-current");
			var ptr = visible.tocElement;
			while (ptr) {
				if (ptr.id === "th-toc") break;
				ptr.classList.add("th-toc-current-within");
				ptr = ptr.parentNode.closest("li");
			}

		});
	}
}
