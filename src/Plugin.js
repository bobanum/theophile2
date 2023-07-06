/**
 * Description
 * @export
 * @class Plugin
 */
export default class Plugin {
	static debug = true;
	static log = this.debug ? console.log.bind(console) : () => {};
	static name = "Plugin";
	static plugins = {};
	static parent = null;
	static hooks = {
		beforeFetch: [],
		fetched: [],
		beforeMount: [],
		beforeCleanup: [],
		cleanedup: [],
		mounted: [],
		afterMounted: [],
	};
	static registerPlugin(plugin, name = null) {
		name = name || plugin.name;
		if (this.parent) {
			return this.parent.registerPlugin(plugin, `${this.name}.${name}`);
		}
		if (this.plugins[name]) return this;
		this.plugins[name] = plugin;
		plugin.init(this);
		return this;
	}

	static addHook(name, hook) {
		this.log(`addHook : ${this.name}.${name}`);
		if (!this.hooks[name]) {
			throw new Error(`Unknown hook ${name}`);
		}
		this.hooks[name].push(hook);
		return this;
	}
	static beforeFetch(hook) {
		return this.addHook("beforeFetch", hook);
	}
	static fetched(hook) {
		return this.addHook("fetched", hook);
	}
	static beforeMount(hook) {
		return this.addHook("beforeMount", hook);
	}
	static beforeCleanup(hook) {
		return this.addHook("beforeCleanup", hook);
	}
	static cleanedup(hook) {
		return this.addHook("cleanedup", hook);
	}
	static mounted(hook) {
		return this.addHook("mounted", hook);
	}
	static afterMounted(hook) {
		return this.addHook("afterMounted", hook);
	}
	static execHook(name, ...args) {
		this.log(`execHook : ${this.name}.${name}`);
		if (!this.hooks[name]) {
			throw new Error(`Unknown hook ${name}`);
		}
		return Promise.all(this.hooks[name].map((hook) => hook(...args)));
	}
	/**
	 * Description
	 * @param {object} [parent=null]
	 * @returns Promise
	 * @memberof Plugin
	 */
	static init(parent = null) {
		this.log(`init : ${this.name}`);
		if (parent) {
			this.parent = parent;
			this.hooks = parent.hooks;
		}
	}
}