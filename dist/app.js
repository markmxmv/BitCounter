class AbstractView {
    constructor() {
        this.app = document.getElementById('root');
    };

    destroy() {
        return
    };

    render() {
        return
    };
    
}

class AbstractDiv {
    constructor() {
        this.el = document.createElement('div');
    };

    render() {
        this.el;
    }

}

class Header extends AbstractDiv {
    constructor() {
        super();
    }

    activeElement() {
        if(location.hash == '#cryptocurrencies') {
            return this.el.querySelector('.menu__item_cryptocurrencies').classList.add('menu__item_active')
        } else if(location.hash == '') {
            return this.el.querySelector('.menu__item_cryptocurrencies').classList.add('menu__item_active')
        } else if(location.hash == '#portfolio') {
            return this.el.querySelector('.menu__item_portfolio').classList.add('menu__item_active')
        } else if(location.hash == '#about') {
            return this.el.querySelector('.menu__item_about').classList.add('menu__item_active')
        } return
    }

    render() {
        this.el.classList.add('header');
        this.el.innerHTML = `
        <div class="header__wrapper">
        <a class="header__logo" href="">
            <img src="../../static/logo2.svg" /> 
        </a>
        <div class="header__menu">
            <div class="menu__item_cover"><a class="menu__item menu__item_cryptocurrencies" href="#cryptocurrencies">Cryptocurrencies</a></div>
            <div class="menu__item_cover"><a class="menu__item menu__item_portfolio" href="#portfolio">Portfolio</a></div>
            <div class="menu__item_cover"><a class="menu__item menu__item_about" href="#about">About</a></div>
        </div>
        <a class="header__user menu__item">
            <img src="../../static/user.svg"/>
        </a>

        </div>
        <hr/>
        </div>
        `;
        this.activeElement();
        return this.el;
    }
}

class AboutView extends AbstractView {
    constructor() {
        super();
    }

    destroy() {
        this.app.innerHTML = '';
    }

    render() {
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header);
    }
}

const PATH_SEPARATOR = '.';
const TARGET = Symbol('target');
const UNSUBSCRIBE = Symbol('unsubscribe');

function isBuiltinWithMutableMethods(value) {
	return value instanceof Date
		|| value instanceof Set
		|| value instanceof Map
		|| value instanceof WeakSet
		|| value instanceof WeakMap
		|| ArrayBuffer.isView(value);
}

function isBuiltinWithoutMutableMethods(value) {
	return (typeof value === 'object' ? value === null : typeof value !== 'function') || value instanceof RegExp;
}

var isArray = Array.isArray;

function isSymbol(value) {
	return typeof value === 'symbol';
}

const path = {
	after: (path, subPath) => {
		if (isArray(path)) {
			return path.slice(subPath.length);
		}

		if (subPath === '') {
			return path;
		}

		return path.slice(subPath.length + 1);
	},
	concat: (path, key) => {
		if (isArray(path)) {
			path = [...path];

			if (key) {
				path.push(key);
			}

			return path;
		}

		if (key && key.toString !== undefined) {
			if (path !== '') {
				path += PATH_SEPARATOR;
			}

			if (isSymbol(key)) {
				return path + key.toString();
			}

			return path + key;
		}

		return path;
	},
	initial: path => {
		if (isArray(path)) {
			return path.slice(0, -1);
		}

		if (path === '') {
			return path;
		}

		const index = path.lastIndexOf(PATH_SEPARATOR);

		if (index === -1) {
			return '';
		}

		return path.slice(0, index);
	},
	last: path => {
		if (isArray(path)) {
			return path[path.length - 1] || '';
		}

		if (path === '') {
			return path;
		}

		const index = path.lastIndexOf(PATH_SEPARATOR);

		if (index === -1) {
			return path;
		}

		return path.slice(index + 1);
	},
	walk: (path, callback) => {
		if (isArray(path)) {
			for (const key of path) {
				callback(key);
			}
		} else if (path !== '') {
			let position = 0;
			let index = path.indexOf(PATH_SEPARATOR);

			if (index === -1) {
				callback(path);
			} else {
				while (position < path.length) {
					if (index === -1) {
						index = path.length;
					}

					callback(path.slice(position, index));

					position = index + 1;
					index = path.indexOf(PATH_SEPARATOR, position);
				}
			}
		}
	},
	get(object, path) {
		this.walk(path, key => {
			if (object) {
				object = object[key];
			}
		});

		return object;
	},
};

function isIterator(value) {
	return typeof value === 'object' && typeof value.next === 'function';
}

// eslint-disable-next-line max-params
function wrapIterator(iterator, target, thisArg, applyPath, prepareValue) {
	const originalNext = iterator.next;

	if (target.name === 'entries') {
		iterator.next = function () {
			const result = originalNext.call(this);

			if (result.done === false) {
				result.value[0] = prepareValue(
					result.value[0],
					target,
					result.value[0],
					applyPath,
				);
				result.value[1] = prepareValue(
					result.value[1],
					target,
					result.value[0],
					applyPath,
				);
			}

			return result;
		};
	} else if (target.name === 'values') {
		const keyIterator = thisArg[TARGET].keys();

		iterator.next = function () {
			const result = originalNext.call(this);

			if (result.done === false) {
				result.value = prepareValue(
					result.value,
					target,
					keyIterator.next().value,
					applyPath,
				);
			}

			return result;
		};
	} else {
		iterator.next = function () {
			const result = originalNext.call(this);

			if (result.done === false) {
				result.value = prepareValue(
					result.value,
					target,
					result.value,
					applyPath,
				);
			}

			return result;
		};
	}

	return iterator;
}

function ignoreProperty(cache, options, property) {
	return cache.isUnsubscribed
		|| (options.ignoreSymbols && isSymbol(property))
		|| (options.ignoreUnderscores && property.charAt(0) === '_')
		|| ('ignoreKeys' in options && options.ignoreKeys.includes(property));
}

/**
@class Cache
@private
*/
class Cache {
	constructor(equals) {
		this._equals = equals;
		this._proxyCache = new WeakMap();
		this._pathCache = new WeakMap();
		this.isUnsubscribed = false;
	}

	_getDescriptorCache() {
		if (this._descriptorCache === undefined) {
			this._descriptorCache = new WeakMap();
		}

		return this._descriptorCache;
	}

	_getProperties(target) {
		const descriptorCache = this._getDescriptorCache();
		let properties = descriptorCache.get(target);

		if (properties === undefined) {
			properties = {};
			descriptorCache.set(target, properties);
		}

		return properties;
	}

	_getOwnPropertyDescriptor(target, property) {
		if (this.isUnsubscribed) {
			return Reflect.getOwnPropertyDescriptor(target, property);
		}

		const properties = this._getProperties(target);
		let descriptor = properties[property];

		if (descriptor === undefined) {
			descriptor = Reflect.getOwnPropertyDescriptor(target, property);
			properties[property] = descriptor;
		}

		return descriptor;
	}

	getProxy(target, path, handler, proxyTarget) {
		if (this.isUnsubscribed) {
			return target;
		}

		const reflectTarget = target[proxyTarget];
		const source = reflectTarget || target;

		this._pathCache.set(source, path);

		let proxy = this._proxyCache.get(source);

		if (proxy === undefined) {
			proxy = reflectTarget === undefined
				? new Proxy(target, handler)
				: target;

			this._proxyCache.set(source, proxy);
		}

		return proxy;
	}

	getPath(target) {
		return this.isUnsubscribed ? undefined : this._pathCache.get(target);
	}

	isDetached(target, object) {
		return !Object.is(target, path.get(object, this.getPath(target)));
	}

	defineProperty(target, property, descriptor) {
		if (!Reflect.defineProperty(target, property, descriptor)) {
			return false;
		}

		if (!this.isUnsubscribed) {
			this._getProperties(target)[property] = descriptor;
		}

		return true;
	}

	setProperty(target, property, value, receiver, previous) { // eslint-disable-line max-params
		if (!this._equals(previous, value) || !(property in target)) {
			const descriptor = this._getOwnPropertyDescriptor(target, property);

			if (descriptor !== undefined && 'set' in descriptor) {
				return Reflect.set(target, property, value, receiver);
			}

			return Reflect.set(target, property, value);
		}

		return true;
	}

	deleteProperty(target, property, previous) {
		if (Reflect.deleteProperty(target, property)) {
			if (!this.isUnsubscribed) {
				const properties = this._getDescriptorCache().get(target);

				if (properties) {
					delete properties[property];
					this._pathCache.delete(previous);
				}
			}

			return true;
		}

		return false;
	}

	isSameDescriptor(a, target, property) {
		const b = this._getOwnPropertyDescriptor(target, property);

		return a !== undefined
			&& b !== undefined
			&& Object.is(a.value, b.value)
			&& (a.writable || false) === (b.writable || false)
			&& (a.enumerable || false) === (b.enumerable || false)
			&& (a.configurable || false) === (b.configurable || false)
			&& a.get === b.get
			&& a.set === b.set;
	}

	isGetInvariant(target, property) {
		const descriptor = this._getOwnPropertyDescriptor(target, property);

		return descriptor !== undefined
			&& descriptor.configurable !== true
			&& descriptor.writable !== true;
	}

	unsubscribe() {
		this._descriptorCache = null;
		this._pathCache = null;
		this._proxyCache = null;
		this.isUnsubscribed = true;
	}
}

function isObject(value) {
	return toString.call(value) === '[object Object]';
}

function isDiffCertain() {
	return true;
}

function isDiffArrays(clone, value) {
	return clone.length !== value.length || clone.some((item, index) => value[index] !== item);
}

const IMMUTABLE_OBJECT_METHODS = new Set([
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'toLocaleString',
	'toString',
	'valueOf',
]);

const IMMUTABLE_ARRAY_METHODS = new Set([
	'concat',
	'includes',
	'indexOf',
	'join',
	'keys',
	'lastIndexOf',
]);

const MUTABLE_ARRAY_METHODS = {
	push: isDiffCertain,
	pop: isDiffCertain,
	shift: isDiffCertain,
	unshift: isDiffCertain,
	copyWithin: isDiffArrays,
	reverse: isDiffArrays,
	sort: isDiffArrays,
	splice: isDiffArrays,
	flat: isDiffArrays,
	fill: isDiffArrays,
};

const HANDLED_ARRAY_METHODS = new Set([
	...IMMUTABLE_OBJECT_METHODS,
	...IMMUTABLE_ARRAY_METHODS,
	...Object.keys(MUTABLE_ARRAY_METHODS),
]);

function isDiffSets(clone, value) {
	if (clone.size !== value.size) {
		return true;
	}

	for (const element of clone) {
		if (!value.has(element)) {
			return true;
		}
	}

	return false;
}

const COLLECTION_ITERATOR_METHODS = [
	'keys',
	'values',
	'entries',
];

const IMMUTABLE_SET_METHODS = new Set([
	'has',
	'toString',
]);

const MUTABLE_SET_METHODS = {
	add: isDiffSets,
	clear: isDiffSets,
	delete: isDiffSets,
	forEach: isDiffSets,
};

const HANDLED_SET_METHODS = new Set([
	...IMMUTABLE_SET_METHODS,
	...Object.keys(MUTABLE_SET_METHODS),
	...COLLECTION_ITERATOR_METHODS,
]);

function isDiffMaps(clone, value) {
	if (clone.size !== value.size) {
		return true;
	}

	let bValue;
	for (const [key, aValue] of clone) {
		bValue = value.get(key);

		if (bValue !== aValue || (bValue === undefined && !value.has(key))) {
			return true;
		}
	}

	return false;
}

const IMMUTABLE_MAP_METHODS = new Set([...IMMUTABLE_SET_METHODS, 'get']);

const MUTABLE_MAP_METHODS = {
	set: isDiffMaps,
	clear: isDiffMaps,
	delete: isDiffMaps,
	forEach: isDiffMaps,
};

const HANDLED_MAP_METHODS = new Set([
	...IMMUTABLE_MAP_METHODS,
	...Object.keys(MUTABLE_MAP_METHODS),
	...COLLECTION_ITERATOR_METHODS,
]);

class CloneObject {
	constructor(value, path, argumentsList, hasOnValidate) {
		this._path = path;
		this._isChanged = false;
		this._clonedCache = new Set();
		this._hasOnValidate = hasOnValidate;
		this._changes = hasOnValidate ? [] : null;

		this.clone = path === undefined ? value : this._shallowClone(value);
	}

	static isHandledMethod(name) {
		return IMMUTABLE_OBJECT_METHODS.has(name);
	}

	_shallowClone(value) {
		let clone = value;

		if (isObject(value)) {
			clone = {...value};
		} else if (isArray(value) || ArrayBuffer.isView(value)) {
			clone = [...value];
		} else if (value instanceof Date) {
			clone = new Date(value);
		} else if (value instanceof Set) {
			clone = new Set([...value].map(item => this._shallowClone(item)));
		} else if (value instanceof Map) {
			clone = new Map();

			for (const [key, item] of value.entries()) {
				clone.set(key, this._shallowClone(item));
			}
		}

		this._clonedCache.add(clone);

		return clone;
	}

	preferredThisArg(isHandledMethod, name, thisArg, thisProxyTarget) {
		if (isHandledMethod) {
			if (isArray(thisProxyTarget)) {
				this._onIsChanged = MUTABLE_ARRAY_METHODS[name];
			} else if (thisProxyTarget instanceof Set) {
				this._onIsChanged = MUTABLE_SET_METHODS[name];
			} else if (thisProxyTarget instanceof Map) {
				this._onIsChanged = MUTABLE_MAP_METHODS[name];
			}

			return thisProxyTarget;
		}

		return thisArg;
	}

	update(fullPath, property, value) {
		const changePath = path.after(fullPath, this._path);

		if (property !== 'length') {
			let object = this.clone;

			path.walk(changePath, key => {
				if (object && object[key]) {
					if (!this._clonedCache.has(object[key])) {
						object[key] = this._shallowClone(object[key]);
					}

					object = object[key];
				}
			});

			if (this._hasOnValidate) {
				this._changes.push({
					path: changePath,
					property,
					previous: value,
				});
			}

			if (object && object[property]) {
				object[property] = value;
			}
		}

		this._isChanged = true;
	}

	undo(object) {
		let change;

		for (let index = this._changes.length - 1; index !== -1; index--) {
			change = this._changes[index];

			path.get(object, change.path)[change.property] = change.previous;
		}
	}

	isChanged(value) {
		return this._onIsChanged === undefined
			? this._isChanged
			: this._onIsChanged(this.clone, value);
	}
}

class CloneArray extends CloneObject {
	static isHandledMethod(name) {
		return HANDLED_ARRAY_METHODS.has(name);
	}
}

class CloneDate extends CloneObject {
	undo(object) {
		object.setTime(this.clone.getTime());
	}

	isChanged(value, equals) {
		return !equals(this.clone.valueOf(), value.valueOf());
	}
}

class CloneSet extends CloneObject {
	static isHandledMethod(name) {
		return HANDLED_SET_METHODS.has(name);
	}

	undo(object) {
		for (const value of this.clone) {
			object.add(value);
		}

		for (const value of object) {
			if (!this.clone.has(value)) {
				object.delete(value);
			}
		}
	}
}

class CloneMap extends CloneObject {
	static isHandledMethod(name) {
		return HANDLED_MAP_METHODS.has(name);
	}

	undo(object) {
		for (const [key, value] of this.clone.entries()) {
			object.set(key, value);
		}

		for (const key of object.keys()) {
			if (!this.clone.has(key)) {
				object.delete(key);
			}
		}
	}
}

class CloneWeakSet extends CloneObject {
	constructor(value, path, argumentsList, hasOnValidate) {
		super(undefined, path, argumentsList, hasOnValidate);

		this._arg1 = argumentsList[0];
		this._weakValue = value.has(this._arg1);
	}

	isChanged(value) {
		return this._weakValue !== value.has(this._arg1);
	}

	undo(object) {
		if (this._weakValue && !object.has(this._arg1)) {
			object.add(this._arg1);
		} else {
			object.delete(this._arg1);
		}
	}
}

class CloneWeakMap extends CloneObject {
	constructor(value, path, argumentsList, hasOnValidate) {
		super(undefined, path, argumentsList, hasOnValidate);

		this._weakKey = argumentsList[0];
		this._weakHas = value.has(this._weakKey);
		this._weakValue = value.get(this._weakKey);
	}

	isChanged(value) {
		return this._weakValue !== value.get(this._weakKey);
	}

	undo(object) {
		const weakHas = object.has(this._weakKey);

		if (this._weakHas && !weakHas) {
			object.set(this._weakKey, this._weakValue);
		} else if (!this._weakHas && weakHas) {
			object.delete(this._weakKey);
		} else if (this._weakValue !== object.get(this._weakKey)) {
			object.set(this._weakKey, this._weakValue);
		}
	}
}

class SmartClone {
	constructor(hasOnValidate) {
		this._stack = [];
		this._hasOnValidate = hasOnValidate;
	}

	static isHandledType(value) {
		return isObject(value)
			|| isArray(value)
			|| isBuiltinWithMutableMethods(value);
	}

	static isHandledMethod(target, name) {
		if (isObject(target)) {
			return CloneObject.isHandledMethod(name);
		}

		if (isArray(target)) {
			return CloneArray.isHandledMethod(name);
		}

		if (target instanceof Set) {
			return CloneSet.isHandledMethod(name);
		}

		if (target instanceof Map) {
			return CloneMap.isHandledMethod(name);
		}

		return isBuiltinWithMutableMethods(target);
	}

	get isCloning() {
		return this._stack.length > 0;
	}

	start(value, path, argumentsList) {
		let CloneClass = CloneObject;

		if (isArray(value)) {
			CloneClass = CloneArray;
		} else if (value instanceof Date) {
			CloneClass = CloneDate;
		} else if (value instanceof Set) {
			CloneClass = CloneSet;
		} else if (value instanceof Map) {
			CloneClass = CloneMap;
		} else if (value instanceof WeakSet) {
			CloneClass = CloneWeakSet;
		} else if (value instanceof WeakMap) {
			CloneClass = CloneWeakMap;
		}

		this._stack.push(new CloneClass(value, path, argumentsList, this._hasOnValidate));
	}

	update(fullPath, property, value) {
		this._stack[this._stack.length - 1].update(fullPath, property, value);
	}

	preferredThisArg(target, thisArg, thisProxyTarget) {
		const {name} = target;
		const isHandledMethod = SmartClone.isHandledMethod(thisProxyTarget, name);

		return this._stack[this._stack.length - 1]
			.preferredThisArg(isHandledMethod, name, thisArg, thisProxyTarget);
	}

	isChanged(isMutable, value, equals) {
		return this._stack[this._stack.length - 1].isChanged(isMutable, value, equals);
	}

	undo(object) {
		if (this._previousClone !== undefined) {
			this._previousClone.undo(object);
		}
	}

	stop() {
		this._previousClone = this._stack.pop();

		return this._previousClone.clone;
	}
}

/* eslint-disable unicorn/prefer-spread */

const defaultOptions = {
	equals: Object.is,
	isShallow: false,
	pathAsArray: false,
	ignoreSymbols: false,
	ignoreUnderscores: false,
	ignoreDetached: false,
	details: false,
};

const onChange = (object, onChange, options = {}) => {
	options = {
		...defaultOptions,
		...options,
	};

	const proxyTarget = Symbol('ProxyTarget');
	const {equals, isShallow, ignoreDetached, details} = options;
	const cache = new Cache(equals);
	const hasOnValidate = typeof options.onValidate === 'function';
	const smartClone = new SmartClone(hasOnValidate);

	// eslint-disable-next-line max-params
	const validate = (target, property, value, previous, applyData) => !hasOnValidate
		|| smartClone.isCloning
		|| options.onValidate(path.concat(cache.getPath(target), property), value, previous, applyData) === true;

	const handleChangeOnTarget = (target, property, value, previous) => {
		if (
			!ignoreProperty(cache, options, property)
			&& !(ignoreDetached && cache.isDetached(target, object))
		) {
			handleChange(cache.getPath(target), property, value, previous);
		}
	};

	// eslint-disable-next-line max-params
	const handleChange = (changePath, property, value, previous, applyData) => {
		if (smartClone.isCloning) {
			smartClone.update(changePath, property, previous);
		} else {
			onChange(path.concat(changePath, property), value, previous, applyData);
		}
	};

	const getProxyTarget = value => value
		? (value[proxyTarget] || value)
		: value;

	const prepareValue = (value, target, property, basePath) => {
		if (
			isBuiltinWithoutMutableMethods(value)
			|| property === 'constructor'
			|| (isShallow && !SmartClone.isHandledMethod(target, property))
			|| ignoreProperty(cache, options, property)
			|| cache.isGetInvariant(target, property)
			|| (ignoreDetached && cache.isDetached(target, object))
		) {
			return value;
		}

		if (basePath === undefined) {
			basePath = cache.getPath(target);
		}

		return cache.getProxy(value, path.concat(basePath, property), handler, proxyTarget);
	};

	const handler = {
		get(target, property, receiver) {
			if (isSymbol(property)) {
				if (property === proxyTarget || property === TARGET) {
					return target;
				}

				if (
					property === UNSUBSCRIBE
					&& !cache.isUnsubscribed
					&& cache.getPath(target).length === 0
				) {
					cache.unsubscribe();
					return target;
				}
			}

			const value = isBuiltinWithMutableMethods(target)
				? Reflect.get(target, property)
				: Reflect.get(target, property, receiver);

			return prepareValue(value, target, property);
		},

		set(target, property, value, receiver) {
			value = getProxyTarget(value);

			const reflectTarget = target[proxyTarget] || target;
			const previous = reflectTarget[property];

			if (equals(previous, value) && property in target) {
				return true;
			}

			const isValid = validate(target, property, value, previous);

			if (
				isValid
				&& cache.setProperty(reflectTarget, property, value, receiver, previous)
			) {
				handleChangeOnTarget(target, property, target[property], previous);

				return true;
			}

			return !isValid;
		},

		defineProperty(target, property, descriptor) {
			if (!cache.isSameDescriptor(descriptor, target, property)) {
				const previous = target[property];

				if (
					validate(target, property, descriptor.value, previous)
					&& cache.defineProperty(target, property, descriptor, previous)
				) {
					handleChangeOnTarget(target, property, descriptor.value, previous);
				}
			}

			return true;
		},

		deleteProperty(target, property) {
			if (!Reflect.has(target, property)) {
				return true;
			}

			const previous = Reflect.get(target, property);
			const isValid = validate(target, property, undefined, previous);

			if (
				isValid
				&& cache.deleteProperty(target, property, previous)
			) {
				handleChangeOnTarget(target, property, undefined, previous);

				return true;
			}

			return !isValid;
		},

		apply(target, thisArg, argumentsList) {
			const thisProxyTarget = thisArg[proxyTarget] || thisArg;

			if (cache.isUnsubscribed) {
				return Reflect.apply(target, thisProxyTarget, argumentsList);
			}

			if (
				(details === false
					|| (details !== true && !details.includes(target.name)))
				&& SmartClone.isHandledType(thisProxyTarget)
			) {
				let applyPath = path.initial(cache.getPath(target));
				const isHandledMethod = SmartClone.isHandledMethod(thisProxyTarget, target.name);

				smartClone.start(thisProxyTarget, applyPath, argumentsList);

				let result = Reflect.apply(
					target,
					smartClone.preferredThisArg(target, thisArg, thisProxyTarget),
					isHandledMethod
						? argumentsList.map(argument => getProxyTarget(argument))
						: argumentsList,
				);

				const isChanged = smartClone.isChanged(thisProxyTarget, equals);
				const previous = smartClone.stop();

				if (SmartClone.isHandledType(result) && isHandledMethod) {
					if (thisArg instanceof Map && target.name === 'get') {
						applyPath = path.concat(applyPath, argumentsList[0]);
					}

					result = cache.getProxy(result, applyPath, handler);
				}

				if (isChanged) {
					const applyData = {
						name: target.name,
						args: argumentsList,
						result,
					};
					const changePath = smartClone.isCloning
						? path.initial(applyPath)
						: applyPath;
					const property = smartClone.isCloning
						? path.last(applyPath)
						: '';

					if (validate(path.get(object, changePath), property, thisProxyTarget, previous, applyData)) {
						handleChange(changePath, property, thisProxyTarget, previous, applyData);
					} else {
						smartClone.undo(thisProxyTarget);
					}
				}

				if (
					(thisArg instanceof Map || thisArg instanceof Set)
					&& isIterator(result)
				) {
					return wrapIterator(result, target, thisArg, applyPath, prepareValue);
				}

				return result;
			}

			return Reflect.apply(target, thisArg, argumentsList);
		},
	};

	const proxy = cache.getProxy(object, options.pathAsArray ? [] : '', handler);
	onChange = onChange.bind(proxy);

	if (hasOnValidate) {
		options.onValidate = options.onValidate.bind(proxy);
	}

	return proxy;
};

onChange.target = proxy => (proxy && proxy[TARGET]) || proxy;
onChange.unsubscribe = proxy => proxy[UNSUBSCRIBE] || proxy;

class CurrenciesList extends AbstractDiv{
    constructor(appState) {
        super();
        this.appState = appState;
    }

    #addToFavorites(id) {
        this.appState.favorites.push(this.appState.coinList.find(i => i.id == id));
    }

    #deleteFromFavorites(id) {
        this.appState.favorites = this.appState.favorites.filter((c) => {return c.id != id});
    }
    

    getNegativeOrPositivePercentage(item) {
        if(item.price_change_percentage_24h < 0) {
            return 'negative'
        } return 'positive'
    }

    renderListItem(item) {
        const existInFavorites = this.appState.favorites.find(i => i.id == item.id);
        const coinListItem = document.createElement('div');
        coinListItem.classList.add('currencies-list__item__wrapper');
        coinListItem.id = `${item.id}`;
        coinListItem.innerHTML = `
            <div class="currencies-list__item">
                <div class="currencies-list__item__favorites-button">
                    <img class="favorites-button" src="../../../static/favorites-button${existInFavorites?'_active':''}.svg"/>
                </div>
                <span class="currencies-list__item__number">${item.market_cap_rank}</span>
                <div class="currencies-list__item__name__logo__wrapper"><img class="currencies-list__item__name__logo" src=${item.image}></div>
                <span class="currencies-list__item__name">${item.symbol.toUpperCase()}</span>
                <div class="currencies-list__item__24h__icon__wrapper"><img class="currencies-list__item__24h__icon" src="../../static/24h-${this.getNegativeOrPositivePercentage(item)}.svg"/></div>
                <span class="currencies-list__item__24h ${this.getNegativeOrPositivePercentage(item)}">${item.price_change_percentage_24h.toFixed(1)}%</span>
                <span class="currencies-list__item__market-cap">$${item.market_cap}</span>
                <span class="currencies-list__item__volume-24h">$${item.total_volume}</span>
                <span class="currencies-list__item__price">$${item.current_price}</span>
                <div class="currencies-list__item__dummy"></div>
            </div>
        `;
        if(existInFavorites) {
            coinListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#deleteFromFavorites.bind(this)(item.id);});
        } else {
            coinListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#addToFavorites.bind(this)(item.id);});
        }        coinListItem.addEventListener('click', () => {
            this.setChosenCoin(coinListItem.id);
        });
        return coinListItem;

    }

    renderFavoritesIcon() {
        const favoritesIcon = document.createElement('div');
        favoritesIcon.classList.add('favorites-icon__wrapper');
        favoritesIcon.innerHTML = `
            <img class="favorites-icon" src="../../../static/favorites.svg"/>

        `;

        return favoritesIcon
    }

    renderFavoritesItem(item) {
        const existInFavorites = this.appState.favorites.find(i => i.id == item.id);
        const favoritesListItem = document.createElement('div');
        favoritesListItem.classList.add('favorites-list__item__wrapper');
        favoritesListItem.id = `${item.id}`;
        favoritesListItem.innerHTML = `
        <div class="favorites-list__item">
                <div class="favorites-list__item__favorites-button">
                    <img class="favorites-button" src="../../../static/favorites-button${existInFavorites?'_active':''}.svg"/>
                </div>
                <div class="favorites-list__item__name__logo__wrapper"><img class="favorites-list__item__name__logo" src=${item.image}></div>
                <span class="favorites-list__item__name">${item.symbol.toUpperCase()}</span>
                <div class="favorites-list__item__24h__icon__wrapper"><img class="favorites-list__item__24h__icon" src="../../static/24h-${this.getNegativeOrPositivePercentage(item)}.svg"/></div>
                <span class="favorites-list__item__24h ${this.getNegativeOrPositivePercentage(item)}">${item.price_change_percentage_24h.toFixed(1)}%</span>
                <span class="favorites-list__item__price">$${item.current_price}</span>
                <div class="favorites-list__item__dummy"></div>
            </div>
        `;

        if(existInFavorites) {
            favoritesListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#deleteFromFavorites.bind(this)(item.id);});
        } else {
            favoritesListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#addToFavorites.bind(this)(item.id);});
        }        favoritesListItem.addEventListener('click', () => {
            this.setChosenCoin(favoritesListItem.id);
        });
        return favoritesListItem
        
    }

    renderSearchItem(item) {
        const existInFavorites = this.appState.favorites.find(i => i.id == item.id);
        const searchListItem = document.createElement('div');
        searchListItem.classList.add('search-list__item__wrapper');
        searchListItem.id = `${item.id}`;
        searchListItem.innerHTML = `
        <div class="search-list__item">
                <div class="favorites-list__item__favorites-button">
                    <img class="favorites-button" src="../../../static/favorites-button${existInFavorites?'_active':''}.svg"/>
                </div>
                <div class="search-list__item__name__logo__wrapper"><img class="favorites-list__item__name__logo" src=${item.image}></div>
                <span class="search-list__item__name">${item.symbol.toUpperCase()}</span>
                <div class="search-list__item__24h__icon__wrapper"><img class="search-list__item__24h__icon" src="../../static/24h-${this.getNegativeOrPositivePercentage(item)}.svg"/></div>
                <span class="search-list__item__24h ${this.getNegativeOrPositivePercentage(item)}">${item.price_change_percentage_24h.toFixed(1)}%</span>
                <span class="search-list__item__price">$${item.current_price}</span>
                <div class="search-list__item__dummy"></div>
            </div>
        `;

        if(existInFavorites) {
            searchListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#deleteFromFavorites.bind(this)(item.id);});
        } else {
            searchListItem.querySelector('.favorites-button').addEventListener('click', () => {this.#addToFavorites.bind(this)(item.id);});
        }        searchListItem.addEventListener('click', () => {
            this.setChosenCoin(searchListItem.id);
        });
        return searchListItem
        
    }

    setChosenCoin(coin) {
        this.appState.chosenCoin = coin;
    }

    render() {
        this.el.classList.add('currencies-list');
        this.el.innerHTML = `
        <div class="currencies-list__wrapper">
            <div class="currencies-list__left">
                <div class="currencies-list__search__wrapper">
                    <img class="search-icon" src="../../../static/search-icon.svg"></img>
                    <input type="text" class="currencies-list__search" placeholder="Search crypto"></input>
                    <img class="cancel-search-button" hidden src="../../../static/cancel-search.svg"></img>
                </div>
            </div>
            <div class="currencies-list__right">
                <div class="currencies-list__header">
                    <div class="currencies-list__header__wrapper">
                        <div class="currencies-list__header__favorites-button"></div>
                        <span class="currencies-list__header__number">#</span>
                        <span class="currencies-list__header__name">Name</span>
                        <span class="currencies-list__header__24h">24h%</span>
                        <span class="currencies-list__header__market-cap">Market Cap</span>
                        <span class="currencies-list__header__volume-24h">Volume 24h</span>
                        <span class="currencies-list__header__price">Price</span>
                        <div class="currencies-list__header__dummy"></div>
                    </div>
                </div>
            </div>
        </div>
        `;

        if (this.appState.searchQuery != '') {
            this.el.querySelector('.cancel-search-button').hidden = false;
        }
        this.el.querySelector('.currencies-list__search').value = this.appState.searchQuery;

        this.el.querySelector('.currencies-list__search').addEventListener('input', (e) => {
            if (e.target.value) {
                this.el.querySelector('.cancel-search-button').hidden = false;
            }
            if(e.target.value === '') {
                if (this.el.querySelector('.cancel-search-button').hidden == false) {
                    this.el.querySelector('.cancel-search-button').hidden = true;
                }
                this.appState.searchQuery = '';
                
            }
        });

        this.el.querySelector('.currencies-list__search').addEventListener('keydown', (e) => {
            if(e.code == 'Enter') {
                this.appState.searchQuery = this.el.querySelector('.currencies-list__search').value;
            } return
        });

        this.el.querySelector('.cancel-search-button').addEventListener('click', () => {
            this.el.querySelector('.cancel-search-button').hidden = true;
            this.el.querySelector('.currencies-list__search').value = '';
        });

        const coinList = document.createElement('div');
        coinList.classList.add('currencies-list__scroll');
        for(const item of this.appState.coinList) {
            coinList.append(this.renderListItem(item));
        }
        this.el.querySelector('.currencies-list__right').appendChild(coinList);

        if (this.appState.searchQuery === '') {
            if(this.appState.favorites.length == 0) {
                this.el.querySelector('.currencies-list__left').append(this.renderFavoritesIcon());
            } else {
                const favoritesHeader = document.createElement('div');
                favoritesHeader.classList.add('favorites-list__header');
                favoritesHeader.innerHTML = `
                    <span>Favorites:</span>
                `;
                this.el.querySelector('.currencies-list__left').appendChild(favoritesHeader);
    
                const favoritesList = document.createElement('div');
                favoritesList.classList.add('currencies-list__favorites__scroll');
                for(const item of this.appState.favorites) {
                    favoritesList.append(this.renderFavoritesItem(item));
                }
                this.el.querySelector('.currencies-list__left').appendChild(favoritesList);
            }
        } else {
            const searchHeader = document.createElement('div');
            searchHeader.classList.add('search-list__header');
            searchHeader.innerHTML = `
            <span>Search results:</span>
            <img class="go-back-to-favorites-button" src="../../../static/cancel-search.svg"></img>               
            `;
            this.el.querySelector('.currencies-list__left').appendChild(searchHeader);
            this.el.querySelector('.go-back-to-favorites-button').addEventListener('click', () => {
                this.el.querySelector('.currencies-list__search').value = '';
                this.appState.searchQuery = '';
            });

            const searchListItems = this.appState.coinList.filter(el => {
                return el.id.toLowerCase().includes(this.appState.searchQuery.toLowerCase()) || el.symbol.toLowerCase().includes(this.appState.searchQuery.toLowerCase())
            });

            if (searchListItems.length > 0) {
                const searchResults = document.createElement('div');
                searchResults.classList.add('currencies-list__search__scroll');
                for(const item of searchListItems) {
                        searchResults.append(this.renderSearchItem(item));
                    }
                this.el.querySelector('.currencies-list__left').appendChild(searchResults);
            } else {
                console.log('no res');
                const noResults = document.createElement('div');
                noResults.classList.add('currencies-list__search__no-results');
                noResults.innerHTML = `
                    <div>No results for '${this.appState.searchQuery}'</div>
                `;
                this.el.querySelector('.currencies-list__left').appendChild(noResults);

            }

        }

        return this.el
    }
}

function size(_a) {
    var width = _a.width, height = _a.height;
    if (width < 0) {
        throw new Error('Negative width is not allowed for Size');
    }
    if (height < 0) {
        throw new Error('Negative height is not allowed for Size');
    }
    return {
        width: width,
        height: height,
    };
}
function equalSizes(first, second) {
    return (first.width === second.width) &&
        (first.height === second.height);
}

var Observable = /** @class */ (function () {
    function Observable(win) {
        var _this = this;
        this._resolutionListener = function () { return _this._onResolutionChanged(); };
        this._resolutionMediaQueryList = null;
        this._observers = [];
        this._window = win;
        this._installResolutionListener();
    }
    Observable.prototype.dispose = function () {
        this._uninstallResolutionListener();
        this._window = null;
    };
    Object.defineProperty(Observable.prototype, "value", {
        get: function () {
            return this._window.devicePixelRatio;
        },
        enumerable: false,
        configurable: true
    });
    Observable.prototype.subscribe = function (next) {
        var _this = this;
        var observer = { next: next };
        this._observers.push(observer);
        return {
            unsubscribe: function () {
                _this._observers = _this._observers.filter(function (o) { return o !== observer; });
            },
        };
    };
    Observable.prototype._installResolutionListener = function () {
        if (this._resolutionMediaQueryList !== null) {
            throw new Error('Resolution listener is already installed');
        }
        var dppx = this._window.devicePixelRatio;
        this._resolutionMediaQueryList = this._window.matchMedia("all and (resolution: ".concat(dppx, "dppx)"));
        // IE and some versions of Edge do not support addEventListener/removeEventListener, and we are going to use the deprecated addListener/removeListener
        this._resolutionMediaQueryList.addListener(this._resolutionListener);
    };
    Observable.prototype._uninstallResolutionListener = function () {
        if (this._resolutionMediaQueryList !== null) {
            // IE and some versions of Edge do not support addEventListener/removeEventListener, and we are going to use the deprecated addListener/removeListener
            this._resolutionMediaQueryList.removeListener(this._resolutionListener);
            this._resolutionMediaQueryList = null;
        }
    };
    Observable.prototype._reinstallResolutionListener = function () {
        this._uninstallResolutionListener();
        this._installResolutionListener();
    };
    Observable.prototype._onResolutionChanged = function () {
        var _this = this;
        this._observers.forEach(function (observer) { return observer.next(_this._window.devicePixelRatio); });
        this._reinstallResolutionListener();
    };
    return Observable;
}());
function createObservable(win) {
    return new Observable(win);
}

var DevicePixelContentBoxBinding = /** @class */ (function () {
    function DevicePixelContentBoxBinding(canvasElement, transformBitmapSize, options) {
        var _a;
        this._canvasElement = null;
        this._bitmapSizeChangedListeners = [];
        this._suggestedBitmapSize = null;
        this._suggestedBitmapSizeChangedListeners = [];
        // devicePixelRatio approach
        this._devicePixelRatioObservable = null;
        // ResizeObserver approach
        this._canvasElementResizeObserver = null;
        this._canvasElement = canvasElement;
        this._canvasElementClientSize = size({
            width: this._canvasElement.clientWidth,
            height: this._canvasElement.clientHeight,
        });
        this._transformBitmapSize = transformBitmapSize !== null && transformBitmapSize !== void 0 ? transformBitmapSize : (function (size) { return size; });
        this._allowResizeObserver = (_a = options === null || options === void 0 ? void 0 : options.allowResizeObserver) !== null && _a !== void 0 ? _a : true;
        this._chooseAndInitObserver();
        // we MAY leave the constuctor without any bitmap size observation mechanics initialized
    }
    DevicePixelContentBoxBinding.prototype.dispose = function () {
        var _a, _b;
        if (this._canvasElement === null) {
            throw new Error('Object is disposed');
        }
        (_a = this._canvasElementResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        this._canvasElementResizeObserver = null;
        (_b = this._devicePixelRatioObservable) === null || _b === void 0 ? void 0 : _b.dispose();
        this._devicePixelRatioObservable = null;
        this._suggestedBitmapSizeChangedListeners.length = 0;
        this._bitmapSizeChangedListeners.length = 0;
        this._canvasElement = null;
    };
    Object.defineProperty(DevicePixelContentBoxBinding.prototype, "canvasElement", {
        get: function () {
            if (this._canvasElement === null) {
                throw new Error('Object is disposed');
            }
            return this._canvasElement;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DevicePixelContentBoxBinding.prototype, "canvasElementClientSize", {
        get: function () {
            return this._canvasElementClientSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DevicePixelContentBoxBinding.prototype, "bitmapSize", {
        get: function () {
            return size({
                width: this.canvasElement.width,
                height: this.canvasElement.height,
            });
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Use this function to change canvas element client size until binding is disposed
     * @param clientSize New client size for bound HTMLCanvasElement
     */
    DevicePixelContentBoxBinding.prototype.resizeCanvasElement = function (clientSize) {
        this._canvasElementClientSize = size(clientSize);
        this.canvasElement.style.width = "".concat(this._canvasElementClientSize.width, "px");
        this.canvasElement.style.height = "".concat(this._canvasElementClientSize.height, "px");
        this._invalidateBitmapSize();
    };
    DevicePixelContentBoxBinding.prototype.subscribeBitmapSizeChanged = function (listener) {
        this._bitmapSizeChangedListeners.push(listener);
    };
    DevicePixelContentBoxBinding.prototype.unsubscribeBitmapSizeChanged = function (listener) {
        this._bitmapSizeChangedListeners = this._bitmapSizeChangedListeners.filter(function (l) { return l !== listener; });
    };
    Object.defineProperty(DevicePixelContentBoxBinding.prototype, "suggestedBitmapSize", {
        get: function () {
            return this._suggestedBitmapSize;
        },
        enumerable: false,
        configurable: true
    });
    DevicePixelContentBoxBinding.prototype.subscribeSuggestedBitmapSizeChanged = function (listener) {
        this._suggestedBitmapSizeChangedListeners.push(listener);
    };
    DevicePixelContentBoxBinding.prototype.unsubscribeSuggestedBitmapSizeChanged = function (listener) {
        this._suggestedBitmapSizeChangedListeners = this._suggestedBitmapSizeChangedListeners.filter(function (l) { return l !== listener; });
    };
    DevicePixelContentBoxBinding.prototype.applySuggestedBitmapSize = function () {
        if (this._suggestedBitmapSize === null) {
            // nothing to apply
            return;
        }
        var oldSuggestedSize = this._suggestedBitmapSize;
        this._suggestedBitmapSize = null;
        this._resizeBitmap(oldSuggestedSize);
        this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, this._suggestedBitmapSize);
    };
    DevicePixelContentBoxBinding.prototype._resizeBitmap = function (newSize) {
        var oldSize = this.bitmapSize;
        if (equalSizes(oldSize, newSize)) {
            return;
        }
        this.canvasElement.width = newSize.width;
        this.canvasElement.height = newSize.height;
        this._emitBitmapSizeChanged(oldSize, newSize);
    };
    DevicePixelContentBoxBinding.prototype._emitBitmapSizeChanged = function (oldSize, newSize) {
        var _this = this;
        this._bitmapSizeChangedListeners.forEach(function (listener) { return listener.call(_this, oldSize, newSize); });
    };
    DevicePixelContentBoxBinding.prototype._suggestNewBitmapSize = function (newSize) {
        var oldSuggestedSize = this._suggestedBitmapSize;
        var finalNewSize = size(this._transformBitmapSize(newSize, this._canvasElementClientSize));
        var newSuggestedSize = equalSizes(this.bitmapSize, finalNewSize) ? null : finalNewSize;
        if (oldSuggestedSize === null && newSuggestedSize === null) {
            return;
        }
        if (oldSuggestedSize !== null && newSuggestedSize !== null
            && equalSizes(oldSuggestedSize, newSuggestedSize)) {
            return;
        }
        this._suggestedBitmapSize = newSuggestedSize;
        this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, newSuggestedSize);
    };
    DevicePixelContentBoxBinding.prototype._emitSuggestedBitmapSizeChanged = function (oldSize, newSize) {
        var _this = this;
        this._suggestedBitmapSizeChangedListeners.forEach(function (listener) { return listener.call(_this, oldSize, newSize); });
    };
    DevicePixelContentBoxBinding.prototype._chooseAndInitObserver = function () {
        var _this = this;
        if (!this._allowResizeObserver) {
            this._initDevicePixelRatioObservable();
            return;
        }
        isDevicePixelContentBoxSupported()
            .then(function (isSupported) {
            return isSupported ?
                _this._initResizeObserver() :
                _this._initDevicePixelRatioObservable();
        });
    };
    // devicePixelRatio approach
    DevicePixelContentBoxBinding.prototype._initDevicePixelRatioObservable = function () {
        var _this = this;
        if (this._canvasElement === null) {
            // it looks like we are already dead
            return;
        }
        var win = canvasElementWindow(this._canvasElement);
        if (win === null) {
            throw new Error('No window is associated with the canvas');
        }
        this._devicePixelRatioObservable = createObservable(win);
        this._devicePixelRatioObservable.subscribe(function () { return _this._invalidateBitmapSize(); });
        this._invalidateBitmapSize();
    };
    DevicePixelContentBoxBinding.prototype._invalidateBitmapSize = function () {
        var _a, _b;
        if (this._canvasElement === null) {
            // it looks like we are already dead
            return;
        }
        var win = canvasElementWindow(this._canvasElement);
        if (win === null) {
            return;
        }
        var ratio = (_b = (_a = this._devicePixelRatioObservable) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : win.devicePixelRatio;
        var canvasRects = this._canvasElement.getClientRects();
        var newSize = 
        // eslint-disable-next-line no-negated-condition
        canvasRects[0] !== undefined ?
            predictedBitmapSize(canvasRects[0], ratio) :
            size({
                width: this._canvasElementClientSize.width * ratio,
                height: this._canvasElementClientSize.height * ratio,
            });
        this._suggestNewBitmapSize(newSize);
    };
    // ResizeObserver approach
    DevicePixelContentBoxBinding.prototype._initResizeObserver = function () {
        var _this = this;
        if (this._canvasElement === null) {
            // it looks like we are already dead
            return;
        }
        this._canvasElementResizeObserver = new ResizeObserver(function (entries) {
            var entry = entries.find(function (entry) { return entry.target === _this._canvasElement; });
            if (!entry || !entry.devicePixelContentBoxSize || !entry.devicePixelContentBoxSize[0]) {
                return;
            }
            var entrySize = entry.devicePixelContentBoxSize[0];
            var newSize = size({
                width: entrySize.inlineSize,
                height: entrySize.blockSize,
            });
            _this._suggestNewBitmapSize(newSize);
        });
        this._canvasElementResizeObserver.observe(this._canvasElement, { box: 'device-pixel-content-box' });
    };
    return DevicePixelContentBoxBinding;
}());
function bindTo(canvasElement, target) {
    if (target.type === 'device-pixel-content-box') {
        return new DevicePixelContentBoxBinding(canvasElement, target.transform, target.options);
    }
    throw new Error('Unsupported binding target');
}
function canvasElementWindow(canvasElement) {
    // According to DOM Level 2 Core specification, ownerDocument should never be null for HTMLCanvasElement
    // see https://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#node-ownerDoc
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return canvasElement.ownerDocument.defaultView;
}
function isDevicePixelContentBoxSupported() {
    return new Promise(function (resolve) {
        var ro = new ResizeObserver(function (entries) {
            resolve(entries.every(function (entry) { return 'devicePixelContentBoxSize' in entry; }));
            ro.disconnect();
        });
        ro.observe(document.body, { box: 'device-pixel-content-box' });
    })
        .catch(function () { return false; });
}
function predictedBitmapSize(canvasRect, ratio) {
    return size({
        width: Math.round(canvasRect.left * ratio + canvasRect.width * ratio) -
            Math.round(canvasRect.left * ratio),
        height: Math.round(canvasRect.top * ratio + canvasRect.height * ratio) -
            Math.round(canvasRect.top * ratio),
    });
}

/**
 * @experimental
 */
var CanvasRenderingTarget2D = /** @class */ (function () {
    function CanvasRenderingTarget2D(context, mediaSize, bitmapSize) {
        if (mediaSize.width === 0 || mediaSize.height === 0) {
            throw new TypeError('Rendering target could only be created on a media with positive width and height');
        }
        this._mediaSize = mediaSize;
        // !Number.isInteger(bitmapSize.width) || !Number.isInteger(bitmapSize.height)
        if (bitmapSize.width === 0 || bitmapSize.height === 0) {
            throw new TypeError('Rendering target could only be created using a bitmap with positive integer width and height');
        }
        this._bitmapSize = bitmapSize;
        this._context = context;
    }
    CanvasRenderingTarget2D.prototype.useMediaCoordinateSpace = function (f) {
        try {
            this._context.save();
            // do not use resetTransform to support old versions of Edge
            this._context.setTransform(1, 0, 0, 1, 0, 0);
            this._context.scale(this._horizontalPixelRatio, this._verticalPixelRatio);
            return f({
                context: this._context,
                mediaSize: this._mediaSize,
            });
        }
        finally {
            this._context.restore();
        }
    };
    CanvasRenderingTarget2D.prototype.useBitmapCoordinateSpace = function (f) {
        try {
            this._context.save();
            // do not use resetTransform to support old versions of Edge
            this._context.setTransform(1, 0, 0, 1, 0, 0);
            return f({
                context: this._context,
                mediaSize: this._mediaSize,
                bitmapSize: this._bitmapSize,
                horizontalPixelRatio: this._horizontalPixelRatio,
                verticalPixelRatio: this._verticalPixelRatio,
            });
        }
        finally {
            this._context.restore();
        }
    };
    Object.defineProperty(CanvasRenderingTarget2D.prototype, "_horizontalPixelRatio", {
        get: function () {
            return this._bitmapSize.width / this._mediaSize.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasRenderingTarget2D.prototype, "_verticalPixelRatio", {
        get: function () {
            return this._bitmapSize.height / this._mediaSize.height;
        },
        enumerable: false,
        configurable: true
    });
    return CanvasRenderingTarget2D;
}());
/**
 * @experimental
 */
function tryCreateCanvasRenderingTarget2D(binding, contextOptions) {
    var mediaSize = binding.canvasElementClientSize;
    if (mediaSize.width === 0 || mediaSize.height === 0) {
        return null;
    }
    var bitmapSize = binding.bitmapSize;
    if (bitmapSize.width === 0 || bitmapSize.height === 0) {
        return null;
    }
    var context = binding.canvasElement.getContext('2d', contextOptions);
    if (context === null) {
        return null;
    }
    return new CanvasRenderingTarget2D(context, mediaSize, bitmapSize);
}

/*!
 * @license
 * TradingView Lightweight Charts™ v4.1.0
 * Copyright (c) 2023 TradingView, Inc.
 * Licensed under Apache License 2.0 https://www.apache.org/licenses/LICENSE-2.0
 */
const e={upColor:"#26a69a",downColor:"#ef5350",wickVisible:!0,borderVisible:!0,borderColor:"#378658",borderUpColor:"#26a69a",borderDownColor:"#ef5350",wickColor:"#737375",wickUpColor:"#26a69a",wickDownColor:"#ef5350"},r={upColor:"#26a69a",downColor:"#ef5350",openVisible:!0,thinBars:!0},h={color:"#2196f3",lineStyle:0,lineWidth:3,lineType:0,lineVisible:!0,crosshairMarkerVisible:!0,crosshairMarkerRadius:4,crosshairMarkerBorderColor:"",crosshairMarkerBorderWidth:2,crosshairMarkerBackgroundColor:"",lastPriceAnimation:0,pointMarkersVisible:!1},l={topColor:"rgba( 46, 220, 135, 0.4)",bottomColor:"rgba( 40, 221, 100, 0)",invertFilledArea:!1,lineColor:"#33D778",lineStyle:0,lineWidth:3,lineType:0,lineVisible:!0,crosshairMarkerVisible:!0,crosshairMarkerRadius:4,crosshairMarkerBorderColor:"",crosshairMarkerBorderWidth:2,crosshairMarkerBackgroundColor:"",lastPriceAnimation:0,pointMarkersVisible:!1},a={baseValue:{type:"price",price:0},topFillColor1:"rgba(38, 166, 154, 0.28)",topFillColor2:"rgba(38, 166, 154, 0.05)",topLineColor:"rgba(38, 166, 154, 1)",bottomFillColor1:"rgba(239, 83, 80, 0.05)",bottomFillColor2:"rgba(239, 83, 80, 0.28)",bottomLineColor:"rgba(239, 83, 80, 1)",lineWidth:3,lineStyle:0,lineType:0,lineVisible:!0,crosshairMarkerVisible:!0,crosshairMarkerRadius:4,crosshairMarkerBorderColor:"",crosshairMarkerBorderWidth:2,crosshairMarkerBackgroundColor:"",lastPriceAnimation:0,pointMarkersVisible:!1},o={color:"#26a69a",base:0},_={color:"#2196f3"},u={title:"",visible:!0,lastValueVisible:!0,priceLineVisible:!0,priceLineSource:0,priceLineWidth:1,priceLineColor:"",priceLineStyle:2,baseLineVisible:!0,baseLineWidth:1,baseLineColor:"#B2B5BE",baseLineStyle:0,priceFormat:{type:"price",precision:2,minMove:.01}};var c,d;function f(t,i){const n={0:[],1:[t.lineWidth,t.lineWidth],2:[2*t.lineWidth,2*t.lineWidth],3:[6*t.lineWidth,6*t.lineWidth],4:[t.lineWidth,4*t.lineWidth]}[i];t.setLineDash(n);}function v(t,i,n,s){t.beginPath();const e=t.lineWidth%2?.5:0;t.moveTo(n,i+e),t.lineTo(s,i+e),t.stroke();}function p(t,i){if(!t)throw new Error("Assertion failed"+(i?": "+i:""))}function m(t){if(void 0===t)throw new Error("Value is undefined");return t}function b(t){if(null===t)throw new Error("Value is null");return t}function w(t){return b(m(t))}!function(t){t[t.Simple=0]="Simple",t[t.WithSteps=1]="WithSteps",t[t.Curved=2]="Curved";}(c||(c={})),function(t){t[t.Solid=0]="Solid",t[t.Dotted=1]="Dotted",t[t.Dashed=2]="Dashed",t[t.LargeDashed=3]="LargeDashed",t[t.SparseDotted=4]="SparseDotted";}(d||(d={}));const g={khaki:"#f0e68c",azure:"#f0ffff",aliceblue:"#f0f8ff",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gainsboro:"#dcdcdc",gray:"#808080",green:"#008000",honeydew:"#f0fff0",floralwhite:"#fffaf0",lightblue:"#add8e6",lightcoral:"#f08080",lemonchiffon:"#fffacd",hotpink:"#ff69b4",lightyellow:"#ffffe0",greenyellow:"#adff2f",lightgoldenrodyellow:"#fafad2",limegreen:"#32cd32",linen:"#faf0e6",lightcyan:"#e0ffff",magenta:"#f0f",maroon:"#800000",olive:"#808000",orange:"#ffa500",oldlace:"#fdf5e6",mediumblue:"#0000cd",transparent:"#0000",lime:"#0f0",lightpink:"#ffb6c1",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",midnightblue:"#191970",orchid:"#da70d6",mediumorchid:"#ba55d3",mediumturquoise:"#48d1cc",orangered:"#ff4500",royalblue:"#4169e1",powderblue:"#b0e0e6",red:"#f00",coral:"#ff7f50",turquoise:"#40e0d0",white:"#fff",whitesmoke:"#f5f5f5",wheat:"#f5deb3",teal:"#008080",steelblue:"#4682b4",bisque:"#ffe4c4",aquamarine:"#7fffd4",aqua:"#0ff",sienna:"#a0522d",silver:"#c0c0c0",springgreen:"#00ff7f",antiquewhite:"#faebd7",burlywood:"#deb887",brown:"#a52a2a",beige:"#f5f5dc",chocolate:"#d2691e",chartreuse:"#7fff00",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cadetblue:"#5f9ea0",tomato:"#ff6347",fuchsia:"#f0f",blue:"#00f",salmon:"#fa8072",blanchedalmond:"#ffebcd",slateblue:"#6a5acd",slategray:"#708090",thistle:"#d8bfd8",tan:"#d2b48c",cyan:"#0ff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",blueviolet:"#8a2be2",black:"#000",darkmagenta:"#8b008b",darkslateblue:"#483d8b",darkkhaki:"#bdb76b",darkorchid:"#9932cc",darkorange:"#ff8c00",darkgreen:"#006400",darkred:"#8b0000",dodgerblue:"#1e90ff",darkslategray:"#2f4f4f",dimgray:"#696969",deepskyblue:"#00bfff",firebrick:"#b22222",forestgreen:"#228b22",indigo:"#4b0082",ivory:"#fffff0",lavenderblush:"#fff0f5",feldspar:"#d19275",indianred:"#cd5c5c",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightskyblue:"#87cefa",lightslategray:"#789",lightslateblue:"#8470ff",snow:"#fffafa",lightseagreen:"#20b2aa",lightsalmon:"#ffa07a",darksalmon:"#e9967a",darkviolet:"#9400d3",mediumpurple:"#9370d8",mediumaquamarine:"#66cdaa",skyblue:"#87ceeb",lavender:"#e6e6fa",lightsteelblue:"#b0c4de",mediumvioletred:"#c71585",mintcream:"#f5fffa",navajowhite:"#ffdead",navy:"#000080",olivedrab:"#6b8e23",palevioletred:"#d87093",violetred:"#d02090",yellow:"#ff0",yellowgreen:"#9acd32",lawngreen:"#7cfc00",pink:"#ffc0cb",paleturquoise:"#afeeee",palegoldenrod:"#eee8aa",darkolivegreen:"#556b2f",darkseagreen:"#8fbc8f",darkturquoise:"#00ced1",peachpuff:"#ffdab9",deeppink:"#ff1493",violet:"#ee82ee",palegreen:"#98fb98",mediumseagreen:"#3cb371",peru:"#cd853f",saddlebrown:"#8b4513",sandybrown:"#f4a460",rosybrown:"#bc8f8f",purple:"#800080",seagreen:"#2e8b57",seashell:"#fff5ee",papayawhip:"#ffefd5",mediumslateblue:"#7b68ee",plum:"#dda0dd",mediumspringgreen:"#00fa9a"};function M(t){return t<0?0:t>255?255:Math.round(t)||0}function x(t){return t<=0||t>0?t<0?0:t>1?1:Math.round(1e4*t)/1e4:0}const S=/^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i,k=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i,y=/^rgb\(\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*\)$/,C=/^rgba\(\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?\d{1,10})\s*,\s*(-?[\d]{0,10}(?:\.\d+)?)\s*\)$/;function T(t){(t=t.toLowerCase())in g&&(t=g[t]);{const i=C.exec(t)||y.exec(t);if(i)return [M(parseInt(i[1],10)),M(parseInt(i[2],10)),M(parseInt(i[3],10)),x(i.length<5?1:parseFloat(i[4]))]}{const i=k.exec(t);if(i)return [M(parseInt(i[1],16)),M(parseInt(i[2],16)),M(parseInt(i[3],16)),1]}{const i=S.exec(t);if(i)return [M(17*parseInt(i[1],16)),M(17*parseInt(i[2],16)),M(17*parseInt(i[3],16)),1]}throw new Error(`Cannot parse color: ${t}`)}function P(t){const i=T(t);return {t:`rgb(${i[0]}, ${i[1]}, ${i[2]})`,i:(n=i,.199*n[0]+.687*n[1]+.114*n[2]>160?"black":"white")};var n;}class R{constructor(){this.h=[];}l(t,i,n){const s={o:t,_:i,u:!0===n};this.h.push(s);}v(t){const i=this.h.findIndex((i=>t===i.o));i>-1&&this.h.splice(i,1);}p(t){this.h=this.h.filter((i=>i._!==t));}m(t,i,n){const s=[...this.h];this.h=this.h.filter((t=>!t.u)),s.forEach((s=>s.o(t,i,n)));}M(){return this.h.length>0}S(){this.h=[];}}function D(t,...i){for(const n of i)for(const i in n)void 0!==n[i]&&("object"!=typeof n[i]||void 0===t[i]||Array.isArray(n[i])?t[i]=n[i]:D(t[i],n[i]));return t}function O(t){return "number"==typeof t&&isFinite(t)}function A(t){return "number"==typeof t&&t%1==0}function V(t){return "string"==typeof t}function B(t){return "boolean"==typeof t}function I(t){const i=t;if(!i||"object"!=typeof i)return i;let n,s,e;for(s in n=Array.isArray(i)?[]:{},i)i.hasOwnProperty(s)&&(e=i[s],n[s]=e&&"object"==typeof e?I(e):e);return n}function z(t){return null!==t}function E(t){return null===t?void 0:t}const L="-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";function N(t,i,n){return void 0===i&&(i=L),`${n=void 0!==n?`${n} `:""}${t}px ${i}`}class F{constructor(t){this.k={C:1,T:5,P:NaN,R:"",D:"",O:"",A:"",V:0,B:0,I:0,L:0,N:0},this.F=t;}W(){const t=this.k,i=this.j(),n=this.H();return t.P===i&&t.D===n||(t.P=i,t.D=n,t.R=N(i,n),t.L=2.5/12*i,t.V=t.L,t.B=i/12*t.T,t.I=i/12*t.T,t.N=0),t.O=this.$(),t.A=this.U(),this.k}$(){return this.F.W().layout.textColor}U(){return this.F.q()}j(){return this.F.W().layout.fontSize}H(){return this.F.W().layout.fontFamily}}class W{constructor(){this.Y=[];}X(t){this.Y=t;}K(t,i,n){this.Y.forEach((s=>{s.K(t,i,n);}));}}class j{K(t,i,n){t.useMediaCoordinateSpace((t=>this.Z(t,i,n)));}G(t,i,n){t.useMediaCoordinateSpace((t=>this.J(t,i,n)));}J(t,i,n){}}class H extends j{constructor(){super(...arguments),this.tt=null;}it(t){this.tt=t;}Z({context:t}){if(null===this.tt||null===this.tt.nt)return;const i=this.tt.nt,n=this.tt,s=s=>{t.beginPath();for(let e=i.to-1;e>=i.from;--e){const i=n.st[e];t.moveTo(i.et,i.rt),t.arc(i.et,i.rt,s,0,2*Math.PI);}t.fill();};n.ht>0&&(t.fillStyle=n.lt,s(n.ot+n.ht)),t.fillStyle=n._t,s(n.ot);}}function $(){return {st:[{et:0,rt:0,ut:0,ct:0}],_t:"",lt:"",ot:0,ht:0,nt:null}}const U={from:0,to:1};class q{constructor(t,i){this.dt=new W,this.ft=[],this.vt=[],this.bt=!0,this.F=t,this.wt=i,this.dt.X(this.ft);}gt(t){const i=this.F.Mt();i.length!==this.ft.length&&(this.vt=i.map($),this.ft=this.vt.map((t=>{const i=new H;return i.it(t),i})),this.dt.X(this.ft)),this.bt=!0;}xt(){return this.bt&&(this.St(),this.bt=!1),this.dt}St(){const t=2===this.wt.W().mode,i=this.F.Mt(),n=this.wt.kt(),s=this.F.yt();i.forEach(((i,e)=>{var r;const h=this.vt[e],l=i.Ct(n);if(t||null===l||!i.Tt())return void(h.nt=null);const a=b(i.Pt());h._t=l.Rt,h.ot=l.ot,h.ht=l.Dt,h.st[0].ct=l.ct,h.st[0].rt=i.At().Ot(l.ct,a.Vt),h.lt=null!==(r=l.Bt)&&void 0!==r?r:this.F.It(h.st[0].rt/i.At().zt()),h.st[0].ut=n,h.st[0].et=s.Et(n),h.nt=U;}));}}class Y{K(t,i,n){t.useBitmapCoordinateSpace((t=>this.Z(t,i,n)));}}class X extends Y{constructor(t){super(),this.Lt=t;}Z({context:t,bitmapSize:i,horizontalPixelRatio:n,verticalPixelRatio:s}){if(null===this.Lt)return;const e=this.Lt.Nt.Tt,r=this.Lt.Ft.Tt;if(!e&&!r)return;const h=Math.round(this.Lt.et*n),l=Math.round(this.Lt.rt*s);t.lineCap="butt",e&&h>=0&&(t.lineWidth=Math.floor(this.Lt.Nt.ht*n),t.strokeStyle=this.Lt.Nt.O,t.fillStyle=this.Lt.Nt.O,f(t,this.Lt.Nt.Wt),function(t,i,n,s){t.beginPath();const e=t.lineWidth%2?.5:0;t.moveTo(i+e,n),t.lineTo(i+e,s),t.stroke();}(t,h,0,i.height)),r&&l>=0&&(t.lineWidth=Math.floor(this.Lt.Ft.ht*s),t.strokeStyle=this.Lt.Ft.O,t.fillStyle=this.Lt.Ft.O,f(t,this.Lt.Ft.Wt),v(t,l,0,i.width));}}class K{constructor(t){this.bt=!0,this.jt={Nt:{ht:1,Wt:0,O:"",Tt:!1},Ft:{ht:1,Wt:0,O:"",Tt:!1},et:0,rt:0},this.Ht=new X(this.jt),this.$t=t;}gt(){this.bt=!0;}xt(){return this.bt&&(this.St(),this.bt=!1),this.Ht}St(){const t=this.$t.Tt(),i=b(this.$t.Ut()),n=i.qt().W().crosshair,s=this.jt;if(2===n.mode)return s.Ft.Tt=!1,void(s.Nt.Tt=!1);s.Ft.Tt=t&&this.$t.Yt(i),s.Nt.Tt=t&&this.$t.Xt(),s.Ft.ht=n.horzLine.width,s.Ft.Wt=n.horzLine.style,s.Ft.O=n.horzLine.color,s.Nt.ht=n.vertLine.width,s.Nt.Wt=n.vertLine.style,s.Nt.O=n.vertLine.color,s.et=this.$t.Kt(),s.rt=this.$t.Zt();}}function Z(t,i,n,s,e,r){t.fillRect(i+r,n,s-2*r,r),t.fillRect(i+r,n+e-r,s-2*r,r),t.fillRect(i,n,r,e),t.fillRect(i+s-r,n,r,e);}function G(t,i,n,s,e,r){t.save(),t.globalCompositeOperation="copy",t.fillStyle=r,t.fillRect(i,n,s,e),t.restore();}function J(t,i){return t.map((t=>0===t?t:t+i))}function Q(t,i,n,s,e,r){t.beginPath(),t.lineTo(i+s-r[1],n),0!==r[1]&&t.arcTo(i+s,n,i+s,n+r[1],r[1]),t.lineTo(i+s,n+e-r[2]),0!==r[2]&&t.arcTo(i+s,n+e,i+s-r[2],n+e,r[2]),t.lineTo(i+r[3],n+e),0!==r[3]&&t.arcTo(i,n+e,i,n+e-r[3],r[3]),t.lineTo(i,n+r[0]),0!==r[0]&&t.arcTo(i,n,i+r[0],n,r[0]);}function tt(t,i,n,s,e,r,h=0,l=[0,0,0,0],a=""){if(t.save(),!h||!a||a===r)return Q(t,i,n,s,e,l),t.fillStyle=r,t.fill(),void t.restore();const o=h/2;if("transparent"!==r){Q(t,i+h,n+h,s-2*h,e-2*h,J(l,-h)),t.fillStyle=r,t.fill();}if("transparent"!==a){Q(t,i+o,n+o,s-h,e-h,J(l,-o)),t.lineWidth=h,t.strokeStyle=a,t.closePath(),t.stroke();}t.restore();}function it(t,i,n,s,e,r,h){t.save(),t.globalCompositeOperation="copy";const l=t.createLinearGradient(0,0,0,e);l.addColorStop(0,r),l.addColorStop(1,h),t.fillStyle=l,t.fillRect(i,n,s,e),t.restore();}class nt{constructor(t,i){this.it(t,i);}it(t,i){this.Lt=t,this.Gt=i;}zt(t,i){return this.Lt.Tt?t.P+t.L+t.V:0}K(t,i,n,s){if(!this.Lt.Tt||0===this.Lt.Jt.length)return;const e=this.Lt.O,r=this.Gt.t,h=t.useBitmapCoordinateSpace((t=>{const h=t.context;h.font=i.R;const l=this.Qt(t,i,n,s),a=l.ti,o=(t,i)=>{l.ii?tt(h,a.ni,a.si,a.ei,a.ri,t,a.hi,[a.ot,0,0,a.ot],i):tt(h,a.li,a.si,a.ei,a.ri,t,a.hi,[0,a.ot,a.ot,0],i);};return o(r,"transparent"),this.Lt.ai&&(h.fillStyle=e,h.fillRect(a.li,a.oi,a._i-a.li,a.ui)),o("transparent",r),this.Lt.ci&&(h.fillStyle=i.A,h.fillRect(l.ii?a.di-a.hi:0,a.si,a.hi,a.fi-a.si)),l}));t.useMediaCoordinateSpace((({context:t})=>{const n=h.vi;t.font=i.R,t.textAlign=h.ii?"right":"left",t.textBaseline="middle",t.fillStyle=e,t.fillText(this.Lt.Jt,n.pi,(n.si+n.fi)/2+n.mi);}));}Qt(t,i,n,s){var e;const{context:r,bitmapSize:h,mediaSize:l,horizontalPixelRatio:a,verticalPixelRatio:o}=t,_=this.Lt.ai||!this.Lt.bi?i.T:0,u=this.Lt.wi?i.C:0,c=i.L+this.Gt.gi,d=i.V+this.Gt.Mi,f=i.B,v=i.I,p=this.Lt.Jt,m=i.P,b=n.xi(r,p),w=Math.ceil(n.Si(r,p)),g=m+c+d,M=i.C+f+v+w+_,x=Math.max(1,Math.floor(o));let S=Math.round(g*o);S%2!=x%2&&(S+=1);const k=u>0?Math.max(1,Math.floor(u*a)):0,y=Math.round(M*a),C=Math.round(_*a),T=null!==(e=this.Gt.ki)&&void 0!==e?e:this.Gt.yi,P=Math.round(T*o)-Math.floor(.5*o),R=Math.floor(P+x/2-S/2),D=R+S,O="right"===s,A=O?l.width-u:u,V=O?h.width-k:k;let B,I,z;return O?(B=V-y,I=V-C,z=A-_-f-u):(B=V+y,I=V+C,z=A+_+f),{ii:O,ti:{si:R,oi:P,fi:D,ei:y,ri:S,ot:2*a,hi:k,ni:B,li:V,_i:I,ui:x,di:h.width},vi:{si:R/o,fi:D/o,pi:z,mi:b}}}}class st{constructor(t){this.Ci={yi:0,t:"#000",Mi:0,gi:0},this.Ti={Jt:"",Tt:!1,ai:!0,bi:!1,Bt:"",O:"#FFF",ci:!1,wi:!1},this.Pi={Jt:"",Tt:!1,ai:!1,bi:!0,Bt:"",O:"#FFF",ci:!0,wi:!0},this.bt=!0,this.Ri=new(t||nt)(this.Ti,this.Ci),this.Di=new(t||nt)(this.Pi,this.Ci);}Jt(){return this.Oi(),this.Ti.Jt}yi(){return this.Oi(),this.Ci.yi}gt(){this.bt=!0;}zt(t,i=!1){return Math.max(this.Ri.zt(t,i),this.Di.zt(t,i))}Ai(){return this.Ci.ki||0}Vi(t){this.Ci.ki=t;}Bi(){return this.Oi(),this.Ti.Tt||this.Pi.Tt}Ii(){return this.Oi(),this.Ti.Tt}xt(t){return this.Oi(),this.Ti.ai=this.Ti.ai&&t.W().ticksVisible,this.Pi.ai=this.Pi.ai&&t.W().ticksVisible,this.Ri.it(this.Ti,this.Ci),this.Di.it(this.Pi,this.Ci),this.Ri}zi(){return this.Oi(),this.Ri.it(this.Ti,this.Ci),this.Di.it(this.Pi,this.Ci),this.Di}Oi(){this.bt&&(this.Ti.ai=!0,this.Pi.ai=!1,this.Ei(this.Ti,this.Pi,this.Ci));}}class et extends st{constructor(t,i,n){super(),this.$t=t,this.Li=i,this.Ni=n;}Ei(t,i,n){if(t.Tt=!1,2===this.$t.W().mode)return;const s=this.$t.W().horzLine;if(!s.labelVisible)return;const e=this.Li.Pt();if(!this.$t.Tt()||this.Li.Fi()||null===e)return;const r=P(s.labelBackgroundColor);n.t=r.t,t.O=r.i;const h=2/12*this.Li.P();n.gi=h,n.Mi=h;const l=this.Ni(this.Li);n.yi=l.yi,t.Jt=this.Li.Wi(l.ct,e),t.Tt=!0;}}const rt=/[1-9]/g;class ht{constructor(){this.Lt=null;}it(t){this.Lt=t;}K(t,i){if(null===this.Lt||!1===this.Lt.Tt||0===this.Lt.Jt.length)return;const n=t.useMediaCoordinateSpace((({context:t})=>(t.font=i.R,Math.round(i.ji.Si(t,b(this.Lt).Jt,rt)))));if(n<=0)return;const s=i.Hi,e=n+2*s,r=e/2,h=this.Lt.$i;let l=this.Lt.yi,a=Math.floor(l-r)+.5;a<0?(l+=Math.abs(0-a),a=Math.floor(l-r)+.5):a+e>h&&(l-=Math.abs(h-(a+e)),a=Math.floor(l-r)+.5);const o=a+e,_=Math.ceil(0+i.C+i.T+i.L+i.P+i.V);t.useBitmapCoordinateSpace((({context:t,horizontalPixelRatio:n,verticalPixelRatio:s})=>{const e=b(this.Lt);t.fillStyle=e.t;const r=Math.round(a*n),h=Math.round(0*s),l=Math.round(o*n),u=Math.round(_*s),c=Math.round(2*n);if(t.beginPath(),t.moveTo(r,h),t.lineTo(r,u-c),t.arcTo(r,u,r+c,u,c),t.lineTo(l-c,u),t.arcTo(l,u,l,u-c,c),t.lineTo(l,h),t.fill(),e.ai){const r=Math.round(e.yi*n),l=h,a=Math.round((l+i.T)*s);t.fillStyle=e.O;const o=Math.max(1,Math.floor(n)),_=Math.floor(.5*n);t.fillRect(r-_,l,o,a-l);}})),t.useMediaCoordinateSpace((({context:t})=>{const n=b(this.Lt),e=0+i.C+i.T+i.L+i.P/2;t.font=i.R,t.textAlign="left",t.textBaseline="middle",t.fillStyle=n.O;const r=i.ji.xi(t,"Apr0");t.translate(a+s,e+r),t.fillText(n.Jt,0,0);}));}}class lt{constructor(t,i,n){this.bt=!0,this.Ht=new ht,this.jt={Tt:!1,t:"#4c525e",O:"white",Jt:"",$i:0,yi:NaN,ai:!0},this.wt=t,this.Ui=i,this.Ni=n;}gt(){this.bt=!0;}xt(){return this.bt&&(this.St(),this.bt=!1),this.Ht.it(this.jt),this.Ht}St(){const t=this.jt;if(t.Tt=!1,2===this.wt.W().mode)return;const i=this.wt.W().vertLine;if(!i.labelVisible)return;const n=this.Ui.yt();if(n.Fi())return;t.$i=n.$i();const s=this.Ni();if(null===s)return;t.yi=s.yi;const e=n.qi(this.wt.kt());t.Jt=n.Yi(b(e)),t.Tt=!0;const r=P(i.labelBackgroundColor);t.t=r.t,t.O=r.i,t.ai=n.W().ticksVisible;}}class at{constructor(){this.Xi=null,this.Ki=0;}Zi(){return this.Ki}Gi(t){this.Ki=t;}At(){return this.Xi}Ji(t){this.Xi=t;}Qi(t){return []}tn(){return []}Tt(){return !0}}var ot;!function(t){t[t.Normal=0]="Normal",t[t.Magnet=1]="Magnet",t[t.Hidden=2]="Hidden";}(ot||(ot={}));class _t extends at{constructor(t,i){super(),this.nn=null,this.sn=NaN,this.en=0,this.rn=!0,this.hn=new Map,this.ln=!1,this.an=NaN,this.on=NaN,this._n=NaN,this.un=NaN,this.Ui=t,this.cn=i,this.dn=new q(t,this);this.fn=((t,i)=>n=>{const s=i(),e=t();if(n===b(this.nn).vn())return {ct:e,yi:s};{const t=b(n.Pt());return {ct:n.pn(s,t),yi:s}}})((()=>this.sn),(()=>this.on));const n=((t,i)=>()=>{const n=this.Ui.yt().mn(t()),s=i();return n&&Number.isFinite(s)?{ut:n,yi:s}:null})((()=>this.en),(()=>this.Kt()));this.bn=new lt(this,t,n),this.wn=new K(this);}W(){return this.cn}gn(t,i){this._n=t,this.un=i;}Mn(){this._n=NaN,this.un=NaN;}xn(){return this._n}Sn(){return this.un}kn(t,i,n){this.ln||(this.ln=!0),this.rn=!0,this.yn(t,i,n);}kt(){return this.en}Kt(){return this.an}Zt(){return this.on}Tt(){return this.rn}Cn(){this.rn=!1,this.Tn(),this.sn=NaN,this.an=NaN,this.on=NaN,this.nn=null,this.Mn();}Pn(t){return null!==this.nn?[this.wn,this.dn]:[]}Yt(t){return t===this.nn&&this.cn.horzLine.visible}Xt(){return this.cn.vertLine.visible}Rn(t,i){this.rn&&this.nn===t||this.hn.clear();const n=[];return this.nn===t&&n.push(this.Dn(this.hn,i,this.fn)),n}tn(){return this.rn?[this.bn]:[]}Ut(){return this.nn}On(){this.wn.gt(),this.hn.forEach((t=>t.gt())),this.bn.gt(),this.dn.gt();}An(t){return t&&!t.vn().Fi()?t.vn():null}yn(t,i,n){this.Vn(t,i,n)&&this.On();}Vn(t,i,n){const s=this.an,e=this.on,r=this.sn,h=this.en,l=this.nn,a=this.An(n);this.en=t,this.an=isNaN(t)?NaN:this.Ui.yt().Et(t),this.nn=n;const o=null!==a?a.Pt():null;return null!==a&&null!==o?(this.sn=i,this.on=a.Ot(i,o)):(this.sn=NaN,this.on=NaN),s!==this.an||e!==this.on||h!==this.en||r!==this.sn||l!==this.nn}Tn(){const t=this.Ui.Mt().map((t=>t.In().Bn())).filter(z),i=0===t.length?null:Math.max(...t);this.en=null!==i?i:NaN;}Dn(t,i,n){let s=t.get(i);return void 0===s&&(s=new et(this,i,n),t.set(i,s)),s}}function ut(t){return "left"===t||"right"===t}class ct{constructor(t){this.zn=new Map,this.En=[],this.Ln=t;}Nn(t,i){const n=function(t,i){return void 0===t?i:{Fn:Math.max(t.Fn,i.Fn),Wn:t.Wn||i.Wn}}(this.zn.get(t),i);this.zn.set(t,n);}jn(){return this.Ln}Hn(t){const i=this.zn.get(t);return void 0===i?{Fn:this.Ln}:{Fn:Math.max(this.Ln,i.Fn),Wn:i.Wn}}$n(){this.Un(),this.En=[{qn:0}];}Yn(t){this.Un(),this.En=[{qn:1,Vt:t}];}Xn(t){this.Kn(),this.En.push({qn:5,Vt:t});}Un(){this.Kn(),this.En.push({qn:6});}Zn(){this.Un(),this.En=[{qn:4}];}Gn(t){this.Un(),this.En.push({qn:2,Vt:t});}Jn(t){this.Un(),this.En.push({qn:3,Vt:t});}Qn(){return this.En}ts(t){for(const i of t.En)this.ns(i);this.Ln=Math.max(this.Ln,t.Ln),t.zn.forEach(((t,i)=>{this.Nn(i,t);}));}static ss(){return new ct(2)}static es(){return new ct(3)}ns(t){switch(t.qn){case 0:this.$n();break;case 1:this.Yn(t.Vt);break;case 2:this.Gn(t.Vt);break;case 3:this.Jn(t.Vt);break;case 4:this.Zn();break;case 5:this.Xn(t.Vt);break;case 6:this.Kn();}}Kn(){const t=this.En.findIndex((t=>5===t.qn));-1!==t&&this.En.splice(t,1);}}const dt=".";function ft(t,i){if(!O(t))return "n/a";if(!A(i))throw new TypeError("invalid length");if(i<0||i>16)throw new TypeError("invalid length");if(0===i)return t.toString();return ("0000000000000000"+t.toString()).slice(-i)}class vt{constructor(t,i){if(i||(i=1),O(t)&&A(t)||(t=100),t<0)throw new TypeError("invalid base");this.Li=t,this.rs=i,this.hs();}format(t){const i=t<0?"−":"";return t=Math.abs(t),i+this.ls(t)}hs(){if(this.os=0,this.Li>0&&this.rs>0){let t=this.Li;for(;t>1;)t/=10,this.os++;}}ls(t){const i=this.Li/this.rs;let n=Math.floor(t),s="";const e=void 0!==this.os?this.os:NaN;if(i>1){let r=+(Math.round(t*i)-n*i).toFixed(this.os);r>=i&&(r-=i,n+=1),s=dt+ft(+r.toFixed(this.os)*this.rs,e);}else n=Math.round(n*i)/i,e>0&&(s=dt+ft(0,e));return n.toFixed(0)+s}}class pt extends vt{constructor(t=100){super(t);}format(t){return `${super.format(t)}%`}}class mt{constructor(t){this._s=t;}format(t){let i="";return t<0&&(i="-",t=-t),t<995?i+this.us(t):t<999995?i+this.us(t/1e3)+"K":t<999999995?(t=1e3*Math.round(t/1e3),i+this.us(t/1e6)+"M"):(t=1e6*Math.round(t/1e6),i+this.us(t/1e9)+"B")}us(t){let i;const n=Math.pow(10,this._s);return i=(t=Math.round(t*n)/n)>=1e-15&&t<1?t.toFixed(this._s).replace(/\.?0+$/,""):String(t),i.replace(/(\.[1-9]*)0+$/,((t,i)=>i))}}function bt(t,i,n,s,e,r,h){if(0===i.length||s.from>=i.length||s.to<=0)return;const{context:l,horizontalPixelRatio:a,verticalPixelRatio:o}=t,_=i[s.from];let u=r(t,_),c=_;if(s.to-s.from<2){const i=e/2;l.beginPath();const n={et:_.et-i,rt:_.rt},s={et:_.et+i,rt:_.rt};l.moveTo(n.et*a,n.rt*o),l.lineTo(s.et*a,s.rt*o),h(t,u,n,s);}else {const e=(i,n)=>{h(t,u,c,n),l.beginPath(),u=i,c=n;};let d=c;l.beginPath(),l.moveTo(_.et*a,_.rt*o);for(let h=s.from+1;h<s.to;++h){d=i[h];const s=r(t,d);switch(n){case 0:l.lineTo(d.et*a,d.rt*o);break;case 1:l.lineTo(d.et*a,i[h-1].rt*o),s!==u&&(e(s,d),l.lineTo(d.et*a,i[h-1].rt*o)),l.lineTo(d.et*a,d.rt*o);break;case 2:{const[t,n]=xt(i,h-1,h);l.bezierCurveTo(t.et*a,t.rt*o,n.et*a,n.rt*o,d.et*a,d.rt*o);break}}1!==n&&s!==u&&(e(s,d),l.moveTo(d.et*a,d.rt*o));}(c!==d||c===d&&1===n)&&h(t,u,c,d);}}const wt=6;function gt(t,i){return {et:t.et-i.et,rt:t.rt-i.rt}}function Mt(t,i){return {et:t.et/i,rt:t.rt/i}}function xt(t,i,n){const s=Math.max(0,i-1),e=Math.min(t.length-1,n+1);var r,h;return [(r=t[i],h=Mt(gt(t[n],t[s]),wt),{et:r.et+h.et,rt:r.rt+h.rt}),gt(t[n],Mt(gt(t[e],t[i]),wt))]}function St(t,i,n,s,e){const{context:r,horizontalPixelRatio:h,verticalPixelRatio:l}=i;r.lineTo(e.et*h,t*l),r.lineTo(s.et*h,t*l),r.closePath(),r.fillStyle=n,r.fill();}class kt extends Y{constructor(){super(...arguments),this.tt=null;}it(t){this.tt=t;}Z(t){var i;if(null===this.tt)return;const{st:n,nt:s,cs:e,ht:r,Wt:h,ds:l}=this.tt,a=null!==(i=this.tt.fs)&&void 0!==i?i:this.tt.vs?0:t.mediaSize.height;if(null===s)return;const o=t.context;o.lineCap="butt",o.lineJoin="round",o.lineWidth=r,f(o,h),o.lineWidth=1,bt(t,n,l,s,e,this.ps.bind(this),St.bind(null,a));}}function yt(t,i,n){return Math.min(Math.max(t,i),n)}function Ct(t,i,n){return i-t<=n}function Tt(t){const i=Math.ceil(t);return i%2==0?i-1:i}class Pt{bs(t,i){const n=this.ws,{gs:s,Ms:e,xs:r,Ss:h,ks:l,fs:a}=i;if(void 0===this.ys||void 0===n||n.gs!==s||n.Ms!==e||n.xs!==r||n.Ss!==h||n.fs!==a||n.ks!==l){const n=t.context.createLinearGradient(0,0,0,l);if(n.addColorStop(0,s),null!=a){const i=yt(a*t.verticalPixelRatio/l,0,1);n.addColorStop(i,e),n.addColorStop(i,r);}n.addColorStop(1,h),this.ys=n,this.ws=i;}return this.ys}}class Rt extends kt{constructor(){super(...arguments),this.Cs=new Pt;}ps(t,i){return this.Cs.bs(t,{gs:i.Ts,Ms:"",xs:"",Ss:i.Ps,ks:t.bitmapSize.height})}}function Dt(t,i){const n=t.context;n.strokeStyle=i,n.stroke();}class Ot extends Y{constructor(){super(...arguments),this.tt=null;}it(t){this.tt=t;}Z(t){if(null===this.tt)return;const{st:i,nt:n,cs:s,ds:e,ht:r,Wt:h,Rs:l}=this.tt;if(null===n)return;const a=t.context;a.lineCap="butt",a.lineWidth=r*t.verticalPixelRatio,f(a,h),a.lineJoin="round";const o=this.Ds.bind(this);void 0!==e&&bt(t,i,e,n,s,o,Dt),l&&function(t,i,n,s,e){const{horizontalPixelRatio:r,verticalPixelRatio:h,context:l}=t;let a=null;const o=Math.max(1,Math.floor(r))%2/2,_=n*h+o;for(let n=s.to-1;n>=s.from;--n){const s=i[n];if(s){const i=e(t,s);i!==a&&(l.beginPath(),null!==a&&l.fill(),l.fillStyle=i,a=i);const n=Math.round(s.et*r)+o,u=s.rt*h;l.moveTo(n,u),l.arc(n,u,_,0,2*Math.PI);}}l.fill();}(t,i,l,n,o);}}class At extends Ot{Ds(t,i){return i._t}}function Vt(t,i,n,s,e=0,r=i.length){let h=r-e;for(;0<h;){const r=h>>1,l=e+r;s(i[l],n)===t?(e=l+1,h-=r+1):h=r;}return e}const Bt=Vt.bind(null,!0),It=Vt.bind(null,!1);function zt(t,i){return t.ut<i}function Et(t,i){return i<t.ut}function Lt(t,i,n){const s=i.Os(),e=i.di(),r=Bt(t,s,zt),h=It(t,e,Et);if(!n)return {from:r,to:h};let l=r,a=h;return r>0&&r<t.length&&t[r].ut>=s&&(l=r-1),h>0&&h<t.length&&t[h-1].ut<=e&&(a=h+1),{from:l,to:a}}class Nt{constructor(t,i,n){this.As=!0,this.Vs=!0,this.Bs=!0,this.Is=[],this.zs=null,this.Es=t,this.Ls=i,this.Ns=n;}gt(t){this.As=!0,"data"===t&&(this.Vs=!0),"options"===t&&(this.Bs=!0);}xt(){return this.Es.Tt()?(this.Fs(),null===this.zs?null:this.Ws):null}js(){this.Is=this.Is.map((t=>Object.assign(Object.assign({},t),this.Es.$s().Hs(t.ut))));}Us(){this.zs=null;}Fs(){this.Vs&&(this.qs(),this.Vs=!1),this.Bs&&(this.js(),this.Bs=!1),this.As&&(this.Ys(),this.As=!1);}Ys(){const t=this.Es.At(),i=this.Ls.yt();if(this.Us(),i.Fi()||t.Fi())return;const n=i.Xs();if(null===n)return;if(0===this.Es.In().Ks())return;const s=this.Es.Pt();null!==s&&(this.zs=Lt(this.Is,n,this.Ns),this.Zs(t,i,s.Vt),this.Gs());}}class Ft extends Nt{constructor(t,i){super(t,i,!0);}Zs(t,i,n){i.Js(this.Is,E(this.zs)),t.Qs(this.Is,n,E(this.zs));}te(t,i){return {ut:t,ct:i,et:NaN,rt:NaN}}qs(){const t=this.Es.$s();this.Is=this.Es.In().ie().map((i=>{const n=i.Vt[3];return this.ne(i.se,n,t)}));}}class Wt extends Ft{constructor(t,i){super(t,i),this.Ws=new W,this.ee=new Rt,this.re=new At,this.Ws.X([this.ee,this.re]);}ne(t,i,n){return Object.assign(Object.assign({},this.te(t,i)),n.Hs(t))}Gs(){const t=this.Es.W();this.ee.it({ds:t.lineType,st:this.Is,Wt:t.lineStyle,ht:t.lineWidth,fs:null,vs:t.invertFilledArea,nt:this.zs,cs:this.Ls.yt().he()}),this.re.it({ds:t.lineVisible?t.lineType:void 0,st:this.Is,Wt:t.lineStyle,ht:t.lineWidth,nt:this.zs,cs:this.Ls.yt().he(),Rs:t.pointMarkersVisible?t.pointMarkersRadius||t.lineWidth/2+2:void 0});}}class jt extends Y{constructor(){super(...arguments),this.Lt=null,this.le=0,this.ae=0;}it(t){this.Lt=t;}Z({context:t,horizontalPixelRatio:i,verticalPixelRatio:n}){if(null===this.Lt||0===this.Lt.In.length||null===this.Lt.nt)return;if(this.le=this.oe(i),this.le>=2){Math.max(1,Math.floor(i))%2!=this.le%2&&this.le--;}this.ae=this.Lt._e?Math.min(this.le,Math.floor(i)):this.le;let s=null;const e=this.ae<=this.le&&this.Lt.he>=Math.floor(1.5*i);for(let r=this.Lt.nt.from;r<this.Lt.nt.to;++r){const h=this.Lt.In[r];s!==h.ue&&(t.fillStyle=h.ue,s=h.ue);const l=Math.floor(.5*this.ae),a=Math.round(h.et*i),o=a-l,_=this.ae,u=o+_-1,c=Math.min(h.ce,h.de),d=Math.max(h.ce,h.de),f=Math.round(c*n)-l,v=Math.round(d*n)+l,p=Math.max(v-f,this.ae);t.fillRect(o,f,_,p);const m=Math.ceil(1.5*this.le);if(e){if(this.Lt.fe){const i=a-m;let s=Math.max(f,Math.round(h.ve*n)-l),e=s+_-1;e>f+p-1&&(e=f+p-1,s=e-_+1),t.fillRect(i,s,o-i,e-s+1);}const i=a+m;let s=Math.max(f,Math.round(h.pe*n)-l),e=s+_-1;e>f+p-1&&(e=f+p-1,s=e-_+1),t.fillRect(u+1,s,i-u,e-s+1);}}}oe(t){const i=Math.floor(t);return Math.max(i,Math.floor(function(t,i){return Math.floor(.3*t*i)}(b(this.Lt).he,t)))}}class Ht extends Nt{constructor(t,i){super(t,i,!1);}Zs(t,i,n){i.Js(this.Is,E(this.zs)),t.me(this.Is,n,E(this.zs));}be(t,i,n){return {ut:t,we:i.Vt[0],ge:i.Vt[1],Me:i.Vt[2],xe:i.Vt[3],et:NaN,ve:NaN,ce:NaN,de:NaN,pe:NaN}}qs(){const t=this.Es.$s();this.Is=this.Es.In().ie().map((i=>this.ne(i.se,i,t)));}}class $t extends Ht{constructor(){super(...arguments),this.Ws=new jt;}ne(t,i,n){return Object.assign(Object.assign({},this.be(t,i,n)),n.Hs(t))}Gs(){const t=this.Es.W();this.Ws.it({In:this.Is,he:this.Ls.yt().he(),fe:t.openVisible,_e:t.thinBars,nt:this.zs});}}class Ut extends kt{constructor(){super(...arguments),this.Cs=new Pt;}ps(t,i){const n=this.tt;return this.Cs.bs(t,{gs:i.Se,Ms:i.ke,xs:i.ye,Ss:i.Ce,ks:t.bitmapSize.height,fs:n.fs})}}class qt extends Ot{constructor(){super(...arguments),this.Te=new Pt;}Ds(t,i){const n=this.tt;return this.Te.bs(t,{gs:i.Pe,Ms:i.Pe,xs:i.Re,Ss:i.Re,ks:t.bitmapSize.height,fs:n.fs})}}class Yt extends Ft{constructor(t,i){super(t,i),this.Ws=new W,this.De=new Ut,this.Oe=new qt,this.Ws.X([this.De,this.Oe]);}ne(t,i,n){return Object.assign(Object.assign({},this.te(t,i)),n.Hs(t))}Gs(){const t=this.Es.Pt();if(null===t)return;const i=this.Es.W(),n=this.Es.At().Ot(i.baseValue.price,t.Vt),s=this.Ls.yt().he();this.De.it({st:this.Is,ht:i.lineWidth,Wt:i.lineStyle,ds:i.lineType,fs:n,vs:!1,nt:this.zs,cs:s}),this.Oe.it({st:this.Is,ht:i.lineWidth,Wt:i.lineStyle,ds:i.lineVisible?i.lineType:void 0,Rs:i.pointMarkersVisible?i.pointMarkersRadius||i.lineWidth/2+2:void 0,fs:n,nt:this.zs,cs:s});}}class Xt extends Y{constructor(){super(...arguments),this.Lt=null,this.le=0;}it(t){this.Lt=t;}Z(t){if(null===this.Lt||0===this.Lt.In.length||null===this.Lt.nt)return;const{horizontalPixelRatio:i}=t;if(this.le=function(t,i){if(t>=2.5&&t<=4)return Math.floor(3*i);const n=1-.2*Math.atan(Math.max(4,t)-4)/(.5*Math.PI),s=Math.floor(t*n*i),e=Math.floor(t*i),r=Math.min(s,e);return Math.max(Math.floor(i),r)}(this.Lt.he,i),this.le>=2){Math.floor(i)%2!=this.le%2&&this.le--;}const n=this.Lt.In;this.Lt.Ae&&this.Ve(t,n,this.Lt.nt),this.Lt.ci&&this.Be(t,n,this.Lt.nt);const s=this.Ie(i);(!this.Lt.ci||this.le>2*s)&&this.ze(t,n,this.Lt.nt);}Ve(t,i,n){if(null===this.Lt)return;const{context:s,horizontalPixelRatio:e,verticalPixelRatio:r}=t;let h="",l=Math.min(Math.floor(e),Math.floor(this.Lt.he*e));l=Math.max(Math.floor(e),Math.min(l,this.le));const a=Math.floor(.5*l);let o=null;for(let t=n.from;t<n.to;t++){const n=i[t];n.Ee!==h&&(s.fillStyle=n.Ee,h=n.Ee);const _=Math.round(Math.min(n.ve,n.pe)*r),u=Math.round(Math.max(n.ve,n.pe)*r),c=Math.round(n.ce*r),d=Math.round(n.de*r);let f=Math.round(e*n.et)-a;const v=f+l-1;null!==o&&(f=Math.max(o+1,f),f=Math.min(f,v));const p=v-f+1;s.fillRect(f,c,p,_-c),s.fillRect(f,u+1,p,d-u),o=v;}}Ie(t){let i=Math.floor(1*t);this.le<=2*i&&(i=Math.floor(.5*(this.le-1)));const n=Math.max(Math.floor(t),i);return this.le<=2*n?Math.max(Math.floor(t),Math.floor(1*t)):n}Be(t,i,n){if(null===this.Lt)return;const{context:s,horizontalPixelRatio:e,verticalPixelRatio:r}=t;let h="";const l=this.Ie(e);let a=null;for(let t=n.from;t<n.to;t++){const n=i[t];n.Le!==h&&(s.fillStyle=n.Le,h=n.Le);let o=Math.round(n.et*e)-Math.floor(.5*this.le);const _=o+this.le-1,u=Math.round(Math.min(n.ve,n.pe)*r),c=Math.round(Math.max(n.ve,n.pe)*r);if(null!==a&&(o=Math.max(a+1,o),o=Math.min(o,_)),this.Lt.he*e>2*l)Z(s,o,u,_-o+1,c-u+1,l);else {const t=_-o+1;s.fillRect(o,u,t,c-u+1);}a=_;}}ze(t,i,n){if(null===this.Lt)return;const{context:s,horizontalPixelRatio:e,verticalPixelRatio:r}=t;let h="";const l=this.Ie(e);for(let t=n.from;t<n.to;t++){const n=i[t];let a=Math.round(Math.min(n.ve,n.pe)*r),o=Math.round(Math.max(n.ve,n.pe)*r),_=Math.round(n.et*e)-Math.floor(.5*this.le),u=_+this.le-1;if(n.ue!==h){const t=n.ue;s.fillStyle=t,h=t;}this.Lt.ci&&(_+=l,a+=l,u-=l,o-=l),a>o||s.fillRect(_,a,u-_+1,o-a+1);}}}class Kt extends Ht{constructor(){super(...arguments),this.Ws=new Xt;}ne(t,i,n){return Object.assign(Object.assign({},this.be(t,i,n)),n.Hs(t))}Gs(){const t=this.Es.W();this.Ws.it({In:this.Is,he:this.Ls.yt().he(),Ae:t.wickVisible,ci:t.borderVisible,nt:this.zs});}}class Zt{constructor(t,i){this.Ne=t,this.Li=i;}K(t,i,n){this.Ne.draw(t,this.Li,i,n);}}class Gt extends Nt{constructor(t,i,n){super(t,i,!1),this.wn=n,this.Ws=new Zt(this.wn.renderer(),(i=>{const n=t.Pt();return null===n?null:t.At().Ot(i,n.Vt)}));}Fe(t){return this.wn.priceValueBuilder(t)}We(t){return this.wn.isWhitespace(t)}qs(){const t=this.Es.$s();this.Is=this.Es.In().ie().map((i=>Object.assign(Object.assign({ut:i.se,et:NaN},t.Hs(i.se)),{je:i.He})));}Zs(t,i){i.Js(this.Is,E(this.zs));}Gs(){this.wn.update({bars:this.Is.map(Jt),barSpacing:this.Ls.yt().he(),visibleRange:this.zs},this.Es.W());}}function Jt(t){return {x:t.et,time:t.ut,originalData:t.je,barColor:t.ue}}class Qt extends Y{constructor(){super(...arguments),this.Lt=null,this.$e=[];}it(t){this.Lt=t,this.$e=[];}Z({context:t,horizontalPixelRatio:i,verticalPixelRatio:n}){if(null===this.Lt||0===this.Lt.st.length||null===this.Lt.nt)return;this.$e.length||this.Ue(i);const s=Math.max(1,Math.floor(n)),e=Math.round(this.Lt.qe*n)-Math.floor(s/2),r=e+s;for(let i=this.Lt.nt.from;i<this.Lt.nt.to;i++){const h=this.Lt.st[i],l=this.$e[i-this.Lt.nt.from],a=Math.round(h.rt*n);let o,_;t.fillStyle=h.ue,a<=e?(o=a,_=r):(o=e,_=a-Math.floor(s/2)+s),t.fillRect(l.Os,o,l.di-l.Os+1,_-o);}}Ue(t){if(null===this.Lt||0===this.Lt.st.length||null===this.Lt.nt)return void(this.$e=[]);const i=Math.ceil(this.Lt.he*t)<=1?0:Math.max(1,Math.floor(t)),n=Math.round(this.Lt.he*t)-i;this.$e=new Array(this.Lt.nt.to-this.Lt.nt.from);for(let i=this.Lt.nt.from;i<this.Lt.nt.to;i++){const s=this.Lt.st[i],e=Math.round(s.et*t);let r,h;if(n%2){const t=(n-1)/2;r=e-t,h=e+t;}else {const t=n/2;r=e-t,h=e+t-1;}this.$e[i-this.Lt.nt.from]={Os:r,di:h,Ye:e,Xe:s.et*t,ut:s.ut};}for(let t=this.Lt.nt.from+1;t<this.Lt.nt.to;t++){const n=this.$e[t-this.Lt.nt.from],s=this.$e[t-this.Lt.nt.from-1];n.ut===s.ut+1&&(n.Os-s.di!==i+1&&(s.Ye>s.Xe?s.di=n.Os-i-1:n.Os=s.di+i+1));}let s=Math.ceil(this.Lt.he*t);for(let t=this.Lt.nt.from;t<this.Lt.nt.to;t++){const i=this.$e[t-this.Lt.nt.from];i.di<i.Os&&(i.di=i.Os);const n=i.di-i.Os+1;s=Math.min(n,s);}if(i>0&&s<4)for(let t=this.Lt.nt.from;t<this.Lt.nt.to;t++){const i=this.$e[t-this.Lt.nt.from];i.di-i.Os+1>s&&(i.Ye>i.Xe?i.di-=1:i.Os+=1);}}}class ti extends Ft{constructor(){super(...arguments),this.Ws=new Qt;}ne(t,i,n){return Object.assign(Object.assign({},this.te(t,i)),n.Hs(t))}Gs(){const t={st:this.Is,he:this.Ls.yt().he(),nt:this.zs,qe:this.Es.At().Ot(this.Es.W().base,b(this.Es.Pt()).Vt)};this.Ws.it(t);}}class ii extends Ft{constructor(){super(...arguments),this.Ws=new At;}ne(t,i,n){return Object.assign(Object.assign({},this.te(t,i)),n.Hs(t))}Gs(){const t=this.Es.W(),i={st:this.Is,Wt:t.lineStyle,ds:t.lineVisible?t.lineType:void 0,ht:t.lineWidth,Rs:t.pointMarkersVisible?t.pointMarkersRadius||t.lineWidth/2+2:void 0,nt:this.zs,cs:this.Ls.yt().he()};this.Ws.it(i);}}const ni=/[2-9]/g;class si{constructor(t=50){this.Ke=0,this.Ze=1,this.Ge=1,this.Je={},this.Qe=new Map,this.tr=t;}ir(){this.Ke=0,this.Qe.clear(),this.Ze=1,this.Ge=1,this.Je={};}Si(t,i,n){return this.nr(t,i,n).width}xi(t,i,n){const s=this.nr(t,i,n);return ((s.actualBoundingBoxAscent||0)-(s.actualBoundingBoxDescent||0))/2}nr(t,i,n){const s=n||ni,e=String(i).replace(s,"0");if(this.Qe.has(e))return m(this.Qe.get(e)).sr;if(this.Ke===this.tr){const t=this.Je[this.Ge];delete this.Je[this.Ge],this.Qe.delete(t),this.Ge++,this.Ke--;}t.save(),t.textBaseline="middle";const r=t.measureText(e);return t.restore(),0===r.width&&i.length||(this.Qe.set(e,{sr:r,er:this.Ze}),this.Je[this.Ze]=e,this.Ke++,this.Ze++),r}}class ei{constructor(t){this.rr=null,this.k=null,this.hr="right",this.lr=t;}ar(t,i,n){this.rr=t,this.k=i,this.hr=n;}K(t){null!==this.k&&null!==this.rr&&this.rr.K(t,this.k,this.lr,this.hr);}}class ri{constructor(t,i,n){this._r=t,this.lr=new si(50),this.ur=i,this.F=n,this.j=-1,this.Ht=new ei(this.lr);}xt(){const t=this.F.cr(this.ur);if(null===t)return null;const i=t.dr(this.ur)?t.vr():this.ur.At();if(null===i)return null;const n=t.pr(i);if("overlay"===n)return null;const s=this.F.mr();return s.P!==this.j&&(this.j=s.P,this.lr.ir()),this.Ht.ar(this._r.zi(),s,n),this.Ht}}class hi extends Y{constructor(){super(...arguments),this.Lt=null;}it(t){this.Lt=t;}br(t,i){var n;if(!(null===(n=this.Lt)||void 0===n?void 0:n.Tt))return null;const{rt:s,ht:e,wr:r}=this.Lt;return i>=s-e-7&&i<=s+e+7?{gr:this.Lt,wr:r}:null}Z({context:t,bitmapSize:i,horizontalPixelRatio:n,verticalPixelRatio:s}){if(null===this.Lt)return;if(!1===this.Lt.Tt)return;const e=Math.round(this.Lt.rt*s);e<0||e>i.height||(t.lineCap="butt",t.strokeStyle=this.Lt.O,t.lineWidth=Math.floor(this.Lt.ht*n),f(t,this.Lt.Wt),v(t,e,0,i.width));}}class li{constructor(t){this.Mr={rt:0,O:"rgba(0, 0, 0, 0)",ht:1,Wt:0,Tt:!1},this.Sr=new hi,this.bt=!0,this.Es=t,this.Ls=t.qt(),this.Sr.it(this.Mr);}gt(){this.bt=!0;}xt(){return this.Es.Tt()?(this.bt&&(this.kr(),this.bt=!1),this.Sr):null}}class ai extends li{constructor(t){super(t);}kr(){this.Mr.Tt=!1;const t=this.Es.At(),i=t.yr().yr;if(2!==i&&3!==i)return;const n=this.Es.W();if(!n.baseLineVisible||!this.Es.Tt())return;const s=this.Es.Pt();null!==s&&(this.Mr.Tt=!0,this.Mr.rt=t.Ot(s.Vt,s.Vt),this.Mr.O=n.baseLineColor,this.Mr.ht=n.baseLineWidth,this.Mr.Wt=n.baseLineStyle);}}class oi extends Y{constructor(){super(...arguments),this.Lt=null;}it(t){this.Lt=t;}He(){return this.Lt}Z({context:t,horizontalPixelRatio:i,verticalPixelRatio:n}){const s=this.Lt;if(null===s)return;const e=Math.max(1,Math.floor(i)),r=e%2/2,h=Math.round(s.Xe.x*i)+r,l=s.Xe.y*n;t.fillStyle=s.Cr,t.beginPath();const a=Math.max(2,1.5*s.Tr)*i;t.arc(h,l,a,0,2*Math.PI,!1),t.fill(),t.fillStyle=s.Pr,t.beginPath(),t.arc(h,l,s.ot*i,0,2*Math.PI,!1),t.fill(),t.lineWidth=e,t.strokeStyle=s.Rr,t.beginPath(),t.arc(h,l,s.ot*i+e/2,0,2*Math.PI,!1),t.stroke();}}const _i=[{Dr:0,Or:.25,Ar:4,Vr:10,Br:.25,Ir:0,zr:.4,Er:.8},{Dr:.25,Or:.525,Ar:10,Vr:14,Br:0,Ir:0,zr:.8,Er:0},{Dr:.525,Or:1,Ar:14,Vr:14,Br:0,Ir:0,zr:0,Er:0}];function ui(t,i,n,s){return function(t,i){if("transparent"===t)return t;const n=T(t),s=n[3];return `rgba(${n[0]}, ${n[1]}, ${n[2]}, ${i*s})`}(t,n+(s-n)*i)}function ci(t,i){const n=t%2600/2600;let s;for(const t of _i)if(n>=t.Dr&&n<=t.Or){s=t;break}p(void 0!==s,"Last price animation internal logic error");const e=(n-s.Dr)/(s.Or-s.Dr);return {Pr:ui(i,e,s.Br,s.Ir),Rr:ui(i,e,s.zr,s.Er),ot:(r=e,h=s.Ar,l=s.Vr,h+(l-h)*r)};var r,h,l;}class di{constructor(t){this.Ht=new oi,this.bt=!0,this.Lr=!0,this.Nr=performance.now(),this.Fr=this.Nr-1,this.Wr=t;}jr(){this.Fr=this.Nr-1,this.gt();}Hr(){if(this.gt(),2===this.Wr.W().lastPriceAnimation){const t=performance.now(),i=this.Fr-t;if(i>0)return void(i<650&&(this.Fr+=2600));this.Nr=t,this.Fr=t+2600;}}gt(){this.bt=!0;}$r(){this.Lr=!0;}Tt(){return 0!==this.Wr.W().lastPriceAnimation}Ur(){switch(this.Wr.W().lastPriceAnimation){case 0:return !1;case 1:return !0;case 2:return performance.now()<=this.Fr}}xt(){return this.bt?(this.St(),this.bt=!1,this.Lr=!1):this.Lr&&(this.qr(),this.Lr=!1),this.Ht}St(){this.Ht.it(null);const t=this.Wr.qt().yt(),i=t.Xs(),n=this.Wr.Pt();if(null===i||null===n)return;const s=this.Wr.Yr(!0);if(s.Xr||!i.Kr(s.se))return;const e={x:t.Et(s.se),y:this.Wr.At().Ot(s.ct,n.Vt)},r=s.O,h=this.Wr.W().lineWidth,l=ci(this.Zr(),r);this.Ht.it({Cr:r,Tr:h,Pr:l.Pr,Rr:l.Rr,ot:l.ot,Xe:e});}qr(){const t=this.Ht.He();if(null!==t){const i=ci(this.Zr(),t.Cr);t.Pr=i.Pr,t.Rr=i.Rr,t.ot=i.ot;}}Zr(){return this.Ur()?performance.now()-this.Nr:2599}}function fi(t,i){return Tt(Math.min(Math.max(t,12),30)*i)}function vi(t,i){switch(t){case"arrowDown":case"arrowUp":return fi(i,1);case"circle":return fi(i,.8);case"square":return fi(i,.7)}}function pi(t){return function(t){const i=Math.ceil(t);return i%2!=0?i-1:i}(fi(t,1))}function mi(t){return Math.max(fi(t,.1),3)}function bi(t,i,n,s,e){const r=vi("square",n),h=(r-1)/2,l=t-h,a=i-h;return s>=l&&s<=l+r&&e>=a&&e<=a+r}function wi(t,i,n,s,e){const r=(vi("arrowUp",e)-1)/2,h=(Tt(e/2)-1)/2;i.beginPath(),t?(i.moveTo(n-r,s),i.lineTo(n,s-r),i.lineTo(n+r,s),i.lineTo(n+h,s),i.lineTo(n+h,s+r),i.lineTo(n-h,s+r),i.lineTo(n-h,s)):(i.moveTo(n-r,s),i.lineTo(n,s+r),i.lineTo(n+r,s),i.lineTo(n+h,s),i.lineTo(n+h,s-r),i.lineTo(n-h,s-r),i.lineTo(n-h,s)),i.fill();}function gi(t,i,n,s,e,r){return bi(i,n,s,e,r)}class Mi extends j{constructor(){super(...arguments),this.Lt=null,this.lr=new si,this.j=-1,this.H="",this.Gr="";}it(t){this.Lt=t;}ar(t,i){this.j===t&&this.H===i||(this.j=t,this.H=i,this.Gr=N(t,i),this.lr.ir());}br(t,i){if(null===this.Lt||null===this.Lt.nt)return null;for(let n=this.Lt.nt.from;n<this.Lt.nt.to;n++){const s=this.Lt.st[n];if(Si(s,t,i))return {gr:s.Jr,wr:s.wr}}return null}Z({context:t},i,n){if(null!==this.Lt&&null!==this.Lt.nt){t.textBaseline="middle",t.font=this.Gr;for(let i=this.Lt.nt.from;i<this.Lt.nt.to;i++){const n=this.Lt.st[i];void 0!==n.Jt&&(n.Jt.$i=this.lr.Si(t,n.Jt.Qr),n.Jt.zt=this.j,n.Jt.et=n.et-n.Jt.$i/2),xi(n,t);}}}}function xi(t,i){i.fillStyle=t.O,void 0!==t.Jt&&function(t,i,n,s){t.fillText(i,n,s);}(i,t.Jt.Qr,t.Jt.et,t.Jt.rt),function(t,i){if(0===t.Ks)return;switch(t.th){case"arrowDown":return void wi(!1,i,t.et,t.rt,t.Ks);case"arrowUp":return void wi(!0,i,t.et,t.rt,t.Ks);case"circle":return void function(t,i,n,s){const e=(vi("circle",s)-1)/2;t.beginPath(),t.arc(i,n,e,0,2*Math.PI,!1),t.fill();}(i,t.et,t.rt,t.Ks);case"square":return void function(t,i,n,s){const e=vi("square",s),r=(e-1)/2,h=i-r,l=n-r;t.fillRect(h,l,e,e);}(i,t.et,t.rt,t.Ks)}t.th;}(t,i);}function Si(t,i,n){return !(void 0===t.Jt||!function(t,i,n,s,e,r){const h=s/2;return e>=t&&e<=t+n&&r>=i-h&&r<=i+h}(t.Jt.et,t.Jt.rt,t.Jt.$i,t.Jt.zt,i,n))||function(t,i,n){if(0===t.Ks)return !1;switch(t.th){case"arrowDown":case"arrowUp":return gi(0,t.et,t.rt,t.Ks,i,n);case"circle":return function(t,i,n,s,e){const r=2+vi("circle",n)/2,h=t-s,l=i-e;return Math.sqrt(h*h+l*l)<=r}(t.et,t.rt,t.Ks,i,n);case"square":return bi(t.et,t.rt,t.Ks,i,n)}}(t,i,n)}function ki(t,i,n,s,e,r,h,l,a){const o=O(n)?n:n.xe,_=O(n)?n:n.ge,u=O(n)?n:n.Me,c=O(i.size)?Math.max(i.size,0):1,d=pi(l.he())*c,f=d/2;switch(t.Ks=d,i.position){case"inBar":return t.rt=h.Ot(o,a),void(void 0!==t.Jt&&(t.Jt.rt=t.rt+f+r+.6*e));case"aboveBar":return t.rt=h.Ot(_,a)-f-s.ih,void 0!==t.Jt&&(t.Jt.rt=t.rt-f-.6*e,s.ih+=1.2*e),void(s.ih+=d+r);case"belowBar":return t.rt=h.Ot(u,a)+f+s.nh,void 0!==t.Jt&&(t.Jt.rt=t.rt+f+r+.6*e,s.nh+=1.2*e),void(s.nh+=d+r)}i.position;}class yi{constructor(t,i){this.bt=!0,this.sh=!0,this.eh=!0,this.rh=null,this.Ht=new Mi,this.Wr=t,this.Ui=i,this.Lt={st:[],nt:null};}gt(t){this.bt=!0,this.eh=!0,"data"===t&&(this.sh=!0);}xt(t){if(!this.Wr.Tt())return null;this.bt&&this.hh();const i=this.Ui.W().layout;return this.Ht.ar(i.fontSize,i.fontFamily),this.Ht.it(this.Lt),this.Ht}lh(){if(this.eh){if(this.Wr.ah().length>0){const t=this.Ui.yt().he(),i=mi(t),n=1.5*pi(t)+2*i;this.rh={above:n,below:n};}else this.rh=null;this.eh=!1;}return this.rh}hh(){const t=this.Wr.At(),i=this.Ui.yt(),n=this.Wr.ah();this.sh&&(this.Lt.st=n.map((t=>({ut:t.time,et:0,rt:0,Ks:0,th:t.shape,O:t.color,Jr:t.Jr,wr:t.id,Jt:void 0}))),this.sh=!1);const s=this.Ui.W().layout;this.Lt.nt=null;const e=i.Xs();if(null===e)return;const r=this.Wr.Pt();if(null===r)return;if(0===this.Lt.st.length)return;let h=NaN;const l=mi(i.he()),a={ih:l,nh:l};this.Lt.nt=Lt(this.Lt.st,e,!0);for(let e=this.Lt.nt.from;e<this.Lt.nt.to;e++){const o=n[e];o.time!==h&&(a.ih=l,a.nh=l,h=o.time);const _=this.Lt.st[e];_.et=i.Et(o.time),void 0!==o.text&&o.text.length>0&&(_.Jt={Qr:o.text,et:0,rt:0,$i:0,zt:0});const u=this.Wr.oh(o.time);null!==u&&ki(_,o,u,a,s.fontSize,l,t,i,r.Vt);}this.bt=!1;}}class Ci extends li{constructor(t){super(t);}kr(){const t=this.Mr;t.Tt=!1;const i=this.Es.W();if(!i.priceLineVisible||!this.Es.Tt())return;const n=this.Es.Yr(0===i.priceLineSource);n.Xr||(t.Tt=!0,t.rt=n.yi,t.O=this.Es._h(n.O),t.ht=i.priceLineWidth,t.Wt=i.priceLineStyle);}}class Ti extends st{constructor(t){super(),this.$t=t;}Ei(t,i,n){t.Tt=!1,i.Tt=!1;const s=this.$t;if(!s.Tt())return;const e=s.W(),r=e.lastValueVisible,h=""!==s.uh(),l=0===e.seriesLastValueMode,a=s.Yr(!1);if(a.Xr)return;r&&(t.Jt=this.dh(a,r,l),t.Tt=0!==t.Jt.length),(h||l)&&(i.Jt=this.fh(a,r,h,l),i.Tt=i.Jt.length>0);const o=s._h(a.O),_=P(o);n.t=_.t,n.yi=a.yi,i.Bt=s.qt().It(a.yi/s.At().zt()),t.Bt=o,t.O=_.i,i.O=_.i;}fh(t,i,n,s){let e="";const r=this.$t.uh();return n&&0!==r.length&&(e+=`${r} `),i&&s&&(e+=this.$t.At().ph()?t.mh:t.bh),e.trim()}dh(t,i,n){return i?n?this.$t.At().ph()?t.bh:t.mh:t.Jt:""}}function Pi(t,i,n,s){const e=Number.isFinite(i),r=Number.isFinite(n);return e&&r?t(i,n):e||r?e?i:n:s}class Ri{constructor(t,i){this.wh=t,this.gh=i;}Mh(t){return null!==t&&(this.wh===t.wh&&this.gh===t.gh)}xh(){return new Ri(this.wh,this.gh)}Sh(){return this.wh}kh(){return this.gh}yh(){return this.gh-this.wh}Fi(){return this.gh===this.wh||Number.isNaN(this.gh)||Number.isNaN(this.wh)}ts(t){return null===t?this:new Ri(Pi(Math.min,this.Sh(),t.Sh(),-1/0),Pi(Math.max,this.kh(),t.kh(),1/0))}Ch(t){if(!O(t))return;if(0===this.gh-this.wh)return;const i=.5*(this.gh+this.wh);let n=this.gh-i,s=this.wh-i;n*=t,s*=t,this.gh=i+n,this.wh=i+s;}Th(t){O(t)&&(this.gh+=t,this.wh+=t);}Ph(){return {minValue:this.wh,maxValue:this.gh}}static Rh(t){return null===t?null:new Ri(t.minValue,t.maxValue)}}class Di{constructor(t,i){this.Dh=t,this.Oh=i||null;}Ah(){return this.Dh}Vh(){return this.Oh}Ph(){return null===this.Dh?null:{priceRange:this.Dh.Ph(),margins:this.Oh||void 0}}static Rh(t){return null===t?null:new Di(Ri.Rh(t.priceRange),t.margins)}}class Oi extends li{constructor(t,i){super(t),this.Bh=i;}kr(){const t=this.Mr;t.Tt=!1;const i=this.Bh.W();if(!this.Es.Tt()||!i.lineVisible)return;const n=this.Bh.Ih();null!==n&&(t.Tt=!0,t.rt=n,t.O=i.color,t.ht=i.lineWidth,t.Wt=i.lineStyle,t.wr=this.Bh.W().id);}}class Ai extends st{constructor(t,i){super(),this.Wr=t,this.Bh=i;}Ei(t,i,n){t.Tt=!1,i.Tt=!1;const s=this.Bh.W(),e=s.axisLabelVisible,r=""!==s.title,h=this.Wr;if(!e||!h.Tt())return;const l=this.Bh.Ih();if(null===l)return;r&&(i.Jt=s.title,i.Tt=!0),i.Bt=h.qt().It(l/h.At().zt()),t.Jt=this.zh(s.price),t.Tt=!0;const a=P(s.axisLabelColor||s.color);n.t=a.t;const o=s.axisLabelTextColor||a.i;t.O=o,i.O=o,n.yi=l;}zh(t){const i=this.Wr.Pt();return null===i?"":this.Wr.At().Wi(t,i.Vt)}}class Vi{constructor(t,i){this.Wr=t,this.cn=i,this.Eh=new Oi(t,this),this._r=new Ai(t,this),this.Lh=new ri(this._r,t,t.qt());}Nh(t){D(this.cn,t),this.gt(),this.Wr.qt().Fh();}W(){return this.cn}Wh(){return this.Eh}jh(){return this.Lh}Hh(){return this._r}gt(){this.Eh.gt(),this._r.gt();}Ih(){const t=this.Wr,i=t.At();if(t.qt().yt().Fi()||i.Fi())return null;const n=t.Pt();return null===n?null:i.Ot(this.cn.price,n.Vt)}}class Bi extends at{constructor(t){super(),this.Ui=t;}qt(){return this.Ui}}const Ii={Bar:(t,i,n,s)=>{var e;const r=i.upColor,h=i.downColor,l=b(t(n,s)),a=w(l.Vt[0])<=w(l.Vt[3]);return {ue:null!==(e=l.O)&&void 0!==e?e:a?r:h}},Candlestick:(t,i,n,s)=>{var e,r,h;const l=i.upColor,a=i.downColor,o=i.borderUpColor,_=i.borderDownColor,u=i.wickUpColor,c=i.wickDownColor,d=b(t(n,s)),f=w(d.Vt[0])<=w(d.Vt[3]);return {ue:null!==(e=d.O)&&void 0!==e?e:f?l:a,Le:null!==(r=d.Bt)&&void 0!==r?r:f?o:_,Ee:null!==(h=d.$h)&&void 0!==h?h:f?u:c}},Custom:(t,i,n,s)=>{var e;return {ue:null!==(e=b(t(n,s)).O)&&void 0!==e?e:i.color}},Area:(t,i,n,s)=>{var e,r,h,l;const a=b(t(n,s));return {ue:null!==(e=a._t)&&void 0!==e?e:i.lineColor,_t:null!==(r=a._t)&&void 0!==r?r:i.lineColor,Ts:null!==(h=a.Ts)&&void 0!==h?h:i.topColor,Ps:null!==(l=a.Ps)&&void 0!==l?l:i.bottomColor}},Baseline:(t,i,n,s)=>{var e,r,h,l,a,o;const _=b(t(n,s));return {ue:_.Vt[3]>=i.baseValue.price?i.topLineColor:i.bottomLineColor,Pe:null!==(e=_.Pe)&&void 0!==e?e:i.topLineColor,Re:null!==(r=_.Re)&&void 0!==r?r:i.bottomLineColor,Se:null!==(h=_.Se)&&void 0!==h?h:i.topFillColor1,ke:null!==(l=_.ke)&&void 0!==l?l:i.topFillColor2,ye:null!==(a=_.ye)&&void 0!==a?a:i.bottomFillColor1,Ce:null!==(o=_.Ce)&&void 0!==o?o:i.bottomFillColor2}},Line:(t,i,n,s)=>{var e,r;const h=b(t(n,s));return {ue:null!==(e=h.O)&&void 0!==e?e:i.color,_t:null!==(r=h.O)&&void 0!==r?r:i.color}},Histogram:(t,i,n,s)=>{var e;return {ue:null!==(e=b(t(n,s)).O)&&void 0!==e?e:i.color}}};class zi{constructor(t){this.Uh=(t,i)=>void 0!==i?i.Vt:this.Wr.In().qh(t),this.Wr=t,this.Yh=Ii[t.Xh()];}Hs(t,i){return this.Yh(this.Uh,this.Wr.W(),t,i)}}var Ei;!function(t){t[t.NearestLeft=-1]="NearestLeft",t[t.None=0]="None",t[t.NearestRight=1]="NearestRight";}(Ei||(Ei={}));const Li=30;class Ni{constructor(){this.Kh=[],this.Zh=new Map,this.Gh=new Map;}Jh(){return this.Ks()>0?this.Kh[this.Kh.length-1]:null}Qh(){return this.Ks()>0?this.tl(0):null}Bn(){return this.Ks()>0?this.tl(this.Kh.length-1):null}Ks(){return this.Kh.length}Fi(){return 0===this.Ks()}Kr(t){return null!==this.il(t,0)}qh(t){return this.nl(t)}nl(t,i=0){const n=this.il(t,i);return null===n?null:Object.assign(Object.assign({},this.sl(n)),{se:this.tl(n)})}ie(){return this.Kh}el(t,i,n){if(this.Fi())return null;let s=null;for(const e of n){s=Fi(s,this.rl(t,i,e));}return s}it(t){this.Gh.clear(),this.Zh.clear(),this.Kh=t;}tl(t){return this.Kh[t].se}sl(t){return this.Kh[t]}il(t,i){const n=this.hl(t);if(null===n&&0!==i)switch(i){case-1:return this.ll(t);case 1:return this.al(t);default:throw new TypeError("Unknown search mode")}return n}ll(t){let i=this.ol(t);return i>0&&(i-=1),i!==this.Kh.length&&this.tl(i)<t?i:null}al(t){const i=this._l(t);return i!==this.Kh.length&&t<this.tl(i)?i:null}hl(t){const i=this.ol(t);return i===this.Kh.length||t<this.Kh[i].se?null:i}ol(t){return Bt(this.Kh,t,((t,i)=>t.se<i))}_l(t){return It(this.Kh,t,((t,i)=>t.se>i))}ul(t,i,n){let s=null;for(let e=t;e<i;e++){const t=this.Kh[e].Vt[n];Number.isNaN(t)||(null===s?s={cl:t,dl:t}:(t<s.cl&&(s.cl=t),t>s.dl&&(s.dl=t)));}return s}rl(t,i,n){if(this.Fi())return null;let s=null;const e=b(this.Qh()),r=b(this.Bn()),h=Math.max(t,e),l=Math.min(i,r),a=Math.ceil(h/Li)*Li,o=Math.max(a,Math.floor(l/Li)*Li);{const t=this.ol(h),e=this._l(Math.min(l,a,i));s=Fi(s,this.ul(t,e,n));}let _=this.Zh.get(n);void 0===_&&(_=new Map,this.Zh.set(n,_));for(let t=Math.max(a+1,h);t<o;t+=Li){const i=Math.floor(t/Li);let e=_.get(i);if(void 0===e){const t=this.ol(i*Li),s=this._l((i+1)*Li-1);e=this.ul(t,s,n),_.set(i,e);}s=Fi(s,e);}{const t=this.ol(o),i=this._l(l);s=Fi(s,this.ul(t,i,n));}return s}}function Fi(t,i){if(null===t)return i;if(null===i)return t;return {cl:Math.min(t.cl,i.cl),dl:Math.max(t.dl,i.dl)}}class Wi{constructor(t){this.fl=t;}K(t,i,n){this.fl.draw(t);}G(t,i,n){var s,e;null===(e=(s=this.fl).drawBackground)||void 0===e||e.call(s,t);}}class ji{constructor(t){this.Qe=null,this.wn=t;}xt(){var t;const i=this.wn.renderer();if(null===i)return null;if((null===(t=this.Qe)||void 0===t?void 0:t.vl)===i)return this.Qe.pl;const n=new Wi(i);return this.Qe={vl:i,pl:n},n}ml(){var t,i,n;return null!==(n=null===(i=(t=this.wn).zOrder)||void 0===i?void 0:i.call(t))&&void 0!==n?n:"normal"}}function Hi(t){var i,n,s,e,r;return {Jt:t.text(),yi:t.coordinate(),ki:null===(i=t.fixedCoordinate)||void 0===i?void 0:i.call(t),O:t.textColor(),t:t.backColor(),Tt:null===(s=null===(n=t.visible)||void 0===n?void 0:n.call(t))||void 0===s||s,ai:null===(r=null===(e=t.tickVisible)||void 0===e?void 0:e.call(t))||void 0===r||r}}class $i{constructor(t,i){this.Ht=new ht,this.bl=t,this.wl=i;}xt(){return this.Ht.it(Object.assign({$i:this.wl.$i()},Hi(this.bl))),this.Ht}}class Ui extends st{constructor(t,i){super(),this.bl=t,this.Li=i;}Ei(t,i,n){const s=Hi(this.bl);n.t=s.t,t.O=s.O;const e=2/12*this.Li.P();n.gi=e,n.Mi=e,n.yi=s.yi,n.ki=s.ki,t.Jt=s.Jt,t.Tt=s.Tt,t.ai=s.ai;}}class qi{constructor(t,i){this.gl=null,this.Ml=null,this.xl=null,this.Sl=null,this.kl=null,this.yl=t,this.Wr=i;}Cl(){return this.yl}On(){var t,i;null===(i=(t=this.yl).updateAllViews)||void 0===i||i.call(t);}Pn(){var t,i,n,s;const e=null!==(n=null===(i=(t=this.yl).paneViews)||void 0===i?void 0:i.call(t))&&void 0!==n?n:[];if((null===(s=this.gl)||void 0===s?void 0:s.vl)===e)return this.gl.pl;const r=e.map((t=>new ji(t)));return this.gl={vl:e,pl:r},r}tn(){var t,i,n,s;const e=null!==(n=null===(i=(t=this.yl).timeAxisViews)||void 0===i?void 0:i.call(t))&&void 0!==n?n:[];if((null===(s=this.Ml)||void 0===s?void 0:s.vl)===e)return this.Ml.pl;const r=this.Wr.qt().yt(),h=e.map((t=>new $i(t,r)));return this.Ml={vl:e,pl:h},h}Rn(){var t,i,n,s;const e=null!==(n=null===(i=(t=this.yl).priceAxisViews)||void 0===i?void 0:i.call(t))&&void 0!==n?n:[];if((null===(s=this.xl)||void 0===s?void 0:s.vl)===e)return this.xl.pl;const r=this.Wr.At(),h=e.map((t=>new Ui(t,r)));return this.xl={vl:e,pl:h},h}Tl(){var t,i,n,s;const e=null!==(n=null===(i=(t=this.yl).priceAxisPaneViews)||void 0===i?void 0:i.call(t))&&void 0!==n?n:[];if((null===(s=this.Sl)||void 0===s?void 0:s.vl)===e)return this.Sl.pl;const r=e.map((t=>new ji(t)));return this.Sl={vl:e,pl:r},r}Pl(){var t,i,n,s;const e=null!==(n=null===(i=(t=this.yl).timeAxisPaneViews)||void 0===i?void 0:i.call(t))&&void 0!==n?n:[];if((null===(s=this.kl)||void 0===s?void 0:s.vl)===e)return this.kl.pl;const r=e.map((t=>new ji(t)));return this.kl={vl:e,pl:r},r}Rl(t,i){var n,s,e;return null!==(e=null===(s=(n=this.yl).autoscaleInfo)||void 0===s?void 0:s.call(n,t,i))&&void 0!==e?e:null}br(t,i){var n,s,e;return null!==(e=null===(s=(n=this.yl).hitTest)||void 0===s?void 0:s.call(n,t,i))&&void 0!==e?e:null}}function Yi(t,i,n,s){t.forEach((t=>{i(t).forEach((t=>{t.ml()===n&&s.push(t);}));}));}function Xi(t){return t.Pn()}function Ki(t){return t.Tl()}function Zi(t){return t.Pl()}class Gi extends Bi{constructor(t,i,n,s,e){super(t),this.Lt=new Ni,this.Eh=new Ci(this),this.Dl=[],this.Ol=new ai(this),this.Al=null,this.Vl=null,this.Bl=[],this.Il=[],this.zl=null,this.El=[],this.cn=i,this.Ll=n;const r=new Ti(this);this.hn=[r],this.Lh=new ri(r,this,t),"Area"!==n&&"Line"!==n&&"Baseline"!==n||(this.Al=new di(this)),this.Nl(),this.Fl(e);}S(){null!==this.zl&&clearTimeout(this.zl);}_h(t){return this.cn.priceLineColor||t}Yr(t){const i={Xr:!0},n=this.At();if(this.qt().yt().Fi()||n.Fi()||this.Lt.Fi())return i;const s=this.qt().yt().Xs(),e=this.Pt();if(null===s||null===e)return i;let r,h;if(t){const t=this.Lt.Jh();if(null===t)return i;r=t,h=t.se;}else {const t=this.Lt.nl(s.di(),-1);if(null===t)return i;if(r=this.Lt.qh(t.se),null===r)return i;h=t.se;}const l=r.Vt[3],a=this.$s().Hs(h,{Vt:r}),o=n.Ot(l,e.Vt);return {Xr:!1,ct:l,Jt:n.Wi(l,e.Vt),mh:n.Wl(l),bh:n.jl(l,e.Vt),O:a.ue,yi:o,se:h}}$s(){return null!==this.Vl||(this.Vl=new zi(this)),this.Vl}W(){return this.cn}Nh(t){const i=t.priceScaleId;void 0!==i&&i!==this.cn.priceScaleId&&this.qt().Hl(this,i),D(this.cn,t),void 0!==t.priceFormat&&(this.Nl(),this.qt().$l()),this.qt().Ul(this),this.qt().ql(),this.wn.gt("options");}it(t,i){this.Lt.it(t),this.Yl(),this.wn.gt("data"),this.dn.gt("data"),null!==this.Al&&(i&&i.Xl?this.Al.Hr():0===t.length&&this.Al.jr());const n=this.qt().cr(this);this.qt().Kl(n),this.qt().Ul(this),this.qt().ql(),this.qt().Fh();}Zl(t){this.Bl=t,this.Yl();const i=this.qt().cr(this);this.dn.gt("data"),this.qt().Kl(i),this.qt().Ul(this),this.qt().ql(),this.qt().Fh();}Gl(){return this.Bl}ah(){return this.Il}Jl(t){const i=new Vi(this,t);return this.Dl.push(i),this.qt().Ul(this),i}Ql(t){const i=this.Dl.indexOf(t);-1!==i&&this.Dl.splice(i,1),this.qt().Ul(this);}Xh(){return this.Ll}Pt(){const t=this.ta();return null===t?null:{Vt:t.Vt[3],ia:t.ut}}ta(){const t=this.qt().yt().Xs();if(null===t)return null;const i=t.Os();return this.Lt.nl(i,1)}In(){return this.Lt}oh(t){const i=this.Lt.qh(t);return null===i?null:"Bar"===this.Ll||"Candlestick"===this.Ll||"Custom"===this.Ll?{we:i.Vt[0],ge:i.Vt[1],Me:i.Vt[2],xe:i.Vt[3]}:i.Vt[3]}na(t){const i=[];Yi(this.El,Xi,"top",i);const n=this.Al;return null!==n&&n.Tt()?(null===this.zl&&n.Ur()&&(this.zl=setTimeout((()=>{this.zl=null,this.qt().sa();}),0)),n.$r(),i.push(n),i):i}Pn(){const t=[];this.ea()||t.push(this.Ol),t.push(this.wn,this.Eh,this.dn);const i=this.Dl.map((t=>t.Wh()));return t.push(...i),Yi(this.El,Xi,"normal",t),t}ra(){return this.ha(Xi,"bottom")}la(t){return this.ha(Ki,t)}aa(t){return this.ha(Zi,t)}oa(t,i){return this.El.map((n=>n.br(t,i))).filter((t=>null!==t))}Qi(t){return [this.Lh,...this.Dl.map((t=>t.jh()))]}Rn(t,i){if(i!==this.Xi&&!this.ea())return [];const n=[...this.hn];for(const t of this.Dl)n.push(t.Hh());return this.El.forEach((t=>{n.push(...t.Rn());})),n}tn(){const t=[];return this.El.forEach((i=>{t.push(...i.tn());})),t}Rl(t,i){if(void 0!==this.cn.autoscaleInfoProvider){const n=this.cn.autoscaleInfoProvider((()=>{const n=this._a(t,i);return null===n?null:n.Ph()}));return Di.Rh(n)}return this._a(t,i)}ua(){return this.cn.priceFormat.minMove}ca(){return this.da}On(){var t;this.wn.gt(),this.dn.gt();for(const t of this.hn)t.gt();for(const t of this.Dl)t.gt();this.Eh.gt(),this.Ol.gt(),null===(t=this.Al)||void 0===t||t.gt(),this.El.forEach((t=>t.On()));}At(){return b(super.At())}Ct(t){if(!(("Line"===this.Ll||"Area"===this.Ll||"Baseline"===this.Ll)&&this.cn.crosshairMarkerVisible))return null;const i=this.Lt.qh(t);if(null===i)return null;return {ct:i.Vt[3],ot:this.fa(),Bt:this.va(),Dt:this.pa(),Rt:this.ma(t)}}uh(){return this.cn.title}Tt(){return this.cn.visible}ba(t){this.El.push(new qi(t,this));}wa(t){this.El=this.El.filter((i=>i.Cl()!==t));}ga(){if(this.wn instanceof Gt!=!1)return t=>this.wn.Fe(t)}Ma(){if(this.wn instanceof Gt!=!1)return t=>this.wn.We(t)}ea(){return !ut(this.At().xa())}_a(t,i){if(!A(t)||!A(i)||this.Lt.Fi())return null;const n="Line"===this.Ll||"Area"===this.Ll||"Baseline"===this.Ll||"Histogram"===this.Ll?[3]:[2,1],s=this.Lt.el(t,i,n);let e=null!==s?new Ri(s.cl,s.dl):null;if("Histogram"===this.Xh()){const t=this.cn.base,i=new Ri(t,t);e=null!==e?e.ts(i):i;}let r=this.dn.lh();return this.El.forEach((n=>{const s=n.Rl(t,i);if(null==s?void 0:s.priceRange){const t=new Ri(s.priceRange.minValue,s.priceRange.maxValue);e=null!==e?e.ts(t):t;}var h,l,a,o;(null==s?void 0:s.margins)&&(h=r,l=s.margins,r={above:Math.max(null!==(a=null==h?void 0:h.above)&&void 0!==a?a:0,l.above),below:Math.max(null!==(o=null==h?void 0:h.below)&&void 0!==o?o:0,l.below)});})),new Di(e,r)}fa(){switch(this.Ll){case"Line":case"Area":case"Baseline":return this.cn.crosshairMarkerRadius}return 0}va(){switch(this.Ll){case"Line":case"Area":case"Baseline":{const t=this.cn.crosshairMarkerBorderColor;if(0!==t.length)return t}}return null}pa(){switch(this.Ll){case"Line":case"Area":case"Baseline":return this.cn.crosshairMarkerBorderWidth}return 0}ma(t){switch(this.Ll){case"Line":case"Area":case"Baseline":{const t=this.cn.crosshairMarkerBackgroundColor;if(0!==t.length)return t}}return this.$s().Hs(t).ue}Nl(){switch(this.cn.priceFormat.type){case"custom":this.da={format:this.cn.priceFormat.formatter};break;case"volume":this.da=new mt(this.cn.priceFormat.precision);break;case"percent":this.da=new pt(this.cn.priceFormat.precision);break;default:{const t=Math.pow(10,this.cn.priceFormat.precision);this.da=new vt(t,this.cn.priceFormat.minMove*t);}}null!==this.Xi&&this.Xi.Sa();}Yl(){const t=this.qt().yt();if(!t.ka()||this.Lt.Fi())return void(this.Il=[]);const i=b(this.Lt.Qh());this.Il=this.Bl.map(((n,s)=>{const e=b(t.ya(n.time,!0)),r=e<i?1:-1;return {time:b(this.Lt.nl(e,r)).se,position:n.position,shape:n.shape,color:n.color,id:n.id,Jr:s,text:n.text,size:n.size,originalTime:n.originalTime}}));}Fl(t){switch(this.dn=new yi(this,this.qt()),this.Ll){case"Bar":this.wn=new $t(this,this.qt());break;case"Candlestick":this.wn=new Kt(this,this.qt());break;case"Line":this.wn=new ii(this,this.qt());break;case"Custom":this.wn=new Gt(this,this.qt(),m(t));break;case"Area":this.wn=new Wt(this,this.qt());break;case"Baseline":this.wn=new Yt(this,this.qt());break;case"Histogram":this.wn=new ti(this,this.qt());break;default:throw Error("Unknown chart style assigned: "+this.Ll)}}ha(t,i){const n=[];return Yi(this.El,t,i,n),n}}class Ji{constructor(t){this.cn=t;}Ca(t,i,n){let s=t;if(0===this.cn.mode)return s;const e=n.vn(),r=e.Pt();if(null===r)return s;const h=e.Ot(t,r),l=n.Ta().filter((t=>t instanceof Gi)).reduce(((t,s)=>{if(n.dr(s)||!s.Tt())return t;const e=s.At(),r=s.In();if(e.Fi()||!r.Kr(i))return t;const h=r.qh(i);if(null===h)return t;const l=w(s.Pt());return t.concat([e.Ot(h.Vt[3],l.Vt)])}),[]);if(0===l.length)return s;l.sort(((t,i)=>Math.abs(t-h)-Math.abs(i-h)));const a=l[0];return s=e.pn(a,r),s}}class Qi extends Y{constructor(){super(...arguments),this.Lt=null;}it(t){this.Lt=t;}Z({context:t,bitmapSize:i,horizontalPixelRatio:n,verticalPixelRatio:s}){if(null===this.Lt)return;const e=Math.max(1,Math.floor(n));t.lineWidth=e,function(t,i){t.save(),t.lineWidth%2&&t.translate(.5,.5),i(),t.restore();}(t,(()=>{const r=b(this.Lt);if(r.Pa){t.strokeStyle=r.Ra,f(t,r.Da),t.beginPath();for(const s of r.Oa){const r=Math.round(s.Aa*n);t.moveTo(r,-e),t.lineTo(r,i.height+e);}t.stroke();}if(r.Va){t.strokeStyle=r.Ba,f(t,r.Ia),t.beginPath();for(const n of r.za){const r=Math.round(n.Aa*s);t.moveTo(-e,r),t.lineTo(i.width+e,r);}t.stroke();}}));}}class tn{constructor(t){this.Ht=new Qi,this.bt=!0,this.nn=t;}gt(){this.bt=!0;}xt(){if(this.bt){const t=this.nn.qt().W().grid,i={Va:t.horzLines.visible,Pa:t.vertLines.visible,Ba:t.horzLines.color,Ra:t.vertLines.color,Ia:t.horzLines.style,Da:t.vertLines.style,za:this.nn.vn().Ea(),Oa:(this.nn.qt().yt().Ea()||[]).map((t=>({Aa:t.coord})))};this.Ht.it(i),this.bt=!1;}return this.Ht}}class nn{constructor(t){this.wn=new tn(t);}Wh(){return this.wn}}const sn={La:4,Na:1e-4};function en(t,i){const n=100*(t-i)/i;return i<0?-n:n}function rn(t,i){const n=en(t.Sh(),i),s=en(t.kh(),i);return new Ri(n,s)}function hn(t,i){const n=100*(t-i)/i+100;return i<0?-n:n}function ln(t,i){const n=hn(t.Sh(),i),s=hn(t.kh(),i);return new Ri(n,s)}function an(t,i){const n=Math.abs(t);if(n<1e-15)return 0;const s=Math.log10(n+i.Na)+i.La;return t<0?-s:s}function on(t,i){const n=Math.abs(t);if(n<1e-15)return 0;const s=Math.pow(10,n-i.La)-i.Na;return t<0?-s:s}function _n(t,i){if(null===t)return null;const n=an(t.Sh(),i),s=an(t.kh(),i);return new Ri(n,s)}function un(t,i){if(null===t)return null;const n=on(t.Sh(),i),s=on(t.kh(),i);return new Ri(n,s)}function cn(t){if(null===t)return sn;const i=Math.abs(t.kh()-t.Sh());if(i>=1||i<1e-15)return sn;const n=Math.ceil(Math.abs(Math.log10(i))),s=sn.La+n;return {La:s,Na:1/Math.pow(10,s)}}class dn{constructor(t,i){if(this.Fa=t,this.Wa=i,function(t){if(t<0)return !1;for(let i=t;i>1;i/=10)if(i%10!=0)return !1;return !0}(this.Fa))this.ja=[2,2.5,2];else {this.ja=[];for(let t=this.Fa;1!==t;){if(t%2==0)this.ja.push(2),t/=2;else {if(t%5!=0)throw new Error("unexpected base");this.ja.push(2,2.5),t/=5;}if(this.ja.length>100)throw new Error("something wrong with base")}}}Ha(t,i,n){const s=0===this.Fa?0:1/this.Fa;let e=Math.pow(10,Math.max(0,Math.ceil(Math.log10(t-i)))),r=0,h=this.Wa[0];for(;;){const t=Ct(e,s,1e-14)&&e>s+1e-14,i=Ct(e,n*h,1e-14),l=Ct(e,1,1e-14);if(!(t&&i&&l))break;e/=h,h=this.Wa[++r%this.Wa.length];}if(e<=s+1e-14&&(e=s),e=Math.max(1,e),this.ja.length>0&&(l=e,a=1,o=1e-14,Math.abs(l-a)<o))for(r=0,h=this.ja[0];Ct(e,n*h,1e-14)&&e>s+1e-14;)e/=h,h=this.ja[++r%this.ja.length];var l,a,o;return e}}class fn{constructor(t,i,n,s){this.$a=[],this.Li=t,this.Fa=i,this.Ua=n,this.qa=s;}Ha(t,i){if(t<i)throw new Error("high < low");const n=this.Li.zt(),s=(t-i)*this.Ya()/n,e=new dn(this.Fa,[2,2.5,2]),r=new dn(this.Fa,[2,2,2.5]),h=new dn(this.Fa,[2.5,2,2]),l=[];return l.push(e.Ha(t,i,s),r.Ha(t,i,s),h.Ha(t,i,s)),function(t){if(t.length<1)throw Error("array is empty");let i=t[0];for(let n=1;n<t.length;++n)t[n]<i&&(i=t[n]);return i}(l)}Xa(){const t=this.Li,i=t.Pt();if(null===i)return void(this.$a=[]);const n=t.zt(),s=this.Ua(n-1,i),e=this.Ua(0,i),r=this.Li.W().entireTextOnly?this.Ka()/2:0,h=r,l=n-1-r,a=Math.max(s,e),o=Math.min(s,e);if(a===o)return void(this.$a=[]);let _=this.Ha(a,o),u=a%_;u+=u<0?_:0;const c=a>=o?1:-1;let d=null,f=0;for(let n=a-u;n>o;n-=_){const s=this.qa(n,i,!0);null!==d&&Math.abs(s-d)<this.Ya()||(s<h||s>l||(f<this.$a.length?(this.$a[f].Aa=s,this.$a[f].Za=t.Ga(n)):this.$a.push({Aa:s,Za:t.Ga(n)}),f++,d=s,t.Ja()&&(_=this.Ha(n*c,o))));}this.$a.length=f;}Ea(){return this.$a}Ka(){return this.Li.P()}Ya(){return Math.ceil(2.5*this.Ka())}}function vn(t){return t.slice().sort(((t,i)=>b(t.Zi())-b(i.Zi())))}var pn;!function(t){t[t.Normal=0]="Normal",t[t.Logarithmic=1]="Logarithmic",t[t.Percentage=2]="Percentage",t[t.IndexedTo100=3]="IndexedTo100";}(pn||(pn={}));const mn=new pt,bn=new vt(100,1);class wn{constructor(t,i,n,s){this.Qa=0,this.io=null,this.Dh=null,this.no=null,this.so={eo:!1,ro:null},this.ho=0,this.lo=0,this.ao=new R,this.oo=new R,this._o=[],this.uo=null,this.co=null,this.do=null,this.fo=null,this.da=bn,this.vo=cn(null),this.po=t,this.cn=i,this.mo=n,this.bo=s,this.wo=new fn(this,100,this.Mo.bind(this),this.xo.bind(this));}xa(){return this.po}W(){return this.cn}Nh(t){if(D(this.cn,t),this.Sa(),void 0!==t.mode&&this.So({yr:t.mode}),void 0!==t.scaleMargins){const i=m(t.scaleMargins.top),n=m(t.scaleMargins.bottom);if(i<0||i>1)throw new Error(`Invalid top margin - expect value between 0 and 1, given=${i}`);if(n<0||n>1||i+n>1)throw new Error(`Invalid bottom margin - expect value between 0 and 1, given=${n}`);if(i+n>1)throw new Error(`Invalid margins - sum of margins must be less than 1, given=${i+n}`);this.ko(),this.co=null;}}yo(){return this.cn.autoScale}Ja(){return 1===this.cn.mode}ph(){return 2===this.cn.mode}Co(){return 3===this.cn.mode}yr(){return {Wn:this.cn.autoScale,To:this.cn.invertScale,yr:this.cn.mode}}So(t){const i=this.yr();let n=null;void 0!==t.Wn&&(this.cn.autoScale=t.Wn),void 0!==t.yr&&(this.cn.mode=t.yr,2!==t.yr&&3!==t.yr||(this.cn.autoScale=!0),this.so.eo=!1),1===i.yr&&t.yr!==i.yr&&(!function(t,i){if(null===t)return !1;const n=on(t.Sh(),i),s=on(t.kh(),i);return isFinite(n)&&isFinite(s)}(this.Dh,this.vo)?this.cn.autoScale=!0:(n=un(this.Dh,this.vo),null!==n&&this.Po(n))),1===t.yr&&t.yr!==i.yr&&(n=_n(this.Dh,this.vo),null!==n&&this.Po(n));const s=i.yr!==this.cn.mode;s&&(2===i.yr||this.ph())&&this.Sa(),s&&(3===i.yr||this.Co())&&this.Sa(),void 0!==t.To&&i.To!==t.To&&(this.cn.invertScale=t.To,this.Ro()),this.oo.m(i,this.yr());}Do(){return this.oo}P(){return this.mo.fontSize}zt(){return this.Qa}Oo(t){this.Qa!==t&&(this.Qa=t,this.ko(),this.co=null);}Ao(){if(this.io)return this.io;const t=this.zt()-this.Vo()-this.Bo();return this.io=t,t}Ah(){return this.Io(),this.Dh}Po(t,i){const n=this.Dh;(i||null===n&&null!==t||null!==n&&!n.Mh(t))&&(this.co=null,this.Dh=t);}Fi(){return this.Io(),0===this.Qa||!this.Dh||this.Dh.Fi()}zo(t){return this.To()?t:this.zt()-1-t}Ot(t,i){return this.ph()?t=en(t,i):this.Co()&&(t=hn(t,i)),this.xo(t,i)}Qs(t,i,n){this.Io();const s=this.Bo(),e=b(this.Ah()),r=e.Sh(),h=e.kh(),l=this.Ao()-1,a=this.To(),o=l/(h-r),_=void 0===n?0:n.from,u=void 0===n?t.length:n.to,c=this.Eo();for(let n=_;n<u;n++){const e=t[n],h=e.ct;if(isNaN(h))continue;let l=h;null!==c&&(l=c(e.ct,i));const _=s+o*(l-r),u=a?_:this.Qa-1-_;e.rt=u;}}me(t,i,n){this.Io();const s=this.Bo(),e=b(this.Ah()),r=e.Sh(),h=e.kh(),l=this.Ao()-1,a=this.To(),o=l/(h-r),_=void 0===n?0:n.from,u=void 0===n?t.length:n.to,c=this.Eo();for(let n=_;n<u;n++){const e=t[n];let h=e.we,l=e.ge,_=e.Me,u=e.xe;null!==c&&(h=c(e.we,i),l=c(e.ge,i),_=c(e.Me,i),u=c(e.xe,i));let d=s+o*(h-r),f=a?d:this.Qa-1-d;e.ve=f,d=s+o*(l-r),f=a?d:this.Qa-1-d,e.ce=f,d=s+o*(_-r),f=a?d:this.Qa-1-d,e.de=f,d=s+o*(u-r),f=a?d:this.Qa-1-d,e.pe=f;}}pn(t,i){const n=this.Mo(t,i);return this.Lo(n,i)}Lo(t,i){let n=t;return this.ph()?n=function(t,i){return i<0&&(t=-t),t/100*i+i}(n,i):this.Co()&&(n=function(t,i){return t-=100,i<0&&(t=-t),t/100*i+i}(n,i)),n}Ta(){return this._o}No(){if(this.uo)return this.uo;let t=[];for(let i=0;i<this._o.length;i++){const n=this._o[i];null===n.Zi()&&n.Gi(i+1),t.push(n);}return t=vn(t),this.uo=t,this.uo}Fo(t){-1===this._o.indexOf(t)&&(this._o.push(t),this.Sa(),this.Wo());}jo(t){const i=this._o.indexOf(t);if(-1===i)throw new Error("source is not attached to scale");this._o.splice(i,1),0===this._o.length&&(this.So({Wn:!0}),this.Po(null)),this.Sa(),this.Wo();}Pt(){let t=null;for(const i of this._o){const n=i.Pt();null!==n&&((null===t||n.ia<t.ia)&&(t=n));}return null===t?null:t.Vt}To(){return this.cn.invertScale}Ea(){const t=null===this.Pt();if(null!==this.co&&(t||this.co.Ho===t))return this.co.Ea;this.wo.Xa();const i=this.wo.Ea();return this.co={Ea:i,Ho:t},this.ao.m(),i}$o(){return this.ao}Uo(t){this.ph()||this.Co()||null===this.do&&null===this.no&&(this.Fi()||(this.do=this.Qa-t,this.no=b(this.Ah()).xh()));}qo(t){if(this.ph()||this.Co())return;if(null===this.do)return;this.So({Wn:!1}),(t=this.Qa-t)<0&&(t=0);let i=(this.do+.2*(this.Qa-1))/(t+.2*(this.Qa-1));const n=b(this.no).xh();i=Math.max(i,.1),n.Ch(i),this.Po(n);}Yo(){this.ph()||this.Co()||(this.do=null,this.no=null);}Xo(t){this.yo()||null===this.fo&&null===this.no&&(this.Fi()||(this.fo=t,this.no=b(this.Ah()).xh()));}Ko(t){if(this.yo())return;if(null===this.fo)return;const i=b(this.Ah()).yh()/(this.Ao()-1);let n=t-this.fo;this.To()&&(n*=-1);const s=n*i,e=b(this.no).xh();e.Th(s),this.Po(e,!0),this.co=null;}Zo(){this.yo()||null!==this.fo&&(this.fo=null,this.no=null);}ca(){return this.da||this.Sa(),this.da}Wi(t,i){switch(this.cn.mode){case 2:return this.Go(en(t,i));case 3:return this.ca().format(hn(t,i));default:return this.zh(t)}}Ga(t){switch(this.cn.mode){case 2:return this.Go(t);case 3:return this.ca().format(t);default:return this.zh(t)}}Wl(t){return this.zh(t,b(this.Jo()).ca())}jl(t,i){return t=en(t,i),this.Go(t,mn)}Qo(){return this._o}t_(t){this.so={ro:t,eo:!1};}On(){this._o.forEach((t=>t.On()));}Sa(){this.co=null;const t=this.Jo();let i=100;null!==t&&(i=Math.round(1/t.ua())),this.da=bn,this.ph()?(this.da=mn,i=100):this.Co()?(this.da=new vt(100,1),i=100):null!==t&&(this.da=t.ca()),this.wo=new fn(this,i,this.Mo.bind(this),this.xo.bind(this)),this.wo.Xa();}Wo(){this.uo=null;}Jo(){return this._o[0]||null}Vo(){return this.To()?this.cn.scaleMargins.bottom*this.zt()+this.lo:this.cn.scaleMargins.top*this.zt()+this.ho}Bo(){return this.To()?this.cn.scaleMargins.top*this.zt()+this.ho:this.cn.scaleMargins.bottom*this.zt()+this.lo}Io(){this.so.eo||(this.so.eo=!0,this.i_());}ko(){this.io=null;}xo(t,i){if(this.Io(),this.Fi())return 0;t=this.Ja()&&t?an(t,this.vo):t;const n=b(this.Ah()),s=this.Bo()+(this.Ao()-1)*(t-n.Sh())/n.yh();return this.zo(s)}Mo(t,i){if(this.Io(),this.Fi())return 0;const n=this.zo(t),s=b(this.Ah()),e=s.Sh()+s.yh()*((n-this.Bo())/(this.Ao()-1));return this.Ja()?on(e,this.vo):e}Ro(){this.co=null,this.wo.Xa();}i_(){const t=this.so.ro;if(null===t)return;let i=null;const n=this.Qo();let s=0,e=0;for(const r of n){if(!r.Tt())continue;const n=r.Pt();if(null===n)continue;const h=r.Rl(t.Os(),t.di());let l=h&&h.Ah();if(null!==l){switch(this.cn.mode){case 1:l=_n(l,this.vo);break;case 2:l=rn(l,n.Vt);break;case 3:l=ln(l,n.Vt);}if(i=null===i?l:i.ts(b(l)),null!==h){const t=h.Vh();null!==t&&(s=Math.max(s,t.above),e=Math.max(s,t.below));}}}if(s===this.ho&&e===this.lo||(this.ho=s,this.lo=e,this.co=null,this.ko()),null!==i){if(i.Sh()===i.kh()){const t=this.Jo(),n=5*(null===t||this.ph()||this.Co()?1:t.ua());this.Ja()&&(i=un(i,this.vo)),i=new Ri(i.Sh()-n,i.kh()+n),this.Ja()&&(i=_n(i,this.vo));}if(this.Ja()){const t=un(i,this.vo),n=cn(t);if(r=n,h=this.vo,r.La!==h.La||r.Na!==h.Na){const s=null!==this.no?un(this.no,this.vo):null;this.vo=n,i=_n(t,n),null!==s&&(this.no=_n(s,n));}}this.Po(i);}else null===this.Dh&&(this.Po(new Ri(-.5,.5)),this.vo=cn(null));var r,h;this.so.eo=!0;}Eo(){return this.ph()?en:this.Co()?hn:this.Ja()?t=>an(t,this.vo):null}n_(t,i,n){return void 0===i?(void 0===n&&(n=this.ca()),n.format(t)):i(t)}zh(t,i){return this.n_(t,this.bo.priceFormatter,i)}Go(t,i){return this.n_(t,this.bo.percentageFormatter,i)}}class gn{constructor(t,i){this._o=[],this.s_=new Map,this.Qa=0,this.e_=0,this.r_=1e3,this.uo=null,this.h_=new R,this.wl=t,this.Ui=i,this.l_=new nn(this);const n=i.W();this.a_=this.o_("left",n.leftPriceScale),this.__=this.o_("right",n.rightPriceScale),this.a_.Do().l(this.u_.bind(this,this.a_),this),this.__.Do().l(this.u_.bind(this,this.__),this),this.c_(n);}c_(t){if(t.leftPriceScale&&this.a_.Nh(t.leftPriceScale),t.rightPriceScale&&this.__.Nh(t.rightPriceScale),t.localization&&(this.a_.Sa(),this.__.Sa()),t.overlayPriceScales){const i=Array.from(this.s_.values());for(const n of i){const i=b(n[0].At());i.Nh(t.overlayPriceScales),t.localization&&i.Sa();}}}d_(t){switch(t){case"left":return this.a_;case"right":return this.__}return this.s_.has(t)?m(this.s_.get(t))[0].At():null}S(){this.qt().f_().p(this),this.a_.Do().p(this),this.__.Do().p(this),this._o.forEach((t=>{t.S&&t.S();})),this.h_.m();}v_(){return this.r_}p_(t){this.r_=t;}qt(){return this.Ui}$i(){return this.e_}zt(){return this.Qa}m_(t){this.e_=t,this.b_();}Oo(t){this.Qa=t,this.a_.Oo(t),this.__.Oo(t),this._o.forEach((i=>{if(this.dr(i)){const n=i.At();null!==n&&n.Oo(t);}})),this.b_();}Ta(){return this._o}dr(t){const i=t.At();return null===i||this.a_!==i&&this.__!==i}Fo(t,i,n){const s=void 0!==n?n:this.g_().w_+1;this.M_(t,i,s);}jo(t){const i=this._o.indexOf(t);p(-1!==i,"removeDataSource: invalid data source"),this._o.splice(i,1);const n=b(t.At()).xa();if(this.s_.has(n)){const i=m(this.s_.get(n)),s=i.indexOf(t);-1!==s&&(i.splice(s,1),0===i.length&&this.s_.delete(n));}const s=t.At();s&&s.Ta().indexOf(t)>=0&&s.jo(t),null!==s&&(s.Wo(),this.x_(s)),this.uo=null;}pr(t){return t===this.a_?"left":t===this.__?"right":"overlay"}S_(){return this.a_}k_(){return this.__}y_(t,i){t.Uo(i);}C_(t,i){t.qo(i),this.b_();}T_(t){t.Yo();}P_(t,i){t.Xo(i);}R_(t,i){t.Ko(i),this.b_();}D_(t){t.Zo();}b_(){this._o.forEach((t=>{t.On();}));}vn(){let t=null;return this.Ui.W().rightPriceScale.visible&&0!==this.__.Ta().length?t=this.__:this.Ui.W().leftPriceScale.visible&&0!==this.a_.Ta().length?t=this.a_:0!==this._o.length&&(t=this._o[0].At()),null===t&&(t=this.__),t}vr(){let t=null;return this.Ui.W().rightPriceScale.visible?t=this.__:this.Ui.W().leftPriceScale.visible&&(t=this.a_),t}x_(t){null!==t&&t.yo()&&this.O_(t);}A_(t){const i=this.wl.Xs();t.So({Wn:!0}),null!==i&&t.t_(i),this.b_();}V_(){this.O_(this.a_),this.O_(this.__);}B_(){this.x_(this.a_),this.x_(this.__),this._o.forEach((t=>{this.dr(t)&&this.x_(t.At());})),this.b_(),this.Ui.Fh();}No(){return null===this.uo&&(this.uo=vn(this._o)),this.uo}I_(){return this.h_}z_(){return this.l_}O_(t){const i=t.Qo();if(i&&i.length>0&&!this.wl.Fi()){const i=this.wl.Xs();null!==i&&t.t_(i);}t.On();}g_(){const t=this.No();if(0===t.length)return {E_:0,w_:0};let i=0,n=0;for(let s=0;s<t.length;s++){const e=t[s].Zi();null!==e&&(e<i&&(i=e),e>n&&(n=e));}return {E_:i,w_:n}}M_(t,i,n){let s=this.d_(i);if(null===s&&(s=this.o_(i,this.Ui.W().overlayPriceScales)),this._o.push(t),!ut(i)){const n=this.s_.get(i)||[];n.push(t),this.s_.set(i,n);}s.Fo(t),t.Ji(s),t.Gi(n),this.x_(s),this.uo=null;}u_(t,i,n){i.yr!==n.yr&&this.O_(t);}o_(t,i){const n=Object.assign({visible:!0,autoScale:!0},I(i)),s=new wn(t,n,this.Ui.W().layout,this.Ui.W().localization);return s.Oo(this.zt()),s}}class Mn{constructor(t,i,n=50){this.Ke=0,this.Ze=1,this.Ge=1,this.Qe=new Map,this.Je=new Map,this.L_=t,this.N_=i,this.tr=n;}F_(t){const i=t.time,n=this.N_.cacheKey(i),s=this.Qe.get(n);if(void 0!==s)return s.W_;if(this.Ke===this.tr){const t=this.Je.get(this.Ge);this.Je.delete(this.Ge),this.Qe.delete(m(t)),this.Ge++,this.Ke--;}const e=this.L_(t);return this.Qe.set(n,{W_:e,er:this.Ze}),this.Je.set(this.Ze,n),this.Ke++,this.Ze++,e}}class xn{constructor(t,i){p(t<=i,"right should be >= left"),this.j_=t,this.H_=i;}Os(){return this.j_}di(){return this.H_}U_(){return this.H_-this.j_+1}Kr(t){return this.j_<=t&&t<=this.H_}Mh(t){return this.j_===t.Os()&&this.H_===t.di()}}function Sn(t,i){return null===t||null===i?t===i:t.Mh(i)}class kn{constructor(){this.q_=new Map,this.Qe=null,this.Y_=!1;}X_(t){this.Y_=t,this.Qe=null;}K_(t,i){this.Z_(i),this.Qe=null;for(let n=i;n<t.length;++n){const i=t[n];let s=this.q_.get(i.timeWeight);void 0===s&&(s=[],this.q_.set(i.timeWeight,s)),s.push({index:n,time:i.time,weight:i.timeWeight,originalTime:i.originalTime});}}G_(t,i){const n=Math.ceil(i/t);return null!==this.Qe&&this.Qe.J_===n||(this.Qe={Ea:this.Q_(n),J_:n}),this.Qe.Ea}Z_(t){if(0===t)return void this.q_.clear();const i=[];this.q_.forEach(((n,s)=>{t<=n[0].index?i.push(s):n.splice(Bt(n,t,(i=>i.index<t)),1/0);}));for(const t of i)this.q_.delete(t);}Q_(t){let i=[];for(const n of Array.from(this.q_.keys()).sort(((t,i)=>i-t))){if(!this.q_.get(n))continue;const s=i;i=[];const e=s.length;let r=0;const h=m(this.q_.get(n)),l=h.length;let a=1/0,o=-1/0;for(let n=0;n<l;n++){const l=h[n],_=l.index;for(;r<e;){const t=s[r],n=t.index;if(!(n<_)){a=n;break}r++,i.push(t),o=n,a=1/0;}if(a-_>=t&&_-o>=t)i.push(l),o=_;else if(this.Y_)return s}for(;r<e;r++)i.push(s[r]);}return i}}class yn{constructor(t){this.tu=t;}iu(){return null===this.tu?null:new xn(Math.floor(this.tu.Os()),Math.ceil(this.tu.di()))}nu(){return this.tu}static su(){return new yn(null)}}function Cn(t,i){return t.weight>i.weight?t:i}class Tn{constructor(t,i,n,s){this.e_=0,this.eu=null,this.ru=[],this.fo=null,this.do=null,this.hu=new kn,this.lu=new Map,this.au=yn.su(),this.ou=!0,this._u=new R,this.uu=new R,this.cu=new R,this.du=null,this.fu=null,this.vu=[],this.cn=i,this.bo=n,this.pu=i.rightOffset,this.mu=i.barSpacing,this.Ui=t,this.N_=s,this.bu(),this.hu.X_(i.uniformDistribution);}W(){return this.cn}wu(t){D(this.bo,t),this.gu(),this.bu();}Nh(t,i){var n;D(this.cn,t),this.cn.fixLeftEdge&&this.Mu(),this.cn.fixRightEdge&&this.xu(),void 0!==t.barSpacing&&this.Ui.Gn(t.barSpacing),void 0!==t.rightOffset&&this.Ui.Jn(t.rightOffset),void 0!==t.minBarSpacing&&this.Ui.Gn(null!==(n=t.barSpacing)&&void 0!==n?n:this.mu),this.gu(),this.bu(),this.cu.m();}mn(t){var i,n;return null!==(n=null===(i=this.ru[t])||void 0===i?void 0:i.time)&&void 0!==n?n:null}qi(t){var i;return null!==(i=this.ru[t])&&void 0!==i?i:null}ya(t,i){if(this.ru.length<1)return null;if(this.N_.key(t)>this.N_.key(this.ru[this.ru.length-1].time))return i?this.ru.length-1:null;const n=Bt(this.ru,this.N_.key(t),((t,i)=>this.N_.key(t.time)<i));return this.N_.key(t)<this.N_.key(this.ru[n].time)?i?n:null:n}Fi(){return 0===this.e_||0===this.ru.length||null===this.eu}ka(){return this.ru.length>0}Xs(){return this.Su(),this.au.iu()}ku(){return this.Su(),this.au.nu()}yu(){const t=this.Xs();if(null===t)return null;const i={from:t.Os(),to:t.di()};return this.Cu(i)}Cu(t){const i=Math.round(t.from),n=Math.round(t.to),s=b(this.Tu()),e=b(this.Bn());return {from:b(this.qi(Math.max(s,i))),to:b(this.qi(Math.min(e,n)))}}Pu(t){return {from:b(this.ya(t.from,!0)),to:b(this.ya(t.to,!0))}}$i(){return this.e_}m_(t){if(!isFinite(t)||t<=0)return;if(this.e_===t)return;const i=this.ku(),n=this.e_;if(this.e_=t,this.ou=!0,this.cn.lockVisibleTimeRangeOnResize&&0!==n){const i=this.mu*t/n;this.mu=i;}if(this.cn.fixLeftEdge&&null!==i&&i.Os()<=0){const i=n-t;this.pu-=Math.round(i/this.mu)+1,this.ou=!0;}this.Ru(),this.Du();}Et(t){if(this.Fi()||!A(t))return 0;const i=this.Ou()+this.pu-t;return this.e_-(i+.5)*this.mu-1}Js(t,i){const n=this.Ou(),s=void 0===i?0:i.from,e=void 0===i?t.length:i.to;for(let i=s;i<e;i++){const s=t[i].ut,e=n+this.pu-s,r=this.e_-(e+.5)*this.mu-1;t[i].et=r;}}Au(t){return Math.ceil(this.Vu(t))}Jn(t){this.ou=!0,this.pu=t,this.Du(),this.Ui.Bu(),this.Ui.Fh();}he(){return this.mu}Gn(t){this.Iu(t),this.Du(),this.Ui.Bu(),this.Ui.Fh();}zu(){return this.pu}Ea(){if(this.Fi())return null;if(null!==this.fu)return this.fu;const t=this.mu,i=5*(this.Ui.W().layout.fontSize+4)/8*(this.cn.tickMarkMaxCharacterLength||8),n=Math.round(i/t),s=b(this.Xs()),e=Math.max(s.Os(),s.Os()-n),r=Math.max(s.di(),s.di()-n),h=this.hu.G_(t,i),l=this.Tu()+n,a=this.Bn()-n,o=this.Eu(),_=this.cn.fixLeftEdge||o,u=this.cn.fixRightEdge||o;let c=0;for(const t of h){if(!(e<=t.index&&t.index<=r))continue;let n;c<this.vu.length?(n=this.vu[c],n.coord=this.Et(t.index),n.label=this.Lu(t),n.weight=t.weight):(n={needAlignCoordinate:!1,coord:this.Et(t.index),label:this.Lu(t),weight:t.weight},this.vu.push(n)),this.mu>i/2&&!o?n.needAlignCoordinate=!1:n.needAlignCoordinate=_&&t.index<=l||u&&t.index>=a,c++;}return this.vu.length=c,this.fu=this.vu,this.vu}Nu(){this.ou=!0,this.Gn(this.cn.barSpacing),this.Jn(this.cn.rightOffset);}Fu(t){this.ou=!0,this.eu=t,this.Du(),this.Mu();}Wu(t,i){const n=this.Vu(t),s=this.he(),e=s+i*(s/10);this.Gn(e),this.cn.rightBarStaysOnScroll||this.Jn(this.zu()+(n-this.Vu(t)));}Uo(t){this.fo&&this.Zo(),null===this.do&&null===this.du&&(this.Fi()||(this.do=t,this.ju()));}qo(t){if(null===this.du)return;const i=yt(this.e_-t,0,this.e_),n=yt(this.e_-b(this.do),0,this.e_);0!==i&&0!==n&&this.Gn(this.du.he*i/n);}Yo(){null!==this.do&&(this.do=null,this.Hu());}Xo(t){null===this.fo&&null===this.du&&(this.Fi()||(this.fo=t,this.ju()));}Ko(t){if(null===this.fo)return;const i=(this.fo-t)/this.he();this.pu=b(this.du).zu+i,this.ou=!0,this.Du();}Zo(){null!==this.fo&&(this.fo=null,this.Hu());}$u(){this.Uu(this.cn.rightOffset);}Uu(t,i=400){if(!isFinite(t))throw new RangeError("offset is required and must be finite number");if(!isFinite(i)||i<=0)throw new RangeError("animationDuration (optional) must be finite positive number");const n=this.pu,s=performance.now();this.Ui.Xn({qu:t=>(t-s)/i>=1,Yu:e=>{const r=(e-s)/i;return r>=1?t:n+(t-n)*r}});}gt(t,i){this.ou=!0,this.ru=t,this.hu.K_(t,i),this.Du();}Xu(){return this._u}Ku(){return this.uu}Zu(){return this.cu}Ou(){return this.eu||0}Gu(t){const i=t.U_();this.Iu(this.e_/i),this.pu=t.di()-this.Ou(),this.Du(),this.ou=!0,this.Ui.Bu(),this.Ui.Fh();}Ju(){const t=this.Tu(),i=this.Bn();null!==t&&null!==i&&this.Gu(new xn(t,i+this.cn.rightOffset));}Qu(t){const i=new xn(t.from,t.to);this.Gu(i);}Yi(t){return void 0!==this.bo.timeFormatter?this.bo.timeFormatter(t.originalTime):this.N_.formatHorzItem(t.time)}Bn(){return 0===this.ru.length?null:this.ru.length-1}Eu(){const{handleScroll:t,handleScale:i}=this.Ui.W();return !(t.horzTouchDrag||t.mouseWheel||t.pressedMouseMove||t.vertTouchDrag||i.axisDoubleClickReset.time||i.axisPressedMouseMove.time||i.mouseWheel||i.pinch)}Tu(){return 0===this.ru.length?null:0}tc(t){return (this.e_-1-t)/this.mu}Vu(t){const i=this.tc(t),n=this.Ou()+this.pu-i;return Math.round(1e6*n)/1e6}Iu(t){const i=this.mu;this.mu=t,this.Ru(),i!==this.mu&&(this.ou=!0,this.ic());}Su(){if(!this.ou)return;if(this.ou=!1,this.Fi())return void this.nc(yn.su());const t=this.Ou(),i=this.e_/this.mu,n=this.pu+t,s=new xn(n-i+1,n);this.nc(new yn(s));}Ru(){const t=this.sc();if(this.mu<t&&(this.mu=t,this.ou=!0),0!==this.e_){const t=.5*this.e_;this.mu>t&&(this.mu=t,this.ou=!0);}}sc(){return this.cn.fixLeftEdge&&this.cn.fixRightEdge&&0!==this.ru.length?this.e_/this.ru.length:this.cn.minBarSpacing}Du(){const t=this.ec();this.pu>t&&(this.pu=t,this.ou=!0);const i=this.rc();null!==i&&this.pu<i&&(this.pu=i,this.ou=!0);}rc(){const t=this.Tu(),i=this.eu;if(null===t||null===i)return null;return t-i-1+(this.cn.fixLeftEdge?this.e_/this.mu:Math.min(2,this.ru.length))}ec(){return this.cn.fixRightEdge?0:this.e_/this.mu-Math.min(2,this.ru.length)}ju(){this.du={he:this.he(),zu:this.zu()};}Hu(){this.du=null;}Lu(t){let i=this.lu.get(t.weight);return void 0===i&&(i=new Mn((t=>this.hc(t)),this.N_),this.lu.set(t.weight,i)),i.F_(t)}hc(t){return this.N_.formatTickmark(t,this.bo)}nc(t){const i=this.au;this.au=t,Sn(i.iu(),this.au.iu())||this._u.m(),Sn(i.nu(),this.au.nu())||this.uu.m(),this.ic();}ic(){this.fu=null;}gu(){this.ic(),this.lu.clear();}bu(){this.N_.updateFormatter(this.bo);}Mu(){if(!this.cn.fixLeftEdge)return;const t=this.Tu();if(null===t)return;const i=this.Xs();if(null===i)return;const n=i.Os()-t;if(n<0){const t=this.pu-n-1;this.Jn(t);}this.Ru();}xu(){this.Du(),this.Ru();}}class Pn extends j{constructor(t){super(),this.lc=new Map,this.Lt=t;}Z(t){}J(t){if(!this.Lt.Tt)return;const{context:i,mediaSize:n}=t;let s=0;for(const t of this.Lt.ac){if(0===t.Jt.length)continue;i.font=t.R;const e=this.oc(i,t.Jt);e>n.width?t.Wu=n.width/e:t.Wu=1,s+=t._c*t.Wu;}let e=0;switch(this.Lt.uc){case"top":e=0;break;case"center":e=Math.max((n.height-s)/2,0);break;case"bottom":e=Math.max(n.height-s,0);}i.fillStyle=this.Lt.O;for(const t of this.Lt.ac){i.save();let s=0;switch(this.Lt.cc){case"left":i.textAlign="left",s=t._c/2;break;case"center":i.textAlign="center",s=n.width/2;break;case"right":i.textAlign="right",s=n.width-1-t._c/2;}i.translate(s,e),i.textBaseline="top",i.font=t.R,i.scale(t.Wu,t.Wu),i.fillText(t.Jt,0,t.dc),i.restore(),e+=t._c*t.Wu;}}oc(t,i){const n=this.fc(t.font);let s=n.get(i);return void 0===s&&(s=t.measureText(i).width,n.set(i,s)),s}fc(t){let i=this.lc.get(t);return void 0===i&&(i=new Map,this.lc.set(t,i)),i}}class Rn{constructor(t){this.bt=!0,this.jt={Tt:!1,O:"",ac:[],uc:"center",cc:"center"},this.Ht=new Pn(this.jt),this.$t=t;}gt(){this.bt=!0;}xt(){return this.bt&&(this.St(),this.bt=!1),this.Ht}St(){const t=this.$t.W(),i=this.jt;i.Tt=t.visible,i.Tt&&(i.O=t.color,i.cc=t.horzAlign,i.uc=t.vertAlign,i.ac=[{Jt:t.text,R:N(t.fontSize,t.fontFamily,t.fontStyle),_c:1.2*t.fontSize,dc:0,Wu:0}]);}}class Dn extends at{constructor(t,i){super(),this.cn=i,this.wn=new Rn(this);}Rn(){return []}Pn(){return [this.wn]}W(){return this.cn}On(){this.wn.gt();}}var On,An,Vn,Bn,In;!function(t){t[t.OnTouchEnd=0]="OnTouchEnd",t[t.OnNextTap=1]="OnNextTap";}(On||(On={}));class zn{constructor(t,i,n){this.vc=[],this.mc=[],this.e_=0,this.bc=null,this.wc=new R,this.gc=new R,this.Mc=null,this.xc=t,this.cn=i,this.N_=n,this.Sc=new F(this),this.wl=new Tn(this,i.timeScale,this.cn.localization,n),this.wt=new _t(this,i.crosshair),this.kc=new Ji(i.crosshair),this.yc=new Dn(this,i.watermark),this.Cc(),this.vc[0].p_(2e3),this.Tc=this.Pc(0),this.Rc=this.Pc(1);}$l(){this.Dc(ct.es());}Fh(){this.Dc(ct.ss());}sa(){this.Dc(new ct(1));}Ul(t){const i=this.Oc(t);this.Dc(i);}Ac(){return this.bc}Vc(t){const i=this.bc;this.bc=t,null!==i&&this.Ul(i.Bc),null!==t&&this.Ul(t.Bc);}W(){return this.cn}Nh(t){D(this.cn,t),this.vc.forEach((i=>i.c_(t))),void 0!==t.timeScale&&this.wl.Nh(t.timeScale),void 0!==t.localization&&this.wl.wu(t.localization),(t.leftPriceScale||t.rightPriceScale)&&this.wc.m(),this.Tc=this.Pc(0),this.Rc=this.Pc(1),this.$l();}Ic(t,i){if("left"===t)return void this.Nh({leftPriceScale:i});if("right"===t)return void this.Nh({rightPriceScale:i});const n=this.zc(t);null!==n&&(n.At.Nh(i),this.wc.m());}zc(t){for(const i of this.vc){const n=i.d_(t);if(null!==n)return {Ut:i,At:n}}return null}yt(){return this.wl}Ec(){return this.vc}Lc(){return this.yc}Nc(){return this.wt}Fc(){return this.gc}Wc(t,i){t.Oo(i),this.Bu();}m_(t){this.e_=t,this.wl.m_(this.e_),this.vc.forEach((i=>i.m_(t))),this.Bu();}Cc(t){const i=new gn(this.wl,this);void 0!==t?this.vc.splice(t,0,i):this.vc.push(i);const n=void 0===t?this.vc.length-1:t,s=ct.es();return s.Nn(n,{Fn:0,Wn:!0}),this.Dc(s),i}y_(t,i,n){t.y_(i,n);}C_(t,i,n){t.C_(i,n),this.ql(),this.Dc(this.jc(t,2));}T_(t,i){t.T_(i),this.Dc(this.jc(t,2));}P_(t,i,n){i.yo()||t.P_(i,n);}R_(t,i,n){i.yo()||(t.R_(i,n),this.ql(),this.Dc(this.jc(t,2)));}D_(t,i){i.yo()||(t.D_(i),this.Dc(this.jc(t,2)));}A_(t,i){t.A_(i),this.Dc(this.jc(t,2));}Hc(t){this.wl.Uo(t);}$c(t,i){const n=this.yt();if(n.Fi()||0===i)return;const s=n.$i();t=Math.max(1,Math.min(t,s)),n.Wu(t,i),this.Bu();}Uc(t){this.qc(0),this.Yc(t),this.Xc();}Kc(t){this.wl.qo(t),this.Bu();}Zc(){this.wl.Yo(),this.Fh();}qc(t){this.wl.Xo(t);}Yc(t){this.wl.Ko(t),this.Bu();}Xc(){this.wl.Zo(),this.Fh();}Mt(){return this.mc}Gc(t,i,n,s,e){this.wt.gn(t,i);let r=NaN,h=this.wl.Au(t);const l=this.wl.Xs();null!==l&&(h=Math.min(Math.max(l.Os(),h),l.di()));const a=s.vn(),o=a.Pt();null!==o&&(r=a.pn(i,o)),r=this.kc.Ca(r,h,s),this.wt.kn(h,r,s),this.sa(),e||this.gc.m(this.wt.kt(),{x:t,y:i},n);}Jc(t,i,n){const s=n.vn(),e=s.Pt(),r=s.Ot(t,b(e)),h=this.wl.ya(i,!0),l=this.wl.Et(b(h));this.Gc(l,r,null,n,!0);}Qc(t){this.Nc().Cn(),this.sa(),t||this.gc.m(null,null,null);}ql(){const t=this.wt.Ut();if(null!==t){const i=this.wt.xn(),n=this.wt.Sn();this.Gc(i,n,null,t);}this.wt.On();}td(t,i,n){const s=this.wl.mn(0),e=this.wl.Bn();void 0!==i&&void 0!==n&&this.wl.gt(i,n);const r=this.wl.mn(0),h=this.wl.Ou(),l=this.wl.Xs();if(null!==l&&null!==s&&null!==r){const i=l.Kr(h),n=this.N_.key(s)>this.N_.key(r),a=null!==t&&t>h&&!n,o=this.wl.Bn(),_=i&&!(o===e)&&this.wl.W().shiftVisibleRangeOnNewBar;if(a&&!_){const i=t-h;this.wl.Jn(this.wl.zu()-i);}}this.wl.Fu(t);}Kl(t){null!==t&&t.B_();}cr(t){const i=this.vc.find((i=>i.No().includes(t)));return void 0===i?null:i}Bu(){this.yc.On(),this.vc.forEach((t=>t.B_())),this.ql();}S(){this.vc.forEach((t=>t.S())),this.vc.length=0,this.cn.localization.priceFormatter=void 0,this.cn.localization.percentageFormatter=void 0,this.cn.localization.timeFormatter=void 0;}nd(){return this.Sc}mr(){return this.Sc.W()}f_(){return this.wc}sd(t,i,n){const s=this.vc[0],e=this.ed(i,t,s,n);return this.mc.push(e),1===this.mc.length?this.$l():this.Fh(),e}rd(t){const i=this.cr(t),n=this.mc.indexOf(t);p(-1!==n,"Series not found"),this.mc.splice(n,1),b(i).jo(t),t.S&&t.S();}Hl(t,i){const n=b(this.cr(t));n.jo(t);const s=this.zc(i);if(null===s){const s=t.Zi();n.Fo(t,i,s);}else {const e=s.Ut===n?t.Zi():void 0;s.Ut.Fo(t,i,e);}}Ju(){const t=ct.ss();t.$n(),this.Dc(t);}hd(t){const i=ct.ss();i.Yn(t),this.Dc(i);}Zn(){const t=ct.ss();t.Zn(),this.Dc(t);}Gn(t){const i=ct.ss();i.Gn(t),this.Dc(i);}Jn(t){const i=ct.ss();i.Jn(t),this.Dc(i);}Xn(t){const i=ct.ss();i.Xn(t),this.Dc(i);}Un(){const t=ct.ss();t.Un(),this.Dc(t);}ld(){return this.cn.rightPriceScale.visible?"right":"left"}ad(){return this.Rc}q(){return this.Tc}It(t){const i=this.Rc,n=this.Tc;if(i===n)return i;if(t=Math.max(0,Math.min(100,Math.round(100*t))),null===this.Mc||this.Mc.Ts!==n||this.Mc.Ps!==i)this.Mc={Ts:n,Ps:i,od:new Map};else {const i=this.Mc.od.get(t);if(void 0!==i)return i}const s=function(t,i,n){const[s,e,r,h]=T(t),[l,a,o,_]=T(i),u=[M(s+n*(l-s)),M(e+n*(a-e)),M(r+n*(o-r)),x(h+n*(_-h))];return `rgba(${u[0]}, ${u[1]}, ${u[2]}, ${u[3]})`}(n,i,t/100);return this.Mc.od.set(t,s),s}jc(t,i){const n=new ct(i);if(null!==t){const s=this.vc.indexOf(t);n.Nn(s,{Fn:i});}return n}Oc(t,i){return void 0===i&&(i=2),this.jc(this.cr(t),i)}Dc(t){this.xc&&this.xc(t),this.vc.forEach((t=>t.z_().Wh().gt()));}ed(t,i,n,s){const e=new Gi(this,t,i,n,s),r=void 0!==t.priceScaleId?t.priceScaleId:this.ld();return n.Fo(e,r),ut(r)||e.Nh(t),e}Pc(t){const i=this.cn.layout;return "gradient"===i.background.type?0===t?i.background.topColor:i.background.bottomColor:i.background.color}}function En(t){return !O(t)&&!V(t)}function Ln(t){return O(t)}!function(t){t[t.Disabled=0]="Disabled",t[t.Continuous=1]="Continuous",t[t.OnDataUpdate=2]="OnDataUpdate";}(An||(An={})),function(t){t[t.LastBar=0]="LastBar",t[t.LastVisible=1]="LastVisible";}(Vn||(Vn={})),function(t){t.Solid="solid",t.VerticalGradient="gradient";}(Bn||(Bn={})),function(t){t[t.Year=0]="Year",t[t.Month=1]="Month",t[t.DayOfMonth=2]="DayOfMonth",t[t.Time=3]="Time",t[t.TimeWithSeconds=4]="TimeWithSeconds";}(In||(In={}));const Nn=t=>t.getUTCFullYear();function Fn(t,i,n){return i.replace(/yyyy/g,(t=>ft(Nn(t),4))(t)).replace(/yy/g,(t=>ft(Nn(t)%100,2))(t)).replace(/MMMM/g,((t,i)=>new Date(t.getUTCFullYear(),t.getUTCMonth(),1).toLocaleString(i,{month:"long"}))(t,n)).replace(/MMM/g,((t,i)=>new Date(t.getUTCFullYear(),t.getUTCMonth(),1).toLocaleString(i,{month:"short"}))(t,n)).replace(/MM/g,(t=>ft((t=>t.getUTCMonth()+1)(t),2))(t)).replace(/dd/g,(t=>ft((t=>t.getUTCDate())(t),2))(t))}class Wn{constructor(t="yyyy-MM-dd",i="default"){this._d=t,this.ud=i;}F_(t){return Fn(t,this._d,this.ud)}}class jn{constructor(t){this.dd=t||"%h:%m:%s";}F_(t){return this.dd.replace("%h",ft(t.getUTCHours(),2)).replace("%m",ft(t.getUTCMinutes(),2)).replace("%s",ft(t.getUTCSeconds(),2))}}const Hn={fd:"yyyy-MM-dd",vd:"%h:%m:%s",pd:" ",md:"default"};class $n{constructor(t={}){const i=Object.assign(Object.assign({},Hn),t);this.bd=new Wn(i.fd,i.md),this.wd=new jn(i.vd),this.gd=i.pd;}F_(t){return `${this.bd.F_(t)}${this.gd}${this.wd.F_(t)}`}}function Un(t){return 60*t*60*1e3}function qn(t){return 60*t*1e3}const Yn=[{Md:(Xn=1,1e3*Xn),xd:10},{Md:qn(1),xd:20},{Md:qn(5),xd:21},{Md:qn(30),xd:22},{Md:Un(1),xd:30},{Md:Un(3),xd:31},{Md:Un(6),xd:32},{Md:Un(12),xd:33}];var Xn;function Kn(t,i){if(t.getUTCFullYear()!==i.getUTCFullYear())return 70;if(t.getUTCMonth()!==i.getUTCMonth())return 60;if(t.getUTCDate()!==i.getUTCDate())return 50;for(let n=Yn.length-1;n>=0;--n)if(Math.floor(i.getTime()/Yn[n].Md)!==Math.floor(t.getTime()/Yn[n].Md))return Yn[n].xd;return 0}function Zn(t){let i=t;if(V(t)&&(i=Jn(t)),!En(i))throw new Error("time must be of type BusinessDay");const n=new Date(Date.UTC(i.year,i.month-1,i.day,0,0,0,0));return {Sd:Math.round(n.getTime()/1e3),kd:i}}function Gn(t){if(!Ln(t))throw new Error("time must be of type isUTCTimestamp");return {Sd:t}}function Jn(t){const i=new Date(t);if(isNaN(i.getTime()))throw new Error(`Invalid date string=${t}, expected format=yyyy-mm-dd`);return {day:i.getUTCDate(),month:i.getUTCMonth()+1,year:i.getUTCFullYear()}}function Qn(t){V(t.time)&&(t.time=Jn(t.time));}class ts{options(){return this.cn}setOptions(t){this.cn=t,this.updateFormatter(t.localization);}preprocessData(t){Array.isArray(t)?function(t){t.forEach(Qn);}(t):Qn(t);}createConverterToInternalObj(t){return b(function(t){return 0===t.length?null:En(t[0].time)||V(t[0].time)?Zn:Gn}(t))}key(t){return "object"==typeof t&&"Sd"in t?t.Sd:this.key(this.convertHorzItemToInternal(t))}cacheKey(t){const i=t;return void 0===i.kd?new Date(1e3*i.Sd).getTime():new Date(Date.UTC(i.kd.year,i.kd.month-1,i.kd.day)).getTime()}convertHorzItemToInternal(t){return Ln(i=t)?Gn(i):En(i)?Zn(i):Zn(Jn(i));var i;}updateFormatter(t){if(!this.cn)return;const i=t.dateFormat;this.cn.timeScale.timeVisible?this.yd=new $n({fd:i,vd:this.cn.timeScale.secondsVisible?"%h:%m:%s":"%h:%m",pd:"   ",md:t.locale}):this.yd=new Wn(i,t.locale);}formatHorzItem(t){const i=t;return this.yd.F_(new Date(1e3*i.Sd))}formatTickmark(t,i){const n=function(t,i,n){switch(t){case 0:case 10:return i?n?4:3:2;case 20:case 21:case 22:case 30:case 31:case 32:case 33:return i?3:2;case 50:return 2;case 60:return 1;case 70:return 0}}(t.weight,this.cn.timeScale.timeVisible,this.cn.timeScale.secondsVisible),s=this.cn.timeScale;if(void 0!==s.tickMarkFormatter){const e=s.tickMarkFormatter(t.originalTime,n,i.locale);if(null!==e)return e}return function(t,i,n){const s={};switch(i){case 0:s.year="numeric";break;case 1:s.month="short";break;case 2:s.day="numeric";break;case 3:s.hour12=!1,s.hour="2-digit",s.minute="2-digit";break;case 4:s.hour12=!1,s.hour="2-digit",s.minute="2-digit",s.second="2-digit";}const e=void 0===t.kd?new Date(1e3*t.Sd):new Date(Date.UTC(t.kd.year,t.kd.month-1,t.kd.day));return new Date(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds(),e.getUTCMilliseconds()).toLocaleString(n,s)}(t.time,n,i.locale)}maxTickMarkWeight(t){let i=t.reduce(Cn,t[0]).weight;return i>30&&i<50&&(i=30),i}fillWeightsForPoints(t,i){!function(t,i=0){if(0===t.length)return;let n=0===i?null:t[i-1].time.Sd,s=null!==n?new Date(1e3*n):null,e=0;for(let r=i;r<t.length;++r){const i=t[r],h=new Date(1e3*i.time.Sd);null!==s&&(i.timeWeight=Kn(h,s)),e+=i.time.Sd-(n||i.time.Sd),n=i.time.Sd,s=h;}if(0===i&&t.length>1){const i=Math.ceil(e/(t.length-1)),n=new Date(1e3*(t[0].time.Sd-i));t[0].timeWeight=Kn(new Date(1e3*t[0].time.Sd),n);}}(t,i);}static Cd(t){return D({localization:{dateFormat:"dd MMM 'yy"}},null!=t?t:{})}}const is="undefined"!=typeof window;function ns(){return !!is&&window.navigator.userAgent.toLowerCase().indexOf("firefox")>-1}function ss(){return !!is&&/iPhone|iPad|iPod/.test(window.navigator.platform)}function es(t){return t+t%2}function rs(t,i){return t.Td-i.Td}function hs(t,i,n){const s=(t.Td-i.Td)/(t.ut-i.ut);return Math.sign(s)*Math.min(Math.abs(s),n)}class ls{constructor(t,i,n,s){this.Pd=null,this.Rd=null,this.Dd=null,this.Od=null,this.Ad=null,this.Vd=0,this.Bd=0,this.Id=t,this.zd=i,this.Ed=n,this.rs=s;}Ld(t,i){if(null!==this.Pd){if(this.Pd.ut===i)return void(this.Pd.Td=t);if(Math.abs(this.Pd.Td-t)<this.rs)return}this.Od=this.Dd,this.Dd=this.Rd,this.Rd=this.Pd,this.Pd={ut:i,Td:t};}Dr(t,i){if(null===this.Pd||null===this.Rd)return;if(i-this.Pd.ut>50)return;let n=0;const s=hs(this.Pd,this.Rd,this.zd),e=rs(this.Pd,this.Rd),r=[s],h=[e];if(n+=e,null!==this.Dd){const t=hs(this.Rd,this.Dd,this.zd);if(Math.sign(t)===Math.sign(s)){const i=rs(this.Rd,this.Dd);if(r.push(t),h.push(i),n+=i,null!==this.Od){const t=hs(this.Dd,this.Od,this.zd);if(Math.sign(t)===Math.sign(s)){const i=rs(this.Dd,this.Od);r.push(t),h.push(i),n+=i;}}}}let l=0;for(let t=0;t<r.length;++t)l+=h[t]/n*r[t];Math.abs(l)<this.Id||(this.Ad={Td:t,ut:i},this.Bd=l,this.Vd=function(t,i){const n=Math.log(i);return Math.log(1*n/-t)/n}(Math.abs(l),this.Ed));}Yu(t){const i=b(this.Ad),n=t-i.ut;return i.Td+this.Bd*(Math.pow(this.Ed,n)-1)/Math.log(this.Ed)}qu(t){return null===this.Ad||this.Nd(t)===this.Vd}Nd(t){const i=t-b(this.Ad).ut;return Math.min(i,this.Vd)}}function as(t,n){const s=b(t.ownerDocument).createElement("canvas");t.appendChild(s);const e=bindTo(s,{type:"device-pixel-content-box",options:{allowResizeObserver:!1},transform:(t,i)=>({width:Math.max(t.width,i.width),height:Math.max(t.height,i.height)})});return e.resizeCanvasElement(n),e}function os(t,i,n,s){t.G&&t.G(i,n,s);}function _s(t,i,n,s){t.K(i,n,s);}function us(t,i,n,s){const e=t(n,s);for(const t of e){const n=t.xt();null!==n&&i(n);}}function cs(t){is&&void 0!==window.chrome&&t.addEventListener("mousedown",(t=>{if(1===t.button)return t.preventDefault(),!1}));}class ds{constructor(t,i,n){this.Fd=0,this.Wd=null,this.jd={et:Number.NEGATIVE_INFINITY,rt:Number.POSITIVE_INFINITY},this.Hd=0,this.$d=null,this.Ud={et:Number.NEGATIVE_INFINITY,rt:Number.POSITIVE_INFINITY},this.qd=null,this.Yd=!1,this.Xd=null,this.Kd=null,this.Zd=!1,this.Gd=!1,this.Jd=!1,this.Qd=null,this.tf=null,this.if=null,this.nf=null,this.sf=null,this.ef=null,this.rf=null,this.hf=0,this.lf=!1,this.af=!1,this._f=!1,this.uf=0,this.cf=null,this.df=!ss(),this.ff=t=>{this.vf(t);},this.pf=t=>{if(this.mf(t)){const i=this.bf(t);if(++this.Hd,this.$d&&this.Hd>1){const{wf:n}=this.gf(ps(t),this.Ud);n<30&&!this.Jd&&this.Mf(i,this.Sf.xf),this.kf();}}else {const i=this.bf(t);if(++this.Fd,this.Wd&&this.Fd>1){const{wf:n}=this.gf(ps(t),this.jd);n<5&&!this.Gd&&this.yf(i,this.Sf.Cf),this.Tf();}}},this.Pf=t,this.Sf=i,this.cn=n,this.Rf();}S(){null!==this.Qd&&(this.Qd(),this.Qd=null),null!==this.tf&&(this.tf(),this.tf=null),null!==this.nf&&(this.nf(),this.nf=null),null!==this.sf&&(this.sf(),this.sf=null),null!==this.ef&&(this.ef(),this.ef=null),null!==this.if&&(this.if(),this.if=null),this.Df(),this.Tf();}Of(t){this.nf&&this.nf();const i=this.Af.bind(this);if(this.nf=()=>{this.Pf.removeEventListener("mousemove",i);},this.Pf.addEventListener("mousemove",i),this.mf(t))return;const n=this.bf(t);this.yf(n,this.Sf.Vf),this.df=!0;}Tf(){null!==this.Wd&&clearTimeout(this.Wd),this.Fd=0,this.Wd=null,this.jd={et:Number.NEGATIVE_INFINITY,rt:Number.POSITIVE_INFINITY};}kf(){null!==this.$d&&clearTimeout(this.$d),this.Hd=0,this.$d=null,this.Ud={et:Number.NEGATIVE_INFINITY,rt:Number.POSITIVE_INFINITY};}Af(t){if(this._f||null!==this.Kd)return;if(this.mf(t))return;const i=this.bf(t);this.yf(i,this.Sf.Bf),this.df=!0;}If(t){const i=bs(t.changedTouches,b(this.cf));if(null===i)return;if(this.uf=ms(t),null!==this.rf)return;if(this.af)return;this.lf=!0;const n=this.gf(ps(i),b(this.Kd)),{zf:s,Ef:e,wf:r}=n;if(this.Zd||!(r<5)){if(!this.Zd){const t=.5*s,i=e>=t&&!this.cn.Lf(),n=t>e&&!this.cn.Nf();i||n||(this.af=!0),this.Zd=!0,this.Jd=!0,this.Df(),this.kf();}if(!this.af){const n=this.bf(t,i);this.Mf(n,this.Sf.Ff),vs(t);}}}Wf(t){if(0!==t.button)return;const i=this.gf(ps(t),b(this.Xd)),{wf:n}=i;if(n>=5&&(this.Gd=!0,this.Tf()),this.Gd){const i=this.bf(t);this.yf(i,this.Sf.jf);}}gf(t,i){const n=Math.abs(i.et-t.et),s=Math.abs(i.rt-t.rt);return {zf:n,Ef:s,wf:n+s}}Hf(t){let i=bs(t.changedTouches,b(this.cf));if(null===i&&0===t.touches.length&&(i=t.changedTouches[0]),null===i)return;this.cf=null,this.uf=ms(t),this.Df(),this.Kd=null,this.ef&&(this.ef(),this.ef=null);const n=this.bf(t,i);if(this.Mf(n,this.Sf.$f),++this.Hd,this.$d&&this.Hd>1){const{wf:t}=this.gf(ps(i),this.Ud);t<30&&!this.Jd&&this.Mf(n,this.Sf.xf),this.kf();}else this.Jd||(this.Mf(n,this.Sf.Uf),this.Sf.Uf&&vs(t));0===this.Hd&&vs(t),0===t.touches.length&&this.Yd&&(this.Yd=!1,vs(t));}vf(t){if(0!==t.button)return;const i=this.bf(t);if(this.Xd=null,this._f=!1,this.sf&&(this.sf(),this.sf=null),ns()){this.Pf.ownerDocument.documentElement.removeEventListener("mouseleave",this.ff);}if(!this.mf(t))if(this.yf(i,this.Sf.qf),++this.Fd,this.Wd&&this.Fd>1){const{wf:n}=this.gf(ps(t),this.jd);n<5&&!this.Gd&&this.yf(i,this.Sf.Cf),this.Tf();}else this.Gd||this.yf(i,this.Sf.Yf);}Df(){null!==this.qd&&(clearTimeout(this.qd),this.qd=null);}Xf(t){if(null!==this.cf)return;const i=t.changedTouches[0];this.cf=i.identifier,this.uf=ms(t);const n=this.Pf.ownerDocument.documentElement;this.Jd=!1,this.Zd=!1,this.af=!1,this.Kd=ps(i),this.ef&&(this.ef(),this.ef=null);{const i=this.If.bind(this),s=this.Hf.bind(this);this.ef=()=>{n.removeEventListener("touchmove",i),n.removeEventListener("touchend",s);},n.addEventListener("touchmove",i,{passive:!1}),n.addEventListener("touchend",s,{passive:!1}),this.Df(),this.qd=setTimeout(this.Kf.bind(this,t),240);}const s=this.bf(t,i);this.Mf(s,this.Sf.Zf),this.$d||(this.Hd=0,this.$d=setTimeout(this.kf.bind(this),500),this.Ud=ps(i));}Gf(t){if(0!==t.button)return;const i=this.Pf.ownerDocument.documentElement;ns()&&i.addEventListener("mouseleave",this.ff),this.Gd=!1,this.Xd=ps(t),this.sf&&(this.sf(),this.sf=null);{const t=this.Wf.bind(this),n=this.vf.bind(this);this.sf=()=>{i.removeEventListener("mousemove",t),i.removeEventListener("mouseup",n);},i.addEventListener("mousemove",t),i.addEventListener("mouseup",n);}if(this._f=!0,this.mf(t))return;const n=this.bf(t);this.yf(n,this.Sf.Jf),this.Wd||(this.Fd=0,this.Wd=setTimeout(this.Tf.bind(this),500),this.jd=ps(t));}Rf(){this.Pf.addEventListener("mouseenter",this.Of.bind(this)),this.Pf.addEventListener("touchcancel",this.Df.bind(this));{const t=this.Pf.ownerDocument,i=t=>{this.Sf.Qf&&(t.composed&&this.Pf.contains(t.composedPath()[0])||t.target&&this.Pf.contains(t.target)||this.Sf.Qf());};this.tf=()=>{t.removeEventListener("touchstart",i);},this.Qd=()=>{t.removeEventListener("mousedown",i);},t.addEventListener("mousedown",i),t.addEventListener("touchstart",i,{passive:!0});}ss()&&(this.if=()=>{this.Pf.removeEventListener("dblclick",this.pf);},this.Pf.addEventListener("dblclick",this.pf)),this.Pf.addEventListener("mouseleave",this.tv.bind(this)),this.Pf.addEventListener("touchstart",this.Xf.bind(this),{passive:!0}),cs(this.Pf),this.Pf.addEventListener("mousedown",this.Gf.bind(this)),this.iv(),this.Pf.addEventListener("touchmove",(()=>{}),{passive:!1});}iv(){void 0===this.Sf.nv&&void 0===this.Sf.sv&&void 0===this.Sf.ev||(this.Pf.addEventListener("touchstart",(t=>this.rv(t.touches)),{passive:!0}),this.Pf.addEventListener("touchmove",(t=>{if(2===t.touches.length&&null!==this.rf&&void 0!==this.Sf.sv){const i=fs(t.touches[0],t.touches[1])/this.hf;this.Sf.sv(this.rf,i),vs(t);}}),{passive:!1}),this.Pf.addEventListener("touchend",(t=>{this.rv(t.touches);})));}rv(t){1===t.length&&(this.lf=!1),2!==t.length||this.lf||this.Yd?this.hv():this.lv(t);}lv(t){const i=this.Pf.getBoundingClientRect()||{left:0,top:0};this.rf={et:(t[0].clientX-i.left+(t[1].clientX-i.left))/2,rt:(t[0].clientY-i.top+(t[1].clientY-i.top))/2},this.hf=fs(t[0],t[1]),void 0!==this.Sf.nv&&this.Sf.nv(),this.Df();}hv(){null!==this.rf&&(this.rf=null,void 0!==this.Sf.ev&&this.Sf.ev());}tv(t){if(this.nf&&this.nf(),this.mf(t))return;if(!this.df)return;const i=this.bf(t);this.yf(i,this.Sf.av),this.df=!ss();}Kf(t){const i=bs(t.touches,b(this.cf));if(null===i)return;const n=this.bf(t,i);this.Mf(n,this.Sf.ov),this.Jd=!0,this.Yd=!0;}mf(t){return t.sourceCapabilities&&void 0!==t.sourceCapabilities.firesTouchEvents?t.sourceCapabilities.firesTouchEvents:ms(t)<this.uf+500}Mf(t,i){i&&i.call(this.Sf,t);}yf(t,i){i&&i.call(this.Sf,t);}bf(t,i){const n=i||t,s=this.Pf.getBoundingClientRect()||{left:0,top:0};return {clientX:n.clientX,clientY:n.clientY,pageX:n.pageX,pageY:n.pageY,screenX:n.screenX,screenY:n.screenY,localX:n.clientX-s.left,localY:n.clientY-s.top,ctrlKey:t.ctrlKey,altKey:t.altKey,shiftKey:t.shiftKey,metaKey:t.metaKey,_v:!t.type.startsWith("mouse")&&"contextmenu"!==t.type&&"click"!==t.type,uv:t.type,cv:n.target,dv:t.view,fv:()=>{"touchstart"!==t.type&&vs(t);}}}}function fs(t,i){const n=t.clientX-i.clientX,s=t.clientY-i.clientY;return Math.sqrt(n*n+s*s)}function vs(t){t.cancelable&&t.preventDefault();}function ps(t){return {et:t.pageX,rt:t.pageY}}function ms(t){return t.timeStamp||performance.now()}function bs(t,i){for(let n=0;n<t.length;++n)if(t[n].identifier===i)return t[n];return null}function ws(t){return {Bc:t.Bc,vv:{wr:t.pv.externalId},mv:t.pv.cursorStyle}}function gs(t,i,n){for(const s of t){const t=s.xt();if(null!==t&&t.br){const e=t.br(i,n);if(null!==e)return {dv:s,vv:e}}}return null}function Ms(t,i){return n=>{var s,e,r,h;return (null!==(e=null===(s=n.At())||void 0===s?void 0:s.xa())&&void 0!==e?e:"")!==i?[]:null!==(h=null===(r=n.la)||void 0===r?void 0:r.call(n,t))&&void 0!==h?h:[]}}class xs{constructor(i,n,s,e){this.Li=null,this.bv=null,this.wv=!1,this.gv=new si(200),this.Gr=null,this.Mv=0,this.xv=!1,this.Sv=()=>{this.xv||this.nn.kv().qt().Fh();},this.yv=()=>{this.xv||this.nn.kv().qt().Fh();},this.nn=i,this.cn=n,this.mo=n.layout,this.Sc=s,this.Cv="left"===e,this.Tv=Ms("normal",e),this.Pv=Ms("top",e),this.Rv=Ms("bottom",e),this.Dv=document.createElement("div"),this.Dv.style.height="100%",this.Dv.style.overflow="hidden",this.Dv.style.width="25px",this.Dv.style.left="0",this.Dv.style.position="relative",this.Ov=as(this.Dv,size({width:16,height:16})),this.Ov.subscribeSuggestedBitmapSizeChanged(this.Sv);const r=this.Ov.canvasElement;r.style.position="absolute",r.style.zIndex="1",r.style.left="0",r.style.top="0",this.Av=as(this.Dv,size({width:16,height:16})),this.Av.subscribeSuggestedBitmapSizeChanged(this.yv);const h=this.Av.canvasElement;h.style.position="absolute",h.style.zIndex="2",h.style.left="0",h.style.top="0";const l={Jf:this.Vv.bind(this),Zf:this.Vv.bind(this),jf:this.Bv.bind(this),Ff:this.Bv.bind(this),Qf:this.Iv.bind(this),qf:this.zv.bind(this),$f:this.zv.bind(this),Cf:this.Ev.bind(this),xf:this.Ev.bind(this),Vf:this.Lv.bind(this),av:this.Nv.bind(this)};this.Fv=new ds(this.Av.canvasElement,l,{Lf:()=>!1,Nf:()=>!0});}S(){this.Fv.S(),this.Av.unsubscribeSuggestedBitmapSizeChanged(this.yv),this.Av.dispose(),this.Ov.unsubscribeSuggestedBitmapSizeChanged(this.Sv),this.Ov.dispose(),null!==this.Li&&this.Li.$o().p(this),this.Li=null;}Wv(){return this.Dv}P(){return this.mo.fontSize}jv(){const t=this.Sc.W();return this.Gr!==t.R&&(this.gv.ir(),this.Gr=t.R),t}Hv(){if(null===this.Li)return 0;let t=0;const i=this.jv(),n=b(this.Ov.canvasElement.getContext("2d"));n.save();const s=this.Li.Ea();n.font=this.$v(),s.length>0&&(t=Math.max(this.gv.Si(n,s[0].Za),this.gv.Si(n,s[s.length-1].Za)));const e=this.Uv();for(let i=e.length;i--;){const s=this.gv.Si(n,e[i].Jt());s>t&&(t=s);}const r=this.Li.Pt();if(null!==r&&null!==this.bv){const i=this.Li.pn(1,r),s=this.Li.pn(this.bv.height-2,r);t=Math.max(t,this.gv.Si(n,this.Li.Wi(Math.floor(Math.min(i,s))+.11111111111111,r)),this.gv.Si(n,this.Li.Wi(Math.ceil(Math.max(i,s))-.11111111111111,r)));}n.restore();const h=t||34;return es(Math.ceil(i.C+i.T+i.B+i.I+5+h))}qv(t){null!==this.bv&&equalSizes(this.bv,t)||(this.bv=t,this.xv=!0,this.Ov.resizeCanvasElement(t),this.Av.resizeCanvasElement(t),this.xv=!1,this.Dv.style.width=`${t.width}px`,this.Dv.style.height=`${t.height}px`);}Yv(){return b(this.bv).width}Ji(t){this.Li!==t&&(null!==this.Li&&this.Li.$o().p(this),this.Li=t,t.$o().l(this.ao.bind(this),this));}At(){return this.Li}ir(){const t=this.nn.Xv();this.nn.kv().qt().A_(t,b(this.At()));}Kv(t){if(null===this.bv)return;if(1!==t){this.Zv(),this.Ov.applySuggestedBitmapSize();const t=tryCreateCanvasRenderingTarget2D(this.Ov);null!==t&&(t.useBitmapCoordinateSpace((t=>{this.Gv(t),this.Be(t);})),this.nn.Jv(t,this.Rv),this.Qv(t),this.nn.Jv(t,this.Tv),this.tp(t));}this.Av.applySuggestedBitmapSize();const i=tryCreateCanvasRenderingTarget2D(this.Av);null!==i&&(i.useBitmapCoordinateSpace((({context:t,bitmapSize:i})=>{t.clearRect(0,0,i.width,i.height);})),this.ip(i),this.nn.Jv(i,this.Pv));}np(){return this.Ov.bitmapSize}sp(t,i,n){const s=this.np();s.width>0&&s.height>0&&t.drawImage(this.Ov.canvasElement,i,n);}gt(){var t;null===(t=this.Li)||void 0===t||t.Ea();}Vv(t){if(null===this.Li||this.Li.Fi()||!this.cn.handleScale.axisPressedMouseMove.price)return;const i=this.nn.kv().qt(),n=this.nn.Xv();this.wv=!0,i.y_(n,this.Li,t.localY);}Bv(t){if(null===this.Li||!this.cn.handleScale.axisPressedMouseMove.price)return;const i=this.nn.kv().qt(),n=this.nn.Xv(),s=this.Li;i.C_(n,s,t.localY);}Iv(){if(null===this.Li||!this.cn.handleScale.axisPressedMouseMove.price)return;const t=this.nn.kv().qt(),i=this.nn.Xv(),n=this.Li;this.wv&&(this.wv=!1,t.T_(i,n));}zv(t){if(null===this.Li||!this.cn.handleScale.axisPressedMouseMove.price)return;const i=this.nn.kv().qt(),n=this.nn.Xv();this.wv=!1,i.T_(n,this.Li);}Ev(t){this.cn.handleScale.axisDoubleClickReset.price&&this.ir();}Lv(t){if(null===this.Li)return;!this.nn.kv().qt().W().handleScale.axisPressedMouseMove.price||this.Li.ph()||this.Li.Co()||this.ep(1);}Nv(t){this.ep(0);}Uv(){const t=[],i=null===this.Li?void 0:this.Li;return (n=>{for(let s=0;s<n.length;++s){const e=n[s].Rn(this.nn.Xv(),i);for(let i=0;i<e.length;i++)t.push(e[i]);}})(this.nn.Xv().No()),t}Gv({context:t,bitmapSize:i}){const{width:n,height:s}=i,e=this.nn.Xv().qt(),r=e.q(),h=e.ad();r===h?G(t,0,0,n,s,r):it(t,0,0,n,s,r,h);}Be({context:t,bitmapSize:i,horizontalPixelRatio:n}){if(null===this.bv||null===this.Li||!this.Li.W().borderVisible)return;t.fillStyle=this.Li.W().borderColor;const s=Math.max(1,Math.floor(this.jv().C*n));let e;e=this.Cv?i.width-s:0,t.fillRect(e,0,s,i.height);}Qv(t){if(null===this.bv||null===this.Li)return;const i=this.Li.Ea(),n=this.Li.W(),s=this.jv(),e=this.Cv?this.bv.width-s.T:0;n.borderVisible&&n.ticksVisible&&t.useBitmapCoordinateSpace((({context:t,horizontalPixelRatio:r,verticalPixelRatio:h})=>{t.fillStyle=n.borderColor;const l=Math.max(1,Math.floor(h)),a=Math.floor(.5*h),o=Math.round(s.T*r);t.beginPath();for(const n of i)t.rect(Math.floor(e*r),Math.round(n.Aa*h)-a,o,l);t.fill();})),t.useMediaCoordinateSpace((({context:t})=>{var r;t.font=this.$v(),t.fillStyle=null!==(r=n.textColor)&&void 0!==r?r:this.mo.textColor,t.textAlign=this.Cv?"right":"left",t.textBaseline="middle";const h=this.Cv?Math.round(e-s.B):Math.round(e+s.T+s.B),l=i.map((i=>this.gv.xi(t,i.Za)));for(let n=i.length;n--;){const s=i[n];t.fillText(s.Za,h,s.Aa+l[n]);}}));}Zv(){if(null===this.bv||null===this.Li)return;let t=this.bv.height/2;const i=[],n=this.Li.No().slice(),s=this.nn.Xv(),e=this.jv();this.Li===s.vr()&&this.nn.Xv().No().forEach((t=>{s.dr(t)&&n.push(t);}));const r=this.Li.Ta()[0],h=this.Li;n.forEach((n=>{const e=n.Rn(s,h);e.forEach((t=>{t.Vi(null),t.Bi()&&i.push(t);})),r===n&&e.length>0&&(t=e[0].yi());})),i.forEach((t=>t.Vi(t.yi())));this.Li.W().alignLabels&&this.rp(i,e,t);}rp(t,i,n){if(null===this.bv)return;const s=t.filter((t=>t.yi()<=n)),e=t.filter((t=>t.yi()>n));s.sort(((t,i)=>i.yi()-t.yi())),s.length&&e.length&&e.push(s[0]),e.sort(((t,i)=>t.yi()-i.yi()));for(const n of t){const t=Math.floor(n.zt(i)/2),s=n.yi();s>-t&&s<t&&n.Vi(t),s>this.bv.height-t&&s<this.bv.height+t&&n.Vi(this.bv.height-t);}for(let t=1;t<s.length;t++){const n=s[t],e=s[t-1],r=e.zt(i,!1),h=n.yi(),l=e.Ai();h>l-r&&n.Vi(l-r);}for(let t=1;t<e.length;t++){const n=e[t],s=e[t-1],r=s.zt(i,!0),h=n.yi(),l=s.Ai();h<l+r&&n.Vi(l+r);}}tp(t){if(null===this.bv)return;const i=this.Uv(),n=this.jv(),s=this.Cv?"right":"left";i.forEach((i=>{if(i.Ii()){i.xt(b(this.Li)).K(t,n,this.gv,s);}}));}ip(t){if(null===this.bv||null===this.Li)return;const i=this.nn.kv().qt(),n=[],s=this.nn.Xv(),e=i.Nc().Rn(s,this.Li);e.length&&n.push(e);const r=this.jv(),h=this.Cv?"right":"left";n.forEach((i=>{i.forEach((i=>{i.xt(b(this.Li)).K(t,r,this.gv,h);}));}));}ep(t){this.Dv.style.cursor=1===t?"ns-resize":"default";}ao(){const t=this.Hv();this.Mv<t&&this.nn.kv().qt().$l(),this.Mv=t;}$v(){return N(this.mo.fontSize,this.mo.fontFamily)}}function Ss(t,i){var n,s;return null!==(s=null===(n=t.ra)||void 0===n?void 0:n.call(t,i))&&void 0!==s?s:[]}function ks(t,i){var n,s;return null!==(s=null===(n=t.Pn)||void 0===n?void 0:n.call(t,i))&&void 0!==s?s:[]}function ys(t,i){var n,s;return null!==(s=null===(n=t.Qi)||void 0===n?void 0:n.call(t,i))&&void 0!==s?s:[]}function Cs(t,i){var n,s;return null!==(s=null===(n=t.na)||void 0===n?void 0:n.call(t,i))&&void 0!==s?s:[]}class Ts{constructor(i,n){this.bv=size({width:0,height:0}),this.hp=null,this.lp=null,this.ap=null,this.op=!1,this._p=new R,this.up=new R,this.cp=0,this.dp=!1,this.fp=null,this.vp=!1,this.pp=null,this.mp=null,this.xv=!1,this.Sv=()=>{this.xv||null===this.bp||this.Ui().Fh();},this.yv=()=>{this.xv||null===this.bp||this.Ui().Fh();},this.wp=i,this.bp=n,this.bp.I_().l(this.gp.bind(this),this,!0),this.Mp=document.createElement("td"),this.Mp.style.padding="0",this.Mp.style.position="relative";const s=document.createElement("div");s.style.width="100%",s.style.height="100%",s.style.position="relative",s.style.overflow="hidden",this.xp=document.createElement("td"),this.xp.style.padding="0",this.Sp=document.createElement("td"),this.Sp.style.padding="0",this.Mp.appendChild(s),this.Ov=as(s,size({width:16,height:16})),this.Ov.subscribeSuggestedBitmapSizeChanged(this.Sv);const e=this.Ov.canvasElement;e.style.position="absolute",e.style.zIndex="1",e.style.left="0",e.style.top="0",this.Av=as(s,size({width:16,height:16})),this.Av.subscribeSuggestedBitmapSizeChanged(this.yv);const r=this.Av.canvasElement;r.style.position="absolute",r.style.zIndex="2",r.style.left="0",r.style.top="0",this.kp=document.createElement("tr"),this.kp.appendChild(this.xp),this.kp.appendChild(this.Mp),this.kp.appendChild(this.Sp),this.yp(),this.Fv=new ds(this.Av.canvasElement,this,{Lf:()=>null===this.fp&&!this.wp.W().handleScroll.vertTouchDrag,Nf:()=>null===this.fp&&!this.wp.W().handleScroll.horzTouchDrag});}S(){null!==this.hp&&this.hp.S(),null!==this.lp&&this.lp.S(),this.Av.unsubscribeSuggestedBitmapSizeChanged(this.yv),this.Av.dispose(),this.Ov.unsubscribeSuggestedBitmapSizeChanged(this.Sv),this.Ov.dispose(),null!==this.bp&&this.bp.I_().p(this),this.Fv.S();}Xv(){return b(this.bp)}Cp(t){null!==this.bp&&this.bp.I_().p(this),this.bp=t,null!==this.bp&&this.bp.I_().l(Ts.prototype.gp.bind(this),this,!0),this.yp();}kv(){return this.wp}Wv(){return this.kp}yp(){if(null!==this.bp&&(this.Tp(),0!==this.Ui().Mt().length)){if(null!==this.hp){const t=this.bp.S_();this.hp.Ji(b(t));}if(null!==this.lp){const t=this.bp.k_();this.lp.Ji(b(t));}}}Pp(){null!==this.hp&&this.hp.gt(),null!==this.lp&&this.lp.gt();}v_(){return null!==this.bp?this.bp.v_():0}p_(t){this.bp&&this.bp.p_(t);}Vf(t){if(!this.bp)return;this.Rp();const i=t.localX,n=t.localY;this.Dp(i,n,t);}Jf(t){this.Rp(),this.Op(),this.Dp(t.localX,t.localY,t);}Bf(t){var i;if(!this.bp)return;this.Rp();const n=t.localX,s=t.localY;this.Dp(n,s,t);const e=this.br(n,s);this.wp.Ap(null!==(i=null==e?void 0:e.mv)&&void 0!==i?i:null),this.Ui().Vc(e&&{Bc:e.Bc,vv:e.vv});}Yf(t){null!==this.bp&&(this.Rp(),this.Vp(t));}Cf(t){null!==this.bp&&this.Bp(this.up,t);}xf(t){this.Cf(t);}jf(t){this.Rp(),this.Ip(t),this.Dp(t.localX,t.localY,t);}qf(t){null!==this.bp&&(this.Rp(),this.dp=!1,this.zp(t));}Uf(t){null!==this.bp&&this.Vp(t);}ov(t){if(this.dp=!0,null===this.fp){const i={x:t.localX,y:t.localY};this.Ep(i,i,t);}}av(t){null!==this.bp&&(this.Rp(),this.bp.qt().Vc(null),this.Lp());}Np(){return this._p}Fp(){return this.up}nv(){this.cp=1,this.Ui().Un();}sv(t,i){if(!this.wp.W().handleScale.pinch)return;const n=5*(i-this.cp);this.cp=i,this.Ui().$c(t.et,n);}Zf(t){this.dp=!1,this.vp=null!==this.fp,this.Op();const i=this.Ui().Nc();null!==this.fp&&i.Tt()&&(this.pp={x:i.Kt(),y:i.Zt()},this.fp={x:t.localX,y:t.localY});}Ff(t){if(null===this.bp)return;const i=t.localX,n=t.localY;if(null===this.fp)this.Ip(t);else {this.vp=!1;const s=b(this.pp),e=s.x+(i-this.fp.x),r=s.y+(n-this.fp.y);this.Dp(e,r,t);}}$f(t){0===this.kv().W().trackingMode.exitMode&&(this.vp=!0),this.Wp(),this.zp(t);}br(t,i){const n=this.bp;return null===n?null:function(t,i,n){const s=t.No(),e=function(t,i,n){var s,e;let r,h;for(const o of t){const t=null!==(e=null===(s=o.oa)||void 0===s?void 0:s.call(o,i,n))&&void 0!==e?e:[];for(const i of t)l=i.zOrder,(!(a=null==r?void 0:r.zOrder)||"top"===l&&"top"!==a||"normal"===l&&"bottom"===a)&&(r=i,h=o);}var l,a;return r&&h?{pv:r,Bc:h}:null}(s,i,n);if("top"===(null==e?void 0:e.pv.zOrder))return ws(e);for(const r of s){if(e&&e.Bc===r&&"bottom"!==e.pv.zOrder&&!e.pv.isBackground)return ws(e);const s=gs(r.Pn(t),i,n);if(null!==s)return {Bc:r,dv:s.dv,vv:s.vv};if(e&&e.Bc===r&&"bottom"!==e.pv.zOrder&&e.pv.isBackground)return ws(e)}return (null==e?void 0:e.pv)?ws(e):null}(n,t,i)}jp(i,n){b("left"===n?this.hp:this.lp).qv(size({width:i,height:this.bv.height}));}Hp(){return this.bv}qv(t){equalSizes(this.bv,t)||(this.bv=t,this.xv=!0,this.Ov.resizeCanvasElement(t),this.Av.resizeCanvasElement(t),this.xv=!1,this.Mp.style.width=t.width+"px",this.Mp.style.height=t.height+"px");}$p(){const t=b(this.bp);t.x_(t.S_()),t.x_(t.k_());for(const i of t.Ta())if(t.dr(i)){const n=i.At();null!==n&&t.x_(n),i.On();}}np(){return this.Ov.bitmapSize}sp(t,i,n){const s=this.np();s.width>0&&s.height>0&&t.drawImage(this.Ov.canvasElement,i,n);}Kv(t){if(0===t)return;if(null===this.bp)return;if(t>1&&this.$p(),null!==this.hp&&this.hp.Kv(t),null!==this.lp&&this.lp.Kv(t),1!==t){this.Ov.applySuggestedBitmapSize();const t=tryCreateCanvasRenderingTarget2D(this.Ov);null!==t&&(t.useBitmapCoordinateSpace((t=>{this.Gv(t);})),this.bp&&(this.Up(t,Ss),this.qp(t),this.Yp(t),this.Up(t,ks),this.Up(t,ys)));}this.Av.applySuggestedBitmapSize();const i=tryCreateCanvasRenderingTarget2D(this.Av);null!==i&&(i.useBitmapCoordinateSpace((({context:t,bitmapSize:i})=>{t.clearRect(0,0,i.width,i.height);})),this.Xp(i),this.Up(i,Cs));}Kp(){return this.hp}Zp(){return this.lp}Jv(t,i){this.Up(t,i);}gp(){null!==this.bp&&this.bp.I_().p(this),this.bp=null;}Vp(t){this.Bp(this._p,t);}Bp(t,i){const n=i.localX,s=i.localY;t.M()&&t.m(this.Ui().yt().Au(n),{x:n,y:s},i);}Gv({context:t,bitmapSize:i}){const{width:n,height:s}=i,e=this.Ui(),r=e.q(),h=e.ad();r===h?G(t,0,0,n,s,h):it(t,0,0,n,s,r,h);}qp(t){const i=b(this.bp).z_().Wh().xt();null!==i&&i.K(t,!1);}Yp(t){const i=this.Ui().Lc();this.Gp(t,ks,os,i),this.Gp(t,ks,_s,i);}Xp(t){this.Gp(t,ks,_s,this.Ui().Nc());}Up(t,i){const n=b(this.bp).No();for(const s of n)this.Gp(t,i,os,s);for(const s of n)this.Gp(t,i,_s,s);}Gp(t,i,n,s){const e=b(this.bp),r=e.qt().Ac(),h=null!==r&&r.Bc===s,l=null!==r&&h&&void 0!==r.vv?r.vv.gr:void 0;us(i,(i=>n(i,t,h,l)),s,e);}Tp(){if(null===this.bp)return;const t=this.wp,i=this.bp.S_().W().visible,n=this.bp.k_().W().visible;i||null===this.hp||(this.xp.removeChild(this.hp.Wv()),this.hp.S(),this.hp=null),n||null===this.lp||(this.Sp.removeChild(this.lp.Wv()),this.lp.S(),this.lp=null);const s=t.qt().nd();i&&null===this.hp&&(this.hp=new xs(this,t.W(),s,"left"),this.xp.appendChild(this.hp.Wv())),n&&null===this.lp&&(this.lp=new xs(this,t.W(),s,"right"),this.Sp.appendChild(this.lp.Wv()));}Jp(t){return t._v&&this.dp||null!==this.fp}Qp(t){return Math.max(0,Math.min(t,this.bv.width-1))}tm(t){return Math.max(0,Math.min(t,this.bv.height-1))}Dp(t,i,n){this.Ui().Gc(this.Qp(t),this.tm(i),n,b(this.bp));}Lp(){this.Ui().Qc();}Wp(){this.vp&&(this.fp=null,this.Lp());}Ep(t,i,n){this.fp=t,this.vp=!1,this.Dp(i.x,i.y,n);const s=this.Ui().Nc();this.pp={x:s.Kt(),y:s.Zt()};}Ui(){return this.wp.qt()}zp(t){if(!this.op)return;const i=this.Ui(),n=this.Xv();if(i.D_(n,n.vn()),this.ap=null,this.op=!1,i.Xc(),null!==this.mp){const t=performance.now(),n=i.yt();this.mp.Dr(n.zu(),t),this.mp.qu(t)||i.Xn(this.mp);}}Rp(){this.fp=null;}Op(){if(!this.bp)return;if(this.Ui().Un(),document.activeElement!==document.body&&document.activeElement!==document.documentElement)b(document.activeElement).blur();else {const t=document.getSelection();null!==t&&t.removeAllRanges();}!this.bp.vn().Fi()&&this.Ui().yt().Fi();}Ip(t){if(null===this.bp)return;const i=this.Ui(),n=i.yt();if(n.Fi())return;const s=this.wp.W(),e=s.handleScroll,r=s.kineticScroll;if((!e.pressedMouseMove||t._v)&&(!e.horzTouchDrag&&!e.vertTouchDrag||!t._v))return;const h=this.bp.vn(),l=performance.now();if(null!==this.ap||this.Jp(t)||(this.ap={x:t.clientX,y:t.clientY,Sd:l,im:t.localX,nm:t.localY}),null!==this.ap&&!this.op&&(this.ap.x!==t.clientX||this.ap.y!==t.clientY)){if(t._v&&r.touch||!t._v&&r.mouse){const t=n.he();this.mp=new ls(.2/t,7/t,.997,15/t),this.mp.Ld(n.zu(),this.ap.Sd);}else this.mp=null;h.Fi()||i.P_(this.bp,h,t.localY),i.qc(t.localX),this.op=!0;}this.op&&(h.Fi()||i.R_(this.bp,h,t.localY),i.Yc(t.localX),null!==this.mp&&this.mp.Ld(n.zu(),l));}}class Ps{constructor(i,n,s,e,r){this.bt=!0,this.bv=size({width:0,height:0}),this.Sv=()=>this.Kv(3),this.Cv="left"===i,this.Sc=s.nd,this.cn=n,this.sm=e,this.rm=r,this.Dv=document.createElement("div"),this.Dv.style.width="25px",this.Dv.style.height="100%",this.Dv.style.overflow="hidden",this.Ov=as(this.Dv,size({width:16,height:16})),this.Ov.subscribeSuggestedBitmapSizeChanged(this.Sv);}S(){this.Ov.unsubscribeSuggestedBitmapSizeChanged(this.Sv),this.Ov.dispose();}Wv(){return this.Dv}Hp(){return this.bv}qv(t){equalSizes(this.bv,t)||(this.bv=t,this.Ov.resizeCanvasElement(t),this.Dv.style.width=`${t.width}px`,this.Dv.style.height=`${t.height}px`,this.bt=!0);}Kv(t){if(t<3&&!this.bt)return;if(0===this.bv.width||0===this.bv.height)return;this.bt=!1,this.Ov.applySuggestedBitmapSize();const i=tryCreateCanvasRenderingTarget2D(this.Ov);null!==i&&i.useBitmapCoordinateSpace((t=>{this.Gv(t),this.Be(t);}));}np(){return this.Ov.bitmapSize}sp(t,i,n){const s=this.np();s.width>0&&s.height>0&&t.drawImage(this.Ov.canvasElement,i,n);}Be({context:t,bitmapSize:i,horizontalPixelRatio:n,verticalPixelRatio:s}){if(!this.sm())return;t.fillStyle=this.cn.timeScale.borderColor;const e=Math.floor(this.Sc.W().C*n),r=Math.floor(this.Sc.W().C*s),h=this.Cv?i.width-e:0;t.fillRect(h,0,e,r);}Gv({context:t,bitmapSize:i}){G(t,0,0,i.width,i.height,this.rm());}}function Rs(t){return i=>{var n,s;return null!==(s=null===(n=i.aa)||void 0===n?void 0:n.call(i,t))&&void 0!==s?s:[]}}const Ds=Rs("normal"),Os=Rs("top"),As=Rs("bottom");class Vs{constructor(i,n){this.hm=null,this.lm=null,this.k=null,this.am=!1,this.bv=size({width:0,height:0}),this.om=new R,this.gv=new si(5),this.xv=!1,this.Sv=()=>{this.xv||this.wp.qt().Fh();},this.yv=()=>{this.xv||this.wp.qt().Fh();},this.wp=i,this.N_=n,this.cn=i.W().layout,this._m=document.createElement("tr"),this.um=document.createElement("td"),this.um.style.padding="0",this.dm=document.createElement("td"),this.dm.style.padding="0",this.Dv=document.createElement("td"),this.Dv.style.height="25px",this.Dv.style.padding="0",this.fm=document.createElement("div"),this.fm.style.width="100%",this.fm.style.height="100%",this.fm.style.position="relative",this.fm.style.overflow="hidden",this.Dv.appendChild(this.fm),this.Ov=as(this.fm,size({width:16,height:16})),this.Ov.subscribeSuggestedBitmapSizeChanged(this.Sv);const s=this.Ov.canvasElement;s.style.position="absolute",s.style.zIndex="1",s.style.left="0",s.style.top="0",this.Av=as(this.fm,size({width:16,height:16})),this.Av.subscribeSuggestedBitmapSizeChanged(this.yv);const e=this.Av.canvasElement;e.style.position="absolute",e.style.zIndex="2",e.style.left="0",e.style.top="0",this._m.appendChild(this.um),this._m.appendChild(this.Dv),this._m.appendChild(this.dm),this.vm(),this.wp.qt().f_().l(this.vm.bind(this),this),this.Fv=new ds(this.Av.canvasElement,this,{Lf:()=>!0,Nf:()=>!1});}S(){this.Fv.S(),null!==this.hm&&this.hm.S(),null!==this.lm&&this.lm.S(),this.Av.unsubscribeSuggestedBitmapSizeChanged(this.yv),this.Av.dispose(),this.Ov.unsubscribeSuggestedBitmapSizeChanged(this.Sv),this.Ov.dispose();}Wv(){return this._m}pm(){return this.hm}bm(){return this.lm}Jf(t){if(this.am)return;this.am=!0;const i=this.wp.qt();!i.yt().Fi()&&this.wp.W().handleScale.axisPressedMouseMove.time&&i.Hc(t.localX);}Zf(t){this.Jf(t);}Qf(){const t=this.wp.qt();!t.yt().Fi()&&this.am&&(this.am=!1,this.wp.W().handleScale.axisPressedMouseMove.time&&t.Zc());}jf(t){const i=this.wp.qt();!i.yt().Fi()&&this.wp.W().handleScale.axisPressedMouseMove.time&&i.Kc(t.localX);}Ff(t){this.jf(t);}qf(){this.am=!1;const t=this.wp.qt();t.yt().Fi()&&!this.wp.W().handleScale.axisPressedMouseMove.time||t.Zc();}$f(){this.qf();}Cf(){this.wp.W().handleScale.axisDoubleClickReset.time&&this.wp.qt().Zn();}xf(){this.Cf();}Vf(){this.wp.qt().W().handleScale.axisPressedMouseMove.time&&this.ep(1);}av(){this.ep(0);}Hp(){return this.bv}wm(){return this.om}gm(i,s,e){equalSizes(this.bv,i)||(this.bv=i,this.xv=!0,this.Ov.resizeCanvasElement(i),this.Av.resizeCanvasElement(i),this.xv=!1,this.Dv.style.width=`${i.width}px`,this.Dv.style.height=`${i.height}px`,this.om.m(i)),null!==this.hm&&this.hm.qv(size({width:s,height:i.height})),null!==this.lm&&this.lm.qv(size({width:e,height:i.height}));}Mm(){const t=this.xm();return Math.ceil(t.C+t.T+t.P+t.L+t.V+t.Sm)}gt(){this.wp.qt().yt().Ea();}np(){return this.Ov.bitmapSize}sp(t,i,n){const s=this.np();s.width>0&&s.height>0&&t.drawImage(this.Ov.canvasElement,i,n);}Kv(t){if(0===t)return;if(1!==t){this.Ov.applySuggestedBitmapSize();const i=tryCreateCanvasRenderingTarget2D(this.Ov);null!==i&&(i.useBitmapCoordinateSpace((t=>{this.Gv(t),this.Be(t),this.km(i,As);})),this.Qv(i),this.km(i,Ds)),null!==this.hm&&this.hm.Kv(t),null!==this.lm&&this.lm.Kv(t);}this.Av.applySuggestedBitmapSize();const i=tryCreateCanvasRenderingTarget2D(this.Av);null!==i&&(i.useBitmapCoordinateSpace((({context:t,bitmapSize:i})=>{t.clearRect(0,0,i.width,i.height);})),this.ym([...this.wp.qt().Mt(),this.wp.qt().Nc()],i),this.km(i,Os));}km(t,i){const n=this.wp.qt().Mt();for(const s of n)us(i,(i=>os(i,t,!1,void 0)),s,void 0);for(const s of n)us(i,(i=>_s(i,t,!1,void 0)),s,void 0);}Gv({context:t,bitmapSize:i}){G(t,0,0,i.width,i.height,this.wp.qt().ad());}Be({context:t,bitmapSize:i,verticalPixelRatio:n}){if(this.wp.W().timeScale.borderVisible){t.fillStyle=this.Cm();const s=Math.max(1,Math.floor(this.xm().C*n));t.fillRect(0,0,i.width,s);}}Qv(t){const i=this.wp.qt().yt(),n=i.Ea();if(!n||0===n.length)return;const s=this.N_.maxTickMarkWeight(n),e=this.xm(),r=i.W();r.borderVisible&&r.ticksVisible&&t.useBitmapCoordinateSpace((({context:t,horizontalPixelRatio:i,verticalPixelRatio:s})=>{t.strokeStyle=this.Cm(),t.fillStyle=this.Cm();const r=Math.max(1,Math.floor(i)),h=Math.floor(.5*i);t.beginPath();const l=Math.round(e.T*s);for(let s=n.length;s--;){const e=Math.round(n[s].coord*i);t.rect(e-h,0,r,l);}t.fill();})),t.useMediaCoordinateSpace((({context:t})=>{const i=e.C+e.T+e.L+e.P/2;t.textAlign="center",t.textBaseline="middle",t.fillStyle=this.$(),t.font=this.$v();for(const e of n)if(e.weight<s){const n=e.needAlignCoordinate?this.Tm(t,e.coord,e.label):e.coord;t.fillText(e.label,n,i);}t.font=this.Pm();for(const e of n)if(e.weight>=s){const n=e.needAlignCoordinate?this.Tm(t,e.coord,e.label):e.coord;t.fillText(e.label,n,i);}}));}Tm(t,i,n){const s=this.gv.Si(t,n),e=s/2,r=Math.floor(i-e)+.5;return r<0?i+=Math.abs(0-r):r+s>this.bv.width&&(i-=Math.abs(this.bv.width-(r+s))),i}ym(t,i){const n=this.xm();for(const s of t)for(const t of s.tn())t.xt().K(i,n);}Cm(){return this.wp.W().timeScale.borderColor}$(){return this.cn.textColor}j(){return this.cn.fontSize}$v(){return N(this.j(),this.cn.fontFamily)}Pm(){return N(this.j(),this.cn.fontFamily,"bold")}xm(){null===this.k&&(this.k={C:1,N:NaN,L:NaN,V:NaN,Hi:NaN,T:5,P:NaN,R:"",ji:new si,Sm:0});const t=this.k,i=this.$v();if(t.R!==i){const n=this.j();t.P=n,t.R=i,t.L=3*n/12,t.V=3*n/12,t.Hi=9*n/12,t.N=0,t.Sm=4*n/12,t.ji.ir();}return this.k}ep(t){this.Dv.style.cursor=1===t?"ew-resize":"default";}vm(){const t=this.wp.qt(),i=t.W();i.leftPriceScale.visible||null===this.hm||(this.um.removeChild(this.hm.Wv()),this.hm.S(),this.hm=null),i.rightPriceScale.visible||null===this.lm||(this.dm.removeChild(this.lm.Wv()),this.lm.S(),this.lm=null);const n={nd:this.wp.qt().nd()},s=()=>i.leftPriceScale.borderVisible&&t.yt().W().borderVisible,e=()=>t.ad();i.leftPriceScale.visible&&null===this.hm&&(this.hm=new Ps("left",i,n,s,e),this.um.appendChild(this.hm.Wv())),i.rightPriceScale.visible&&null===this.lm&&(this.lm=new Ps("right",i,n,s,e),this.dm.appendChild(this.lm.Wv()));}}const Bs=!!is&&!!navigator.userAgentData&&navigator.userAgentData.brands.some((t=>t.brand.includes("Chromium")))&&!!is&&((null===(Is=null===navigator||void 0===navigator?void 0:navigator.userAgentData)||void 0===Is?void 0:Is.platform)?"Windows"===navigator.userAgentData.platform:navigator.userAgent.toLowerCase().indexOf("win")>=0);var Is;class zs{constructor(t,i,n){var s;this.Rm=[],this.Dm=0,this.Qa=0,this.e_=0,this.Om=0,this.Am=0,this.Vm=null,this.Bm=!1,this._p=new R,this.up=new R,this.gc=new R,this.Im=null,this.zm=null,this.Em=t,this.cn=i,this.N_=n,this._m=document.createElement("div"),this._m.classList.add("tv-lightweight-charts"),this._m.style.overflow="hidden",this._m.style.direction="ltr",this._m.style.width="100%",this._m.style.height="100%",(s=this._m).style.userSelect="none",s.style.webkitUserSelect="none",s.style.msUserSelect="none",s.style.MozUserSelect="none",s.style.webkitTapHighlightColor="transparent",this.Lm=document.createElement("table"),this.Lm.setAttribute("cellspacing","0"),this._m.appendChild(this.Lm),this.Nm=this.Fm.bind(this),Es(this.cn)&&this.Wm(!0),this.Ui=new zn(this.xc.bind(this),this.cn,n),this.qt().Fc().l(this.jm.bind(this),this),this.Hm=new Vs(this,this.N_),this.Lm.appendChild(this.Hm.Wv());const e=i.autoSize&&this.$m();let r=this.cn.width,h=this.cn.height;if(e||0===r||0===h){const i=t.getBoundingClientRect();r=r||i.width,h=h||i.height;}this.Um(r,h),this.qm(),t.appendChild(this._m),this.Ym(),this.Ui.yt().Zu().l(this.Ui.$l.bind(this.Ui),this),this.Ui.f_().l(this.Ui.$l.bind(this.Ui),this);}qt(){return this.Ui}W(){return this.cn}Xm(){return this.Rm}Km(){return this.Hm}S(){this.Wm(!1),0!==this.Dm&&window.cancelAnimationFrame(this.Dm),this.Ui.Fc().p(this),this.Ui.yt().Zu().p(this),this.Ui.f_().p(this),this.Ui.S();for(const t of this.Rm)this.Lm.removeChild(t.Wv()),t.Np().p(this),t.Fp().p(this),t.S();this.Rm=[],b(this.Hm).S(),null!==this._m.parentElement&&this._m.parentElement.removeChild(this._m),this.gc.S(),this._p.S(),this.up.S(),this.Zm();}Um(i,n,s=!1){if(this.Qa===n&&this.e_===i)return;const e=function(i){const n=Math.floor(i.width),s=Math.floor(i.height);return size({width:n-n%2,height:s-s%2})}(size({width:i,height:n}));this.Qa=e.height,this.e_=e.width;const r=this.Qa+"px",h=this.e_+"px";b(this._m).style.height=r,b(this._m).style.width=h,this.Lm.style.height=r,this.Lm.style.width=h,s?this.Gm(ct.es(),performance.now()):this.Ui.$l();}Kv(t){void 0===t&&(t=ct.es());for(let i=0;i<this.Rm.length;i++)this.Rm[i].Kv(t.Hn(i).Fn);this.cn.timeScale.visible&&this.Hm.Kv(t.jn());}Nh(t){const i=Es(this.cn);this.Ui.Nh(t);const n=Es(this.cn);n!==i&&this.Wm(n),this.Ym(),this.Jm(t);}Np(){return this._p}Fp(){return this.up}Fc(){return this.gc}Qm(){null!==this.Vm&&(this.Gm(this.Vm,performance.now()),this.Vm=null);const t=this.tb(null),i=document.createElement("canvas");i.width=t.width,i.height=t.height;const n=b(i.getContext("2d"));return this.tb(n),i}ib(t){if("left"===t&&!this.nb())return 0;if("right"===t&&!this.sb())return 0;if(0===this.Rm.length)return 0;return b("left"===t?this.Rm[0].Kp():this.Rm[0].Zp()).Yv()}eb(){return this.cn.autoSize&&null!==this.Im}rb(){return this._m}Ap(t){this.zm=t,this.zm?this.rb().style.setProperty("cursor",t):this.rb().style.removeProperty("cursor");}hb(){return this.zm}lb(){return m(this.Rm[0]).Hp()}Jm(t){(void 0!==t.autoSize||!this.Im||void 0===t.width&&void 0===t.height)&&(t.autoSize&&!this.Im&&this.$m(),!1===t.autoSize&&null!==this.Im&&this.Zm(),t.autoSize||void 0===t.width&&void 0===t.height||this.Um(t.width||this.e_,t.height||this.Qa));}tb(i){let n=0,s=0;const e=this.Rm[0],r=(t,n)=>{let s=0;for(let e=0;e<this.Rm.length;e++){const r=this.Rm[e],h=b("left"===t?r.Kp():r.Zp()),l=h.np();null!==i&&h.sp(i,n,s),s+=l.height;}};if(this.nb()){r("left",0);n+=b(e.Kp()).np().width;}for(let t=0;t<this.Rm.length;t++){const e=this.Rm[t],r=e.np();null!==i&&e.sp(i,n,s),s+=r.height;}if(n+=e.np().width,this.sb()){r("right",n);n+=b(e.Zp()).np().width;}const h=(t,n,s)=>{b("left"===t?this.Hm.pm():this.Hm.bm()).sp(b(i),n,s);};if(this.cn.timeScale.visible){const t=this.Hm.np();if(null!==i){let n=0;this.nb()&&(h("left",n,s),n=b(e.Kp()).np().width),this.Hm.sp(i,n,s),n+=t.width,this.sb()&&h("right",n,s);}s+=t.height;}return size({width:n,height:s})}ab(){let i=0,n=0,s=0;for(const t of this.Rm)this.nb()&&(n=Math.max(n,b(t.Kp()).Hv(),this.cn.leftPriceScale.minimumWidth)),this.sb()&&(s=Math.max(s,b(t.Zp()).Hv(),this.cn.rightPriceScale.minimumWidth)),i+=t.v_();n=es(n),s=es(s);const e=this.e_,r=this.Qa,h=Math.max(e-n-s,0),l=this.cn.timeScale.visible;let a=l?Math.max(this.Hm.Mm(),this.cn.timeScale.minimumHeight):0;var o;a=(o=a)+o%2;const _=0+a,u=r<_?0:r-_,c=u/i;let d=0;for(let i=0;i<this.Rm.length;++i){const e=this.Rm[i];e.Cp(this.Ui.Ec()[i]);let r=0,l=0;l=i===this.Rm.length-1?u-d:Math.round(e.v_()*c),r=Math.max(l,2),d+=r,e.qv(size({width:h,height:r})),this.nb()&&e.jp(n,"left"),this.sb()&&e.jp(s,"right"),e.Xv()&&this.Ui.Wc(e.Xv(),r);}this.Hm.gm(size({width:l?h:0,height:a}),l?n:0,l?s:0),this.Ui.m_(h),this.Om!==n&&(this.Om=n),this.Am!==s&&(this.Am=s);}Wm(t){t?this._m.addEventListener("wheel",this.Nm,{passive:!1}):this._m.removeEventListener("wheel",this.Nm);}ob(t){switch(t.deltaMode){case t.DOM_DELTA_PAGE:return 120;case t.DOM_DELTA_LINE:return 32}return Bs?1/window.devicePixelRatio:1}Fm(t){if(!(0!==t.deltaX&&this.cn.handleScroll.mouseWheel||0!==t.deltaY&&this.cn.handleScale.mouseWheel))return;const i=this.ob(t),n=i*t.deltaX/100,s=-i*t.deltaY/100;if(t.cancelable&&t.preventDefault(),0!==s&&this.cn.handleScale.mouseWheel){const i=Math.sign(s)*Math.min(1,Math.abs(s)),n=t.clientX-this._m.getBoundingClientRect().left;this.qt().$c(n,i);}0!==n&&this.cn.handleScroll.mouseWheel&&this.qt().Uc(-80*n);}Gm(t,i){var n;const s=t.jn();3===s&&this._b(),3!==s&&2!==s||(this.ub(t),this.cb(t,i),this.Hm.gt(),this.Rm.forEach((t=>{t.Pp();})),3===(null===(n=this.Vm)||void 0===n?void 0:n.jn())&&(this.Vm.ts(t),this._b(),this.ub(this.Vm),this.cb(this.Vm,i),t=this.Vm,this.Vm=null)),this.Kv(t);}cb(t,i){for(const n of t.Qn())this.ns(n,i);}ub(t){const i=this.Ui.Ec();for(let n=0;n<i.length;n++)t.Hn(n).Wn&&i[n].V_();}ns(t,i){const n=this.Ui.yt();switch(t.qn){case 0:n.Ju();break;case 1:n.Qu(t.Vt);break;case 2:n.Gn(t.Vt);break;case 3:n.Jn(t.Vt);break;case 4:n.Nu();break;case 5:t.Vt.qu(i)||n.Jn(t.Vt.Yu(i));}}xc(t){null!==this.Vm?this.Vm.ts(t):this.Vm=t,this.Bm||(this.Bm=!0,this.Dm=window.requestAnimationFrame((t=>{if(this.Bm=!1,this.Dm=0,null!==this.Vm){const i=this.Vm;this.Vm=null,this.Gm(i,t);for(const n of i.Qn())if(5===n.qn&&!n.Vt.qu(t)){this.qt().Xn(n.Vt);break}}})));}_b(){this.qm();}qm(){const t=this.Ui.Ec(),i=t.length,n=this.Rm.length;for(let t=i;t<n;t++){const t=m(this.Rm.pop());this.Lm.removeChild(t.Wv()),t.Np().p(this),t.Fp().p(this),t.S();}for(let s=n;s<i;s++){const i=new Ts(this,t[s]);i.Np().l(this.fb.bind(this),this),i.Fp().l(this.vb.bind(this),this),this.Rm.push(i),this.Lm.insertBefore(i.Wv(),this.Hm.Wv());}for(let n=0;n<i;n++){const i=t[n],s=this.Rm[n];s.Xv()!==i?s.Cp(i):s.yp();}this.Ym(),this.ab();}pb(t,i,n){var s;const e=new Map;if(null!==t){this.Ui.Mt().forEach((i=>{const n=i.In().nl(t);null!==n&&e.set(i,n);}));}let r;if(null!==t){const i=null===(s=this.Ui.yt().qi(t))||void 0===s?void 0:s.originalTime;void 0!==i&&(r=i);}const h=this.qt().Ac(),l=null!==h&&h.Bc instanceof Gi?h.Bc:void 0,a=null!==h&&void 0!==h.vv?h.vv.wr:void 0;return {mb:r,se:null!=t?t:void 0,bb:null!=i?i:void 0,wb:l,gb:e,Mb:a,xb:null!=n?n:void 0}}fb(t,i,n){this._p.m((()=>this.pb(t,i,n)));}vb(t,i,n){this.up.m((()=>this.pb(t,i,n)));}jm(t,i,n){this.gc.m((()=>this.pb(t,i,n)));}Ym(){const t=this.cn.timeScale.visible?"":"none";this.Hm.Wv().style.display=t;}nb(){return this.Rm[0].Xv().S_().W().visible}sb(){return this.Rm[0].Xv().k_().W().visible}$m(){return "ResizeObserver"in window&&(this.Im=new ResizeObserver((t=>{const i=t.find((t=>t.target===this.Em));i&&this.Um(i.contentRect.width,i.contentRect.height);})),this.Im.observe(this.Em,{box:"border-box"}),!0)}Zm(){null!==this.Im&&this.Im.disconnect(),this.Im=null;}}function Es(t){return Boolean(t.handleScroll.mouseWheel||t.handleScale.mouseWheel)}function Ls(t,i){var n={};for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&i.indexOf(s)<0&&(n[s]=t[s]);if(null!=t&&"function"==typeof Object.getOwnPropertySymbols){var e=0;for(s=Object.getOwnPropertySymbols(t);e<s.length;e++)i.indexOf(s[e])<0&&Object.prototype.propertyIsEnumerable.call(t,s[e])&&(n[s[e]]=t[s[e]]);}return n}function Ns(t,i,n,s){const e=n.value,r={se:i,ut:t,Vt:[e,e,e,e],mb:s};return void 0!==n.color&&(r.O=n.color),r}function Fs(t,i,n,s){const e=n.value,r={se:i,ut:t,Vt:[e,e,e,e],mb:s};return void 0!==n.lineColor&&(r._t=n.lineColor),void 0!==n.topColor&&(r.Ts=n.topColor),void 0!==n.bottomColor&&(r.Ps=n.bottomColor),r}function Ws(t,i,n,s){const e=n.value,r={se:i,ut:t,Vt:[e,e,e,e],mb:s};return void 0!==n.topLineColor&&(r.Pe=n.topLineColor),void 0!==n.bottomLineColor&&(r.Re=n.bottomLineColor),void 0!==n.topFillColor1&&(r.Se=n.topFillColor1),void 0!==n.topFillColor2&&(r.ke=n.topFillColor2),void 0!==n.bottomFillColor1&&(r.ye=n.bottomFillColor1),void 0!==n.bottomFillColor2&&(r.Ce=n.bottomFillColor2),r}function js(t,i,n,s){const e={se:i,ut:t,Vt:[n.open,n.high,n.low,n.close],mb:s};return void 0!==n.color&&(e.O=n.color),e}function Hs(t,i,n,s){const e={se:i,ut:t,Vt:[n.open,n.high,n.low,n.close],mb:s};return void 0!==n.color&&(e.O=n.color),void 0!==n.borderColor&&(e.Bt=n.borderColor),void 0!==n.wickColor&&(e.$h=n.wickColor),e}function $s(t,i,n,s,e){const r=m(e)(n),h=Math.max(...r),l=Math.min(...r),a=r[r.length-1],o=[a,h,l,a],_=n,{time:u,color:c}=_;return {se:i,ut:t,Vt:o,mb:s,He:Ls(_,["time","color"]),O:c}}function Us(t){return void 0!==t.Vt}function qs(t,i){return void 0!==i.customValues&&(t.Sb=i.customValues),t}function Ys(t){return (i,n,s,e,r,h)=>function(t,i){return i?i(t):void 0===(n=t).open&&void 0===n.value;var n;}(s,h)?qs({ut:i,se:n,mb:e},s):qs(t(i,n,s,e,r),s)}function Xs(t){return {Candlestick:Ys(Hs),Bar:Ys(js),Area:Ys(Fs),Baseline:Ys(Ws),Histogram:Ys(Ns),Line:Ys(Ns),Custom:Ys($s)}[t]}function Ks(t){return {se:0,kb:new Map,ia:t}}function Zs(t,i){if(void 0!==t&&0!==t.length)return {yb:i.key(t[0].ut),Cb:i.key(t[t.length-1].ut)}}function Gs(t){let i;return t.forEach((t=>{void 0===i&&(i=t.mb);})),m(i)}class Js{constructor(t){this.Tb=new Map,this.Pb=new Map,this.Rb=new Map,this.Db=[],this.N_=t;}S(){this.Tb.clear(),this.Pb.clear(),this.Rb.clear(),this.Db=[];}Ob(t,i){let n=0!==this.Tb.size,s=!1;const e=this.Pb.get(t);if(void 0!==e)if(1===this.Pb.size)n=!1,s=!0,this.Tb.clear();else for(const i of this.Db)i.pointData.kb.delete(t)&&(s=!0);let r=[];if(0!==i.length){const n=i.map((t=>t.time)),e=this.N_.createConverterToInternalObj(i),h=Xs(t.Xh()),l=t.ga(),a=t.Ma();r=i.map(((i,r)=>{const o=e(i.time),_=this.N_.key(o);let u=this.Tb.get(_);void 0===u&&(u=Ks(o),this.Tb.set(_,u),s=!0);const c=h(o,u.se,i,n[r],l,a);return u.kb.set(t,c),c}));}n&&this.Ab(),this.Vb(t,r);let h=-1;if(s){const t=[];this.Tb.forEach((i=>{t.push({timeWeight:0,time:i.ia,pointData:i,originalTime:Gs(i.kb)});})),t.sort(((t,i)=>this.N_.key(t.time)-this.N_.key(i.time))),h=this.Bb(t);}return this.Ib(t,h,function(t,i,n){const s=Zs(t,n),e=Zs(i,n);if(void 0!==s&&void 0!==e)return {Xl:s.Cb>=e.Cb&&s.yb>=e.yb}}(this.Pb.get(t),e,this.N_))}rd(t){return this.Ob(t,[])}zb(t,i){const n=i;!function(t){void 0===t.mb&&(t.mb=t.time);}(n),this.N_.preprocessData(i);const s=this.N_.createConverterToInternalObj([i])(i.time),e=this.Rb.get(t);if(void 0!==e&&this.N_.key(s)<this.N_.key(e))throw new Error(`Cannot update oldest data, last time=${e}, new time=${s}`);let r=this.Tb.get(this.N_.key(s));const h=void 0===r;void 0===r&&(r=Ks(s),this.Tb.set(this.N_.key(s),r));const l=Xs(t.Xh()),a=t.ga(),o=t.Ma(),_=l(s,r.se,i,n.mb,a,o);r.kb.set(t,_),this.Eb(t,_);const u={Xl:Us(_)};if(!h)return this.Ib(t,-1,u);const c={timeWeight:0,time:r.ia,pointData:r,originalTime:Gs(r.kb)},d=Bt(this.Db,this.N_.key(c.time),((t,i)=>this.N_.key(t.time)<i));this.Db.splice(d,0,c);for(let t=d;t<this.Db.length;++t)Qs(this.Db[t].pointData,t);return this.N_.fillWeightsForPoints(this.Db,d),this.Ib(t,d,u)}Eb(t,i){let n=this.Pb.get(t);void 0===n&&(n=[],this.Pb.set(t,n));const s=0!==n.length?n[n.length-1]:null;null===s||this.N_.key(i.ut)>this.N_.key(s.ut)?Us(i)&&n.push(i):Us(i)?n[n.length-1]=i:n.splice(-1,1),this.Rb.set(t,i.ut);}Vb(t,i){0!==i.length?(this.Pb.set(t,i.filter(Us)),this.Rb.set(t,i[i.length-1].ut)):(this.Pb.delete(t),this.Rb.delete(t));}Ab(){for(const t of this.Db)0===t.pointData.kb.size&&this.Tb.delete(this.N_.key(t.time));}Bb(t){let i=-1;for(let n=0;n<this.Db.length&&n<t.length;++n){const s=this.Db[n],e=t[n];if(this.N_.key(s.time)!==this.N_.key(e.time)){i=n;break}e.timeWeight=s.timeWeight,Qs(e.pointData,n);}if(-1===i&&this.Db.length!==t.length&&(i=Math.min(this.Db.length,t.length)),-1===i)return -1;for(let n=i;n<t.length;++n)Qs(t[n].pointData,n);return this.N_.fillWeightsForPoints(t,i),this.Db=t,i}Lb(){if(0===this.Pb.size)return null;let t=0;return this.Pb.forEach((i=>{0!==i.length&&(t=Math.max(t,i[i.length-1].se));})),t}Ib(t,i,n){const s={Nb:new Map,yt:{Ou:this.Lb()}};if(-1!==i)this.Pb.forEach(((i,e)=>{s.Nb.set(e,{He:i,Fb:e===t?n:void 0});})),this.Pb.has(t)||s.Nb.set(t,{He:[],Fb:n}),s.yt.Wb=this.Db,s.yt.jb=i;else {const i=this.Pb.get(t);s.Nb.set(t,{He:i||[],Fb:n});}return s}}function Qs(t,i){t.se=i,t.kb.forEach((t=>{t.se=i;}));}function te(t){const i={value:t.Vt[3],time:t.mb};return void 0!==t.Sb&&(i.customValues=t.Sb),i}function ie(t){const i=te(t);return void 0!==t.O&&(i.color=t.O),i}function ne(t){const i=te(t);return void 0!==t._t&&(i.lineColor=t._t),void 0!==t.Ts&&(i.topColor=t.Ts),void 0!==t.Ps&&(i.bottomColor=t.Ps),i}function se(t){const i=te(t);return void 0!==t.Pe&&(i.topLineColor=t.Pe),void 0!==t.Re&&(i.bottomLineColor=t.Re),void 0!==t.Se&&(i.topFillColor1=t.Se),void 0!==t.ke&&(i.topFillColor2=t.ke),void 0!==t.ye&&(i.bottomFillColor1=t.ye),void 0!==t.Ce&&(i.bottomFillColor2=t.Ce),i}function ee(t){const i={open:t.Vt[0],high:t.Vt[1],low:t.Vt[2],close:t.Vt[3],time:t.mb};return void 0!==t.Sb&&(i.customValues=t.Sb),i}function re(t){const i=ee(t);return void 0!==t.O&&(i.color=t.O),i}function he(t){const i=ee(t),{O:n,Bt:s,$h:e}=t;return void 0!==n&&(i.color=n),void 0!==s&&(i.borderColor=s),void 0!==e&&(i.wickColor=e),i}function le(t){return {Area:ne,Line:ie,Baseline:se,Histogram:ie,Bar:re,Candlestick:he,Custom:ae}[t]}function ae(t){const i=t.mb;return Object.assign(Object.assign({},t.He),{time:i})}const oe={vertLine:{color:"#9598A1",width:1,style:3,visible:!0,labelVisible:!0,labelBackgroundColor:"#131722"},horzLine:{color:"#9598A1",width:1,style:3,visible:!0,labelVisible:!0,labelBackgroundColor:"#131722"},mode:1},_e={vertLines:{color:"#D6DCDE",style:0,visible:!0},horzLines:{color:"#D6DCDE",style:0,visible:!0}},ue={background:{type:"solid",color:"#FFFFFF"},textColor:"#191919",fontSize:12,fontFamily:L},ce={autoScale:!0,mode:0,invertScale:!1,alignLabels:!0,borderVisible:!0,borderColor:"#2B2B43",entireTextOnly:!1,visible:!1,ticksVisible:!1,scaleMargins:{bottom:.1,top:.2},minimumWidth:0},de={rightOffset:0,barSpacing:6,minBarSpacing:.5,fixLeftEdge:!1,fixRightEdge:!1,lockVisibleTimeRangeOnResize:!1,rightBarStaysOnScroll:!1,borderVisible:!0,borderColor:"#2B2B43",visible:!0,timeVisible:!1,secondsVisible:!0,shiftVisibleRangeOnNewBar:!0,ticksVisible:!1,uniformDistribution:!1,minimumHeight:0},fe={color:"rgba(0, 0, 0, 0)",visible:!1,fontSize:48,fontFamily:L,fontStyle:"",text:"",horzAlign:"center",vertAlign:"center"};function ve(){return {width:0,height:0,autoSize:!1,layout:ue,crosshair:oe,grid:_e,overlayPriceScales:Object.assign({},ce),leftPriceScale:Object.assign(Object.assign({},ce),{visible:!1}),rightPriceScale:Object.assign(Object.assign({},ce),{visible:!0}),timeScale:de,watermark:fe,localization:{locale:is?navigator.language:"",dateFormat:"dd MMM 'yy"},handleScroll:{mouseWheel:!0,pressedMouseMove:!0,horzTouchDrag:!0,vertTouchDrag:!0},handleScale:{axisPressedMouseMove:{time:!0,price:!0},axisDoubleClickReset:{time:!0,price:!0},mouseWheel:!0,pinch:!0},kineticScroll:{mouse:!1,touch:!0},trackingMode:{exitMode:1}}}class pe{constructor(t,i){this.Hb=t,this.$b=i;}applyOptions(t){this.Hb.qt().Ic(this.$b,t);}options(){return this.Li().W()}width(){return ut(this.$b)?this.Hb.ib(this.$b):0}Li(){return b(this.Hb.qt().zc(this.$b)).At}}function me(t,i,n){const s=Ls(t,["time","originalTime"]),e=Object.assign({time:i},s);return void 0!==n&&(e.originalTime=n),e}const be={color:"#FF0000",price:0,lineStyle:2,lineWidth:1,lineVisible:!0,axisLabelVisible:!0,title:"",axisLabelColor:"",axisLabelTextColor:""};class we{constructor(t){this.Bh=t;}applyOptions(t){this.Bh.Nh(t);}options(){return this.Bh.W()}Ub(){return this.Bh}}class ge{constructor(t,i,n,s,e){this.qb=new R,this.Es=t,this.Yb=i,this.Xb=n,this.N_=e,this.Kb=s;}S(){this.qb.S();}priceFormatter(){return this.Es.ca()}priceToCoordinate(t){const i=this.Es.Pt();return null===i?null:this.Es.At().Ot(t,i.Vt)}coordinateToPrice(t){const i=this.Es.Pt();return null===i?null:this.Es.At().pn(t,i.Vt)}barsInLogicalRange(t){if(null===t)return null;const i=new yn(new xn(t.from,t.to)).iu(),n=this.Es.In();if(n.Fi())return null;const s=n.nl(i.Os(),1),e=n.nl(i.di(),-1),r=b(n.Qh()),h=b(n.Bn());if(null!==s&&null!==e&&s.se>e.se)return {barsBefore:t.from-r,barsAfter:h-t.to};const l={barsBefore:null===s||s.se===r?t.from-r:s.se-r,barsAfter:null===e||e.se===h?h-t.to:h-e.se};return null!==s&&null!==e&&(l.from=s.mb,l.to=e.mb),l}setData(t){this.N_,this.Es.Xh(),this.Yb.Zb(this.Es,t),this.Gb("full");}update(t){this.Es.Xh(),this.Yb.Jb(this.Es,t),this.Gb("update");}dataByIndex(t,i){const n=this.Es.In().nl(t,i);if(null===n)return null;return le(this.seriesType())(n)}data(){const t=le(this.seriesType());return this.Es.In().ie().map((i=>t(i)))}subscribeDataChanged(t){this.qb.l(t);}unsubscribeDataChanged(t){this.qb.v(t);}setMarkers(t){this.N_;const i=t.map((t=>me(t,this.N_.convertHorzItemToInternal(t.time),t.time)));this.Es.Zl(i);}markers(){return this.Es.Gl().map((t=>me(t,t.originalTime,void 0)))}applyOptions(t){this.Es.Nh(t);}options(){return I(this.Es.W())}priceScale(){return this.Xb.priceScale(this.Es.At().xa())}createPriceLine(t){const i=D(I(be),t),n=this.Es.Jl(i);return new we(n)}removePriceLine(t){this.Es.Ql(t.Ub());}seriesType(){return this.Es.Xh()}attachPrimitive(t){this.Es.ba(t),t.attached&&t.attached({chart:this.Kb,series:this,requestUpdate:()=>this.Es.qt().$l()});}detachPrimitive(t){this.Es.wa(t),t.detached&&t.detached();}Gb(t){this.qb.M()&&this.qb.m(t);}}class Me{constructor(t,i,n){this.Qb=new R,this.uu=new R,this.om=new R,this.Ui=t,this.wl=t.yt(),this.Hm=i,this.wl.Xu().l(this.tw.bind(this)),this.wl.Ku().l(this.iw.bind(this)),this.Hm.wm().l(this.nw.bind(this)),this.N_=n;}S(){this.wl.Xu().p(this),this.wl.Ku().p(this),this.Hm.wm().p(this),this.Qb.S(),this.uu.S(),this.om.S();}scrollPosition(){return this.wl.zu()}scrollToPosition(t,i){i?this.wl.Uu(t,1e3):this.Ui.Jn(t);}scrollToRealTime(){this.wl.$u();}getVisibleRange(){const t=this.wl.yu();return null===t?null:{from:t.from.originalTime,to:t.to.originalTime}}setVisibleRange(t){const i={from:this.N_.convertHorzItemToInternal(t.from),to:this.N_.convertHorzItemToInternal(t.to)},n=this.wl.Pu(i);this.Ui.hd(n);}getVisibleLogicalRange(){const t=this.wl.ku();return null===t?null:{from:t.Os(),to:t.di()}}setVisibleLogicalRange(t){p(t.from<=t.to,"The from index cannot be after the to index."),this.Ui.hd(t);}resetTimeScale(){this.Ui.Zn();}fitContent(){this.Ui.Ju();}logicalToCoordinate(t){const i=this.Ui.yt();return i.Fi()?null:i.Et(t)}coordinateToLogical(t){return this.wl.Fi()?null:this.wl.Au(t)}timeToCoordinate(t){const i=this.N_.convertHorzItemToInternal(t),n=this.wl.ya(i,!1);return null===n?null:this.wl.Et(n)}coordinateToTime(t){const i=this.Ui.yt(),n=i.Au(t),s=i.qi(n);return null===s?null:s.originalTime}width(){return this.Hm.Hp().width}height(){return this.Hm.Hp().height}subscribeVisibleTimeRangeChange(t){this.Qb.l(t);}unsubscribeVisibleTimeRangeChange(t){this.Qb.v(t);}subscribeVisibleLogicalRangeChange(t){this.uu.l(t);}unsubscribeVisibleLogicalRangeChange(t){this.uu.v(t);}subscribeSizeChange(t){this.om.l(t);}unsubscribeSizeChange(t){this.om.v(t);}applyOptions(t){this.wl.Nh(t);}options(){return Object.assign(Object.assign({},I(this.wl.W())),{barSpacing:this.wl.he()})}tw(){this.Qb.M()&&this.Qb.m(this.getVisibleRange());}iw(){this.uu.M()&&this.uu.m(this.getVisibleLogicalRange());}nw(t){this.om.m(t.width,t.height);}}function xe(t){if(void 0===t||"custom"===t.type)return;const i=t;void 0!==i.minMove&&void 0===i.precision&&(i.precision=function(t){if(t>=1)return 0;let i=0;for(;i<8;i++){const n=Math.round(t);if(Math.abs(n-t)<1e-8)return i;t*=10;}return i}(i.minMove));}function Se(t){return function(t){if(B(t.handleScale)){const i=t.handleScale;t.handleScale={axisDoubleClickReset:{time:i,price:i},axisPressedMouseMove:{time:i,price:i},mouseWheel:i,pinch:i};}else if(void 0!==t.handleScale){const{axisPressedMouseMove:i,axisDoubleClickReset:n}=t.handleScale;B(i)&&(t.handleScale.axisPressedMouseMove={time:i,price:i}),B(n)&&(t.handleScale.axisDoubleClickReset={time:n,price:n});}const i=t.handleScroll;B(i)&&(t.handleScroll={horzTouchDrag:i,vertTouchDrag:i,mouseWheel:i,pressedMouseMove:i});}(t),t}class ke{constructor(t,i,n){this.sw=new Map,this.ew=new Map,this.rw=new R,this.hw=new R,this.lw=new R,this.aw=new Js(i);const s=void 0===n?I(ve()):D(I(ve()),Se(n));this.N_=i,this.Hb=new zs(t,s,i),this.Hb.Np().l((t=>{this.rw.M()&&this.rw.m(this.ow(t()));}),this),this.Hb.Fp().l((t=>{this.hw.M()&&this.hw.m(this.ow(t()));}),this),this.Hb.Fc().l((t=>{this.lw.M()&&this.lw.m(this.ow(t()));}),this);const e=this.Hb.qt();this._w=new Me(e,this.Hb.Km(),this.N_);}remove(){this.Hb.Np().p(this),this.Hb.Fp().p(this),this.Hb.Fc().p(this),this._w.S(),this.Hb.S(),this.sw.clear(),this.ew.clear(),this.rw.S(),this.hw.S(),this.lw.S(),this.aw.S();}resize(t,i,n){this.autoSizeActive()||this.Hb.Um(t,i,n);}addCustomSeries(t,i){const n=w(t),s=Object.assign(Object.assign({},_),n.defaultOptions());return this.uw("Custom",s,i,n)}addAreaSeries(t){return this.uw("Area",l,t)}addBaselineSeries(t){return this.uw("Baseline",a,t)}addBarSeries(t){return this.uw("Bar",r,t)}addCandlestickSeries(t={}){return function(t){void 0!==t.borderColor&&(t.borderUpColor=t.borderColor,t.borderDownColor=t.borderColor),void 0!==t.wickColor&&(t.wickUpColor=t.wickColor,t.wickDownColor=t.wickColor);}(t),this.uw("Candlestick",e,t)}addHistogramSeries(t){return this.uw("Histogram",o,t)}addLineSeries(t){return this.uw("Line",h,t)}removeSeries(t){const i=m(this.sw.get(t)),n=this.aw.rd(i);this.Hb.qt().rd(i),this.cw(n),this.sw.delete(t),this.ew.delete(i);}Zb(t,i){this.cw(this.aw.Ob(t,i));}Jb(t,i){this.cw(this.aw.zb(t,i));}subscribeClick(t){this.rw.l(t);}unsubscribeClick(t){this.rw.v(t);}subscribeCrosshairMove(t){this.lw.l(t);}unsubscribeCrosshairMove(t){this.lw.v(t);}subscribeDblClick(t){this.hw.l(t);}unsubscribeDblClick(t){this.hw.v(t);}priceScale(t){return new pe(this.Hb,t)}timeScale(){return this._w}applyOptions(t){this.Hb.Nh(Se(t));}options(){return this.Hb.W()}takeScreenshot(){return this.Hb.Qm()}autoSizeActive(){return this.Hb.eb()}chartElement(){return this.Hb.rb()}paneSize(){const t=this.Hb.lb();return {height:t.height,width:t.width}}setCrosshairPosition(t,i,n){const s=this.sw.get(n);if(void 0===s)return;const e=this.Hb.qt().cr(s);null!==e&&this.Hb.qt().Jc(t,i,e);}clearCrosshairPosition(){this.Hb.qt().Qc(!0);}uw(t,i,n={},s){xe(n.priceFormat);const e=D(I(u),I(i),n),r=this.Hb.qt().sd(t,e,s),h=new ge(r,this,this,this,this.N_);return this.sw.set(h,r),this.ew.set(r,h),h}cw(t){const i=this.Hb.qt();i.td(t.yt.Ou,t.yt.Wb,t.yt.jb),t.Nb.forEach(((t,i)=>i.it(t.He,t.Fb))),i.Bu();}dw(t){return m(this.ew.get(t))}ow(t){const i=new Map;t.gb.forEach(((t,n)=>{const s=n.Xh(),e=le(s)(t);if("Custom"!==s)p(function(t){return void 0!==t.open||void 0!==t.value}(e));else {const t=n.Ma();p(!t||!1===t(e));}i.set(this.dw(n),e);}));const n=void 0===t.wb?void 0:this.dw(t.wb);return {time:t.mb,logical:t.se,point:t.bb,hoveredSeries:n,hoveredObjectId:t.Mb,seriesData:i,sourceEvent:t.xb}}}function ye(t,i,n){let s;if(V(t)){const i=document.getElementById(t);p(null!==i,`Cannot find element in DOM with id=${t}`),s=i;}else s=t;const e=new ke(s,i,n);return i.setOptions(e.options()),e}function Ce(t,i){return ye(t,new ts,ts.Cd(i))}Object.assign(Object.assign({},u),_);

class CurrencyChart extends AbstractDiv {
    constructor(appState) {
        super();
        this.appState = appState;
    }

    async loadAllCoins() {
        // const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&page=1&sparkline=false&locale=en`);
        const res = await fetch(`../../../static/coinList.json`);
        return res.json();
    }

    async loadCoinWebsite(coin) {
        // const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`)
        const res = await fetch(`../../../static/bitcoin.json`);
        return res.json();

    }

    async loadHistory(coin) {
        // const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=7&interval=daily`)
        const res = await fetch(`../../../static/bitcoin-history.json`);
        return res.json()
    }

    getNegativeOrPositivePercentage(change) {
        if(change < 0) {
            return 'negative'
        } return 'positive'
    }

    getChosenCoin() {
        if (this.appState.chosenCoin == undefined) {
            return 'bitcoin'
        }
        return this.appState.chosenCoin
    }

    getChosenCoinWebsite(url) {
        const arrUrl = url.split('/');
        return arrUrl[2]
    }

    convertDate(seconds) {
        const day = new Date(seconds).getDate();
        let month = new Date(seconds).getMonth();
        if(month < 10) {
            month = '0' + new Date(seconds).getMonth();
        }
        const year = new Date(seconds).getFullYear();
        return year + '-' + month + '-' + day

    }

    async render() {
        const allCoins = await this.loadAllCoins(this.getChosenCoin());
        const coinData = allCoins.find(el => el.id == this.getChosenCoin());
        const website = await this.loadCoinWebsite(this.getChosenCoin());
        const coinHistory = await this.loadHistory(this.getChosenCoin());
        console.log(coinHistory.prices[0][0]);
        this.el.classList.add('currency-chart');
        this.el.innerHTML = `
        <div class="currency-chart__wrapper">
            <div class="chart__title__wrapper">
                <div class="chart__title">
                    <div class="currency-pair">
                        <div class="currency-logo__wrapper">
                            <img class="currency-logo" src="${coinData.image}"/>
                        </div>
                        <div class="currency-pair__name">${coinData.symbol.toUpperCase()}/USD</div>
                    </div>
                    <div class="currency-price__wrapper">
                        <div class="currency-price">$${coinData.current_price}</div>
                        <div class="currency-price__24h ${this.getNegativeOrPositivePercentage(Number(coinData.price_change_percentage_24h.toFixed(1)))}">
                            <img class="icon__24h" src="../../static/24h-${this.getNegativeOrPositivePercentage(Number(coinData.price_change_percentage_24h.toFixed(1)))}.svg"/>
                            ${Number(coinData.price_change_percentage_24h.toFixed(1)).toFixed(1)}%
                        </div>
                    </div>
                    <div class="chart__title__info">
                        <div class="chart__title__info__market-cap">Market Cap: <span style="font-size: 20px; color: #fff">$${coinData.market_cap}</span></div>
                        <div class="chart__title__info__volume-24h">Volume 24h: <span style="font-size: 20px; color: #fff">$${coinData.total_volume}</span></div>
                        <div class="chart__title__info__website">Website: <a class="chart__title__info__website__link"href="${website.links.homepage[0]}" target="_blank">${this.getChosenCoinWebsite(website.links.homepage[0])}</a></div>
                    </div>
                </div>
            </div>

            <div class="cryptocurrencies-chart">
            </div>
        </div>
        <hr/>
        `;
        const chartOptions = {
            height: 390,
            width: 952,

            layout: {
                background: { color: 'rgba(1,1,1,0'},
                textColor: '#fff'
            },
            grid: {
            vertLines: { color: 'gray' },
            horzLines: { color: 'rgba(1,1,1,0)' },
        },
            timeScale:{
                timeVisible: false,
                secondsVisible:false,
            }
        };
        const cryptocurrenciesChart = Ce(this.el.querySelector('.cryptocurrencies-chart'), chartOptions);

        const chartData = [
            { time: this.convertDate(coinHistory.prices[0][0]), value: Number(coinHistory.prices[0][1]) },
            { time: this.convertDate(coinHistory.prices[1][0]), value: Number(coinHistory.prices[1][1]) },
            { time: this.convertDate(coinHistory.prices[2][0]), value: Number(coinHistory.prices[2][1]) },
            { time: this.convertDate(coinHistory.prices[3][0]), value: Number(coinHistory.prices[3][1]) },
            { time: this.convertDate(coinHistory.prices[4][0]), value: Number(coinHistory.prices[4][1]) },
            { time: this.convertDate(coinHistory.prices[5][0]), value: Number(coinHistory.prices[5][1]) },
            { time: this.convertDate(coinHistory.prices[7][0]), value: Number(coinHistory.prices[7][1]) }
        ];

        console.log(chartData[6]);

        const lineSeries = cryptocurrenciesChart.addLineSeries({
            color: '#4ECB71'
        });
        lineSeries.setData(chartData);

        const areaSeries = cryptocurrenciesChart.addAreaSeries({
            lastValueVisible: false, // hide the last value marker for this series
            crosshairMarkerVisible: false, // hide the crosshair marker for this series
            lineColor: 'transparent', // hide the line
            topColor: 'rgba(78, 203, 113, 0.4)',
            bottomColor: 'rgba(78, 203, 113, 0.1)',
        });

        areaSeries.setData(chartData);
        cryptocurrenciesChart.timeScale().fitContent();
        // const pair = document.createElement('div');
        // pair.classList.add('cryptocurrencies-chart__pair');
        // pair.innerHTML = `${this.appState.chosenCoin}/USD`;
        // this.el.querySelector('.tv-lightweight-charts').append(pair)
        console.log(this.appState);
        return this.el;
    }
}

class CryptocurrenciesView extends AbstractView {

    constructor(appState) {
        super();
        this.appState = appState;
        this.appState = onChange(this.appState, this.appStateHook.bind(this));
    }

    async appStateHook(path) {
        console.log(path);
        if (document.querySelector('.currencies-list__scroll')) {
            localStorage.setItem("coinListScrollPosition", document.querySelector('.currencies-list__scroll').scrollTop);
        }

        if (document.querySelector('.currencies-list__favorites__scroll')) {
            localStorage.setItem("favoritesScrollPosition", document.querySelector('.currencies-list__favorites__scroll').scrollTop);
        }
        
        

        if (path == 'favorites') {
            await this.render();
            
        }
        if (path == 'chosenCoin') {
            await this.render();
        }
        if (path == 'searchQuery') {
            console.log('searching');
            await this.render();
            document.querySelector('.currencies-list__search').focus();

        }

        if (localStorage.getItem("coinListScrollPosition")) {
            document.querySelector('.currencies-list__scroll').scrollTop = localStorage.getItem("coinListScrollPosition");
        }
        if (localStorage.getItem("favoritesScrollPosition")) {
            document.querySelector('.currencies-list__favorites__scroll').scrollTop = localStorage.getItem("favoritesScrollPosition");
        }
    }

    destroy() {
        this.app.innerHTML = '';
    }

    async loadList() {
        const res = await fetch(`../../../static/coinList.json`);
        // const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en')
        return res.json()
    }

    async render() {
        this.appState.coinList = await this.loadList();
        const cryptocurrencies = document.createElement('div');
        cryptocurrencies.classList.add('cryptocurrencies-view');
        cryptocurrencies.append(await new CurrencyChart(this.appState).render());
        cryptocurrencies.append(new CurrenciesList(this.appState).render());
        this.app.innerHTML = '';
        this.app.append(cryptocurrencies);
        this.renderHeader();
        window.addEventListener("beforeunload", () => {
            localStorage.removeItem("coinListScrollPosition");
            localStorage.removeItem("favoritesScrollPosition");
        });

    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header);
    }
    
}

class portfolioMain extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    renderAsset(asset) {
        const portfolioAsset = document.createElement('div');
        portfolioAsset.classList = 'asset';
        portfolioAsset.innerHTML = `${asset}`;
        return portfolioAsset

    }

    render() {
        this.el.classList.add('portfolio-main');
        this.el.innerHTML = `

        `;

        
        if(this.appState.chosenPortfolio) {
            const assets = JSON.parse(localStorage.getItem("PORTFOLIOS")).filter(el => el.id == this.appState.chosenPortfolio)[0].assets;
            console.log(assets);
            for(let el of assets) {
                this.el.append(this.renderAsset(el.name));
            }
        }



        return this.el
    }
}

class portfolioSideMenu extends AbstractDiv {

    constructor(appState) {
        super();
        this.appState = appState;
    }

    createNewPortfolio() {

    const addingPortfolioForm = document.createElement('div');
    addingPortfolioForm.classList.add('adding-portfolio-form');
    addingPortfolioForm.innerHTML = `
    <form>
        <input name="portfolio-name" placeholder="Portfolio name"></input>
    </form>
    <img class="confirm-portfolio" src="../../../static/confirm-portfolio.svg"/>
    <img class="cancel-portfolio" src="../../../static/cancel-portfolio.svg"/>
    `;

    addingPortfolioForm.querySelector('.confirm-portfolio').addEventListener('click', (e) => {
        const form = addingPortfolioForm.querySelector('form');
        const data = new FormData(form);
        const portfolioName = data.get('portfolio-name');
        const newPortfolio = {
            id: this.appState.portfoliosList.at(-1).id + 1,
            name: portfolioName,
            assets: []
        };
        const list = this.appState.portfoliosList;
        list.push(newPortfolio);
        console.log(newPortfolio);
        localStorage.setItem('PORTFOLIOS', JSON.stringify(list));
    });
    
    addingPortfolioForm.querySelector('.cancel-portfolio').addEventListener('click', () => {
        this.el.querySelector('.adding-portfolio-form').remove();
        
    });

    return addingPortfolioForm
    }

    setChosenPortfolio(portfolioId){
        this.appState.chosenPortfolio = portfolioId;
    }

    renderPortfoliosListItem(portfolioObj) {
        const portfoliosListItem = document.createElement('div');
        portfoliosListItem.classList.add('portfolios-list__item');
        portfoliosListItem.id = portfolioObj.id;
        portfoliosListItem.innerHTML = `
            <div class="portfolios-list__item__name">${portfolioObj.name}</div>
            <div class="portfolios-list__item__pnl">
                <img src="../../../static/24h-positive.svg"/>
                <span>10,4%</span>
            </div>
            <div class="portfolios-list__item__worth">$254573</div>
        `;
        portfoliosListItem.addEventListener('click', () => {
            this.setChosenPortfolio(portfoliosListItem.id);
        });
        return portfoliosListItem


    }

    render() {
        this.el.classList.add('portfolio-side-menu');
        this.el.innerHTML = `
        <div class="portfolio-side-menu__header">
            <h2>Your portfolios</h2>
        </div>
        <div class="portfolios-list__wrapper">
            <div class="portfolios-list">
                
            </div>
            <div class="portfolios-list__add-button">
                <img class="add-icon" src="../../../static/add-portfolio-icon.svg"/>
            </div>
        </div>
        `;
        // this.getBTC()
        const portfoliosJSON = JSON.parse(localStorage.getItem("PORTFOLIOS"));
        for(let i = 0; i<portfoliosJSON.length; i++) {
            this.el.querySelector('.portfolios-list').append(this.renderPortfoliosListItem(portfoliosJSON[i]));
        }

        this.el.querySelector('.portfolios-list__add-button').addEventListener('click', () => {
            if(this.el.querySelector('.adding-portfolio-form')) {
                return
            }
            this.el.querySelector('.portfolios-list').append(this.createNewPortfolio());
        });
        

        return this.el
    }
    
}

class PortfolioView extends AbstractView {
    constructor(appState) {
        super();
        this.appState = appState;
        this.appState = onChange(this.appState, this.appStateHook.bind(this));
    }

    appStateHook(path) {
        if (path == 'chosenPortfolio') {
            this.render();
            
        }

        if (path == 'portfoliosList') {
            this.render();
        }

    }

    destroy() {
        this.app.innerHTML = '';
    }

    render() {
        const portfolio = document.createElement('div');
        portfolio.classList.add('portfolio-view');
        portfolio.append(new portfolioSideMenu(this.appState).render());
        portfolio.append(new portfolioMain(this.appState).render());
        this.app.innerHTML = '';
        this.app.append(portfolio);
        this.renderHeader();
    }

    renderHeader() {
        const header = new Header().render();
        this.app.prepend(header);
    }
}

class App {

    routes = [
        {path: '', view: CryptocurrenciesView},
        {path: '#portfolio', view: PortfolioView},
        {path: '#cryptocurrencies', view: CryptocurrenciesView},
        {path: '#about', view: AboutView}
    ];

    appState = {
        coinList: [],
        favorites: [],
        chosenCoin: undefined,
        searchQuery: '',
        portfoliosList: JSON.parse(localStorage.getItem('PORTFOLIOS')),
        chosenPortfolio: undefined
    }

    constructor(){
        window.addEventListener('hashchange', this.route.bind(this));
		this.route();
    };

    route() {
        if(this.currentView) {
            this.currentView.destroy();
        }
        const view = this.routes.find(r => r.path == location.hash).view;
        this.currentView = new view(this.appState);
        this.currentView.render();
    };

}
new App();
