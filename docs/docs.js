/*jslint esnext:true, browser:true*/
class Doc {
	static creerSommaire() {
		var resultat = document.createElement("div");
		var h2 = resultat.appendChild(document.createElement("h2"));
		h2.innerHTML = "Sommaire";
		resultat.setAttribute("id", "sommaire");
		resultat.appendChild(this.recupererListe(["h2", "h3"]));
		return resultat;
	}
	static recupererListe(selecteur, domaine) {
		domaine = domaine || document.body;
		if (typeof selecteur === "string") {
			selecteur = [selecteur];
		}
		var elements = domaine.querySelectorAll(selecteur[0]);
		if (elements.length === 0) {
			return document.createElement("div");
		}
		var resultat = document.createElement("ul");
		elements.forEach(function (e) {
			var id = e.getAttribute("id");
			if (!id) {
				id = this.normaliserString(e.innerHTML);
				id = this.validerId(id, e);
				e.parentNode.setAttribute("id", id);
			}
			var li = resultat.appendChild(document.createElement("li"));
			var a = li.appendChild(document.createElement("a"));
			a.setAttribute("href", "#" + id);
			a.innerHTML = e.textContent;
			if (selecteur.length > 1) {
				li.appendChild(this.recupererListe(selecteur.slice(1), e.parentNode));
			}
		}, this);
		return resultat;
	}
	static validerId(id, element) {
		if (!document.getElementById(id)) {
			return id;
		}
		var p, pid;
		if (element && element.parentNode && (p = element.parentNode.closest("[id]"), p) && (pid = p.getAttribute("id"), pid)) {
			return this.validerId(pid + "-" + id, p);
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
	static normaliserString(str) {
		var resultat;
		resultat = str;
		resultat = resultat.toLowerCase();
		resultat = resultat.replace(/[áàâä]/g, "a");
		resultat = resultat.replace(/[éèêë]/g, "e");
		resultat = resultat.replace(/[íìîï]/g, "i");
		resultat = resultat.replace(/[óòôö]/g, "o");
		resultat = resultat.replace(/[úùûü]/g, "u");
		resultat = resultat.replace(/[ýỳŷÿ]/g, "y");
		resultat = resultat.replace(/[ç]/g, "c");
		resultat = resultat.replace(/[æ]/g, "ae");
		resultat = resultat.replace(/[œ]/g, "oe");
		resultat = resultat.replace(/[^a-z0-9]/g, "_");
		resultat = resultat.replace(/_+/g, "_");
		resultat = resultat.replace(/^_/g, "");
		resultat = resultat.replace(/_$/g, "");
		return resultat;
	}
	static load() {
		var sommaire = this.creerSommaire();
		var colonne = document.body.querySelector("div.interface>div.body>div.colonne");
		colonne.appendChild(sommaire);
	}
	static init() {
		window.addEventListener("load", function () {
			Doc.load();
		});
	}
}
Doc.init();
