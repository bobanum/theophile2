class Doc {
	static createSummary() {
		var result = document.createElement("div");
		var h2 = result.appendChild(document.createElement("h2"));
		h2.innerHTML = "Summary";
		result.id = "summary";
		result.appendChild(this.getList(["h2", "h3"]));
		return result;
	}
	static getList(selector, domain) {
		domain = domain || document.body;
		if (typeof selector === "string") {
			selector = [selector];
		}
		var elements = domain.querySelectorAll(selector[0]);
		if (elements.length === 0) {
			return document.createElement("div");
		}
		var result = document.createElement("ul");
		elements.forEach(element => {
			var id = element.id;
			if (!id) {
				id = this.normalizeString(element.innerHTML);
				id = this.validateId(id, element);
				element.parentNode.id = id;
			}
			var li = result.appendChild(document.createElement("li"));
			var a = li.appendChild(document.createElement("a"));
			a.href = "#" + id;
			a.innerHTML = element.textContent;
			if (selector.length > 1) {
				li.appendChild(this.getList(selector.slice(1), element.parentNode));
			}
		});
		return result;
	}
	static validateId(id, element) {
		if (!document.getElementById(id)) {
			return id;
		}
		var p, pid;
		if (element && element.parentNode && (p = element.parentNode.closest("[id]"), p) && (pid = p.id, pid)) {
			return this.validateId(pid + "-" + id, p);
		}
		var cpt = 0;
		while (document.getElementById(id)) {
			cpt += 1;
			id = id.replace(/[0-9]*$/, "") + cpt;
		}
		return id;
	}
	/**
	 * Normalise une chaine pour utiliser comme id
	 * @param   {string} str - La chaine à normaliser
	 * @returns {string} - La chaine normalisée
	 */
	static normalizeString(str) {
		var result;
		result = str;
		return result
			.toLowerCase()
			.replace(/[áàâä]/g, "a")
			.replace(/[éèêë]/g, "e")
			.replace(/[íìîï]/g, "i")
			.replace(/[óòôö]/g, "o")
			.replace(/[úùûü]/g, "u")
			.replace(/[ýỳŷÿ]/g, "y")
			.replace(/[ç]/g, "c")
			.replace(/[æ]/g, "ae")
			.replace(/[œ]/g, "oe")
			.replace(/[^a-z0-9]/g, "_")
			.replace(/_+/g, "_")
			.replace(/^_/g, "")
			.replace(/_$/g, "");
	}
	static load() {
		const h2s = document.querySelectorAll("h2").forEach(h2 => {
			h2.addEventListener("click", e => {
				e.currentTarget.classList.toggle("collapse");
			});
		});
		var summary = this.createSummary();
		console.log(summary);
		var column = document.body.querySelector("div.interface>div.body>div.column");
		column.appendChild(summary);
	}
	static init() {
		window.addEventListener("load", () => {
			this.load();
		});
	}
}
Doc.init();