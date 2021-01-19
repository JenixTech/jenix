
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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

    const pages = {
      about: "About",
      contact: "Contact"
    };

    const home = {
      intro: {
        text: "Software development from first idea to viable product",
        list: ["Idea development" , "UX design", "Competitive pricing", "In-house developer", "Quick turnaround"]
      },
      fiveSteps: [
        {
          title: "Idea",
          text: "You first thoughts",
          image: "images/lightbulb.svg"
        }, {
          title: "Design",
          text: "UX ideas take shape",
          image: "images/phone.svg"
        }, {
          title: "Build",
          text: "Idea becomes reality",
          image: "images/cogs.svg"
        }, {
          title: "Text",
          text: "Internal + external testing",
          image: "images/checklist.svg"
        }, {
          title: "Publish",
          text: "Launch on app stores",
          image: "images/globe.svg"
        }
      ],
      tech: {
        text: "We use the most trusted technologies to ensure our products stay on the cutting edge.",
        icons: [
          "images/swift.svg",
          "images/kotlin.svg",
          "images/react.svg",
          "images/svelte.svg",
          "images/next.svg",
          "images/tailwind.svg",
          "images/azure.svg",
          "images/aws.svg",
        ]
      } ,
      contact: {
        title: "Start your journey today",
        text: "Get in touch with us to see how we can make your ideas a reality",
        button: "Contact us"
      }
    };

    const about = {
      paragraphs: [
        'Founded in 2020, Jenix Technologies is a full-stack and mobile app development company based in the UK.',
        'Out boutique-in-house team includes a full-time designer, software developer, and a specialist marketing and PR consultant.',
        'Unlike larger enterprises, we take on fewer projects, allowing us the time to get to know and fully understand your idea and vision, so we can fully support you with conceptual challends, all the way through the design, development, and launch cycles.',
        'We approach every project differently on account of your needs, to ensure we work in the most effiecient way for your time and resources whilst maintaining the highest quality results.',
      ],
      staffs: [
        {
          name: "Jemma Grace",
          title: "Co-Founder",
          about: "Jemma is experienced in all aspects of business strategy, operations, and design.",
          image: "images/jemma-bowles.jpg"
        },
        {
          name: "Will Nixon",
          title: "Co-Founder",
          about: "Will is a software engineer experienced in developing full-stack, mobile, and cloud-based applications.",
          image: "images/will-nixon.jpg"
        }
      ],
      values: [
        {
          title: "Our Mission",
          text: "To use our tools and specialist knowledge to make your ideas a reality.",
          image: "images/mission.svg"
        },
        {
          title: "Our Values",
          text: "We work with integrity and always aim to provide a positive customer experience.",
          image: "images/values.svg"
        },
        {
          title: "Our Promise",
          text: "To provide solutions to problems with innovative ideas and technical expertise.",
          image: "images/promise.svg"
        }
      ],
      contact: {
        title: "Contact us to discusss your ideas",
        text: "Get in touch with our friendly team",
        button: "Contact us"
      }
    };

    const contact = {
      title: "Contact Us",
      instructions: "See how we can help take you from ideas to reality:",
      form: "Get in touch",
      submit: "Submit",
      success: "Your form has been submitted!",
      error: "There was an issue submitting your form. Please try again or email as: info@jenixtech.com"
    };

    const actions = {
      newsletter: {
        heading: "Keep up to date with Jenix's latest updates",
        button: "Subscribe",
        success: "You have been successfully subscribed!",
        error: "Something went wrong - please check your email and try again. If you continue to have difficulties, please reach out on our contact page."
      }
    };

    const links = {
      email: "mailto:info@jenixtech.com?subject=New Contact from Website",
      twitter: "https://twitter.com/jenixtech",
      instagram: "https://www.instagram.com/jenixtech",
      facebook: "https://www.facebook.com/jenixtech"
    };

    /* src/components/header.svelte generated by Svelte v3.29.0 */

    const { Object: Object_1 } = globals;
    const file = "src/components/header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (16:6) {#each Object.values(pages) as pageTitle}
    function create_each_block(ctx) {
    	let li;
    	let button;
    	let t0_value = /*pageTitle*/ ctx[4] + "";
    	let t0;
    	let button_class_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[3](/*pageTitle*/ ctx[4], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr_dev(button, "class", button_class_value = "" + ((/*page*/ ctx[0] === /*pageTitle*/ ctx[4]
    			? "text-accent"
    			: "text-light") + " transition duration-150 ease-in-out transform hover:text-accent"));

    			add_location(button, file, 17, 10, 732);
    			add_location(li, file, 16, 8, 717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*page*/ 1 && button_class_value !== (button_class_value = "" + ((/*page*/ ctx[0] === /*pageTitle*/ ctx[4]
    			? "text-accent"
    			: "text-light") + " transition duration-150 ease-in-out transform hover:text-accent"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:6) {#each Object.values(pages) as pageTitle}",
    		ctx
    	});

    	return block;
    }

    // (35:2) {:else}
    function create_else_block(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let h5;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "App ideas, come to life.";
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = "Software company building iOS and Android applications";
    			attr_dev(h1, "class", "text-2xl md:text-3xl font-bold");
    			add_location(h1, file, 36, 4, 1765);
    			attr_dev(h5, "class", "mt-2 text-sm md:text-base");
    			add_location(h5, file, 37, 4, 1842);
    			attr_dev(header, "class", "text-light h-32 sm:h-40 md:h-32 bg-darkSecondary flex flex-col justify-center items-center text-center px-4");
    			add_location(header, file, 35, 2, 1636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, h5);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(35:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#if page === pages.home}
    function create_if_block(ctx) {
    	let header;
    	let div;
    	let h1;
    	let t1;
    	let h5;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "App ideas, come to life.";
    			t1 = space();
    			h5 = element("h5");
    			h5.textContent = "Software company building iOS and Android applications";
    			attr_dev(h1, "class", "text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold");
    			add_location(h1, file, 30, 6, 1401);
    			attr_dev(h5, "class", "mt-2 text-sm md:text-lg");
    			add_location(h5, file, 31, 6, 1505);
    			attr_dev(div, "class", "h-64 sm:h-80 xl:h-96 2xl:h-144 w-full bg-overlay flex flex-col justify-center items-center px-2 sm:px-0");
    			set_style(div, "--overlay-image", "url('/images/header.jpg')");
    			set_style(div, "--overlay-colors", "rgba(22, 28, 34, .7), rgba(22, 28, 34, .7)");
    			add_location(div, file, 29, 4, 1163);
    			attr_dev(header, "class", "text-light h-full bg-darkSecondary flex flex-col justify-center items-center text-center");
    			add_location(header, file, 28, 2, 1053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, h5);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(28:0) {#if page === pages.home}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let ul;
    	let nav_class_value;
    	let t1;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let each_value = Object.values(pages);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] === pages.home) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(img, "class", "w-52 sm:w-40 cursor-pointer");
    			if (img.src !== (img_src_value = "images/logo-white.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Jenix Tech Logo");
    			add_location(img, file, 8, 4, 426);
    			attr_dev(ul, "class", "flex w-36 sm:w-28 md:w-36 justify-between");
    			add_location(ul, file, 14, 4, 606);
    			attr_dev(div, "class", "flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 h-full");
    			add_location(div, file, 7, 2, 298);
    			attr_dev(nav, "class", nav_class_value = "h-36 sm:h-16 py-4 sm:py-0 bg-darkSecondary");
    			add_location(nav, file, 6, 0, 237);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t1, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*page, Object, pages, handleClickNavigation*/ 3) {
    				each_value = Object.values(pages);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t1);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	const writable_props = ["page", "handleClickNavigation"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickNavigation(pages.home);
    	const click_handler_1 = pageTitle => handleClickNavigation(pageTitle);

    	$$self.$$set = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("handleClickNavigation" in $$props) $$invalidate(1, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	$$self.$capture_state = () => ({ pages, page, handleClickNavigation });

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("handleClickNavigation" in $$props) $$invalidate(1, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, handleClickNavigation, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { page: 0, handleClickNavigation: 1 });

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
    }

    /* src/components/footer.svelte generated by Svelte v3.29.0 */
    const file$1 = "src/components/footer.svelte";

    // (41:6) {:else}
    function create_else_block$1(ctx) {
    	let t0;
    	let div;
    	let input;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block = /*newsletterMsg*/ ctx[2] && !/*newsletterSuccess*/ ctx[1] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = `${/*newsletter*/ ctx[3].button.toUpperCase()}`;
    			attr_dev(input, "id", "newletter");
    			attr_dev(input, "class", "mb-4 md:mb-0 md:mr-4 h-10 w-60 sm:w-80 px-2 text-gray-900 bg-light");
    			attr_dev(input, "name", "newletter");
    			attr_dev(input, "type", "email");
    			attr_dev(input, "placeholder", "EMAIL ADDRESS");
    			attr_dev(input, "aria-label", "Newsletter Sign Up");
    			input.required = true;
    			add_location(input, file$1, 45, 8, 1433);
    			attr_dev(button, "id", "submit");
    			attr_dev(button, "class", "bg-accent px-2 rounded transition duration-250 ease-in-out transform hover:opacity-80 h-10 w-40 md:w-32 mx-0");
    			add_location(button, file$1, 55, 8, 1774);
    			attr_dev(div, "class", "my-4 flex flex-col md:flex-row justify-center items-center");
    			add_location(div, file$1, 44, 6, 1352);
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*email*/ ctx[0]);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "input", /*onInputChange*/ ctx[5], false, false, false),
    					listen_dev(button, "click", /*handleSubmit*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*newsletterMsg*/ ctx[2] && !/*newsletterSuccess*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*email*/ 1 && input.value !== /*email*/ ctx[0]) {
    				set_input_value(input, /*email*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(41:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:6) {#if newsletterMsg && newsletterSuccess}
    function create_if_block$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*newsletterMsg*/ ctx[2]);
    			attr_dev(p, "class", "");
    			toggle_class(p, "success", /*newsletterSuccess*/ ctx[1]);
    			add_location(p, file$1, 39, 8, 1166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newsletterMsg*/ 4) set_data_dev(t, /*newsletterMsg*/ ctx[2]);

    			if (dirty & /*newsletterSuccess*/ 2) {
    				toggle_class(p, "success", /*newsletterSuccess*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(39:6) {#if newsletterMsg && newsletterSuccess}",
    		ctx
    	});

    	return block;
    }

    // (42:6) {#if newsletterMsg && !newsletterSuccess}
    function create_if_block_1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*newsletterMsg*/ ctx[2]);
    			attr_dev(p, "class", "");
    			add_location(p, file$1, 42, 8, 1302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*newsletterMsg*/ 4) set_data_dev(t, /*newsletterMsg*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(42:6) {#if newsletterMsg && !newsletterSuccess}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let footer;
    	let div3;
    	let div0;
    	let p0;
    	let t1;
    	let t2;
    	let div1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let a0_href_value;
    	let t3;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let a1_href_value;
    	let t4;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let a2_href_value;
    	let t5;
    	let a3;
    	let img3;
    	let img3_src_value;
    	let a3_href_value;
    	let t6;
    	let div2;
    	let p1;

    	function select_block_type(ctx, dirty) {
    		if (/*newsletterMsg*/ ctx[2] && /*newsletterSuccess*/ ctx[1]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = `${/*newsletter*/ ctx[3].heading}`;
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			div1 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t3 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t4 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t5 = space();
    			a3 = element("a");
    			img3 = element("img");
    			t6 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "© 2020 Jenix Technologies LTD";
    			attr_dev(p0, "class", "");
    			add_location(p0, file$1, 37, 6, 1074);
    			attr_dev(div0, "class", "");
    			add_location(div0, file$1, 36, 4, 1053);
    			attr_dev(img0, "class", "w-8 mx-2 transition duration-250 ease-in-out transform hover:opacity-80");
    			if (img0.src !== (img0_src_value = "images/email.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "social-icon");
    			add_location(img0, file$1, 63, 8, 2130);
    			attr_dev(a0, "href", a0_href_value = links.email);
    			attr_dev(a0, "rel", "noopener");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$1, 62, 6, 2068);
    			attr_dev(img1, "class", "w-8 mx-2 transition duration-250 ease-in-out transform hover:opacity-80");
    			if (img1.src !== (img1_src_value = "images/twitter.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "social-icon");
    			add_location(img1, file$1, 66, 8, 2340);
    			attr_dev(a1, "href", a1_href_value = links.twitter);
    			attr_dev(a1, "rel", "noopener");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$1, 65, 6, 2276);
    			attr_dev(img2, "class", "w-8 mx-2 transition duration-250 ease-in-out transform hover:opacity-80");
    			if (img2.src !== (img2_src_value = "images/facebook.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "social-icon");
    			add_location(img2, file$1, 69, 8, 2553);
    			attr_dev(a2, "href", a2_href_value = links.facebook);
    			attr_dev(a2, "rel", "noopener");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file$1, 68, 6, 2488);
    			attr_dev(img3, "class", "w-8 mx-2 transition duration-250 ease-in-out transform hover:opacity-80");
    			if (img3.src !== (img3_src_value = "images/instagram.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "social-icon");
    			add_location(img3, file$1, 72, 8, 2768);
    			attr_dev(a3, "href", a3_href_value = links.instagram);
    			attr_dev(a3, "rel", "noopener");
    			attr_dev(a3, "target", "_blank");
    			add_location(a3, file$1, 71, 6, 2702);
    			attr_dev(div1, "class", "mb-5 flex");
    			add_location(div1, file$1, 61, 4, 2038);
    			add_location(p1, file$1, 76, 8, 3001);
    			attr_dev(div2, "class", "flex justify-center items-center text-xs text-light");
    			add_location(div2, file$1, 75, 4, 2927);
    			attr_dev(div3, "class", "flex flex-col items-center justify-center p-4 text-center");
    			add_location(div3, file$1, 35, 2, 977);
    			attr_dev(footer, "class", "text-light h-46 py-5 bg-darkSecondary");
    			add_location(footer, file$1, 34, 0, 920);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div3);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			if_block.m(div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, a0);
    			append_dev(a0, img0);
    			append_dev(div1, t3);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div1, t4);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t5);
    			append_dev(div1, a3);
    			append_dev(a3, img3);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			if_block.d();
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
    	validate_slots("Footer", slots, []);
    	const { newsletter } = actions;
    	let email;
    	let successMsg = newsletter.success;
    	let newsletterSuccess = false;
    	let newsletterMsg;

    	async function handleSubmit() {
    		const url = "https://bize978r9h.execute-api.us-east-2.amazonaws.com/Production/join-newsletter";

    		const res = await fetch(url, {
    			method: "POST",
    			body: JSON.stringify({ email })
    		});

    		const response = await res.json();

    		if (response.statusCode && response.statusCode === 200) {
    			$$invalidate(1, newsletterSuccess = true);
    			$$invalidate(2, newsletterMsg = successMsg);
    		} else {
    			const body = JSON.parse(response.body);
    			$$invalidate(1, newsletterSuccess = false);
    			$$invalidate(2, newsletterMsg = body.message);
    		}
    	}

    	function onInputChange(e) {
    		if (!newsletterMsg) {
    			return;
    		}

    		if (e.target.value === "" && newsletterMsg) {
    			$$invalidate(2, newsletterMsg = null);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		email = this.value;
    		$$invalidate(0, email);
    	}

    	$$self.$capture_state = () => ({
    		actions,
    		links,
    		newsletter,
    		email,
    		successMsg,
    		newsletterSuccess,
    		newsletterMsg,
    		handleSubmit,
    		onInputChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("email" in $$props) $$invalidate(0, email = $$props.email);
    		if ("successMsg" in $$props) successMsg = $$props.successMsg;
    		if ("newsletterSuccess" in $$props) $$invalidate(1, newsletterSuccess = $$props.newsletterSuccess);
    		if ("newsletterMsg" in $$props) $$invalidate(2, newsletterMsg = $$props.newsletterMsg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		email,
    		newsletterSuccess,
    		newsletterMsg,
    		newsletter,
    		handleSubmit,
    		onInputChange,
    		input_input_handler
    	];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/lemmi.svelte generated by Svelte v3.29.0 */

    const file$2 = "src/components/lemmi.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let div1;
    	let a;
    	let t2;
    	let sup;
    	let t4;
    	let p0;
    	let t6;
    	let p1;
    	let t8;
    	let div0;
    	let button0;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let button1;
    	let img3;
    	let img3_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div1 = element("div");
    			a = element("a");
    			t2 = text("Lemmi");
    			sup = element("sup");
    			sup.textContent = "®";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Lemmi was designed for people who struggle with their speech.";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "This assistive text-to-speech (AAC) app provides a tool to communicate more easily, allowing users the independence to fully take part in conversations, and to share their thoughts and needs clearly with others.";
    			t8 = space();
    			div0 = element("div");
    			button0 = element("button");
    			img2 = element("img");
    			t9 = space();
    			button1 = element("button");
    			img3 = element("img");
    			attr_dev(img0, "class", "sm:hidden h-24");
    			if (img0.src !== (img0_src_value = "images/lemmi-logo.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Lemmi Logo");
    			add_location(img0, file$2, 12, 4, 477);
    			attr_dev(img1, "class", "hidden sm:flex h-96 mr-12");
    			if (img1.src !== (img1_src_value = "images/hero-image.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Lemmi shown on an iPad and iPhone");
    			add_location(img1, file$2, 13, 4, 557);
    			attr_dev(sup, "class", "text-sm align-top");
    			add_location(sup, file$2, 19, 163, 875);
    			attr_dev(a, "href", "https://www.lemmichat.com");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "text-3xl font-semibold mb-6 transition duration-250 ease-in-out transform hover:text-accent");
    			add_location(a, file$2, 19, 6, 718);
    			attr_dev(p0, "class", "text-sm sm:text-base mb-4");
    			add_location(p0, file$2, 20, 6, 924);
    			attr_dev(p1, "class", "text-sm sm:text-base");
    			add_location(p1, file$2, 21, 6, 1033);
    			if (img2.src !== (img2_src_value = "images/app-store.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Download on the App Store");
    			add_location(img2, file$2, 27, 10, 1457);
    			attr_dev(button0, "class", "w-28 sm:mr-10");
    			add_location(button0, file$2, 23, 8, 1353);
    			if (img3.src !== (img3_src_value = "images/play-store.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Download on the Play Store");
    			add_location(img3, file$2, 35, 10, 1670);
    			attr_dev(button1, "class", "w-32");
    			add_location(button1, file$2, 31, 8, 1574);
    			attr_dev(div0, "class", "mt-10 flex justify-between sm:justify-start");
    			add_location(div0, file$2, 22, 6, 1287);
    			attr_dev(div1, "class", "mt-8");
    			add_location(div1, file$2, 18, 4, 693);
    			attr_dev(div2, "class", "max-w-7xl mx-auto sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full");
    			add_location(div2, file$2, 11, 2, 355);
    			attr_dev(div3, "class", "flex flex-col sm:flex-row bg-lemmi h-full py-8 px-5 items-center text-darkSecondary");
    			add_location(div3, file$2, 10, 0, 255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t0);
    			append_dev(div2, img1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, t2);
    			append_dev(a, sup);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, img2);
    			append_dev(div0, t9);
    			append_dev(div0, button1);
    			append_dev(button1, img3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
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
    	validate_slots("Lemmi", slots, []);

    	const openStore = store => {
    		if (store === "app") {
    			window.open("https://apps.apple.com/us/app/lemmi/id1519868911");
    		} else {
    			window.open("http://play.google.com/store/apps/details?id=com.jenix.lemmi");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lemmi> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => openStore("app");
    	const click_handler_1 = () => openStore("play");
    	$$self.$capture_state = () => ({ openStore });
    	return [openStore, click_handler, click_handler_1];
    }

    class Lemmi extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lemmi",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/home.svelte generated by Svelte v3.29.0 */
    const file$3 = "src/pages/home.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (13:6) {#each intro.list as item}
    function create_each_block_2(ctx) {
    	let li;
    	let span;
    	let t1;
    	let t2_value = /*item*/ ctx[12] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			span.textContent = "✔";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span, "class", "mr-3");
    			add_location(span, file$3, 14, 10, 568);
    			add_location(li, file$3, 13, 8, 553);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(13:6) {#each intro.list as item}",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#each fiveSteps as step, index}
    function create_each_block_1(ctx) {
    	let li;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t1;
    	let div3;
    	let div2;
    	let div1;
    	let t2_value = /*index*/ ctx[11] + 1 + "";
    	let t2;
    	let t3;
    	let p0;
    	let t4_value = /*step*/ ctx[9].title + "";
    	let t4;
    	let t5;
    	let p1;
    	let t6_value = /*step*/ ctx[9].text + "";
    	let t6;
    	let t7;
    	let li_class_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p1 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(div0, "class", div0_class_value = "hidden sm:flex border-solid border-2 border-darkSecondary border-opacity-70 h-12 " + (/*index*/ ctx[11] % 2 === 0 ? "mt-3" : "mb-3"));
    			add_location(div0, file$3, 27, 10, 1300);
    			attr_dev(img, "class", "h-12 mb-2");
    			if (img.src !== (img_src_value = /*step*/ ctx[9].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*step*/ ctx[9].title);
    			add_location(img, file$3, 28, 10, 1443);
    			attr_dev(div1, "class", "mr-3 border-solid border-2 border-darkSecondary rounded-full w-7 h-7 flex justify-center items-center");
    			add_location(div1, file$3, 31, 14, 1622);
    			attr_dev(p0, "class", "text-xl text-accent text-center");
    			add_location(p0, file$3, 32, 14, 1769);
    			attr_dev(div2, "class", "flex mb-1 sm:mb-0 justify-center");
    			add_location(div2, file$3, 30, 12, 1561);
    			attr_dev(p1, "class", "text-sm");
    			add_location(p1, file$3, 34, 12, 1860);
    			attr_dev(div3, "class", "flex flex-col sm:mb-3");
    			add_location(div3, file$3, 29, 10, 1513);
    			attr_dev(li, "class", li_class_value = "flex flex-col " + (/*index*/ ctx[11] % 2 === 0 ? "sm:flex-col-reverse" : "") + " items-center mb-10 sm:relative " + (/*index*/ ctx[11] % 2 === 0 ? "-top-28" : "top-36"));
    			add_location(li, file$3, 26, 8, 1144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(li, t0);
    			append_dev(li, img);
    			append_dev(li, t1);
    			append_dev(li, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div2, t3);
    			append_dev(div2, p0);
    			append_dev(p0, t4);
    			append_dev(div3, t5);
    			append_dev(div3, p1);
    			append_dev(p1, t6);
    			append_dev(li, t7);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(26:6) {#each fiveSteps as step, index}",
    		ctx
    	});

    	return block;
    }

    // (52:6) {#each tech.icons as src}
    function create_each_block$1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "h-10 mx-3 my-4");
    			if (img.src !== (img_src_value = /*src*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*src*/ ctx[6].split("/")[1]);
    			add_location(img, file$3, 52, 8, 2498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(52:6) {#each tech.icons as src}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section0;
    	let div0;
    	let p0;
    	let t1;
    	let ul0;
    	let t2;
    	let section1;
    	let div1;
    	let p1;
    	let t3;
    	let span;
    	let t5;
    	let t6;
    	let ul1;
    	let t7;
    	let section2;
    	let p2;
    	let t9;
    	let section3;
    	let lemmi;
    	let t10;
    	let section4;
    	let div3;
    	let p3;
    	let t12;
    	let div2;
    	let t13;
    	let section5;
    	let div5;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t14;
    	let div4;
    	let p4;
    	let t16;
    	let p5;
    	let t18;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*intro*/ ctx[1].list;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*fiveSteps*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	lemmi = new Lemmi({ $$inline: true });
    	let each_value = /*tech*/ ctx[3].icons;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = `${/*intro*/ ctx[1].text}`;
    			t1 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			section1 = element("section");
    			div1 = element("div");
    			p1 = element("p");
    			t3 = text("Bring your app to life with us ");
    			span = element("span");
    			span.textContent = "five";
    			t5 = text(" easy steps");
    			t6 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			section2 = element("section");
    			p2 = element("p");
    			p2.textContent = "Recent Projects";
    			t9 = space();
    			section3 = element("section");
    			create_component(lemmi.$$.fragment);
    			t10 = space();
    			section4 = element("section");
    			div3 = element("div");
    			p3 = element("p");
    			p3.textContent = `${/*tech*/ ctx[3].text}`;
    			t12 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t13 = space();
    			section5 = element("section");
    			div5 = element("div");
    			img = element("img");
    			t14 = space();
    			div4 = element("div");
    			p4 = element("p");
    			p4.textContent = `${/*contact*/ ctx[4].title}`;
    			t16 = space();
    			p5 = element("p");
    			p5.textContent = `${/*contact*/ ctx[4].text}`;
    			t18 = space();
    			button = element("button");
    			button.textContent = `${/*contact*/ ctx[4].button}`;
    			attr_dev(p0, "class", "text-dark text-center text-lg mb-5 sm:mb-0 font-medium sm:mr-5 sm:w-7/12 max-w-lg sm:text-left");
    			add_location(p0, file$3, 10, 4, 380);
    			add_location(ul0, file$3, 11, 4, 507);
    			attr_dev(div0, "class", "max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full");
    			add_location(div0, file$3, 9, 2, 253);
    			attr_dev(section0, "class", "h-64 md:h-52 bg-accent");
    			add_location(section0, file$3, 8, 0, 210);
    			attr_dev(span, "class", "text-accent uppercase");
    			add_location(span, file$3, 23, 101, 991);
    			attr_dev(p1, "class", "font-bold text-xl text-center mb-6 sm:mb-0 sm:absolute");
    			add_location(p1, file$3, 23, 4, 894);
    			attr_dev(ul1, "class", "flex flex-col sm:flex-row");
    			add_location(ul1, file$3, 24, 4, 1058);
    			attr_dev(div1, "class", "max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full text-darkSecondary sm:relative");
    			add_location(div1, file$3, 22, 2, 736);
    			attr_dev(section1, "class", "h-auto sm:h-96 sm:py-60 pt-8 bg-light");
    			add_location(section1, file$3, 21, 0, 678);
    			attr_dev(p2, "class", "text-2xl font-semibold");
    			add_location(p2, file$3, 42, 2, 2045);
    			attr_dev(section2, "class", "h-20 flex justify-center items-center bg-darkSecondary");
    			add_location(section2, file$3, 41, 0, 1970);
    			attr_dev(section3, "class", "h-auto");
    			add_location(section3, file$3, 44, 0, 2110);
    			attr_dev(p3, "class", "text-center mb-8");
    			add_location(p3, file$3, 49, 4, 2366);
    			attr_dev(div2, "class", "flex flex-wrap justify-center");
    			add_location(div2, file$3, 50, 4, 2414);
    			attr_dev(div3, "class", "max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col items-center justify-center h-full");
    			add_location(div3, file$3, 48, 2, 2251);
    			attr_dev(section4, "class", "h-auto py-8 flex justify-center items-center bg-light text-darkSecondary");
    			add_location(section4, file$3, 47, 0, 2158);
    			attr_dev(img, "class", "w-24 sm:mr-20 sm:-mt-2");
    			if (img.src !== (img_src_value = "images/contact.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*contact*/ ctx[4].text);
    			add_location(img, file$3, 59, 4, 2873);
    			attr_dev(p4, "class", "text-xl font-semibold mb-3 sm:mb-2");
    			add_location(p4, file$3, 61, 6, 2991);
    			attr_dev(p5, "class", "text-sm mb-10 sm:mb-7");
    			add_location(p5, file$3, 62, 6, 3063);
    			attr_dev(button, "class", "bg-dark py-2 px-3 text-light rounded shadow-md transition duration-250 ease-in-out transform hover:shadow-inner");
    			add_location(button, file$3, 63, 6, 3121);
    			attr_dev(div4, "class", "mt-10 sm:m-0");
    			add_location(div4, file$3, 60, 4, 2958);
    			attr_dev(div5, "class", "h-full max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full text-center sm:text-left");
    			add_location(div5, file$3, 58, 2, 2714);
    			attr_dev(section5, "class", "h-auto sm:h-56 py-8 flex justify-center items-center bg-lightSecondary text-darkSecondary");
    			add_location(section5, file$3, 57, 0, 2604);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, ul0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ul0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t3);
    			append_dev(p1, span);
    			append_dev(p1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, ul1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul1, null);
    			}

    			insert_dev(target, t7, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, p2);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, section3, anchor);
    			mount_component(lemmi, section3, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, section4, anchor);
    			append_dev(section4, div3);
    			append_dev(div3, p3);
    			append_dev(div3, t12);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t13, anchor);
    			insert_dev(target, section5, anchor);
    			append_dev(section5, div5);
    			append_dev(div5, img);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, p4);
    			append_dev(div4, t16);
    			append_dev(div4, p5);
    			append_dev(div4, t18);
    			append_dev(div4, button);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*intro*/ 2) {
    				each_value_2 = /*intro*/ ctx[1].list;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*fiveSteps*/ 4) {
    				each_value_1 = /*fiveSteps*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*tech*/ 8) {
    				each_value = /*tech*/ ctx[3].icons;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lemmi.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lemmi.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(section3);
    			destroy_component(lemmi);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(section4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(section5);
    			mounted = false;
    			dispose();
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
    	validate_slots("Home", slots, []);
    	const { intro, fiveSteps, tech, contact } = home;
    	let { handleClickNavigation } = $$props;
    	const writable_props = ["handleClickNavigation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickNavigation(pages.contact);

    	$$self.$$set = $$props => {
    		if ("handleClickNavigation" in $$props) $$invalidate(0, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	$$self.$capture_state = () => ({
    		Lemmi,
    		home,
    		links,
    		pages,
    		intro,
    		fiveSteps,
    		tech,
    		contact,
    		handleClickNavigation
    	});

    	$$self.$inject_state = $$props => {
    		if ("handleClickNavigation" in $$props) $$invalidate(0, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [handleClickNavigation, intro, fiveSteps, tech, contact, click_handler];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { handleClickNavigation: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleClickNavigation*/ ctx[0] === undefined && !("handleClickNavigation" in props)) {
    			console.warn("<Home> was created without expected prop 'handleClickNavigation'");
    		}
    	}

    	get handleClickNavigation() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickNavigation(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/contact.svelte generated by Svelte v3.29.0 */
    const file$4 = "src/pages/contact.svelte";

    // (38:6) {#if success}
    function create_if_block_1$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*success*/ ctx[4]);
    			attr_dev(p, "class", "text-green-500");
    			add_location(p, file$4, 38, 8, 1184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*success*/ 16) set_data_dev(t, /*success*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(38:6) {#if success}",
    		ctx
    	});

    	return block;
    }

    // (41:6) {#if error}
    function create_if_block$2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*error*/ ctx[5]);
    			attr_dev(p, "class", "text-red-500");
    			add_location(p, file$4, 41, 8, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 32) set_data_dev(t, /*error*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:6) {#if error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let div6;
    	let p0;
    	let t1;
    	let div0;
    	let p1;
    	let t3;
    	let t4;
    	let t5;
    	let form;
    	let div3;
    	let div1;
    	let label0;
    	let t7;
    	let input0;
    	let t8;
    	let div2;
    	let label1;
    	let t10;
    	let input1;
    	let t11;
    	let div4;
    	let label2;
    	let t13;
    	let input2;
    	let t14;
    	let div5;
    	let label3;
    	let t16;
    	let textarea;
    	let t17;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = /*success*/ ctx[4] && create_if_block_1$1(ctx);
    	let if_block1 = /*error*/ ctx[5] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div6 = element("div");
    			p0 = element("p");
    			p0.textContent = `${contact.instructions}`;
    			t1 = space();
    			div0 = element("div");
    			p1 = element("p");
    			p1.textContent = `${contact.form}`;
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			form = element("form");
    			div3 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "First Name:*";
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "Last Name:";
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			div4 = element("div");
    			label2 = element("label");
    			label2.textContent = "Email:*";
    			t13 = space();
    			input2 = element("input");
    			t14 = space();
    			div5 = element("div");
    			label3 = element("label");
    			label3.textContent = "Message:*";
    			t16 = space();
    			textarea = element("textarea");
    			t17 = space();
    			button = element("button");
    			button.textContent = `${contact.submit.toUpperCase()}`;
    			attr_dev(p0, "class", "text-center mb-6");
    			add_location(p0, file$4, 34, 4, 1016);
    			attr_dev(p1, "class", "text-accent font-semibold text-xl mb-5");
    			add_location(p1, file$4, 36, 6, 1087);
    			add_location(div0, file$4, 35, 4, 1075);
    			attr_dev(label0, "class", "text-sm");
    			attr_dev(label0, "for", "first-name");
    			add_location(label0, file$4, 47, 10, 1499);
    			attr_dev(input0, "id", "first-name");
    			attr_dev(input0, "class", "bg-lightSecondary h-8 px-2");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "autocomplete", "name");
    			input0.required = true;
    			add_location(input0, file$4, 48, 10, 1570);
    			attr_dev(div1, "class", "flex flex-col mb-3 sm:mb-0 sm:mr-4 sm:w-1/2");
    			add_location(div1, file$4, 46, 8, 1431);
    			attr_dev(label1, "class", "text-sm");
    			attr_dev(label1, "for", "last-name");
    			add_location(label1, file$4, 58, 10, 1890);
    			attr_dev(input1, "id", "last-name");
    			attr_dev(input1, "class", "bg-lightSecondary h-8 px-2");
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "autocomplete", "additional-name");
    			add_location(input1, file$4, 59, 10, 1958);
    			attr_dev(div2, "class", "flex flex-col mb-3 sm:mb-0 sm-ml-4 sm:w-1/2");
    			add_location(div2, file$4, 57, 8, 1822);
    			attr_dev(div3, "class", "flex flex-col sm:flex-row sm:justify-between sm:mb-3");
    			add_location(div3, file$4, 45, 6, 1356);
    			attr_dev(label2, "class", "text-sm");
    			attr_dev(label2, "for", "email");
    			add_location(label2, file$4, 69, 8, 2250);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "id", "email");
    			attr_dev(input2, "class", "bg-lightSecondary h-8 px-2");
    			input2.required = true;
    			attr_dev(input2, "autocomplete", "email");
    			add_location(input2, file$4, 70, 8, 2309);
    			attr_dev(div4, "class", "flex flex-col mb-3");
    			add_location(div4, file$4, 68, 6, 2209);
    			attr_dev(label3, "class", "text-sm");
    			attr_dev(label3, "for", "message");
    			add_location(label3, file$4, 80, 8, 2580);
    			attr_dev(textarea, "id", "message");
    			attr_dev(textarea, "class", "bg-lightSecondary h-32 p-2");
    			textarea.required = true;
    			add_location(textarea, file$4, 81, 8, 2643);
    			attr_dev(div5, "class", "flex flex-col mb-3");
    			add_location(div5, file$4, 79, 6, 2539);
    			attr_dev(form, "id", "contact-form");
    			add_location(form, file$4, 44, 4, 1325);
    			attr_dev(button, "class", "bg-accent rounded px-4 py-2 text-lightSecondary mt-4 sm:w-40 shadow-md transition duration-250 ease-in-out transform hover:shadow-inner");
    			add_location(button, file$4, 89, 4, 2837);
    			attr_dev(div6, "class", "max-w-3xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col h-full");
    			add_location(div6, file$4, 33, 2, 929);
    			attr_dev(section, "class", "h-auto py-8 bg-light text-darkSecondary");
    			add_location(section, file$4, 32, 0, 869);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div6);
    			append_dev(div6, p0);
    			append_dev(div6, t1);
    			append_dev(div6, div0);
    			append_dev(div0, p1);
    			append_dev(div0, t3);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t4);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div6, t5);
    			append_dev(div6, form);
    			append_dev(form, div3);
    			append_dev(div3, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t7);
    			append_dev(div1, input0);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t10);
    			append_dev(div2, input1);
    			append_dev(form, t11);
    			append_dev(form, div4);
    			append_dev(div4, label2);
    			append_dev(div4, t13);
    			append_dev(div4, input2);
    			append_dev(form, t14);
    			append_dev(form, div5);
    			append_dev(div5, label3);
    			append_dev(div5, t16);
    			append_dev(div5, textarea);
    			append_dev(div6, t17);
    			append_dev(div6, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*change_handler*/ ctx[7], false, false, false),
    					listen_dev(input1, "change", /*change_handler_1*/ ctx[8], false, false, false),
    					listen_dev(input2, "change", /*change_handler_2*/ ctx[9], false, false, false),
    					listen_dev(textarea, "change", /*change_handler_3*/ ctx[10], false, false, false),
    					listen_dev(button, "click", /*handleSubmit*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*success*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t4);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*error*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Contact", slots, []);
    	let first, last, email, feedback, success, error;

    	async function handleSubmit(e) {
    		const url = "https://6wi9u41kta.execute-api.us-east-2.amazonaws.com/Production/contact";

    		const res = await fetch(url, {
    			method: "POST",
    			headers: {
    				"Content-Type": "application/json",
    				"Accept": "application/json"
    			},
    			body: JSON.stringify({ feedback, first, last, email })
    		});

    		const response = await res.json();

    		if (response.statusCode && response.statusCode === 200) {
    			$$invalidate(4, success = contact.success);
    			$$invalidate(5, error = undefined);
    			document.getElementById("contact-form").reset();
    		} else {
    			$$invalidate(5, error = contact.error);
    			$$invalidate(4, success = undefined);
    		}

    		$$invalidate(0, first = undefined);
    		$$invalidate(1, last = undefined);
    		$$invalidate(2, email = undefined);
    		$$invalidate(3, feedback = undefined);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	const change_handler = e => $$invalidate(0, first = e.target.value);
    	const change_handler_1 = e => $$invalidate(1, last = e.target.value);
    	const change_handler_2 = e => $$invalidate(2, email = e.target.value);
    	const change_handler_3 = e => $$invalidate(3, feedback = e.target.value);

    	$$self.$capture_state = () => ({
    		contact,
    		first,
    		last,
    		email,
    		feedback,
    		success,
    		error,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("first" in $$props) $$invalidate(0, first = $$props.first);
    		if ("last" in $$props) $$invalidate(1, last = $$props.last);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("feedback" in $$props) $$invalidate(3, feedback = $$props.feedback);
    		if ("success" in $$props) $$invalidate(4, success = $$props.success);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		first,
    		last,
    		email,
    		feedback,
    		success,
    		error,
    		handleSubmit,
    		change_handler,
    		change_handler_1,
    		change_handler_2,
    		change_handler_3
    	];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/about.svelte generated by Svelte v3.29.0 */
    const file$5 = "src/pages/about.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (9:4) {#each paragraphs as text}
    function create_each_block_2$1(ctx) {
    	let p;
    	let t_value = /*text*/ ctx[13] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "text-sm sm:text-base mb-7");
    			add_location(p, file$5, 9, 6, 419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(9:4) {#each paragraphs as text}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#each staffs as staff}
    function create_each_block_1$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let p0;
    	let t1_value = /*staff*/ ctx[10].name + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*staff*/ ctx[10].title + "";
    	let t3;
    	let t4;
    	let p2;
    	let t5_value = /*staff*/ ctx[10].about + "";
    	let t5;
    	let t6;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p2 = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(img, "class", "rounded-lg mb-7 sm:w-44 shadow-lg");
    			if (img.src !== (img_src_value = /*staff*/ ctx[10].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*staff*/ ctx[10].name);
    			add_location(img, file$5, 22, 8, 1084);
    			attr_dev(p0, "class", "font-semibold text-xl sm:text-2xl");
    			add_location(p0, file$5, 23, 8, 1177);
    			attr_dev(p1, "class", "text-sm mb-5");
    			add_location(p1, file$5, 24, 8, 1247);
    			attr_dev(p2, "class", "text-sm");
    			add_location(p2, file$5, 25, 8, 1297);
    			attr_dev(div, "class", "flex flex-col mb-20 sm:mb-0 mx-5 justify-center items-center w-full");
    			add_location(div, file$5, 21, 6, 994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, p0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(div, t4);
    			append_dev(div, p2);
    			append_dev(p2, t5);
    			append_dev(div, t6);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(21:4) {#each staffs as staff}",
    		ctx
    	});

    	return block;
    }

    // (33:4) {#each values as value}
    function create_each_block$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let p0;
    	let t1_value = /*value*/ ctx[7].title + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*value*/ ctx[7].text + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(img, "class", "rounded-lg mb-7 w-20 sm:w-16");
    			if (img.src !== (img_src_value = /*value*/ ctx[7].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*value*/ ctx[7].title);
    			add_location(img, file$5, 34, 8, 1747);
    			attr_dev(p0, "class", "font-semibold text-xl sm:text-lg");
    			add_location(p0, file$5, 35, 8, 1836);
    			attr_dev(p1, "class", "text-sm");
    			add_location(p1, file$5, 36, 8, 1906);
    			attr_dev(div, "class", "flex flex-col my-7 sm:my-0 sm:mx-5 justify-between items-center w-full");
    			add_location(div, file$5, 33, 6, 1654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, p0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(div, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(33:4) {#each values as value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section0;
    	let div0;
    	let t0;
    	let p0;
    	let t1;
    	let button0;
    	let t3;
    	let t4;
    	let section1;
    	let div1;
    	let t5;
    	let section2;
    	let div2;
    	let t6;
    	let section3;
    	let div4;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t7;
    	let div3;
    	let p1;
    	let t9;
    	let p2;
    	let t11;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*paragraphs*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*staffs*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*values*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();
    			p0 = element("p");
    			t1 = text("Not sure how to get started? \n      ");
    			button0 = element("button");
    			button0.textContent = "Contact us";
    			t3 = text("\n      to talk through your idea.");
    			t4 = space();
    			section1 = element("section");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			section2 = element("section");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			section3 = element("section");
    			div4 = element("div");
    			img = element("img");
    			t7 = space();
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = `${/*contact*/ ctx[3].title}`;
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = `${/*contact*/ ctx[3].text}`;
    			t11 = space();
    			button1 = element("button");
    			button1.textContent = `${/*contact*/ ctx[3].button}`;
    			attr_dev(button0, "class", "text-accent cursor-pointer");
    			add_location(button0, file$5, 13, 6, 529);
    			add_location(p0, file$5, 11, 4, 483);
    			attr_dev(div0, "class", "h-full max-w-3xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col items-center justify-center h-full text-darkSecondary text-center");
    			add_location(div0, file$5, 7, 2, 233);
    			attr_dev(section0, "class", "h-auto py-10 flex justify-center items-center bg-light");
    			add_location(section0, file$5, 6, 0, 158);
    			attr_dev(div1, "class", "h-full max-w-4xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-between h-full text-darkSecondary text-center");
    			add_location(div1, file$5, 19, 2, 798);
    			attr_dev(section1, "class", "h-auto py-10 flex justify-center items-center bg-lightSecondary");
    			add_location(section1, file$5, 18, 0, 714);
    			attr_dev(div2, "class", "h-full max-w-6xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-between h-full text-darkSecondary text-center");
    			add_location(div2, file$5, 31, 2, 1458);
    			attr_dev(section2, "class", "h-auto py-10 flex justify-center items-center bg-accent");
    			add_location(section2, file$5, 30, 0, 1382);
    			attr_dev(img, "class", "w-24 sm:mr-20 sm:-mt-2");
    			if (img.src !== (img_src_value = "images/contact.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*contact*/ ctx[3].text);
    			add_location(img, file$5, 43, 4, 2259);
    			attr_dev(p1, "class", "text-xl font-semibold mb-3 sm:mb-2");
    			add_location(p1, file$5, 45, 6, 2377);
    			attr_dev(p2, "class", "text-sm mb-10 sm:mb-7");
    			add_location(p2, file$5, 46, 6, 2449);
    			attr_dev(button1, "class", "bg-dark py-2 px-3 text-light rounded shadow-md transition duration-250 ease-in-out transform hover:shadow-inner");
    			add_location(button1, file$5, 47, 6, 2507);
    			attr_dev(div3, "class", "mt-10 sm:m-0");
    			add_location(div3, file$5, 44, 4, 2344);
    			attr_dev(div4, "class", "h-full max-w-7xl mx-auto px-6 sm:px10 md:px-20 xl:px-0 flex flex-col sm:flex-row items-center justify-center h-full text-center sm:text-left");
    			add_location(div4, file$5, 42, 2, 2100);
    			attr_dev(section3, "class", "h-auto sm:h-56 py-8 flex justify-center items-center bg-lightSecondary text-darkSecondary");
    			add_location(section3, file$5, 41, 0, 1990);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(p0, button0);
    			append_dev(p0, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t6, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, div4);
    			append_dev(div4, img);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, p1);
    			append_dev(div3, t9);
    			append_dev(div3, p2);
    			append_dev(div3, t11);
    			append_dev(div3, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*paragraphs*/ 2) {
    				each_value_2 = /*paragraphs*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(div0, t0);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*staffs*/ 4) {
    				each_value_1 = /*staffs*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*values*/ 16) {
    				each_value = /*values*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
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
    			if (detaching) detach_dev(section0);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(section2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(section3);
    			mounted = false;
    			run_all(dispose);
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
    	const { paragraphs, staffs, contact, values } = about;
    	let { handleClickNavigation } = $$props;
    	const writable_props = ["handleClickNavigation"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClickNavigation(pages.contact);
    	const click_handler_1 = () => handleClickNavigation(pages.contact);

    	$$self.$$set = $$props => {
    		if ("handleClickNavigation" in $$props) $$invalidate(0, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	$$self.$capture_state = () => ({
    		about,
    		pages,
    		paragraphs,
    		staffs,
    		contact,
    		values,
    		handleClickNavigation
    	});

    	$$self.$inject_state = $$props => {
    		if ("handleClickNavigation" in $$props) $$invalidate(0, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		handleClickNavigation,
    		paragraphs,
    		staffs,
    		contact,
    		values,
    		click_handler,
    		click_handler_1
    	];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { handleClickNavigation: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*handleClickNavigation*/ ctx[0] === undefined && !("handleClickNavigation" in props)) {
    			console.warn("<About> was created without expected prop 'handleClickNavigation'");
    		}
    	}

    	get handleClickNavigation() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClickNavigation(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/app.svelte generated by Svelte v3.29.0 */
    const file$6 = "src/app.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let t0;
    	let main;
    	let switch_instance;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				page: /*page*/ ctx[0],
    				handleClickNavigation: /*handleClickNavigation*/ ctx[2]
    			},
    			$$inline: true
    		});

    	var switch_value = /*components*/ ctx[1][/*page*/ ctx[0]];

    	function switch_props(ctx) {
    		return {
    			props: {
    				handleClickNavigation: /*handleClickNavigation*/ ctx[2]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file$6, 24, 0, 619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*page*/ 1) header_changes.page = /*page*/ ctx[0];
    			header.$set(header_changes);

    			if (switch_value !== (switch_value = /*components*/ ctx[1][/*page*/ ctx[0]])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, main, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
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
    	validate_slots("App", slots, []);

    	const components = {
    		[pages.home]: Home,
    		[pages.about]: About,
    		[pages.contact]: Contact
    	};

    	let page = pages.home;

    	let handleClickNavigation = (selected, scrollToTop = false) => {
    		$$invalidate(0, page = selected);

    		if (scrollToTop) {
    			window.scrollTo(0, 0);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Footer,
    		Home,
    		Contact,
    		About,
    		pages,
    		components,
    		page,
    		handleClickNavigation
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("handleClickNavigation" in $$props) $$invalidate(2, handleClickNavigation = $$props.handleClickNavigation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, components, handleClickNavigation];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
