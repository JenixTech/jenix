
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const navigation = {
      work: "WORK",
      about: "ABOUT",
    };

    const projects = [
      {
        title: "Lemmi",
        description: "An Android and iOS app that helps people with speech difficulties communicate with ease, and re-connect with others. Initially developed for the web, then converted to a hybrid application using Apache Cordova, I ported Lemmi to native SDKs to improve performance and make use of APIs not accessible otherwise. (Launching Q3 2020)",
        webImage: "lemmi-web",
        mobileImage: "lemmi-mobile",
        links: {
          "Website": "https://www.lemmichat.com",
          // "App Store": ""
          // "Play Store": ""
        }
      },
    ];

    const staff = [
      {
        name: "Will Nixon",
        title: "Co-Founder",
        about: "Will is a software engineer experienced in developing full-stack and mobile applications. He is passionate about building technology that improves the lives of others and has helped create applications for government and non-profit organizations.",
        image: 'will-nixon'
      }
    ];

    const links = {
      twitter: { label: "TWITTER", url: "https://twitter.com/jenixtech" },
      instagram: { label: "INSTAGRAM", url: "https://www.instagram.com/jenixtech" },
      facebook: { label: "FACEBOOK", url: "https://www.facebook.com/jenixtech" }
    };

    const about = {
      email: { label: "Contact Us", url: "mailto:info@jenixtech.com?subject='Contact from Website'" }
    };

    /* src/components/header.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file = "src/components/header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (55:4) {#each Object.keys(navigation) as link}
    function create_each_block(ctx) {
    	let button;
    	let t0_value = navigation[/*link*/ ctx[5]] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[4](/*link*/ ctx[5], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(`${/*page*/ ctx[0] === navigation[/*link*/ ctx[5]]
			? "selected"
			: ""}`) + " svelte-9u4svc"));

    			add_location(button, file, 55, 6, 1034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*page*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(`${/*page*/ ctx[0] === navigation[/*link*/ ctx[5]]
			? "selected"
			: ""}`) + " svelte-9u4svc"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(55:4) {#each Object.keys(navigation) as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;
    	let each_value = Object.keys(navigation);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "JENIX";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "title svelte-9u4svc");
    			add_location(h1, file, 51, 4, 881);
    			attr_dev(div0, "class", "title-wrapper svelte-9u4svc");
    			add_location(div0, file, 50, 2, 849);
    			attr_dev(div1, "class", "links-wrapper svelte-9u4svc");
    			add_location(div1, file, 53, 2, 956);
    			attr_dev(nav, "class", "svelte-9u4svc");
    			add_location(nav, file, 49, 0, 841);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, h1);
    			append_dev(nav, t1);
    			append_dev(nav, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(h1, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page, navigation, Object, handleClickNavigation*/ 3) {
    				each_value = Object.keys(navigation);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { page } = $$props;
    	let { handleClickNavigation } = $$props;
    	let { handleClickHome } = $$props;
    	const writable_props = ["page", "handleClickNavigation", "handleClickHome"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickHome();
    	const click_handler_1 = link => handleClickNavigation(navigation[link]);

    	$$self.$$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("handleClickNavigation" in $$props) $$invalidate(1, handleClickNavigation = $$props.handleClickNavigation);
    		if ("handleClickHome" in $$props) $$invalidate(2, handleClickHome = $$props.handleClickHome);
    	};

    	$$self.$capture_state = () => ({
    		navigation,
    		page,
    		handleClickNavigation,
    		handleClickHome
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("handleClickNavigation" in $$props) $$invalidate(1, handleClickNavigation = $$props.handleClickNavigation);
    		if ("handleClickHome" in $$props) $$invalidate(2, handleClickHome = $$props.handleClickHome);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, handleClickNavigation, handleClickHome, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			page: 0,
    			handleClickNavigation: 1,
    			handleClickHome: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[0] === undefined && !("page" in props)) {
    			console.warn("<Header> was created without expected prop 'page'");
    		}

    		if (/*handleClickNavigation*/ ctx[1] === undefined && !("handleClickNavigation" in props)) {
    			console.warn("<Header> was created without expected prop 'handleClickNavigation'");
    		}

    		if (/*handleClickHome*/ ctx[2] === undefined && !("handleClickHome" in props)) {
    			console.warn("<Header> was created without expected prop 'handleClickHome'");
    		}
    	}

    	get page() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClickNavigation() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickNavigation(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClickHome() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickHome(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/project-image.svelte generated by Svelte v3.29.0 */

    const file$1 = "src/components/project-image.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let p;
    	let t1_value = /*title*/ ctx[1].toUpperCase() + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p = element("p");
    			t1 = text(t1_value);
    			attr_dev(img, "class", "project-image svelte-myettk");
    			if (img.src !== (img_src_value = `images/${/*image*/ ctx[0]}.png`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `${/*title*/ ctx[1]} website image`);
    			add_location(img, file$1, 74, 4, 1472);
    			attr_dev(p, "class", "project-title svelte-myettk");
    			add_location(p, file$1, 79, 6, 1617);
    			attr_dev(div0, "class", "title-wrapper svelte-myettk");
    			add_location(div0, file$1, 78, 4, 1583);
    			attr_dev(div1, "class", "image-wrapper");
    			add_location(div1, file$1, 73, 2, 1440);
    			attr_dev(div2, "class", "project-image-wrapper svelte-myettk");
    			add_location(div2, file$1, 72, 0, 1359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 1 && img.src !== (img_src_value = `images/${/*image*/ ctx[0]}.png`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*title*/ 2 && img_alt_value !== (img_alt_value = `${/*title*/ ctx[1]} website image`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*title*/ 2 && t1_value !== (t1_value = /*title*/ ctx[1].toUpperCase() + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project_image", slots, []);
    	let { image } = $$props;
    	let { title } = $$props;
    	let { handleClickProject } = $$props;
    	const writable_props = ["image", "title", "handleClickProject"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project_image> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickProject(title);

    	$$self.$$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("handleClickProject" in $$props) $$invalidate(2, handleClickProject = $$props.handleClickProject);
    	};

    	$$self.$capture_state = () => ({ image, title, handleClickProject });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("handleClickProject" in $$props) $$invalidate(2, handleClickProject = $$props.handleClickProject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, title, handleClickProject, click_handler];
    }

    class Project_image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			image: 0,
    			title: 1,
    			handleClickProject: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project_image",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[0] === undefined && !("image" in props)) {
    			console.warn("<Project_image> was created without expected prop 'image'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Project_image> was created without expected prop 'title'");
    		}

    		if (/*handleClickProject*/ ctx[2] === undefined && !("handleClickProject" in props)) {
    			console.warn("<Project_image> was created without expected prop 'handleClickProject'");
    		}
    	}

    	get image() {
    		throw new Error("<Project_image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Project_image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Project_image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Project_image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClickProject() {
    		throw new Error("<Project_image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickProject(value) {
    		throw new Error("<Project_image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/project-details.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$1 } = globals;
    const file$2 = "src/components/project-details.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (111:8) {#each Object.keys(project.links) as link}
    function create_each_block$1(ctx) {
    	let a;
    	let t_value = /*link*/ ctx[8] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*project*/ ctx[2].links[/*link*/ ctx[8]]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-15eqfma");
    			add_location(a, file$2, 111, 10, 2436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*project*/ 4 && t_value !== (t_value = /*link*/ ctx[8] + "")) set_data_dev(t, t_value);

    			if (dirty & /*project*/ 4 && a_href_value !== (a_href_value = /*project*/ ctx[2].links[/*link*/ ctx[8]])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(111:8) {#each Object.keys(project.links) as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div6;
    	let img0;
    	let img0_src_value;
    	let img0_alt_value;
    	let t0;
    	let div5;
    	let div3;
    	let h2;
    	let t1_value = /*project*/ ctx[2].title.toUpperCase() + "";
    	let t1;
    	let t2;
    	let p0;
    	let t3_value = /*project*/ ctx[2].description + "";
    	let t3;
    	let t4;
    	let div0;
    	let t5;
    	let div2;
    	let button0;
    	let t7;
    	let div1;
    	let button1;
    	let t8;
    	let button1_class_value;
    	let t9;
    	let p1;
    	let t10;
    	let p1_class_value;
    	let t11;
    	let button2;
    	let t12;
    	let button2_class_value;
    	let t13;
    	let div4;
    	let img1;
    	let img1_src_value;
    	let img1_alt_value;
    	let mounted;
    	let dispose;
    	let each_value = Object.keys(/*project*/ ctx[2].links);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div5 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div2 = element("div");
    			button0 = element("button");
    			button0.textContent = "BACK TO WORK";
    			t7 = space();
    			div1 = element("div");
    			button1 = element("button");
    			t8 = text("PREV");
    			t9 = space();
    			p1 = element("p");
    			t10 = text("/");
    			t11 = space();
    			button2 = element("button");
    			t12 = text("NEXT");
    			t13 = space();
    			div4 = element("div");
    			img1 = element("img");
    			attr_dev(img0, "class", "project-image svelte-15eqfma");
    			if (img0.src !== (img0_src_value = `images/${/*project*/ ctx[2].webImage}.png`)) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", img0_alt_value = `${/*project*/ ctx[2].title} website image`);
    			add_location(img0, file$2, 101, 2, 2052);
    			attr_dev(h2, "class", "title svelte-15eqfma");
    			add_location(h2, file$2, 107, 6, 2241);
    			attr_dev(p0, "class", "description svelte-15eqfma");
    			add_location(p0, file$2, 108, 6, 2300);
    			attr_dev(div0, "class", "links svelte-15eqfma");
    			add_location(div0, file$2, 109, 6, 2355);
    			attr_dev(button0, "class", "svelte-15eqfma");
    			add_location(button0, file$2, 115, 8, 2561);

    			attr_dev(button1, "class", button1_class_value = "" + (null_to_empty(`${/*project*/ ctx[2].title !== projects[0].title
			? ""
			: "hidden"}`) + " svelte-15eqfma"));

    			add_location(button1, file$2, 119, 10, 2714);

    			attr_dev(p1, "class", p1_class_value = "" + (null_to_empty(`${/*project*/ ctx[2].title !== projects[0].title && /*project*/ ctx[2].title !== projects[projects.length - 1].title
			? ""
			: "hidden"}`) + " svelte-15eqfma"));

    			add_location(p1, file$2, 124, 10, 2942);

    			attr_dev(button2, "class", button2_class_value = "" + (null_to_empty(`${/*project*/ ctx[2].title !== projects[projects.length - 1].title
			? ""
			: "hidden"}`) + " svelte-15eqfma"));

    			add_location(button2, file$2, 128, 10, 3119);
    			attr_dev(div1, "class", "button-wrapper svelte-15eqfma");
    			add_location(div1, file$2, 118, 8, 2675);
    			attr_dev(div2, "class", "navigation svelte-15eqfma");
    			add_location(div2, file$2, 114, 6, 2528);
    			attr_dev(div3, "class", "project-info svelte-15eqfma");
    			add_location(div3, file$2, 106, 4, 2208);
    			attr_dev(img1, "class", "project-mobile-image svelte-15eqfma");
    			if (img1.src !== (img1_src_value = `images/${/*project*/ ctx[2].mobileImage}.png`)) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", img1_alt_value = `${/*project*/ ctx[2].title} mobile image`);
    			add_location(img1, file$2, 137, 6, 3439);
    			attr_dev(div4, "class", "mobile-image-wrapper svelte-15eqfma");
    			add_location(div4, file$2, 136, 4, 3398);
    			attr_dev(div5, "class", "project-details svelte-15eqfma");
    			add_location(div5, file$2, 105, 2, 2174);
    			attr_dev(div6, "class", "project-details-wrapper svelte-15eqfma");
    			add_location(div6, file$2, 100, 0, 2012);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, img0);
    			append_dev(div6, t0);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, h2);
    			append_dev(h2, t1);
    			append_dev(div3, t2);
    			append_dev(div3, p0);
    			append_dev(p0, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, button1);
    			append_dev(button1, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p1);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, button2);
    			append_dev(button2, t12);
    			append_dev(div5, t13);
    			append_dev(div5, div4);
    			append_dev(div4, img1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 4 && img0.src !== (img0_src_value = `images/${/*project*/ ctx[2].webImage}.png`)) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*project*/ 4 && img0_alt_value !== (img0_alt_value = `${/*project*/ ctx[2].title} website image`)) {
    				attr_dev(img0, "alt", img0_alt_value);
    			}

    			if (dirty & /*project*/ 4 && t1_value !== (t1_value = /*project*/ ctx[2].title.toUpperCase() + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*project*/ 4 && t3_value !== (t3_value = /*project*/ ctx[2].description + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*project, Object*/ 4) {
    				each_value = Object.keys(/*project*/ ctx[2].links);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*project*/ 4 && button1_class_value !== (button1_class_value = "" + (null_to_empty(`${/*project*/ ctx[2].title !== projects[0].title
			? ""
			: "hidden"}`) + " svelte-15eqfma"))) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (dirty & /*project*/ 4 && p1_class_value !== (p1_class_value = "" + (null_to_empty(`${/*project*/ ctx[2].title !== projects[0].title && /*project*/ ctx[2].title !== projects[projects.length - 1].title
			? ""
			: "hidden"}`) + " svelte-15eqfma"))) {
    				attr_dev(p1, "class", p1_class_value);
    			}

    			if (dirty & /*project*/ 4 && button2_class_value !== (button2_class_value = "" + (null_to_empty(`${/*project*/ ctx[2].title !== projects[projects.length - 1].title
			? ""
			: "hidden"}`) + " svelte-15eqfma"))) {
    				attr_dev(button2, "class", button2_class_value);
    			}

    			if (dirty & /*project*/ 4 && img1.src !== (img1_src_value = `images/${/*project*/ ctx[2].mobileImage}.png`)) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*project*/ 4 && img1_alt_value !== (img1_alt_value = `${/*project*/ ctx[2].title} mobile image`)) {
    				attr_dev(img1, "alt", img1_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Project_details", slots, []);
    	let { handleClickNavigation } = $$props;
    	let { handleClickProject } = $$props;
    	let { selectedProject } = $$props;
    	let project = projects.find(p => p.title.toLowerCase() === selectedProject.toLowerCase());
    	let projectID = projects.indexOf(project);

    	beforeUpdate(() => {
    		$$invalidate(2, project = projects.find(p => p.title.toLowerCase() === selectedProject.toLowerCase()));
    	});

    	const writable_props = ["handleClickNavigation", "handleClickProject", "selectedProject"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Project_details> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickNavigation(navigation.work);
    	const click_handler_1 = () => handleClickProject(projects[$$invalidate(3, --projectID) % projects.length].title);
    	const click_handler_2 = () => handleClickProject(projects[$$invalidate(3, ++projectID) % projects.length].title);

    	$$self.$$set = $$props => {
    		if ("handleClickNavigation" in $$props) $$invalidate(0, handleClickNavigation = $$props.handleClickNavigation);
    		if ("handleClickProject" in $$props) $$invalidate(1, handleClickProject = $$props.handleClickProject);
    		if ("selectedProject" in $$props) $$invalidate(4, selectedProject = $$props.selectedProject);
    	};

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		projects,
    		navigation,
    		handleClickNavigation,
    		handleClickProject,
    		selectedProject,
    		project,
    		projectID
    	});

    	$$self.$inject_state = $$props => {
    		if ("handleClickNavigation" in $$props) $$invalidate(0, handleClickNavigation = $$props.handleClickNavigation);
    		if ("handleClickProject" in $$props) $$invalidate(1, handleClickProject = $$props.handleClickProject);
    		if ("selectedProject" in $$props) $$invalidate(4, selectedProject = $$props.selectedProject);
    		if ("project" in $$props) $$invalidate(2, project = $$props.project);
    		if ("projectID" in $$props) $$invalidate(3, projectID = $$props.projectID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		handleClickNavigation,
    		handleClickProject,
    		project,
    		projectID,
    		selectedProject,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Project_details extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			handleClickNavigation: 0,
    			handleClickProject: 1,
    			selectedProject: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project_details",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleClickNavigation*/ ctx[0] === undefined && !("handleClickNavigation" in props)) {
    			console.warn("<Project_details> was created without expected prop 'handleClickNavigation'");
    		}

    		if (/*handleClickProject*/ ctx[1] === undefined && !("handleClickProject" in props)) {
    			console.warn("<Project_details> was created without expected prop 'handleClickProject'");
    		}

    		if (/*selectedProject*/ ctx[4] === undefined && !("selectedProject" in props)) {
    			console.warn("<Project_details> was created without expected prop 'selectedProject'");
    		}
    	}

    	get handleClickNavigation() {
    		throw new Error("<Project_details>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickNavigation(value) {
    		throw new Error("<Project_details>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClickProject() {
    		throw new Error("<Project_details>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickProject(value) {
    		throw new Error("<Project_details>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedProject() {
    		throw new Error("<Project_details>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedProject(value) {
    		throw new Error("<Project_details>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/portfolio.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/components/portfolio.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i].title;
    	child_ctx[5] = list[i].webImage;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (64:2) {:else}
    function create_else_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = projects;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*projects, handleClickProject*/ 2) {
    				each_value = projects;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (44:2) {#if selectedProject}
    function create_if_block(ctx) {
    	let button;
    	let svg;
    	let path0;
    	let path1;
    	let t0;
    	let p;
    	let t2;
    	let projectdetails;
    	let current;
    	let mounted;
    	let dispose;

    	projectdetails = new Project_details({
    			props: {
    				selectedProject: /*selectedProject*/ ctx[0],
    				handleClickProject: /*handleClickProject*/ ctx[1],
    				handleClickNavigation: /*handleClickNavigation*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			button = element("button");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Back";
    			t2 = space();
    			create_component(projectdetails.$$.fragment);
    			attr_dev(path0, "d", "M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z");
    			attr_dev(path0, "fill", "#757575");
    			attr_dev(path0, "class", "svelte-1prsfd1");
    			add_location(path0, file$3, 52, 8, 1120);
    			attr_dev(path1, "d", "M0 0h24v24H0z");
    			attr_dev(path1, "fill", "none");
    			attr_dev(path1, "class", "svelte-1prsfd1");
    			add_location(path1, file$3, 55, 8, 1233);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			add_location(svg, file$3, 47, 6, 996);
    			attr_dev(p, "class", "svelte-1prsfd1");
    			add_location(p, file$3, 57, 6, 1291);
    			attr_dev(button, "class", "back-button svelte-1prsfd1");
    			add_location(button, file$3, 44, 4, 893);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(button, t0);
    			append_dev(button, p);
    			insert_dev(target, t2, anchor);
    			mount_component(projectdetails, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const projectdetails_changes = {};
    			if (dirty & /*selectedProject*/ 1) projectdetails_changes.selectedProject = /*selectedProject*/ ctx[0];
    			if (dirty & /*handleClickProject*/ 2) projectdetails_changes.handleClickProject = /*handleClickProject*/ ctx[1];
    			if (dirty & /*handleClickNavigation*/ 4) projectdetails_changes.handleClickNavigation = /*handleClickNavigation*/ ctx[2];
    			projectdetails.$set(projectdetails_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectdetails.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectdetails.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t2);
    			destroy_component(projectdetails, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(44:2) {#if selectedProject}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#each projects as { title, webImage }
    function create_each_block$2(ctx) {
    	let projectimage;
    	let current;

    	projectimage = new Project_image({
    			props: {
    				title: /*title*/ ctx[4],
    				image: /*webImage*/ ctx[5],
    				handleClickProject: /*handleClickProject*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(projectimage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(projectimage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const projectimage_changes = {};
    			if (dirty & /*handleClickProject*/ 2) projectimage_changes.handleClickProject = /*handleClickProject*/ ctx[1];
    			projectimage.$set(projectimage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectimage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectimage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(projectimage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(65:4) {#each projects as { title, webImage }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedProject*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "portfolio svelte-1prsfd1");
    			add_location(div, file$3, 42, 0, 841);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Portfolio", slots, []);
    	let { selectedProject } = $$props;
    	let { handleClickProject } = $$props;
    	let { handleClickNavigation } = $$props;
    	const writable_props = ["selectedProject", "handleClickProject", "handleClickNavigation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Portfolio> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickNavigation(navigation.work);

    	$$self.$$set = $$props => {
    		if ("selectedProject" in $$props) $$invalidate(0, selectedProject = $$props.selectedProject);
    		if ("handleClickProject" in $$props) $$invalidate(1, handleClickProject = $$props.handleClickProject);
    		if ("handleClickNavigation" in $$props) $$invalidate(2, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	$$self.$capture_state = () => ({
    		ProjectImage: Project_image,
    		ProjectDetails: Project_details,
    		projects,
    		navigation,
    		selectedProject,
    		handleClickProject,
    		handleClickNavigation
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedProject" in $$props) $$invalidate(0, selectedProject = $$props.selectedProject);
    		if ("handleClickProject" in $$props) $$invalidate(1, handleClickProject = $$props.handleClickProject);
    		if ("handleClickNavigation" in $$props) $$invalidate(2, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedProject, handleClickProject, handleClickNavigation, click_handler];
    }

    class Portfolio extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			selectedProject: 0,
    			handleClickProject: 1,
    			handleClickNavigation: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Portfolio",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*selectedProject*/ ctx[0] === undefined && !("selectedProject" in props)) {
    			console.warn("<Portfolio> was created without expected prop 'selectedProject'");
    		}

    		if (/*handleClickProject*/ ctx[1] === undefined && !("handleClickProject" in props)) {
    			console.warn("<Portfolio> was created without expected prop 'handleClickProject'");
    		}

    		if (/*handleClickNavigation*/ ctx[2] === undefined && !("handleClickNavigation" in props)) {
    			console.warn("<Portfolio> was created without expected prop 'handleClickNavigation'");
    		}
    	}

    	get selectedProject() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedProject(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClickProject() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickProject(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClickNavigation() {
    		throw new Error("<Portfolio>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickNavigation(value) {
    		throw new Error("<Portfolio>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/staff-profile.svelte generated by Svelte v3.29.0 */

    const file$4 = "src/components/staff-profile.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let p0;
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4;
    	let p2;
    	let t5;
    	let div1_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			p0 = element("p");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(/*title*/ ctx[1]);
    			t4 = space();
    			p2 = element("p");
    			t5 = text(/*about*/ ctx[2]);
    			attr_dev(img, "class", "staff-image svelte-18hr415");
    			if (img.src !== (img_src_value = `images/${/*image*/ ctx[3]}.jpg`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = `${/*name*/ ctx[0]} image`);
    			add_location(img, file$4, 34, 2, 489);
    			attr_dev(p0, "class", "staff-name svelte-18hr415");
    			add_location(p0, file$4, 36, 4, 604);
    			attr_dev(p1, "class", "staff-title svelte-18hr415");
    			add_location(p1, file$4, 37, 4, 641);
    			attr_dev(p2, "class", "staff-about svelte-18hr415");
    			add_location(p2, file$4, 38, 4, 680);
    			attr_dev(div0, "class", "staff-desciption");
    			add_location(div0, file$4, 35, 2, 569);
    			attr_dev(div1, "class", div1_class_value = "staff-profile " + (/*reversed*/ ctx[4] ? "reversed" : "") + " svelte-18hr415");
    			add_location(div1, file$4, 33, 0, 430);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			append_dev(p1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, p2);
    			append_dev(p2, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*image*/ 8 && img.src !== (img_src_value = `images/${/*image*/ ctx[3]}.jpg`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*name*/ 1 && img_alt_value !== (img_alt_value = `${/*name*/ ctx[0]} image`)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    			if (dirty & /*title*/ 2) set_data_dev(t3, /*title*/ ctx[1]);
    			if (dirty & /*about*/ 4) set_data_dev(t5, /*about*/ ctx[2]);

    			if (dirty & /*reversed*/ 16 && div1_class_value !== (div1_class_value = "staff-profile " + (/*reversed*/ ctx[4] ? "reversed" : "") + " svelte-18hr415")) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Staff_profile", slots, []);
    	let { name } = $$props;
    	let { title } = $$props;
    	let { about } = $$props;
    	let { image } = $$props;
    	let { reversed } = $$props;
    	const writable_props = ["name", "title", "about", "image", "reversed"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Staff_profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("about" in $$props) $$invalidate(2, about = $$props.about);
    		if ("image" in $$props) $$invalidate(3, image = $$props.image);
    		if ("reversed" in $$props) $$invalidate(4, reversed = $$props.reversed);
    	};

    	$$self.$capture_state = () => ({ name, title, about, image, reversed });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("about" in $$props) $$invalidate(2, about = $$props.about);
    		if ("image" in $$props) $$invalidate(3, image = $$props.image);
    		if ("reversed" in $$props) $$invalidate(4, reversed = $$props.reversed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, title, about, image, reversed];
    }

    class Staff_profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			name: 0,
    			title: 1,
    			about: 2,
    			image: 3,
    			reversed: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Staff_profile",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Staff_profile> was created without expected prop 'name'");
    		}

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Staff_profile> was created without expected prop 'title'");
    		}

    		if (/*about*/ ctx[2] === undefined && !("about" in props)) {
    			console.warn("<Staff_profile> was created without expected prop 'about'");
    		}

    		if (/*image*/ ctx[3] === undefined && !("image" in props)) {
    			console.warn("<Staff_profile> was created without expected prop 'image'");
    		}

    		if (/*reversed*/ ctx[4] === undefined && !("reversed" in props)) {
    			console.warn("<Staff_profile> was created without expected prop 'reversed'");
    		}
    	}

    	get name() {
    		throw new Error("<Staff_profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Staff_profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Staff_profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Staff_profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get about() {
    		throw new Error("<Staff_profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set about(value) {
    		throw new Error("<Staff_profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Staff_profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Staff_profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reversed() {
    		throw new Error("<Staff_profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reversed(value) {
    		throw new Error("<Staff_profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/about.svelte generated by Svelte v3.29.0 */
    const file$5 = "src/components/about.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i].name;
    	child_ctx[1] = list[i].title;
    	child_ctx[2] = list[i].about;
    	child_ctx[3] = list[i].image;
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (47:4) {#each staff as { name, title, about, image }
    function create_each_block$3(ctx) {
    	let staffprofile;
    	let current;

    	staffprofile = new Staff_profile({
    			props: {
    				name: /*name*/ ctx[0],
    				title: /*title*/ ctx[1],
    				about: /*about*/ ctx[2],
    				image: /*image*/ ctx[3],
    				reversed: /*index*/ ctx[5] % 2 == 0
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(staffprofile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(staffprofile, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(staffprofile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(staffprofile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(staffprofile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(47:4) {#each staff as { name, title, about, image }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div0;
    	let p;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3_value = about.email.label + "";
    	let t3;
    	let a_href_value;
    	let current;
    	let each_value = staff;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "We create.";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			a = element("a");
    			t3 = text(t3_value);
    			add_location(p, file$5, 43, 4, 722);
    			attr_dev(div0, "class", "about-tagline svelte-1iwx72t");
    			add_location(div0, file$5, 42, 2, 690);
    			attr_dev(div1, "class", "svelte-1iwx72t");
    			add_location(div1, file$5, 45, 2, 751);
    			attr_dev(a, "href", a_href_value = about.email.url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1iwx72t");
    			add_location(a, file$5, 51, 2, 919);
    			attr_dev(div2, "class", "about svelte-1iwx72t");
    			add_location(div2, file$5, 41, 0, 668);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, a);
    			append_dev(a, t3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*staff*/ 0) {
    				each_value = staff;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ about, staff, StaffProfile: Staff_profile });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/footer.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1$2 } = globals;
    const file$6 = "src/components/footer.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (54:6) {#each Object.keys(links) as link}
    function create_each_block$4(ctx) {
    	let a;
    	let t_value = links[/*link*/ ctx[0]].label + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = links[/*link*/ ctx[0]].url);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-phwzze");
    			add_location(a, file$6, 54, 8, 1013);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(54:6) {#each Object.keys(links) as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let footer;
    	let div2;
    	let div0;
    	let p;
    	let t1;
    	let div1;
    	let each_value = Object.keys(links);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "© 2020 Jenix Technologies, LTD. All Rights Reserved";
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(p, file$6, 50, 6, 856);
    			attr_dev(div0, "class", "copywrite svelte-phwzze");
    			add_location(div0, file$6, 49, 4, 826);
    			attr_dev(div1, "class", "social-wrapper svelte-phwzze");
    			add_location(div1, file$6, 52, 4, 935);
    			attr_dev(div2, "class", "footer-content svelte-phwzze");
    			add_location(div2, file$6, 48, 2, 793);
    			attr_dev(footer, "class", "svelte-phwzze");
    			add_location(footer, file$6, 47, 0, 782);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links, Object*/ 0) {
    				each_value = Object.keys(links);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ links });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/app.svelte generated by Svelte v3.29.0 */
    const file$7 = "src/app.svelte";

    // (36:2) {#if page === navigation.work}
    function create_if_block_1(ctx) {
    	let portfolio;
    	let current;

    	portfolio = new Portfolio({
    			props: {
    				selectedProject: /*selectedProject*/ ctx[1],
    				handleClickProject: /*handleClickProject*/ ctx[3],
    				handleClickNavigation: /*handleClickNavigation*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(portfolio.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(portfolio, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const portfolio_changes = {};
    			if (dirty & /*selectedProject*/ 2) portfolio_changes.selectedProject = /*selectedProject*/ ctx[1];
    			portfolio.$set(portfolio_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(portfolio.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(portfolio.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(portfolio, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(36:2) {#if page === navigation.work}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#if page === navigation.about}
    function create_if_block$1(ctx) {
    	let about;
    	let current;

    	about = new About({
    			props: {
    				handleClickNavigation: /*handleClickNavigation*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(39:2) {#if page === navigation.about}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let header;
    	let t0;
    	let t1;
    	let t2;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				page: /*page*/ ctx[0],
    				handleClickNavigation: /*handleClickNavigation*/ ctx[2],
    				handleClickHome: /*handleClickHome*/ ctx[4]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*page*/ ctx[0] === navigation.work && create_if_block_1(ctx);
    	let if_block1 = /*page*/ ctx[0] === navigation.about && create_if_block$1(ctx);
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-3gwvnr");
    			add_location(main, file$7, 33, 0, 701);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*page*/ 1) header_changes.page = /*page*/ ctx[0];
    			header.$set(header_changes);

    			if (/*page*/ ctx[0] === navigation.work) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*page*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*page*/ ctx[0] === navigation.about) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*page*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let page = navigation.work;
    	let selectedProject;

    	let handleClickNavigation = selected => {
    		$$invalidate(0, page = selected);
    		$$invalidate(1, selectedProject = null);
    	};

    	let handleClickProject = selected => {
    		$$invalidate(1, selectedProject = selected);
    	};

    	let handleClickHome = () => {
    		$$invalidate(0, page = navigation.work);
    		$$invalidate(1, selectedProject = null);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Portfolio,
    		About,
    		Footer,
    		navigation,
    		page,
    		selectedProject,
    		handleClickNavigation,
    		handleClickProject,
    		handleClickHome
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("selectedProject" in $$props) $$invalidate(1, selectedProject = $$props.selectedProject);
    		if ("handleClickNavigation" in $$props) $$invalidate(2, handleClickNavigation = $$props.handleClickNavigation);
    		if ("handleClickProject" in $$props) $$invalidate(3, handleClickProject = $$props.handleClickProject);
    		if ("handleClickHome" in $$props) $$invalidate(4, handleClickHome = $$props.handleClickHome);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		page,
    		selectedProject,
    		handleClickNavigation,
    		handleClickProject,
    		handleClickHome
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
