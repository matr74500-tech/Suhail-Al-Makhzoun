import { c as useForwardedRef, i as useRouter, l as useIntersectionObserver, n as dummyMatchContext, o as useHydrated, r as matchContext, s as reactUse } from "../server.js";
import { r as TooltipProvider } from "./tooltip-LM5DC4Aj.js";
import * as React$1 from "react";
import React, { createElement } from "react";
import { BaseRootRoute, BaseRoute, RouterCore, appendUniqueUserTags, createNonReactiveMutableStore, createNonReactiveReadonlyStore, deepEqual, escapeHtml, exactPathTest, functionalUpdate, getAssetCrossOrigin, getScriptPreloadAttrs, hasKeys, invariant, isDangerousProtocol, isModuleNotFoundError, preloadWarning, removeTrailingSlash, replaceEqualDeep, resolveManifestCssLink } from "@tanstack/router-core";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { batch, createAtom, useStore } from "@tanstack/react-store";
import { isServer } from "@tanstack/router-core/isServer";
import { flushSync } from "react-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
//#region node_modules/@tanstack/react-router/dist/esm/useMatch.js
var dummyStore = {
	get: () => void 0,
	subscribe: () => ({ unsubscribe: () => {} })
};
/**
* Read and select the nearest or targeted route match.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchHook
*/
function useMatch(opts) {
	const router = useRouter();
	const nearestMatchId = React$1.useContext(opts.from ? dummyMatchContext : matchContext);
	const key = opts.from ?? nearestMatchId;
	const matchStore = key ? opts.from ? router.stores.getRouteMatchStore(key) : router.stores.matchStores.get(key) : void 0;
	if (isServer ?? router.isServer) {
		const match = matchStore?.get();
		if ((opts.shouldThrow ?? true) && !match) invariant();
		if (match === void 0) return;
		return opts.select ? opts.select(match) : match;
	}
	const previousResult = React$1.useRef(void 0);
	return useStore(matchStore ?? dummyStore, (match) => {
		if ((opts.shouldThrow ?? true) && !match) invariant();
		if (match === void 0) return;
		const selected = opts.select ? opts.select(match) : match;
		if (opts.structuralSharing ?? router.options.defaultStructuralSharing) {
			const shared = replaceEqualDeep(previousResult.current, selected);
			previousResult.current = shared;
			return shared;
		}
		return selected;
	});
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useLoaderData.js
/**
* Read and select the current route's loader data with type‑safety.
*
* Options:
* - `from`/`strict`: Choose which route's data to read and strictness
* - `select`: Map the loader data to a derived value
* - `structuralSharing`: Enable structural sharing for stable references
*
* @returns The loader data (or selected value) for the matched route.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useLoaderDataHook
*/
function useLoaderData(opts) {
	return useMatch({
		from: opts.from,
		strict: opts.strict,
		structuralSharing: opts.structuralSharing,
		select: (s) => {
			return opts.select ? opts.select(s.loaderData) : s.loaderData;
		}
	});
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useLoaderDeps.js
/**
* Read and select the current route's loader dependencies object.
*
* Options:
* - `from`: Choose which route's loader deps to read
* - `select`: Map the deps to a derived value
* - `structuralSharing`: Enable structural sharing for stable references
*
* @returns The loader deps (or selected value) for the matched route.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useLoaderDepsHook
*/
function useLoaderDeps(opts) {
	const { select, ...rest } = opts;
	return useMatch({
		...rest,
		select: (s) => {
			return select ? select(s.loaderDeps) : s.loaderDeps;
		}
	});
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useParams.js
/**
* Access the current route's path parameters with type-safety.
*
* Options:
* - `from`/`strict`: Specify the matched route and whether to enforce strict typing
* - `select`: Project the params object to a derived value for memoized renders
* - `structuralSharing`: Enable structural sharing for stable references
* - `shouldThrow`: Throw if the route is not found in strict contexts
*
* @returns The params object (or selected value) for the matched route.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useParamsHook
*/
function useParams(opts) {
	return useMatch({
		from: opts.from,
		shouldThrow: opts.shouldThrow,
		structuralSharing: opts.structuralSharing,
		strict: opts.strict,
		select: (match) => {
			const params = opts.strict === false ? match.params : match._strictParams;
			return opts.select ? opts.select(params) : params;
		}
	});
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useSearch.js
/**
* Read and select the current route's search parameters with type-safety.
*
* Options:
* - `from`/`strict`: Control which route's search is read and how strictly it's typed
* - `select`: Map the search object to a derived value for render optimization
* - `structuralSharing`: Enable structural sharing for stable references
* - `shouldThrow`: Throw when the route is not found (strict contexts)
*
* @returns The search object (or selected value) for the matched route.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useSearchHook
*/
function useSearch(opts) {
	return useMatch({
		from: opts.from,
		strict: opts.strict,
		shouldThrow: opts.shouldThrow,
		structuralSharing: opts.structuralSharing,
		select: (match) => {
			return opts.select ? opts.select(match.search) : match.search;
		}
	});
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useNavigate.js
/**
* Imperative navigation hook.
*
* Returns a stable `navigate(options)` function to change the current location
* programmatically. Prefer the `Link` component for user-initiated navigation,
* and use this hook from effects, callbacks, or handlers where imperative
* navigation is required.
*
* Options:
* - `from`: Optional route base used to resolve relative `to` paths.
*
* @returns A function that accepts `NavigateOptions`.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useNavigateHook
*/
function useNavigate(_defaultOpts) {
	const router = useRouter();
	return React$1.useCallback((options) => {
		return router.navigate({
			...options,
			from: options.from ?? _defaultOpts?.from
		});
	}, [_defaultOpts?.from, router]);
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useRouteContext.js
function useRouteContext(opts) {
	return useMatch({
		...opts,
		select: (match) => opts.select ? opts.select(match.context) : match.context
	});
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/link.js
/**
* Build anchor-like props for declarative navigation and preloading.
*
* Returns stable `href`, event handlers and accessibility props derived from
* router options and active state. Used internally by `Link` and custom links.
*
* Options cover `to`, `params`, `search`, `hash`, `state`, `preload`,
* `activeProps`, `inactiveProps`, and more.
*
* @returns React anchor props suitable for `<a>` or custom components.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useLinkPropsHook
*/
function useLinkProps(options, forwardedRef) {
	const router = useRouter();
	const innerRef = useForwardedRef(forwardedRef);
	const _isServer = isServer ?? router.isServer;
	const { activeProps, inactiveProps, activeOptions, to, preload: userPreload, preloadDelay: userPreloadDelay, preloadIntentProximity: _preloadIntentProximity, hashScrollIntoView, replace, startTransition, resetScroll, viewTransition, children, target, disabled, style, className, onClick, onBlur, onFocus, onMouseEnter, onMouseLeave, onTouchStart, ignoreBlocker, params: _params, search: _search, hash: _hash, state: _state, mask: _mask, reloadDocument: _reloadDocument, unsafeRelative: _unsafeRelative, from: _from, _fromLocation, ...propsSafeToSpread } = options;
	if (_isServer) {
		const safeInternal = isSafeInternal(to);
		if (typeof to === "string" && !safeInternal && to.indexOf(":") > -1) try {
			new URL(to);
			if (isDangerousProtocol(to, router.protocolAllowlist)) return {
				...propsSafeToSpread,
				ref: innerRef,
				href: void 0,
				...children && { children },
				...target && { target },
				...disabled && { disabled },
				...style && { style },
				...className && { className }
			};
			return {
				...propsSafeToSpread,
				ref: innerRef,
				href: to,
				...children && { children },
				...target && { target },
				...disabled && { disabled },
				...style && { style },
				...className && { className }
			};
		} catch {}
		const next = router.buildLocation({
			...options,
			from: options.from
		});
		const hrefOption = getHrefOption(next.maskedLocation ? next.maskedLocation.publicHref : next.publicHref, next.maskedLocation ? next.maskedLocation.external : next.external, router.history, disabled);
		const externalLink = (() => {
			if (hrefOption?.external) {
				if (isDangerousProtocol(hrefOption.href, router.protocolAllowlist)) return;
				return hrefOption.href;
			}
			if (safeInternal) return void 0;
			if (typeof to === "string" && to.indexOf(":") > -1) try {
				new URL(to);
				if (isDangerousProtocol(to, router.protocolAllowlist)) return;
				return to;
			} catch {}
		})();
		const isActive = (() => {
			if (externalLink) return false;
			const currentLocation = router.stores.location.get();
			const exact = activeOptions?.exact ?? false;
			if (exact) {
				if (!exactPathTest(currentLocation.pathname, next.pathname, router.basepath)) return false;
			} else {
				const currentPathSplit = removeTrailingSlash(currentLocation.pathname, router.basepath);
				const nextPathSplit = removeTrailingSlash(next.pathname, router.basepath);
				if (!(currentPathSplit.startsWith(nextPathSplit) && (currentPathSplit.length === nextPathSplit.length || currentPathSplit[nextPathSplit.length] === "/"))) return false;
			}
			if (activeOptions?.includeSearch ?? true) {
				if (currentLocation.search !== next.search) {
					const currentSearchEmpty = !currentLocation.search || typeof currentLocation.search === "object" && !hasKeys(currentLocation.search);
					const nextSearchEmpty = !next.search || typeof next.search === "object" && !hasKeys(next.search);
					if (!(currentSearchEmpty && nextSearchEmpty)) {
						if (!deepEqual(currentLocation.search, next.search, {
							partial: !exact,
							ignoreUndefined: !activeOptions?.explicitUndefined
						})) return false;
					}
				}
			}
			if (activeOptions?.includeHash) return false;
			return true;
		})();
		if (externalLink) return {
			...propsSafeToSpread,
			ref: innerRef,
			href: externalLink,
			...children && { children },
			...target && { target },
			...disabled && { disabled },
			...style && { style },
			...className && { className }
		};
		const resolvedActiveProps = isActive ? functionalUpdate(activeProps, {}) ?? STATIC_ACTIVE_OBJECT : STATIC_EMPTY_OBJECT;
		const resolvedInactiveProps = isActive ? STATIC_EMPTY_OBJECT : functionalUpdate(inactiveProps, {}) ?? STATIC_EMPTY_OBJECT;
		const resolvedStyle = (() => {
			const baseStyle = style;
			const activeStyle = resolvedActiveProps.style;
			const inactiveStyle = resolvedInactiveProps.style;
			if (!baseStyle && !activeStyle && !inactiveStyle) return;
			if (baseStyle && !activeStyle && !inactiveStyle) return baseStyle;
			if (!baseStyle && activeStyle && !inactiveStyle) return activeStyle;
			if (!baseStyle && !activeStyle && inactiveStyle) return inactiveStyle;
			return {
				...baseStyle,
				...activeStyle,
				...inactiveStyle
			};
		})();
		const resolvedClassName = (() => {
			const baseClassName = className;
			const activeClassName = resolvedActiveProps.className;
			const inactiveClassName = resolvedInactiveProps.className;
			if (!baseClassName && !activeClassName && !inactiveClassName) return "";
			let out = "";
			if (baseClassName) out = baseClassName;
			if (activeClassName) out = out ? `${out} ${activeClassName}` : activeClassName;
			if (inactiveClassName) out = out ? `${out} ${inactiveClassName}` : inactiveClassName;
			return out;
		})();
		return {
			...propsSafeToSpread,
			...resolvedActiveProps,
			...resolvedInactiveProps,
			href: hrefOption?.href,
			ref: innerRef,
			disabled: !!disabled,
			target,
			...resolvedStyle && { style: resolvedStyle },
			...resolvedClassName && { className: resolvedClassName },
			...disabled && STATIC_DISABLED_PROPS,
			...isActive && STATIC_ACTIVE_PROPS
		};
	}
	const isHydrated = useHydrated();
	const _options = React$1.useMemo(() => options, [
		router,
		options.from,
		options._fromLocation,
		options.hash,
		options.to,
		options.search,
		options.params,
		options.state,
		options.mask,
		options.unsafeRelative
	]);
	const currentLocation = useStore(router.stores.location, (l) => l, (prev, next) => prev.href === next.href);
	const next = React$1.useMemo(() => {
		const opts = {
			_fromLocation: currentLocation,
			..._options
		};
		return router.buildLocation(opts);
	}, [
		router,
		currentLocation,
		_options
	]);
	const hrefOptionPublicHref = next.maskedLocation ? next.maskedLocation.publicHref : next.publicHref;
	const hrefOptionExternal = next.maskedLocation ? next.maskedLocation.external : next.external;
	const hrefOption = React$1.useMemo(() => getHrefOption(hrefOptionPublicHref, hrefOptionExternal, router.history, disabled), [
		disabled,
		hrefOptionExternal,
		hrefOptionPublicHref,
		router.history
	]);
	const externalLink = React$1.useMemo(() => {
		if (hrefOption?.external) {
			if (isDangerousProtocol(hrefOption.href, router.protocolAllowlist)) return;
			return hrefOption.href;
		}
		if (isSafeInternal(to)) return void 0;
		if (typeof to !== "string" || to.indexOf(":") === -1) return void 0;
		try {
			new URL(to);
			if (isDangerousProtocol(to, router.protocolAllowlist)) return;
			return to;
		} catch {}
	}, [
		to,
		hrefOption,
		router.protocolAllowlist
	]);
	const isActive = React$1.useMemo(() => {
		if (externalLink) return false;
		if (activeOptions?.exact) {
			if (!exactPathTest(currentLocation.pathname, next.pathname, router.basepath)) return false;
		} else {
			const currentPathSplit = removeTrailingSlash(currentLocation.pathname, router.basepath);
			const nextPathSplit = removeTrailingSlash(next.pathname, router.basepath);
			if (!(currentPathSplit.startsWith(nextPathSplit) && (currentPathSplit.length === nextPathSplit.length || currentPathSplit[nextPathSplit.length] === "/"))) return false;
		}
		if (activeOptions?.includeSearch ?? true) {
			if (!deepEqual(currentLocation.search, next.search, {
				partial: !activeOptions?.exact,
				ignoreUndefined: !activeOptions?.explicitUndefined
			})) return false;
		}
		if (activeOptions?.includeHash) return isHydrated && currentLocation.hash === next.hash;
		return true;
	}, [
		activeOptions?.exact,
		activeOptions?.explicitUndefined,
		activeOptions?.includeHash,
		activeOptions?.includeSearch,
		currentLocation,
		externalLink,
		isHydrated,
		next.hash,
		next.pathname,
		next.search,
		router.basepath
	]);
	const resolvedActiveProps = isActive ? functionalUpdate(activeProps, {}) ?? STATIC_ACTIVE_OBJECT : STATIC_EMPTY_OBJECT;
	const resolvedInactiveProps = isActive ? STATIC_EMPTY_OBJECT : functionalUpdate(inactiveProps, {}) ?? STATIC_EMPTY_OBJECT;
	const resolvedClassName = [
		className,
		resolvedActiveProps.className,
		resolvedInactiveProps.className
	].filter(Boolean).join(" ");
	const resolvedStyle = (style || resolvedActiveProps.style || resolvedInactiveProps.style) && {
		...style,
		...resolvedActiveProps.style,
		...resolvedInactiveProps.style
	};
	const [isTransitioning, setIsTransitioning] = React$1.useState(false);
	const hasRenderFetched = React$1.useRef(false);
	const preload = options.reloadDocument || externalLink ? false : userPreload ?? router.options.defaultPreload;
	const preloadDelay = userPreloadDelay ?? router.options.defaultPreloadDelay ?? 0;
	const doPreload = React$1.useCallback(() => {
		router.preloadRoute({
			..._options,
			_builtLocation: next
		}).catch((err) => {
			console.warn(err);
			console.warn(preloadWarning);
		});
	}, [
		router,
		_options,
		next
	]);
	useIntersectionObserver(innerRef, React$1.useCallback((entry) => {
		if (entry?.isIntersecting) doPreload();
	}, [doPreload]), intersectionObserverOptions, { disabled: !!disabled || !(preload === "viewport") });
	React$1.useEffect(() => {
		if (hasRenderFetched.current) return;
		if (!disabled && preload === "render") {
			doPreload();
			hasRenderFetched.current = true;
		}
	}, [
		disabled,
		doPreload,
		preload
	]);
	const handleClick = (e) => {
		const elementTarget = e.currentTarget.getAttribute("target");
		const effectiveTarget = target !== void 0 ? target : elementTarget;
		if (!disabled && !isCtrlEvent(e) && !e.defaultPrevented && (!effectiveTarget || effectiveTarget === "_self") && e.button === 0) {
			e.preventDefault();
			flushSync(() => {
				setIsTransitioning(true);
			});
			const unsub = router.subscribe("onResolved", () => {
				unsub();
				setIsTransitioning(false);
			});
			router.navigate({
				..._options,
				replace,
				resetScroll,
				hashScrollIntoView,
				startTransition,
				viewTransition,
				ignoreBlocker
			});
		}
	};
	if (externalLink) return {
		...propsSafeToSpread,
		ref: innerRef,
		href: externalLink,
		...children && { children },
		...target && { target },
		...disabled && { disabled },
		...style && { style },
		...className && { className },
		...onClick && { onClick },
		...onBlur && { onBlur },
		...onFocus && { onFocus },
		...onMouseEnter && { onMouseEnter },
		...onMouseLeave && { onMouseLeave },
		...onTouchStart && { onTouchStart }
	};
	const enqueueIntentPreload = (e) => {
		if (disabled || preload !== "intent") return;
		if (!preloadDelay) {
			doPreload();
			return;
		}
		const eventTarget = e.currentTarget;
		if (timeoutMap.has(eventTarget)) return;
		const id = setTimeout(() => {
			timeoutMap.delete(eventTarget);
			doPreload();
		}, preloadDelay);
		timeoutMap.set(eventTarget, id);
	};
	const handleTouchStart = (_) => {
		if (disabled || preload !== "intent") return;
		doPreload();
	};
	const handleLeave = (e) => {
		if (disabled || !preload || !preloadDelay) return;
		const eventTarget = e.currentTarget;
		const id = timeoutMap.get(eventTarget);
		if (id) {
			clearTimeout(id);
			timeoutMap.delete(eventTarget);
		}
	};
	return {
		...propsSafeToSpread,
		...resolvedActiveProps,
		...resolvedInactiveProps,
		href: hrefOption?.href,
		ref: innerRef,
		onClick: composeHandlers([onClick, handleClick]),
		onBlur: composeHandlers([onBlur, handleLeave]),
		onFocus: composeHandlers([onFocus, enqueueIntentPreload]),
		onMouseEnter: composeHandlers([onMouseEnter, enqueueIntentPreload]),
		onMouseLeave: composeHandlers([onMouseLeave, handleLeave]),
		onTouchStart: composeHandlers([onTouchStart, handleTouchStart]),
		disabled: !!disabled,
		target,
		...resolvedStyle && { style: resolvedStyle },
		...resolvedClassName && { className: resolvedClassName },
		...disabled && STATIC_DISABLED_PROPS,
		...isActive && STATIC_ACTIVE_PROPS,
		...isHydrated && isTransitioning && STATIC_TRANSITIONING_PROPS
	};
}
var STATIC_EMPTY_OBJECT = {};
var STATIC_ACTIVE_OBJECT = { className: "active" };
var STATIC_DISABLED_PROPS = {
	role: "link",
	"aria-disabled": true
};
var STATIC_ACTIVE_PROPS = {
	"data-status": "active",
	"aria-current": "page"
};
var STATIC_TRANSITIONING_PROPS = { "data-transitioning": "transitioning" };
var timeoutMap = /* @__PURE__ */ new WeakMap();
var intersectionObserverOptions = { rootMargin: "100px" };
var composeHandlers = (handlers) => (e) => {
	for (const handler of handlers) {
		if (!handler) continue;
		if (e.defaultPrevented) return;
		handler(e);
	}
};
function getHrefOption(publicHref, external, history, disabled) {
	if (disabled) return void 0;
	if (external) return {
		href: publicHref,
		external: true
	};
	return {
		href: history.createHref(publicHref) || "/",
		external: false
	};
}
function isSafeInternal(to) {
	if (typeof to !== "string") return false;
	const zero = to.charCodeAt(0);
	if (zero === 47) return to.charCodeAt(1) !== 47;
	return zero === 46;
}
/**
* A strongly-typed anchor component for declarative navigation.
* Handles path, search, hash and state updates with optional route preloading
* and active-state styling.
*
* Props:
* - `preload`: Controls route preloading (eg. 'intent', 'render', 'viewport', true/false)
* - `preloadDelay`: Delay in ms before preloading on hover
* - `activeProps`/`inactiveProps`: Additional props merged when link is active/inactive
* - `resetScroll`/`hashScrollIntoView`: Control scroll behavior on navigation
* - `viewTransition`/`startTransition`: Use View Transitions/React transitions for navigation
* - `ignoreBlocker`: Bypass registered blockers
*
* @returns An anchor-like element that navigates without full page reloads.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/linkComponent
*/
var Link = React$1.forwardRef((props, ref) => {
	const { _asChild, ...rest } = props;
	const { type: _type, ...linkProps } = useLinkProps(rest, ref);
	const children = typeof rest.children === "function" ? rest.children({ isActive: linkProps["data-status"] === "active" }) : rest.children;
	if (!_asChild) {
		const { disabled: _, ...rest } = linkProps;
		return React$1.createElement("a", rest, children);
	}
	return React$1.createElement(_asChild, linkProps, children);
});
function isCtrlEvent(e) {
	return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/route.js
var Route$4 = class extends BaseRoute {
	/**
	* @deprecated Use the `createRoute` function instead.
	*/
	constructor(options) {
		super(options);
		this.useMatch = (opts) => {
			return useMatch({
				select: opts?.select,
				from: this.id,
				structuralSharing: opts?.structuralSharing
			});
		};
		this.useRouteContext = (opts) => {
			return useRouteContext({
				...opts,
				from: this.id
			});
		};
		this.useSearch = (opts) => {
			return useSearch({
				select: opts?.select,
				structuralSharing: opts?.structuralSharing,
				from: this.id
			});
		};
		this.useParams = (opts) => {
			return useParams({
				select: opts?.select,
				structuralSharing: opts?.structuralSharing,
				from: this.id
			});
		};
		this.useLoaderDeps = (opts) => {
			return useLoaderDeps({
				...opts,
				from: this.id
			});
		};
		this.useLoaderData = (opts) => {
			return useLoaderData({
				...opts,
				from: this.id
			});
		};
		this.useNavigate = () => {
			return useNavigate({ from: this.fullPath });
		};
		this.Link = React.forwardRef((props, ref) => {
			return /* @__PURE__ */ jsx(Link, {
				ref,
				from: this.fullPath,
				...props
			});
		});
	}
};
/**
* Creates a non-root Route instance for code-based routing.
*
* Use this to define a route that will be composed into a route tree
* (typically via a parent route's `addChildren`). If you're using file-based
* routing, prefer `createFileRoute`.
*
* @param options Route options (path, component, loader, context, etc.).
* @returns A Route instance to be attached to the route tree.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/createRouteFunction
*/
function createRoute(options) {
	return new Route$4(options);
}
var RootRoute = class extends BaseRootRoute {
	/**
	* @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
	*/
	constructor(options) {
		super(options);
		this.useMatch = (opts) => {
			return useMatch({
				select: opts?.select,
				from: this.id,
				structuralSharing: opts?.structuralSharing
			});
		};
		this.useRouteContext = (opts) => {
			return useRouteContext({
				...opts,
				from: this.id
			});
		};
		this.useSearch = (opts) => {
			return useSearch({
				select: opts?.select,
				structuralSharing: opts?.structuralSharing,
				from: this.id
			});
		};
		this.useParams = (opts) => {
			return useParams({
				select: opts?.select,
				structuralSharing: opts?.structuralSharing,
				from: this.id
			});
		};
		this.useLoaderDeps = (opts) => {
			return useLoaderDeps({
				...opts,
				from: this.id
			});
		};
		this.useLoaderData = (opts) => {
			return useLoaderData({
				...opts,
				from: this.id
			});
		};
		this.useNavigate = () => {
			return useNavigate({ from: this.fullPath });
		};
		this.Link = React.forwardRef((props, ref) => {
			return /* @__PURE__ */ jsx(Link, {
				ref,
				from: this.fullPath,
				...props
			});
		});
	}
};
/**
* Creates a root Route instance used to build your route tree.
*
* Typically paired with `createRouter({ routeTree })`. If you need to require
* a typed router context, use `createRootRouteWithContext` instead.
*
* @param options Root route options (component, error, pending, etc.).
* @returns A root route instance.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/createRootRouteFunction
*/
function createRootRoute(options) {
	return new RootRoute(options);
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/fileRoute.js
/**
* Creates a file-based Route factory for a given path.
*
* Used by TanStack Router's file-based routing to associate a file with a
* route. The returned function accepts standard route options. In normal usage
* the `path` string is inserted and maintained by the `tsr` generator.
*
* @param path File path literal for the route (usually auto-generated).
* @returns A function that accepts Route options and returns a Route instance.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/createFileRouteFunction
*/
function createFileRoute(path) {
	return new FileRoute(path, { silent: true }).createRoute;
}
/** 
@deprecated It's no longer recommended to use the `FileRoute` class directly.
Instead, use `createFileRoute('/path/to/file')(options)` to create a file route.
*/
var FileRoute = class {
	constructor(path, _opts) {
		this.path = path;
		this.createRoute = (options) => {
			const route = createRoute(options);
			route.isRoot = false;
			return route;
		};
		this.silent = _opts?.silent;
	}
};
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/lazyRouteComponent.js
/**
* Wrap a dynamic import to create a route component that supports
* `.preload()` and friendly reload-on-module-missing behavior.
*
* @param importer Function returning a module promise
* @param exportName Named export to use (default: `default`)
* @returns A lazy route component compatible with TanStack Router
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/lazyRouteComponentFunction
*/
function lazyRouteComponent(importer, exportName) {
	let loadPromise;
	let comp;
	let error;
	let reload;
	const load = () => {
		if (!loadPromise) loadPromise = importer().then((res) => {
			loadPromise = void 0;
			comp = res[exportName ?? "default"];
		}).catch((err) => {
			error = err;
			if (isModuleNotFoundError(error)) {
				if (error instanceof Error && typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
					const storageKey = `tanstack_router_reload:${error.message}`;
					if (!sessionStorage.getItem(storageKey)) {
						sessionStorage.setItem(storageKey, "1");
						reload = true;
					}
				}
			}
		});
		return loadPromise;
	};
	const lazyComp = function Lazy(props) {
		if (reload) {
			window.location.reload();
			throw new Promise(() => {});
		}
		if (error) throw error;
		if (!comp) if (reactUse) reactUse(load());
		else throw load();
		return React$1.createElement(comp, props);
	};
	lazyComp.preload = load;
	return lazyComp;
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/routerStores.js
var getStoreFactory = (opts) => {
	if (isServer ?? opts.isServer) return {
		createMutableStore: createNonReactiveMutableStore,
		createReadonlyStore: createNonReactiveReadonlyStore,
		batch: (fn) => fn()
	};
	return {
		createMutableStore: createAtom,
		createReadonlyStore: createAtom,
		batch
	};
};
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/router.js
/**
* Creates a new Router instance for React.
*
* Pass the returned router to `RouterProvider` to enable routing.
* Notable options: `routeTree` (your route definitions) and `context`
* (required if the root route was created with `createRootRouteWithContext`).
*
* @param options Router options used to configure the router.
* @returns A Router instance to be provided to `RouterProvider`.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/createRouterFunction
*/
var createRouter$1 = (options) => {
	return new Router(options);
};
var Router = class extends RouterCore {
	constructor(options) {
		super(options, getStoreFactory);
	}
};
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/Asset.js
var noopScriptHandler = () => {};
function setScriptAttrs(script, attrs) {
	if (!attrs) return;
	for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
}
function Asset(asset) {
	const { attrs, children, nonce, preventScriptHoist } = asset;
	switch (asset.tag) {
		case "title": return /* @__PURE__ */ jsx("title", {
			...attrs,
			suppressHydrationWarning: true,
			children
		});
		case "meta": return /* @__PURE__ */ jsx("meta", {
			...attrs,
			suppressHydrationWarning: true
		});
		case "link": return /* @__PURE__ */ jsx("link", {
			...attrs,
			precedence: attrs?.precedence ?? (attrs?.rel === "stylesheet" ? "default" : void 0),
			nonce,
			suppressHydrationWarning: true
		});
		case "style":
			if (asset.inlineCss && false);
			return /* @__PURE__ */ jsx("style", {
				...attrs,
				dangerouslySetInnerHTML: { __html: children },
				nonce
			});
		case "script": return /* @__PURE__ */ jsx(Script, {
			attrs,
			preventScriptHoist,
			children
		});
		default: return null;
	}
}
function Script({ attrs, children, preventScriptHoist }) {
	const router = useRouter();
	const hydrated = useHydrated();
	const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
	React$1.useEffect(() => {
		if (dataScript) return;
		if (attrs?.src) {
			const normSrc = (() => {
				try {
					const base = document.baseURI || window.location.href;
					return new URL(attrs.src, base).href;
				} catch {
					return attrs.src;
				}
			})();
			for (const el of document.querySelectorAll("script[src]")) if (el.src === normSrc) return;
			const script = document.createElement("script");
			setScriptAttrs(script, attrs);
			document.head.appendChild(script);
			return () => script.remove();
		}
		if (typeof children === "string") {
			const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
			const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
			for (const el of document.querySelectorAll("script:not([src])")) {
				if (!(el instanceof HTMLScriptElement)) continue;
				const sType = el.getAttribute("type") ?? "text/javascript";
				const sNonce = el.getAttribute("nonce") ?? void 0;
				if (el.textContent === children && sType === typeAttr && sNonce === nonceAttr) return;
			}
			const script = document.createElement("script");
			script.textContent = children;
			setScriptAttrs(script, attrs);
			document.head.appendChild(script);
			return () => script.remove();
		}
	}, [
		attrs,
		children,
		dataScript
	]);
	if (isServer ?? router.isServer) {
		if (attrs?.src) {
			if (!preventScriptHoist) return /* @__PURE__ */ jsx("script", {
				...attrs,
				suppressHydrationWarning: true
			});
			return /* @__PURE__ */ jsx("script", {
				...attrs,
				onLoad: noopScriptHandler,
				suppressHydrationWarning: true
			});
		}
		if (typeof children === "string") return /* @__PURE__ */ jsx("script", {
			...attrs,
			dangerouslySetInnerHTML: { __html: children },
			suppressHydrationWarning: true
		});
		return null;
	}
	if (dataScript && typeof children === "string") return /* @__PURE__ */ jsx("script", {
		...attrs,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: children }
	});
	if (!hydrated) {
		if (attrs?.src) return /* @__PURE__ */ jsx("script", {
			...attrs,
			suppressHydrationWarning: true
		});
		if (typeof children === "string") return /* @__PURE__ */ jsx("script", {
			...attrs,
			dangerouslySetInnerHTML: { __html: children },
			suppressHydrationWarning: true
		});
	}
	return null;
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/headContentUtils.js
function buildTagsFromMatches(router, nonce, matches, assetCrossOrigin) {
	const routeMeta = matches.map((match) => match.meta).filter((meta) => meta !== void 0);
	const resultMeta = [];
	const metaByAttribute = {};
	let title;
	for (let i = routeMeta.length - 1; i >= 0; i--) {
		const metas = routeMeta[i];
		for (let j = metas.length - 1; j >= 0; j--) {
			const m = metas[j];
			if (!m) continue;
			if (m.title) {
				if (!title) title = {
					tag: "title",
					children: m.title
				};
			} else if ("script:ld+json" in m) try {
				const json = JSON.stringify(m["script:ld+json"]);
				resultMeta.push({
					tag: "script",
					attrs: { type: "application/ld+json" },
					children: escapeHtml(json)
				});
			} catch {}
			else {
				const attribute = m.name ?? m.property;
				if (attribute) if (metaByAttribute[attribute]) continue;
				else metaByAttribute[attribute] = true;
				resultMeta.push({
					tag: "meta",
					attrs: {
						...m,
						nonce
					}
				});
			}
		}
	}
	if (title) resultMeta.push(title);
	if (nonce) resultMeta.push({
		tag: "meta",
		attrs: {
			property: "csp-nonce",
			content: nonce
		}
	});
	resultMeta.reverse();
	const constructedLinks = matches.flatMap((match) => match.links ?? []).filter((link) => link !== void 0).map((link) => ({
		tag: "link",
		attrs: {
			...link,
			nonce
		}
	}));
	const manifest = router.ssr?.manifest;
	const manifestCssTags = [];
	if (manifest) {
		matches.forEach((match) => {
			(manifest.routes[match.routeId]?.css)?.forEach((link) => {
				const resolvedLink = resolveManifestCssLink(link);
				manifestCssTags.push({
					tag: "link",
					attrs: {
						rel: "stylesheet",
						...resolvedLink,
						crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? resolvedLink.crossOrigin,
						suppressHydrationWarning: true,
						nonce
					}
				});
			});
		});
		if (manifest.inlineStyle) manifestCssTags.push({
			tag: "style",
			attrs: {
				...manifest.inlineStyle.attrs,
				nonce
			},
			children: manifest.inlineStyle.children,
			inlineCss: true
		});
	}
	const preloadLinks = [];
	if (manifest) matches.forEach((match) => {
		manifest.routes[match.routeId]?.preloads?.forEach((preload) => {
			preloadLinks.push({
				tag: "link",
				attrs: {
					...getScriptPreloadAttrs(manifest, preload, assetCrossOrigin),
					nonce
				}
			});
		});
	});
	const styles = matches.flatMap((match) => match.styles ?? []).filter((style) => style !== void 0).map(({ children, ...attrs }) => ({
		tag: "style",
		attrs: {
			...attrs,
			nonce
		},
		children
	}));
	const headScripts = matches.flatMap((match) => match.headScripts ?? []).filter((script) => script !== void 0).map(({ children, ...script }) => ({
		tag: "script",
		attrs: {
			...script,
			nonce
		},
		children
	}));
	const tags = [];
	appendUniqueUserTags(tags, resultMeta);
	tags.push(...preloadLinks);
	appendUniqueUserTags(tags, constructedLinks);
	tags.push(...manifestCssTags);
	appendUniqueUserTags(tags, styles);
	appendUniqueUserTags(tags, headScripts);
	return tags;
}
/**
* Build the list of head/link/meta/script tags to render for active matches.
* Used internally by `HeadContent`.
*/
var useTags = (assetCrossOrigin) => {
	const router = useRouter();
	const nonce = router.options.ssr?.nonce;
	if (isServer ?? router.isServer) return buildTagsFromMatches(router, nonce, router.stores.matches.get(), assetCrossOrigin);
	const routeMeta = useStore(router.stores.matches, (matches) => {
		return matches.map((match) => match.meta).filter((meta) => meta !== void 0);
	}, deepEqual);
	const meta = React$1.useMemo(() => {
		const resultMeta = [];
		const metaByAttribute = {};
		let title;
		for (let i = routeMeta.length - 1; i >= 0; i--) {
			const metas = routeMeta[i];
			for (let j = metas.length - 1; j >= 0; j--) {
				const m = metas[j];
				if (!m) continue;
				if (m.title) {
					if (!title) title = {
						tag: "title",
						children: m.title
					};
				} else if ("script:ld+json" in m) try {
					const json = JSON.stringify(m["script:ld+json"]);
					resultMeta.push({
						tag: "script",
						attrs: { type: "application/ld+json" },
						children: escapeHtml(json)
					});
				} catch {}
				else {
					const attribute = m.name ?? m.property;
					if (attribute) if (metaByAttribute[attribute]) continue;
					else metaByAttribute[attribute] = true;
					resultMeta.push({
						tag: "meta",
						attrs: {
							...m,
							nonce
						}
					});
				}
			}
		}
		if (title) resultMeta.push(title);
		if (nonce) resultMeta.push({
			tag: "meta",
			attrs: {
				property: "csp-nonce",
				content: nonce
			}
		});
		resultMeta.reverse();
		return resultMeta;
	}, [routeMeta, nonce]);
	const links = useStore(router.stores.matches, (matches) => {
		return matches.flatMap((match) => match.links ?? []).filter((link) => link !== void 0).map((link) => ({
			tag: "link",
			attrs: {
				...link,
				nonce
			}
		}));
	}, deepEqual);
	const manifestCssTags = useStore(router.stores.matches, (matches) => {
		const manifest = router.ssr?.manifest;
		const tags = [];
		if (!manifest) return tags;
		matches.forEach((match) => {
			manifest.routes[match.routeId]?.css?.forEach((link) => {
				const resolvedLink = resolveManifestCssLink(link);
				tags.push({
					tag: "link",
					attrs: {
						rel: "stylesheet",
						...resolvedLink,
						crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? resolvedLink.crossOrigin,
						suppressHydrationWarning: true,
						nonce
					}
				});
			});
		});
		if (manifest.inlineStyle) tags.push({
			tag: "style",
			attrs: {
				...manifest.inlineStyle.attrs,
				nonce
			},
			children: manifest.inlineStyle.children,
			inlineCss: true
		});
		return tags;
	}, deepEqual);
	const preloadLinks = useStore(router.stores.matches, (matches) => {
		const preloadLinks = [];
		const manifest = router.ssr?.manifest;
		if (!manifest) return preloadLinks;
		matches.forEach((match) => {
			manifest.routes[match.routeId]?.preloads?.forEach((preload) => {
				preloadLinks.push({
					tag: "link",
					attrs: {
						...getScriptPreloadAttrs(manifest, preload, assetCrossOrigin),
						nonce
					}
				});
			});
		});
		return preloadLinks;
	}, deepEqual);
	const styles = useStore(router.stores.matches, (matches) => {
		return matches.flatMap((match) => match.styles ?? []).filter((style) => style !== void 0).map(({ children, ...attrs }) => ({
			tag: "style",
			attrs: {
				...attrs,
				nonce
			},
			children
		}));
	}, deepEqual);
	const headScripts = useStore(router.stores.matches, (matches) => {
		return matches.flatMap((match) => match.headScripts ?? []).filter((script) => script !== void 0).map(({ children, ...script }) => ({
			tag: "script",
			attrs: {
				...script,
				nonce
			},
			children
		}));
	}, deepEqual);
	const tags = [];
	appendUniqueUserTags(tags, meta);
	tags.push(...preloadLinks);
	appendUniqueUserTags(tags, links);
	tags.push(...manifestCssTags);
	appendUniqueUserTags(tags, styles);
	appendUniqueUserTags(tags, headScripts);
	return tags;
};
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/HeadContent.js
/**
* Render route-managed head tags (title, meta, links, styles, head scripts).
* Place inside the document head of your app shell.
* @link https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management
*/
function HeadContent(props) {
	const tags = useTags(props.assetCrossOrigin);
	const nonce = useRouter().options.ssr?.nonce;
	return /* @__PURE__ */ jsx(Fragment, { children: tags.map((tag) => /* @__PURE__ */ createElement(Asset, {
		...tag,
		key: `tsr-meta-${JSON.stringify(tag)}`,
		nonce
	})) });
}
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/Scripts.js
/**
* Render body script tags collected from route matches and SSR manifests.
* Should be placed near the end of the document body.
*/
var Scripts = () => {
	const router = useRouter();
	const nonce = router.options.ssr?.nonce;
	const getAssetScripts = (matches) => {
		const assetScripts = [];
		const manifest = router.ssr?.manifest;
		if (!manifest) return [];
		for (const match of matches) {
			const scripts = manifest.routes[match.routeId]?.scripts;
			if (!scripts) continue;
			for (const asset of scripts) assetScripts.push({
				tag: "script",
				attrs: {
					...asset.attrs,
					nonce
				},
				children: asset.children,
				...typeof asset.attrs?.src === "string" ? { preventScriptHoist: true } : {}
			});
		}
		return assetScripts;
	};
	const getScripts = (matches) => matches.map((match) => match.scripts).flat(1).filter(Boolean).map(({ children, ...script }) => ({
		tag: "script",
		attrs: {
			...script,
			suppressHydrationWarning: true,
			nonce
		},
		children
	}));
	if (isServer ?? router.isServer) {
		const activeMatches = router.stores.matches.get();
		const assetScripts = getAssetScripts(activeMatches);
		return renderScripts(router, getScripts(activeMatches), assetScripts);
	}
	const assetScripts = useStore(router.stores.matches, getAssetScripts, deepEqual);
	return renderScripts(router, useStore(router.stores.matches, getScripts, deepEqual), assetScripts);
};
function renderScripts(router, scripts, assetScripts) {
	const allScripts = [...scripts, ...assetScripts];
	if ((isServer ?? router.isServer) && router.serverSsr) {
		const serverBufferedScript = router.serverSsr.takeBufferedScripts();
		if (serverBufferedScript) allScripts.unshift(serverBufferedScript);
	}
	return /* @__PURE__ */ jsx(Fragment, { children: allScripts.map((asset, i) => /* @__PURE__ */ createElement(Asset, {
		...asset,
		key: `tsr-scripts-${asset.tag}-${i}`
	})) });
}
//#endregion
//#region src/components/ui/sonner.tsx
function Toaster$1({ ...props }) {
	return /* @__PURE__ */ jsx(Toaster, {
		theme: "system",
		className: "toaster group",
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)"
		},
		...props
	});
}
//#endregion
//#region src/index.css?url
var src_default = "/assets/index-BqbSiiQg.css";
//#endregion
//#region src/routes/__root.tsx
/**
* Pre-paint theme script. Runs synchronously in <head> BEFORE first paint, so
* the document renders in the correct theme on the very first frame — no flash.
* Dark mode is a single `.dark` class on <html>; the token values in index.css
* flip under it. Persisted to localStorage, falls back to system preference.
*/
var themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
var queryClient = new QueryClient();
/**
* Root route — owns the HTML document (SSR), global <head> (SEO-ready),
* and the app-wide providers.
*
* NO app chrome (sidebar/top bar) is applied here by default, so every app —
* landing pages, marketing sites, content, games — renders FULL-BLEED.
* Building a SaaS / dashboard app? The sidebar shell already ships at
* `src/routes/app.tsx` (mounted at the real `/app` segment) with pages under
* `src/routes/app/` — add pages there. Never create a pathless `src/routes/_app.tsx`:
* it adds no URL segment, so it (or its `index.tsx`) collides with the root index
* route at "/". Keep this root bare — don't add chrome here.
*
* SEO/AEO: <HeadContent /> renders the merged head() output (title, meta,
* Open Graph, links) on the server, so crawlers and AI bots receive a
* fully-rendered, indexable document on the first request. Per-page routes
* override title/description via their own head().
*
* SSR: this document (and every route) is server-rendered/prerendered. A child
* that reads browser-only state at render — `blink.auth`/`onAuthStateChanged`,
* `localStorage`, `window` — must be wrapped in `<BlinkClientBoundary>`
* (`src/components/BlinkClientBoundary.tsx`), which also covers a whole-page
* client tree, or the page ships blank / hydration-mismatched. Do NOT use the
* route's `ssr: false` — a client-only route in this template hits Start's
* server-context `node:async_hooks` path (a throwing browser stub) and ships a
* BLANK preview ("AsyncLocalStorage is not a constructor"). Do NOT read SDK/auth here.
*/
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0"
			},
			{ title: "Blink App" },
			{
				name: "description",
				content: "An app built with Blink."
			},
			{
				name: "theme-color",
				content: "#0a0a0a"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: "Blink App"
			},
			{
				property: "og:description",
				content: "An app built with Blink."
			},
			{
				property: "og:site_name",
				content: "Blink App"
			},
			{
				property: "og:locale",
				content: "en_US"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "stylesheet",
			href: src_default
		}, {
			rel: "icon",
			type: "image/svg+xml",
			href: "/favicon.svg"
		}]
	}),
	shellComponent: RootDocument
});
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "ar",
		dir: "rtl",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: themeInitScript } }),
			/* @__PURE__ */ jsx(HeadContent, {}),
			/* @__PURE__ */ jsx("script", {
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify({
					"@context": "https://schema.org",
					"@graph": [{
						"@type": "WebSite",
						name: "Blink App",
						url: "/"
					}, {
						"@type": "Organization",
						name: "Blink App",
						url: "/",
						sameAs: []
					}]
				}) }
			}),
			/* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: "/*BLINK_PICKER_RUNTIME_V2*/try{var s=document.createElement('script');s.textContent=decodeURIComponent(escape(atob('KGZ1bmN0aW9uKCl7CiAgJ3VzZSBzdHJpY3QnOwogIC8vIC0tLS0gdmVyc2lvbiBoYW5kc2hha2UgLS0tLQogIC8vIFNpbmdsZSBpbnN0YWxsIGZsYWcgKG1hdGNoZXMgdjEpIOKAlCBsb2FkLW9yZGVyIGRlY2lkZXMgdGhlIHdpbm5lci4gSW4gcHJvZHVjdGlvbgogIC8vIHYyIGFsd2F5cyBydW5zIGZpcnN0ICh3ZSBpbmplY3QgaXQgaW50byA8aGVhZD4gYmVmb3JlIHdpZGdldC5qcyAvIFZpdGUgcGx1Z2luIG91dHB1dCksCiAgLy8gc28gdjEgaGl0cyBpdHMgb3duIGd1YXJkLiBJZiBmb3IgYW55IHJlYXNvbiB2MSBzb21laG93IGxvYWRlZCBmaXJzdCwgd2UgeWllbGQgdG8gaXQKICAvLyAobm8gdW5pbnN0YWxsIEFQSSkg4oCUIHJlZ2lzdGVyaW5nIGJvdGggPSBkb3VibGUgaGFuZGxlcnMsIHdoaWNoIGlzIHdvcnNlIHRoYW4gbWlzc2luZwogIC8vIGEgZmVhdHVyZSBvbiBzdGFsZSBwcm9qZWN0cy4KICBpZiAod2luZG93Ll9fYmxpbmtQaWNrZXJJbnN0YWxsZWQpIHJldHVybjsKICB3aW5kb3cuX19ibGlua1BpY2tlckluc3RhbGxlZCA9IHRydWU7CiAgd2luZG93Ll9fYmxpbmtQaWNrZXJWZXJzaW9uID0gJzIuMS4wJzsKCiAgdmFyIGFjdGl2ZSA9IGZhbHNlOwogIHZhciBob3ZlckVsID0gbnVsbDsKICB2YXIgaG92ZXJPdXRsaW5lID0gbnVsbDsKICB2YXIgc3R5bGVJbnN0YWxsZWQgPSBmYWxzZTsKICAvLyBSdW50aW1lIGlkZW50aXR5IGxpdmVzIGhlcmUsIG5ldmVyIGluIHRoZSBET006IGVsZW1lbnQg4oaSIHJ0OiBpZCwgYW5kIHJ0OiBpZCDihpIgZWxlbWVudC4KICB2YXIgcnVudGltZUlkcyA9IG5ldyBXZWFrTWFwKCk7CiAgdmFyIGVsZW1lbnRzQnlJZCA9IE9iamVjdC5jcmVhdGUobnVsbCk7CiAgLy8gSW5saW5lLWVkaXQgc3RhdGUg4oCUIHNpbmdsZS1jbGljay10by1lZGl0IChGaWdtYSAvIFdlYmZsb3cgLyBSZXBsaXQgcGF0dGVybikuCiAgLy8gQSBwbGFpbiBjbGljayBvbiBpbmxpbmUtZWRpdGFibGUgdGV4dCBzZWxlY3RzIEFORCBlbnRlcnMgY2FyZXQgZWRpdCBpbiBvbmUKICAvLyBzdGVwICh0ZXh0LWlucHV0IGZlZWwpOyBtb2RpZmllci1jbGlja3Mgc3RheSBtdWx0aS1zZWxlY3QuIE5vIHNlY29uZCBjbGljay4KICAvLyBXaGVuIG5vbi1udWxsOiB7IGVsLCBvcmlnaW5hbFRleHQsIG9uS2V5LCBvbkJsdXIgfSDigJQgc3VwcHJlc3NlcyBob3ZlciByaW5nCiAgLy8gYW5kIEVzY2FwZS10b2dnbGVzLCBhbmQgdGhlIGNsaWNrIGhhbmRsZXIgcm91dGVzIGNsaWNrcyBpbnNpZGUgdGhlIGVkaXRpbmcKICAvLyBlbGVtZW50IHRocm91Z2ggbmF0aXZlIGJyb3dzZXIgY2FyZXQgYmVoYXZpb3VyLgogIHZhciBpbmxpbmVFZGl0aW5nID0gbnVsbDsKICAvLyBPcmlnaW4gb2YgdGhlIGVkaXRvciB0aGF0IGxhc3QgbWVzc2FnZWQgdXM7IGV2ZXJ5IHBvc3QgZ29lcyB0aGVyZSAobnVsbCA9IHBvc3Qgbm90aGluZykuCiAgdmFyIGVkaXRvck9yaWdpbiA9IG51bGw7CiAgdmFyIEVESVRPUl9PUklHSU5TID0gWyJodHRwczovL2JsaW5rLm5ldyIsImh0dHBzOi8vc3RhZ2luZy5ibGluay5uZXciLCJodHRwczovL2Rldi5ibGluay5uZXciLCJodHRwczovL2JsaW5rLXByZXZpZXcudmVyY2VsLmFwcCIsImh0dHBzOi8vYmxpbmstc3RhZ2luZy52ZXJjZWwuYXBwIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl07CiAgdmFyIFRFQU1fUFJFVklFV19PUklHSU4gPSBuZXcgUmVnRXhwKCJeaHR0cHM6XFwvXFwvW2EtejAtOS1dKy1ibGlua2RvdG5ld1xcLnZlcmNlbFxcLmFwcCQiKTsKICB2YXIgTE9DQUxfRURJVE9SX09SSUdJTiA9IG5ldyBSZWdFeHAoIl5odHRwOlxcL1xcL2xvY2FsaG9zdDpcXGQrJCIpOwogIHZhciBJTkxJTkVfRURJVF9ERU5ZID0geyBJTlBVVDogMSwgVEVYVEFSRUE6IDEsIFNFTEVDVDogMSwgT1BUSU9OOiAxLCBTQ1JJUFQ6IDEsIFNUWUxFOiAxLCBTVkc6IDEsIFBBVEg6IDEsIElNRzogMSwgQ09ERTogMSwgUFJFOiAxIH07CiAgdmFyIElOTElORV9FRElUX1NJTkdMRV9MSU5FID0geyBIMTogMSwgSDI6IDEsIEgzOiAxLCBINDogMSwgSDU6IDEsIEg2OiAxLCBCVVRUT046IDEsIEE6IDEsIExBQkVMOiAxLCBTVU1NQVJZOiAxIH07CgogIHZhciBDT01QVVRFRF9LRVlTID0gWydjb2xvcicsJ2JhY2tncm91bmRDb2xvcicsJ2ZvbnRTaXplJywnZm9udFdlaWdodCcsJ2ZvbnRGYW1pbHknLCd0ZXh0QWxpZ24nLCd0ZXh0RGVjb3JhdGlvbkxpbmUnLCdib3JkZXJDb2xvcicsJ2JvcmRlcldpZHRoJywnYm9yZGVyU3R5bGUnLCdib3JkZXJSYWRpdXMnLCdvcGFjaXR5JywnZGlzcGxheScsJ3BhZGRpbmdUb3AnLCdwYWRkaW5nUmlnaHQnLCdwYWRkaW5nQm90dG9tJywncGFkZGluZ0xlZnQnLCdtYXJnaW5Ub3AnLCdtYXJnaW5SaWdodCcsJ21hcmdpbkJvdHRvbScsJ21hcmdpbkxlZnQnLCd3aWR0aCcsJ2hlaWdodCcsJ2dhcCcsJ2ZsZXhEaXJlY3Rpb24nLCdqdXN0aWZ5Q29udGVudCcsJ2FsaWduSXRlbXMnLCdsaW5lSGVpZ2h0JywnbGV0dGVyU3BhY2luZyddOwogIHZhciBTS0lQX1RBR1MgPSB7IFNDUklQVDogMSwgU1RZTEU6IDEsIExJTks6IDEsIE1FVEE6IDEsIEhFQUQ6IDEsIE5PU0NSSVBUOiAxLCBURU1QTEFURTogMSB9OwogIC8vIENyb3NzaGFpciB3aGlsZSBwaWNraW5nLCB0ZXh0IGNhcmV0IHdoaWxlIGlubGluZS1lZGl0aW5nIGEgY29udGVudGVkaXRhYmxlLgogIC8vIFRoZSBbY29udGVudGVkaXRhYmxlPSJ0cnVlIl0gcnVsZSBvbiB0aGUgZWRpdGluZyBlbGVtZW50ICsgZGVzY2VuZGFudHMKICAvLyBvdmVycmlkZXMgdGhlIGdsb2JhbCBjcm9zc2hhaXIgc28gdGhlIHVzZXIgc2VlcyB0aGUgcmlnaHQgYWZmb3JkYW5jZS4KICB2YXIgUElDS0VSX0NTUyA9ICcuYmxpbmstcGlja2VyLWFjdGl2ZSwgLmJsaW5rLXBpY2tlci1hY3RpdmUgKiB7IGN1cnNvcjogY3Jvc3NoYWlyICFpbXBvcnRhbnQ7IH0nICsKICAgICcgaHRtbC5ibGluay1waWNrZXItYWN0aXZlIFtkYXRhLWJsaW5rLWVkaXQtaG92ZXJdIHsgY3Vyc29yOiB0ZXh0ICFpbXBvcnRhbnQ7IH0nICsKICAgICcgaHRtbC5ibGluay1waWNrZXItYWN0aXZlIFtjb250ZW50ZWRpdGFibGU9InRydWUiXSwgaHRtbC5ibGluay1waWNrZXItYWN0aXZlIFtjb250ZW50ZWRpdGFibGU9InRydWUiXSAqIHsgY3Vyc29yOiB0ZXh0ICFpbXBvcnRhbnQ7IH0nICsKICAgIC8vIElubGluZSB0ZXh0IGVkaXQ6IGEgZGlzdGluY3QgdGhpbiBzb2xpZCBib3JkZXIgYXJvdW5kIHRoZQogICAgLy8gY29udGVudGVkaXRhYmxlIGVsZW1lbnQgKEZpZ21hIHBhcml0eSDigJQgZGlmZmVyZW50IGZyb20gaG92ZXIgcmluZykuCiAgICAnIGh0bWwuYmxpbmstcGlja2VyLWVkaXRpbmcgW2NvbnRlbnRlZGl0YWJsZT0idHJ1ZSJdIHsgb3V0bGluZTogMS41cHggc29saWQgcmdiYSg1OSwxMzAsMjQ2LDAuOTUpICFpbXBvcnRhbnQ7IG91dGxpbmUtb2Zmc2V0OiAxcHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czogMnB4ICFpbXBvcnRhbnQ7IH0nICsKICAgIC8vIE5ldXRyYWxpemUgdGhlIExFR0FDWSB3aWRnZXQuanMgcGlja2VyJ3MgY2hyb21lLiB3aWRnZXQuanMgbG9hZHMgZnJvbQogICAgLy8gYmxpbmsubmV3L3dpZGdldC5qcyAoY2FuJ3QgYmUgZ2F0ZWQgaW4gbG9jYWwgcHJldmlld3MpLCBhbmQgaXRzIGhvdmVyCiAgICAvLyB0b29sdGlwICguZ3B0LXNlbGVjdG9yLXRvb2x0aXAg4oCUIHRoZSBzdHJheSAiaDEiIGxhYmVsKSArIGRhc2hlZCBob3Zlci8KICAgIC8vIHNlbGVjdGVkIG91dGxpbmVzIGRvdWJsZSB1cCB3aXRoIHRoaXMgdjIgcGlja2VyIGFuZCB0aGUgcGFyZW50J3MgRmlnbWEKICAgIC8vIHNlbGVjdGlvbiBvdmVybGF5LiB2MiBpcyB0aGUgc291cmNlIG9mIHRydXRoLCBzbyBoaWRlIHRoZSBsZWdhY3kgY2hyb21lLgogICAgJyAuZ3B0LXNlbGVjdG9yLXRvb2x0aXAgeyBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7IH0nICsKICAgICcgW2RhdGEtYmxuay1ob3ZlcmVkXTo6YmVmb3JlLCBbZGF0YS1ibG5rLXNlbGVjdGVkXTo6YmVmb3JlIHsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9JzsKCiAgLy8gLS0tLSBzaG9ydCBoYXNoIChDUkMzMi1pc2gsIDgtY2hhciBoZXgpIC0tLS0KICBmdW5jdGlvbiBzaG9ydEhhc2gocyl7CiAgICB2YXIgaCA9IDB4ODExYzlkYzU7CiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHsKICAgICAgaCA9IChoIF4gcy5jaGFyQ29kZUF0KGkpKSA+Pj4gMDsKICAgICAgaCA9IChoICsgKChoIDw8IDEpICsgKGggPDwgNCkgKyAoaCA8PCA3KSArIChoIDw8IDgpICsgKGggPDwgMjQpKSkgPj4+IDA7CiAgICB9CiAgICB2YXIgaGV4ID0gaC50b1N0cmluZygxNik7CiAgICB3aGlsZSAoaGV4Lmxlbmd0aCA8IDgpIGhleCA9ICcwJyArIGhleDsKICAgIHJldHVybiBoZXg7CiAgfQoKICBmdW5jdGlvbiBzaWJsaW5nSW5kZXgoZWwpewogICAgdmFyIGkgPSAwOwogICAgdmFyIG4gPSBlbDsKICAgIHdoaWxlIChuICYmIG4ucHJldmlvdXNFbGVtZW50U2libGluZykgeyBpKys7IG4gPSBuLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7IH0KICAgIHJldHVybiBpOwogIH0KCiAgZnVuY3Rpb24gbWFrZVJ1bnRpbWVJZChlbCl7CiAgICB0cnkgewogICAgICB2YXIgdGFnID0gKGVsLnRhZ05hbWUgfHwgJ2RpdicpLnRvTG93ZXJDYXNlKCk7CiAgICAgIHZhciB0eHQgPSAoZWwudGV4dENvbnRlbnQgfHwgJycpLnNsaWNlKDAsIDMyKTsKICAgICAgcmV0dXJuICdydDonICsgdGFnICsgJzonICsgc2libGluZ0luZGV4KGVsKSArICc6JyArIHNob3J0SGFzaCh0eHQpOwogICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgIHRyeSB7IGNvbnNvbGUuZXJyb3IoJ1tibGluay1waWNrZXJdIG1ha2VSdW50aW1lSWQgZmFpbGVkJywgZXJyKTsgfSBjYXRjaCAoZTIpIHt9CiAgICAgIHJldHVybiAncnQ6ZGl2OjA6MDAwMDAwMDAnOwogICAgfQogIH0KCiAgLy8gLS0tLSBydW50aW1lIGlkZW50aXR5IChtZW1vcnkgb25seSkgLS0tLQogIC8vIEEgc3RhbGUgcnQ6IGF0dHJpYnV0ZSAobWFya3VwIGNvcGllZCBmcm9tIGFuIG9sZCBzdGFtcGVkIERPTSkgaXMgbm90IGEgYnVpbGQgaWQuCiAgZnVuY3Rpb24gYnVpbGRJZE9mKGVsKXsKICAgIHZhciB2ID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWJsbmstaWQnKTsKICAgIHJldHVybiB2ICYmIHYuc2xpY2UoMCwgMykgIT09ICdydDonID8gdiA6IG51bGw7CiAgfQoKICAvLyBBbiBydDogaWQgaXMgY29tcHV0ZWQgb24gZmlyc3QgdXNlIGFuZCBrZXB0IGZvciB0aGUgZWxlbWVudCdzIGxpZmV0aW1lLCBzbyB0ZXh0IGVkaXRzIGtlZXAgaXQuCiAgZnVuY3Rpb24gaWRPZihlbCl7CiAgICB2YXIgYnVpbGRJZCA9IGJ1aWxkSWRPZihlbCk7CiAgICBpZiAoYnVpbGRJZCkgcmV0dXJuIGJ1aWxkSWQ7CiAgICB2YXIgaWQgPSBydW50aW1lSWRzLmdldChlbCkgfHwgbWFrZVJ1bnRpbWVJZChlbCk7CiAgICByZW1lbWJlclJ1bnRpbWVJZChlbCwgaWQpOwogICAgcmV0dXJuIGlkOwogIH0KCiAgZnVuY3Rpb24gcmVtZW1iZXJSdW50aW1lSWQoZWwsIGlkKXsKICAgIHJ1bnRpbWVJZHMuc2V0KGVsLCBpZCk7CiAgICBlbGVtZW50c0J5SWRbaWRdID0gZWw7CiAgfQoKICBmdW5jdGlvbiBmaW5kQnlJZChpZCl7CiAgICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJyB8fCAhaWQpIHJldHVybiBudWxsOwogICAgaWYgKGlkLnNsaWNlKDAsIDMpICE9PSAncnQ6JykgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWJsbmstaWQ9IicgKyBpZC5yZXBsYWNlKC8iL2csICdcXCInKSArICciXScpOwogICAgdmFyIGtub3duID0gZWxlbWVudHNCeUlkW2lkXTsKICAgIGlmIChrbm93biAmJiBrbm93bi5pc0Nvbm5lY3RlZCkgcmV0dXJuIGtub3duOwogICAgaWYgKGtub3duKSBkZWxldGUgZWxlbWVudHNCeUlkW2lkXTsKICAgIHJldHVybiBkb2N1bWVudC5ib2R5ID8gZmluZFJ1bnRpbWVNYXRjaChkb2N1bWVudC5ib2R5LCBpZCkgOiBudWxsOwogIH0KCiAgLy8gRG9jdW1lbnQtb3JkZXIgd2Fsaywgc28gYSBkdXBsaWNhdGUgcnQ6IGlkIHJlc29sdmVzIHRvIGl0cyBmaXJzdCBtYXRjaCBhcyBiZWZvcmUuCiAgZnVuY3Rpb24gZmluZFJ1bnRpbWVNYXRjaChyb290LCBpZCl7CiAgICB2YXIgbWF0Y2ggPSB3YWxrRm9yUnVudGltZUlkKHJvb3QsIGlkKTsKICAgIGlmIChtYXRjaCkgcmVtZW1iZXJSdW50aW1lSWQobWF0Y2gsIGlkKTsKICAgIHJldHVybiBtYXRjaDsKICB9CgogIGZ1bmN0aW9uIHdhbGtGb3JSdW50aW1lSWQobm9kZSwgaWQpewogICAgaWYgKGlzUnVudGltZUNhbmRpZGF0ZShub2RlLCBpZCkgJiYgKHJ1bnRpbWVJZHMuZ2V0KG5vZGUpIHx8IG1ha2VSdW50aW1lSWQobm9kZSkpID09PSBpZCkgcmV0dXJuIG5vZGU7CiAgICB2YXIga2lkcyA9IG5vZGUuY2hpbGRyZW47CiAgICBmb3IgKHZhciBpID0gMDsga2lkcyAmJiBpIDwga2lkcy5sZW5ndGg7IGkrKykgewogICAgICB2YXIgaGl0ID0gd2Fsa0ZvclJ1bnRpbWVJZChraWRzW2ldLCBpZCk7CiAgICAgIGlmIChoaXQpIHJldHVybiBoaXQ7CiAgICB9CiAgICByZXR1cm4gbnVsbDsKICB9CgogIC8vIEJ1aWxkLXRhZ2dlZCBlbGVtZW50cyByZXBvcnQgdGhlaXIgYnVpbGQgaWQsIHNvIG9ubHkgdGhlaXIgZGVzY2VuZGFudHMgY2FuIG1hdGNoIGFuIHJ0OiBpZC4KICAvLyBUaGUgdGFnIHByZWZpeCBjaGVjayBza2lwcyBtYWtlUnVudGltZUlkIGZvciBlbGVtZW50cyBvZiBhbnkgb3RoZXIgdGFnLgogIGZ1bmN0aW9uIGlzUnVudGltZUNhbmRpZGF0ZShlbCwgaWQpewogICAgaWYgKFNLSVBfVEFHU1tlbC50YWdOYW1lXSB8fCBidWlsZElkT2YoZWwpKSByZXR1cm4gZmFsc2U7CiAgICByZXR1cm4gaWQuaW5kZXhPZigncnQ6JyArIGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICc6JykgPT09IDA7CiAgfQoKICAvLyAtLS0tIFJlYWN0IGZpYmVyIG93bmVyIHJlc29sdXRpb24gLS0tLQogIGZ1bmN0aW9uIGdldEZpYmVyS2V5KGVsKXsKICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZWwpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7CiAgICAgIHZhciBrID0ga2V5c1tpXTsKICAgICAgaWYgKC9eX19yZWFjdChGaWJlcnxJbnRlcm5hbHMpLy50ZXN0KGspKSByZXR1cm4gazsKICAgIH0KICAgIHJldHVybiBudWxsOwogIH0KCiAgZnVuY3Rpb24gZ2V0RmliZXJTb3VyY2UoZWwpewogICAgdHJ5IHsKICAgICAgdmFyIGtleSA9IGdldEZpYmVyS2V5KGVsKTsKICAgICAgaWYgKCFrZXkpIHJldHVybiBudWxsOwogICAgICB2YXIgZmliZXIgPSBlbFtrZXldOwogICAgICB2YXIgaG9wcyA9IDA7CiAgICAgIHdoaWxlIChmaWJlciAmJiBob3BzIDwgMzApIHsKICAgICAgICBpZiAoZmliZXIuX2RlYnVnU291cmNlICYmIGZpYmVyLl9kZWJ1Z1NvdXJjZS5maWxlTmFtZSkgewogICAgICAgICAgdmFyIHMgPSBmaWJlci5fZGVidWdTb3VyY2U7CiAgICAgICAgICByZXR1cm4geyBmaWxlTmFtZTogcy5maWxlTmFtZSwgbGluZU51bWJlcjogcy5saW5lTnVtYmVyIHx8IDAsIGNvbHVtbk51bWJlcjogcy5jb2x1bW5OdW1iZXIgfHwgMCB9OwogICAgICAgIH0KICAgICAgICBmaWJlciA9IGZpYmVyLnJldHVybiB8fCBmaWJlci5fZGVidWdPd25lciB8fCBudWxsOwogICAgICAgIGhvcHMrKzsKICAgICAgfQogICAgICByZXR1cm4gbnVsbDsKICAgIH0gY2F0Y2ggKGVycikgewogICAgICB0cnkgeyBjb25zb2xlLmVycm9yKCdbYmxpbmstcGlja2VyXSBnZXRGaWJlclNvdXJjZSBmYWlsZWQnLCBlcnIpOyB9IGNhdGNoIChlMikge30KICAgICAgcmV0dXJuIG51bGw7CiAgICB9CiAgfQoKICAvLyAtLS0tIG1lc3NhZ2UgYnJpZGdlIC0tLS0KICBmdW5jdGlvbiBpc0VkaXRvck9yaWdpbihvKXsKICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ3N0cmluZycgJiYgKEVESVRPUl9PUklHSU5TLmluZGV4T2YobykgIT09IC0xIHx8IFRFQU1fUFJFVklFV19PUklHSU4udGVzdChvKSB8fCBMT0NBTF9FRElUT1JfT1JJR0lOLnRlc3QobykpOwogIH0KCiAgZnVuY3Rpb24gcG9zdFRvRWRpdG9yKG1zZyl7CiAgICBpZiAoIWVkaXRvck9yaWdpbikgcmV0dXJuOwogICAgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZShtc2csIGVkaXRvck9yaWdpbik7CiAgfQoKICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGV2KXsKICAgIGlmICghaXNFZGl0b3JPcmlnaW4oZXYub3JpZ2luKSkgcmV0dXJuOwogICAgdmFyIG1zZyA9IGV2LmRhdGE7CiAgICBpZiAoIW1zZyB8fCB0eXBlb2YgbXNnICE9PSAnb2JqZWN0JykgcmV0dXJuOwogICAgZWRpdG9yT3JpZ2luID0gZXYub3JpZ2luOwogICAgaWYgKG1zZy50eXBlID09PSAnVE9HR0xFX1NFTEVDVE9SJykgc2V0QWN0aXZlKCEhbXNnLnBheWxvYWQpOwogICAgZWxzZSBpZiAobXNnLnR5cGUgPT09ICdTRVRfRUxFTUVOVF9BVFRSUycpIGFwcGx5QXR0cnMobXNnLnBheWxvYWQpOwogICAgZWxzZSBpZiAobXNnLnR5cGUgPT09ICdSRVNFVF9JTkxJTkVfU1RZTEVTJykgcmVzZXRJbmxpbmVTdHlsZXMobXNnLnBheWxvYWQpOwogICAgZWxzZSBpZiAobXNnLnR5cGUgPT09ICdQSUNLRVJfSEVBTFRIX0NIRUNLJykgcmVwbHlBbGl2ZShtc2csIGV2LnNvdXJjZSwgZXYub3JpZ2luKTsKICB9KTsKCiAgLy8gUmV2ZXJ0IHRoZSBpZnJhbWUgRE9NIGFmdGVyIGFuIHVuZG8vcmVkbyBvbiB0aGUgcGFyZW50IHNpZGUuIENhbGxlciBwYXNzZXMKICAvLyB7IGlkLCBwcm9wZXJ0aWVzOiBzdHJpbmdbXSB9IGFuZCB3ZSByZW1vdmUgdGhvc2UgaW5saW5lLXN0eWxlIHByb3BzIGZyb20KICAvLyB0aGUgbWF0Y2hpbmcgZWxlbWVudCBzbyB0aGUgZWxlbWVudCdzIHN0eWxlc2hlZXQvY29tcHV0ZWQgc3R5bGUgdGFrZXMgb3ZlcgogIC8vIGFnYWluLiBFbXB0eSBwcm9wZXJ0aWVzIG1lYW5zICJ3aXBlIGV2ZXJ5dGhpbmcgd2Ugc2V0IiAobGFzdCByZXNvcnQpLgogIGZ1bmN0aW9uIHJlc2V0SW5saW5lU3R5bGVzKHBheWxvYWQpewogICAgdHJ5IHsKICAgICAgaWYgKCFwYXlsb2FkIHx8IHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgcGF5bG9hZC5pZCAhPT0gJ3N0cmluZycpIHJldHVybjsKICAgICAgdmFyIGVsID0gZmluZEJ5SWQocGF5bG9hZC5pZCk7CiAgICAgIGlmICghZWwpIHJldHVybjsKICAgICAgdmFyIHByb3BzID0gQXJyYXkuaXNBcnJheShwYXlsb2FkLnByb3BlcnRpZXMpID8gcGF5bG9hZC5wcm9wZXJ0aWVzIDogbnVsbDsKICAgICAgaWYgKHByb3BzICYmIHByb3BzLmxlbmd0aCA+IDApIHsKICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSBlbC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShjYW1lbFRvS2ViYWIocHJvcHNbaV0pKTsKICAgICAgfSBlbHNlIGlmIChlbC5yZW1vdmVBdHRyaWJ1dGUpIHsKICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7CiAgICAgIH0KICAgIH0gY2F0Y2ggKGVycikgewogICAgICB0cnkgeyBjb25zb2xlLmVycm9yKCdbYmxpbmstcGlja2VyXSByZXNldElubGluZVN0eWxlcyBmYWlsZWQnLCBlcnIpOyB9IGNhdGNoIChlMikge30KICAgIH0KICB9CgogIC8vIEhlYWx0aCBjaGVjazogbGV0cyBQcmV2aWV3UGFuZWwgdmVyaWZ5IHRoZSBwaWNrZXIgaXMgd2lyZWQgYmVmb3JlIGFjdGl2YXRpbmcKICAvLyBkZXNpZ24gbW9kZS4gUmVwbGllcyBvbiBuZXh0IG1pY3JvdGFzayBzbyB0aGUgcGFyZW50J3MgbGlzdGVuZXIgaXMgYXR0YWNoZWQuCiAgZnVuY3Rpb24gcmVwbHlBbGl2ZShtc2csIHNvdXJjZSwgb3JpZ2luKXsKICAgIHRyeSB7CiAgICAgIHZhciB0YXJnZXQgPSBzb3VyY2UgfHwgd2luZG93LnBhcmVudDsKICAgICAgdGFyZ2V0LnBvc3RNZXNzYWdlKHsKICAgICAgICB0eXBlOiAnUElDS0VSX0FMSVZFJywKICAgICAgICBub25jZTogKG1zZyAmJiBtc2cubm9uY2UpIHx8IG51bGwsCiAgICAgICAgdmVyc2lvbjogd2luZG93Ll9fYmxpbmtQaWNrZXJWZXJzaW9uIHx8ICcyLjEuMCcsCiAgICAgIH0sIG9yaWdpbik7CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgdHJ5IHsgY29uc29sZS5lcnJvcignW2JsaW5rLXBpY2tlcl0gcmVwbHlBbGl2ZSBmYWlsZWQnLCBlcnIpOyB9IGNhdGNoIChlMikge30KICAgIH0KICB9CgogIGZ1bmN0aW9uIHNldEFjdGl2ZShuZXh0KXsKICAgIGlmIChhY3RpdmUgPT09IG5leHQpIHJldHVybjsKICAgIGFjdGl2ZSA9IG5leHQ7CiAgICBpZiAoYWN0aXZlKSBpbnN0YWxsU3R5bGUoKTsKICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdibGluay1waWNrZXItYWN0aXZlJywgYWN0aXZlKTsKICAgIGlmICghYWN0aXZlKSB7CiAgICAgIC8vIEJhaWwgYW55IGluLXByb2dyZXNzIGlubGluZSBlZGl0IHNvIHRoZSBjb250ZW50RWRpdGFibGUgKyBjYXJldCBkb24ndAogICAgICAvLyBsZWFrIGFjcm9zcyBkZWFjdGl2YXRpb25zLiBXZSBjYW5jZWwgKGRvbid0IGNvbW1pdCkg4oCUIHRvZ2dsaW5nIGRlc2lnbgogICAgICAvLyBtb2RlIG1pZC1lZGl0IG1lYW5zIHRoZSB1c2VyIG1vdmVkIHRoZWlyIGF0dGVudGlvbiBhd2F5LgogICAgICBpZiAoaW5saW5lRWRpdGluZykgZXhpdElubGluZUVkaXQoaW5saW5lRWRpdGluZy5lbCwgZmFsc2UpOwogICAgICBjbGVhckhvdmVyKCk7CiAgICAgIGNsZWFyU2VsZWN0ZWRSZWN0VHJhY2tpbmcoKTsKICAgIH0KICB9CgogIC8vIOKUgOKUgOKUgCBTZWxlY3Rpb24gcmVjdCB0cmFja2luZyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKICAvLyBUaGUgcGFyZW50IElERSByZW5kZXJzIHRoZSBzZWxlY3Rpb24gb3V0bGluZSwgdGFnIHBpbGwsIHByb21wdCBjaGlwLCBhbmQKICAvLyBwb3B1cCBhbmNob3IgdXNpbmcgdmlld3BvcnQgY29vcmRzIGZyb20gZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGF0IGNsaWNrCiAgLy8gdGltZS4gV2hlbiB0aGUgdXNlciBzY3JvbGxzIHRoZSBpZnJhbWUsIHRoZSBlbGVtZW50IG1vdmVzIGJ1dCB0aGUgcGFyZW50CiAgLy8gVUkgZG9lc24ndCDigJQgdW5sZXNzIHdlIHJlLWVtaXQgdGhlIHJlY3QuIFRyYWNrIGV2ZXJ5IGNsaWNrZWQgaWQgYW5kIHBvc3QKICAvLyBFTEVNRU5UX1JFQ1RfVVBEQVRFIG9uIHNjcm9sbC9yZXNpemUgKHJBRi1kZWJvdW5jZWQpLgogIHZhciBzZWxlY3RlZElkcyA9IG5ldyBTZXQoKTsKICB2YXIgcGVuZGluZ1JlZmxvdyA9IGZhbHNlOwogIHZhciBsYXN0U2VudFJlY3RzID0gT2JqZWN0LmNyZWF0ZShudWxsKTsKCiAgZnVuY3Rpb24gdHJhY2tTZWxlY3RlZElkKGlkKSB7CiAgICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJyB8fCAhaWQpIHJldHVybjsKICAgIHNlbGVjdGVkSWRzLmFkZChpZCk7CiAgfQoKICBmdW5jdGlvbiBjbGVhclNlbGVjdGVkUmVjdFRyYWNraW5nKCkgewogICAgc2VsZWN0ZWRJZHMuY2xlYXIoKTsKICAgIGxhc3RTZW50UmVjdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpOwogIH0KCiAgZnVuY3Rpb24gc2NoZWR1bGVSZWZsb3coKSB7CiAgICBpZiAocGVuZGluZ1JlZmxvdykgcmV0dXJuOwogICAgLy8gUnVuIHJlZmxvdyB3aGVuIEVJVEhFUiBhIHNlbGVjdGVkIGVsZW1lbnQgT1IgdGhlIGN1cnJlbnRseS1ob3ZlcmVkCiAgICAvLyBlbGVtZW50IG5lZWRzIHJlcG9zaXRpb25pbmcuIFdpdGhvdXQgdGhlIGhvdmVyIGJyYW5jaCwgdGhlIGhvdmVyCiAgICAvLyBkYXNoZWQgcmluZyBzdGF5cyBvcnBoYW5lZCBhdCBpdHMgaW5pdGlhbCB2aWV3cG9ydCBjb29yZHMgd2hlbiB0aGUKICAgIC8vIHVzZXIgc2Nyb2xscyAobW91c2VvdmVyIG9ubHkgZmlyZXMgd2hlbiB0aGUgY3Vyc29yIGNoYW5nZXMgZWxlbWVudHMpLgogICAgaWYgKHNlbGVjdGVkSWRzLnNpemUgPT09IDAgJiYgIWhvdmVyRWwpIHJldHVybjsKICAgIHBlbmRpbmdSZWZsb3cgPSB0cnVlOwogICAgdmFyIHJhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgZnVuY3Rpb24oY2IpeyByZXR1cm4gc2V0VGltZW91dChjYiwgMTYpOyB9OwogICAgcmFmKGZ1bmN0aW9uKCl7CiAgICAgIHBlbmRpbmdSZWZsb3cgPSBmYWxzZTsKICAgICAgZW1pdFJlY3RVcGRhdGVzKCk7CiAgICAgIHJlcG9zaXRpb25Ib3ZlcigpOwogICAgfSk7CiAgfQoKICBmdW5jdGlvbiByZXBvc2l0aW9uSG92ZXIoKSB7CiAgICBpZiAoIWhvdmVyRWwpIHJldHVybjsKICAgIGlmICghaG92ZXJFbC5pc0Nvbm5lY3RlZCkgeyBob3ZlckVsID0gbnVsbDsgZHJhd0hvdmVyKG51bGwpOyByZXR1cm47IH0KICAgIGRyYXdIb3Zlcihob3ZlckVsKTsKICB9CgogIGZ1bmN0aW9uIGVtaXRSZWN0VXBkYXRlcygpIHsKICAgIHRyeSB7CiAgICAgIHZhciB1cGRhdGVzID0gW107CiAgICAgIHZhciBpZHMgPSBBcnJheS5mcm9tKHNlbGVjdGVkSWRzKTsKICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZHMubGVuZ3RoOyBpKyspIHsKICAgICAgICB2YXIgaWQgPSBpZHNbaV07CiAgICAgICAgdmFyIGVsID0gZmluZEJ5SWQoaWQpOwogICAgICAgIGlmICghZWwpIHsgc2VsZWN0ZWRJZHMuZGVsZXRlKGlkKTsgY29udGludWU7IH0KICAgICAgICB2YXIgciA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOwogICAgICAgIHZhciBwcmV2ID0gbGFzdFNlbnRSZWN0c1tpZF07CiAgICAgICAgaWYgKHByZXYgJiYgTWF0aC5hYnMocHJldi54IC0gci54KSA8IDAuNSAmJiBNYXRoLmFicyhwcmV2LnkgLSByLnkpIDwgMC41ICYmIE1hdGguYWJzKHByZXYud2lkdGggLSByLndpZHRoKSA8IDAuNSAmJiBNYXRoLmFicyhwcmV2LmhlaWdodCAtIHIuaGVpZ2h0KSA8IDAuNSkgY29udGludWU7CiAgICAgICAgdmFyIHJlY3QgPSB7IHg6IHIueCwgeTogci55LCB3aWR0aDogci53aWR0aCwgaGVpZ2h0OiByLmhlaWdodCB9OwogICAgICAgIGxhc3RTZW50UmVjdHNbaWRdID0gcmVjdDsKICAgICAgICB1cGRhdGVzLnB1c2goeyBpZDogaWQsIHJlY3Q6IHJlY3QgfSk7CiAgICAgIH0KICAgICAgaWYgKHVwZGF0ZXMubGVuZ3RoID09PSAwKSByZXR1cm47CiAgICAgIHBvc3RUb0VkaXRvcih7IHR5cGU6ICdFTEVNRU5UX1JFQ1RfVVBEQVRFJywgcGF5bG9hZDogeyB1cGRhdGVzOiB1cGRhdGVzLCB2aWV3cG9ydFdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCB9IH0pOwogICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgIHRyeSB7IGNvbnNvbGUuZXJyb3IoJ1tibGluay1waWNrZXJdIGVtaXRSZWN0VXBkYXRlcyBmYWlsZWQnLCBlcnIpOyB9IGNhdGNoIChlMikge30KICAgIH0KICB9CgogIC8vIFNjcm9sbCAvIHJlc2l6ZSBsaXN0ZW5lcnMgZmlyZSBzY2hlZHVsZVJlZmxvdyBvbmNlIHBlciBmcmFtZSBtYXguIGNhcHR1cmU6CiAgLy8gdHJ1ZSBvbiBzY3JvbGwgY2F0Y2hlcyBuZXN0ZWQgc2Nyb2xsIGNvbnRhaW5lcnM7IHBhc3NpdmUgYXZvaWRzIGJsb2NraW5nLgogIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZmxvdywgeyBwYXNzaXZlOiB0cnVlLCBjYXB0dXJlOiB0cnVlIH0pOwogIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZmxvdyk7CgogIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGUpewogICAgaWYgKCFhY3RpdmUpIHJldHVybjsKICAgIGlmIChpbmxpbmVFZGl0aW5nKSByZXR1cm47IC8vIGhvdmVyIHJpbmcgd291bGQgY29tcGV0ZSB3aXRoIHRoZSBjYXJldAogICAgdmFyIGVsID0gY2xvc2VzdFNlbGVjdGFibGUoZS50YXJnZXQpOwogICAgaWYgKGVsID09PSBob3ZlckVsKSByZXR1cm47CiAgICBzZXRFZGl0SG92ZXIoaG92ZXJFbCwgZWwpOyAvLyBlZGl0YWJsZSB0ZXh0IHNob3dzIGFuIEktYmVhbSBiZWZvcmUgeW91IGNsaWNrCiAgICBob3ZlckVsID0gZWw7CiAgICBkcmF3SG92ZXIoZWwpOwogIH0sIHRydWUpOwoKICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpewogICAgaWYgKCFhY3RpdmUpIHJldHVybjsKICAgIC8vIFdoaWxlIGVkaXRpbmcsIGNsaWNrcyBpbnNpZGUgdGhlIGVkaXRpbmcgZWxlbWVudCB1c2UgbmF0aXZlIGJyb3dzZXIKICAgIC8vIGNhcmV0IGJlaGF2aW91ciAobm8gcHJldmVudERlZmF1bHQpLiBDbGlja2luZyBvdXRzaWRlIGNvbW1pdHMgdGhlCiAgICAvLyBjdXJyZW50IGVkaXQgYW5kIGZhbGxzIHRocm91Z2ggdG8gbm9ybWFsIHNlbGVjdGlvbiBvbiB0aGUgbmV3IHRhcmdldC4KICAgIGlmIChpbmxpbmVFZGl0aW5nKSB7CiAgICAgIGlmIChpbmxpbmVFZGl0aW5nLmVsLmNvbnRhaW5zKGUudGFyZ2V0KSkgcmV0dXJuOwogICAgICBleGl0SW5saW5lRWRpdChpbmxpbmVFZGl0aW5nLmVsLCB0cnVlKTsKICAgICAgLy8gRmFsbCB0aHJvdWdoIOKAlCBoYW5kbGUgdGhpcyBjbGljayBhcyBhIGZyZXNoIHNlbGVjdGlvbi4KICAgIH0KICAgIHZhciBlbCA9IGNsb3Nlc3RTZWxlY3RhYmxlKGUudGFyZ2V0KTsKICAgIGlmICghZWwpIHJldHVybjsKICAgIGUucHJldmVudERlZmF1bHQoKTsKICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7CiAgICBpZiAodHlwZW9mIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uID09PSAnZnVuY3Rpb24nKSBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpOwogICAgLy8gQSBwbGFpbiBjbGljayBvbiBhbiBpbmxpbmUtZWRpdGFibGUgdGV4dCBlbGVtZW50IHNlbGVjdHMgaXQgQU5EIGRyb3BzIGEKICAgIC8vIGNhcmV0IHNvIGl0IGJlaGF2ZXMgbGlrZSBhIHRleHQgaW5wdXQgKEthaSdzIGFzayDigJQgbm8gaGlkZGVuIHNlY29uZAogICAgLy8gY2xpY2spLiBFTEVNRU5UX0NMSUNLRUQgZmlyZXMgZmlyc3Qgc28gdGhlIGluc3BlY3RvciBzdGlsbCBvcGVucyBmb3IKICAgIC8vIHN0eWxlOyB0aGVuIHdlIGVudGVyIGNhcmV0IGVkaXQuIE1vZGlmaWVyLWNsaWNrcyAoQ21kL0N0cmwvU2hpZnQpIHN0YXkKICAgIC8vIG11bHRpLXNlbGVjdCBhbmQgbmV2ZXIgZWRpdDsgbm9uLXRleHQgZWxlbWVudHMganVzdCBzZWxlY3QuCiAgICB2YXIgbm9Nb2RzID0gIShlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpOwogICAgaWYgKG5vTW9kcyAmJiBpc0lubGluZUVkaXRhYmxlKGVsKSkgewogICAgICBlbWl0RWxlbWVudENsaWNrZWQoZWwsIHsgbWV0YTogZmFsc2UsIHNoaWZ0OiBmYWxzZSB9KTsKICAgICAgZW50ZXJJbmxpbmVFZGl0KGVsLCBlKTsKICAgICAgcmV0dXJuOwogICAgfQogICAgLy8gVHJhY2sgbW9kaWZpZXIgc28gcGFyZW50IGNhbiBkaXNwYXRjaCBzaW5nbGUtc2VsZWN0IChyZXBsYWNlKSB2cwogICAgLy8gbXVsdGktc2VsZWN0IHRvZ2dsZSAoQ21kL0N0cmwtY2xpY2sg4oCUIExvdmFibGUvRmlnbWEgc2VtYW50aWNzKS4KICAgIGVtaXRFbGVtZW50Q2xpY2tlZChlbCwgeyBtZXRhOiAhIShlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KSwgc2hpZnQ6ICEhZS5zaGlmdEtleSB9KTsKICB9LCB0cnVlKTsKCiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZSl7IGlmIChhY3RpdmUpIGUucHJldmVudERlZmF1bHQoKTsgfSwgdHJ1ZSk7CgogIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKXsKICAgIGlmICghYWN0aXZlKSByZXR1cm47CiAgICAvLyBUaGUgaW5saW5lLWVkaXQgb3duIGtleWRvd24gaGFuZGxlciAoY2FwdHVyZTogdHJ1ZSBvbiB0aGUgZWRpdGluZyBlbCkKICAgIC8vIG93bnMgRXNjYXBlIGR1cmluZyBlZGl0IOKAlCBjYW5jZWwgcmVzdG9yZXMgdGV4dC4gRG9uJ3QgYWxzbyB0b2dnbGUgdGhlCiAgICAvLyB3aG9sZSBwaWNrZXIgb2ZmIGhlcmUuCiAgICBpZiAoaW5saW5lRWRpdGluZykgcmV0dXJuOwogICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgewogICAgICB0cnkgeyBwb3N0VG9FZGl0b3IoeyB0eXBlOiAnVE9HR0xFX1BJQ0tfQU5EX0VESVRfUkVRVUVTVEVEJyB9KTsgfSBjYXRjaCAoZXJyKSB7fQogICAgfQogIH0sIHRydWUpOwoKICAvLyBOZWFyZXN0IHNlbGVjdGFibGUgZWxlbWVudDogYW55IGVsZW1lbnQgZXhjZXB0IFNLSVBfVEFHUyBhbmQgPGh0bWw+IChpZHMgY29tZSBmcm9tIGlkT2YpLgogIGZ1bmN0aW9uIGNsb3Nlc3RTZWxlY3RhYmxlKHRhcmdldCl7CiAgICB2YXIgZWwgPSB0YXJnZXQ7CiAgICB3aGlsZSAoZWwgJiYgZWwgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgewogICAgICBpZiAoZWwubm9kZVR5cGUgPT09IDEgJiYgIVNLSVBfVEFHU1tlbC50YWdOYW1lXSkgcmV0dXJuIGVsOwogICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQ7CiAgICB9CiAgICByZXR1cm4gbnVsbDsKICB9CgogIGZ1bmN0aW9uIHBhcnNlSWRMb2NhdGlvbihpZCl7CiAgICAvLyBCdWlsZC10aW1lIElEcyBhcmUgIjxmaWxlUGF0aD46PGluZGV4PiI7IHJ1bnRpbWUgSURzIHN0YXJ0IHdpdGggInJ0OiIgYW5kIGhhdmUgbm8gcGF0aC4KICAgIGlmIChpZCAmJiBpZC5zbGljZSgwLCAzKSA9PT0gJ3J0OicpIHsKICAgICAgcmV0dXJuIHsgZmlsZVBhdGg6ICcnLCBsaW5lTnVtYmVyOiAwLCBjb2w6IDAgfTsKICAgIH0KICAgIHZhciBsYXN0Q29sb24gPSBpZCA/IGlkLmxhc3RJbmRleE9mKCc6JykgOiAtMTsKICAgIGlmIChsYXN0Q29sb24gPCAwKSByZXR1cm4geyBmaWxlUGF0aDogaWQgfHwgJycsIGxpbmVOdW1iZXI6IDAsIGNvbDogMCB9OwogICAgdmFyIGZpbGVQYXRoID0gaWQuc2xpY2UoMCwgbGFzdENvbG9uKTsKICAgIHZhciBpbmRleCA9IHBhcnNlSW50KGlkLnNsaWNlKGxhc3RDb2xvbiArIDEpLCAxMCkgfHwgMDsKICAgIHJldHVybiB7IGZpbGVQYXRoOiBmaWxlUGF0aCwgbGluZU51bWJlcjogMCwgY29sOiBpbmRleCB9OwogIH0KCiAgZnVuY3Rpb24gY29sbGVjdENvbXB1dGVkKGVsKXsKICAgIHZhciBjcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTsKICAgIHZhciBvdXQgPSB7fTsKICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQ09NUFVURURfS0VZUy5sZW5ndGg7IGkrKykgewogICAgICB2YXIgayA9IENPTVBVVEVEX0tFWVNbaV07CiAgICAgIG91dFtrXSA9IGNzW2tdOwogICAgfQogICAgcmV0dXJuIG91dDsKICB9CgogIGZ1bmN0aW9uIGVtaXRFbGVtZW50Q2xpY2tlZChlbCwgbW9kaWZpZXJzKXsKICAgIHRyeSB7CiAgICAgIHZhciBpZCA9IGlkT2YoZWwpOwogICAgICB2YXIgbG9jID0gcGFyc2VJZExvY2F0aW9uKGlkKTsKICAgICAgdmFyIHIgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsKICAgICAgdmFyIGNsYXNzZXMgPSBlbC5jbGFzc0xpc3QgPyBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlbC5jbGFzc0xpc3QpIDogW107CiAgICAgIHZhciBmaWJlclNvdXJjZSA9IGdldEZpYmVyU291cmNlKGVsKTsKICAgICAgdmFyIHBheWxvYWQgPSB7CiAgICAgICAgaWQ6IGlkLAogICAgICAgIGZpbGVQYXRoOiBsb2MuZmlsZVBhdGgsCiAgICAgICAgbGluZU51bWJlcjogbG9jLmxpbmVOdW1iZXIsCiAgICAgICAgY29sOiBsb2MuY29sLAogICAgICAgIHRhZ05hbWU6IChlbC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpLAogICAgICAgIHJlY3Q6IHsgeDogci54LCB5OiByLnksIHdpZHRoOiByLndpZHRoLCBoZWlnaHQ6IHIuaGVpZ2h0IH0sCiAgICAgICAgY29tcHV0ZWRTdHlsZXM6IGNvbGxlY3RDb21wdXRlZChlbCksCiAgICAgICAgY2xhc3NlczogY2xhc3NlcywKICAgICAgICAvLyBJZGVudGlmeWluZyBzaWduYWxzIHRoZSBhZ2VudCB1c2VzIHRvIGxvY2F0ZSB0aGUgSlNYIHdoZW4gdGhlcmUncwogICAgICAgIC8vIG5vIGJ1aWxkLXRpbWUgZGF0YS1ibG5rLWlkLiBFYWNoIGNhcHR1cmVkIGluIGl0cyBvd24gdHJ5IHNvIGFuIG9kZAogICAgICAgIC8vIGVsZW1lbnQgY2FuJ3QgY3Jhc2ggdGhlIHdob2xlIHBpY2tlci4KICAgICAgICBjbGFzc05hbWU6IGdldENsYXNzTmFtZShlbCksCiAgICAgICAgbmVhcmVzdEhlYWRpbmc6IGZpbmROZWFyZXN0SGVhZGluZyhlbCksCiAgICAgICAgcGFyZW50VGFnOiBnZXRQYXJlbnRUYWcoZWwpLAogICAgICAgIHRleHRDb250ZW50OiBnZXREaXJlY3RUZXh0KGVsKSwKICAgICAgICAvLyBJZnJhbWUncyBvd24gdmlld3BvcnQgd2lkdGguIFBhcmVudCBkaXZpZGVzIGl0cyBvbi1zY3JlZW4gaWZyYW1lCiAgICAgICAgLy8gd2lkdGggYnkgdGhpcyB0byByZWNvdmVyIHRoZSByZW5kZXIgc2NhbGUgKOKJiDEgZm9yIHdlYiwgfjEuMjc2IGZvcgogICAgICAgIC8vIHRoZSBFeHBvIHBob25lIGZyYW1lKSBhbmQgY29ycmVjdCBvdmVybGF5IGNvb3JkaW5hdGVzLgogICAgICAgIHZpZXdwb3J0V2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoLAogICAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzIHx8IHsgbWV0YTogZmFsc2UsIHNoaWZ0OiBmYWxzZSB9LAogICAgICB9OwogICAgICBpZiAoZmliZXJTb3VyY2UpIHBheWxvYWQuZmliZXJTb3VyY2UgPSBmaWJlclNvdXJjZTsKICAgICAgcG9zdFRvRWRpdG9yKHsgdHlwZTogJ0VMRU1FTlRfQ0xJQ0tFRCcsIHBheWxvYWQ6IHBheWxvYWQgfSk7CiAgICAgIC8vIFN0YXJ0IHRyYWNraW5nIHRoaXMgZWxlbWVudCdzIHJlY3Qgc28gc2Nyb2xsL3Jlc2l6ZSBrZWVwcyB0aGUgcGFyZW50CiAgICAgIC8vIFVJIChvdXRsaW5lLCBwaWxsLCBwb3B1cCBhbmNob3IsIHByb21wdCBjaGlwKSBnbHVlZCB0byB0aGUgZWxlbWVudC4KICAgICAgdHJhY2tTZWxlY3RlZElkKGlkKTsKICAgIH0gY2F0Y2ggKGVycikgewogICAgICB0cnkgeyBjb25zb2xlLmVycm9yKCdbYmxpbmstcGlja2VyXSBlbWl0RWxlbWVudENsaWNrZWQgZmFpbGVkJywgZXJyKTsgfSBjYXRjaCAoZTIpIHt9CiAgICB9CiAgfQoKICAvLyBDYXB0dXJlIGlkZW50aWZ5aW5nIHRleHQgZm9yIHRoZSBjbGlja2VkIGVsZW1lbnQuIERpcmVjdCB0ZXh0IGlzIGJlc3QKICAvLyB3aGVuIHByZXNlbnQgKHByZWNpc2UgSlNYIHRleHQgbm9kZSDigJQgaDEsIHAsIHNwYW4sIGV0Yy4pLiBGb3IgbGF5b3V0CiAgLy8gd3JhcHBlcnMgd2l0aCBubyBkaXJlY3QgdGV4dCAoZGl2IC8gc2VjdGlvbiksIGZhbGwgYmFjayB0byBkZXNjZW5kYW50CiAgLy8gdGV4dCBzbyBhcHBseS1jaGFuZ2VzLnRzJ3MgZ3JlcC1ieS10ZXh0IGZhbGxiYWNrIHN0aWxsIGhhcyBTT01FVEhJTkcgdG8KICAvLyBsb2NhdGUgdGhlIGVsZW1lbnQgd2l0aC4gMjAwLWNoYXIgY2FwIGtlZXBzIHRoZSBwYXlsb2FkIHNtYWxsLgogIGZ1bmN0aW9uIGdldERpcmVjdFRleHQoZWwpewogICAgdmFyIHQgPSAnJzsKICAgIHZhciBub2RlcyA9IGVsLmNoaWxkTm9kZXM7CiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7CiAgICAgIGlmIChub2Rlc1tpXS5ub2RlVHlwZSA9PT0gMykgdCArPSBub2Rlc1tpXS5ub2RlVmFsdWU7CiAgICB9CiAgICB0ID0gdC50cmltKCk7CiAgICBpZiAodCkgcmV0dXJuIHQ7CiAgICB2YXIgZGVzY2VuZGFudHMgPSAoZWwudGV4dENvbnRlbnQgfHwgJycpLnJlcGxhY2UoL1xzKy9nLCAnICcpLnRyaW0oKTsKICAgIHJldHVybiBkZXNjZW5kYW50cy5zbGljZSgwLCAyMDApOwogIH0KCiAgLy8gSWRlbnRpZnlpbmcgc2lnbmFscyDigJQgdXNlZCBieSB0aGUgQXBwbHkgY2hhdCBtZXNzYWdlIHNvIHRoZSBhZ2VudCBjYW4KICAvLyBncmVwIHRoZSBKU1ggc291cmNlIGV2ZW4gd2hlbiB0aGVyZSdzIG5vIGJ1aWxkLXRpbWUgZGF0YS1ibG5rLWlkLiBFYWNoCiAgLy8gaGVscGVyIHJldHVybnMgJycgLyBudWxsIG9uIGZhaWx1cmUgcmF0aGVyIHRoYW4gdGhyb3dpbmcuCiAgZnVuY3Rpb24gZ2V0Q2xhc3NOYW1lKGVsKXsKICAgIHRyeSB7CiAgICAgIC8vIFNWR0FuaW1hdGVkU3RyaW5nIG9uIFNWRyBlbGVtZW50cyDigJQgY29lcmNlIHZpYSBjbGFzc0xpc3QgZm9yIGNvbnNpc3RlbmN5LgogICAgICBpZiAoZWwuY2xhc3NMaXN0ICYmICh0eXBlb2YgZWwuY2xhc3NOYW1lICE9PSAnc3RyaW5nJykpIHsKICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWwuY2xhc3NMaXN0KS5qb2luKCcgJykuc2xpY2UoMCwgMjAwKTsKICAgICAgfQogICAgICByZXR1cm4gU3RyaW5nKGVsLmNsYXNzTmFtZSB8fCAnJykuc2xpY2UoMCwgMjAwKTsKICAgIH0gY2F0Y2ggKGVycikgewogICAgICB0cnkgeyBjb25zb2xlLmVycm9yKCdbYmxpbmstcGlja2VyXSBnZXRDbGFzc05hbWUgZmFpbGVkJywgZXJyKTsgfSBjYXRjaCAoZTIpIHt9CiAgICAgIHJldHVybiAnJzsKICAgIH0KICB9CgogIGZ1bmN0aW9uIGdldFBhcmVudFRhZyhlbCl7CiAgICB0cnkgewogICAgICB2YXIgcCA9IGVsLnBhcmVudEVsZW1lbnQ7CiAgICAgIGlmICghcCB8fCAhcC50YWdOYW1lKSByZXR1cm4gbnVsbDsKICAgICAgcmV0dXJuIHAudGFnTmFtZS50b0xvd2VyQ2FzZSgpOwogICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgIHRyeSB7IGNvbnNvbGUuZXJyb3IoJ1tibGluay1waWNrZXJdIGdldFBhcmVudFRhZyBmYWlsZWQnLCBlcnIpOyB9IGNhdGNoIChlMikge30KICAgICAgcmV0dXJuIG51bGw7CiAgICB9CiAgfQoKICAvLyBXYWxrIHVwIHRvIDYgYW5jZXN0b3JzIGxvb2tpbmcgZm9yIGFuIDxoMT4tPGg2PiwgcHJlZmVycmluZyBoaWdoZXItcmFuawogIC8vIGhlYWRpbmdzLiBMZXRzIHRoZSBhZ2VudCBncmVwIGJ5IHNlY3Rpb24gaGVhZGluZyBldmVuIHdoZW4gdGhlIGNsaWNrZWQKICAvLyBlbGVtZW50IGl0c2VsZiBoYXMgbm8gdGV4dCAoZS5nLiBhIGRlY29yYXRpdmUgcGlsbCBpbnNpZGUgYSBzZWN0aW9uKS4KICBmdW5jdGlvbiBmaW5kTmVhcmVzdEhlYWRpbmcoZWwpewogICAgdHJ5IHsKICAgICAgdmFyIG5vZGUgPSBlbC5wYXJlbnRFbGVtZW50OwogICAgICB2YXIgYmVzdCA9IG51bGw7CiAgICAgIHZhciBob3BzID0gMDsKICAgICAgd2hpbGUgKG5vZGUgJiYgaG9wcyA8IDYpIHsKICAgICAgICB2YXIgZm91bmQgPSBmaW5kSGVhZGluZ0luKG5vZGUpOwogICAgICAgIGlmIChmb3VuZCkgewogICAgICAgICAgaWYgKCFiZXN0IHx8IGZvdW5kLnJhbmsgPCBiZXN0LnJhbmspIGJlc3QgPSBmb3VuZDsKICAgICAgICB9CiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudDsKICAgICAgICBob3BzKys7CiAgICAgIH0KICAgICAgaWYgKCFiZXN0KSByZXR1cm4gbnVsbDsKICAgICAgcmV0dXJuIHsgdGFnOiBiZXN0LnRhZywgdGV4dDogYmVzdC50ZXh0IH07CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgdHJ5IHsgY29uc29sZS5lcnJvcignW2JsaW5rLXBpY2tlcl0gZmluZE5lYXJlc3RIZWFkaW5nIGZhaWxlZCcsIGVycik7IH0gY2F0Y2ggKGUyKSB7fQogICAgICByZXR1cm4gbnVsbDsKICAgIH0KICB9CgogIGZ1bmN0aW9uIGZpbmRIZWFkaW5nSW4oY29udGFpbmVyKXsKICAgIHZhciB0YWdzID0gWydoMScsJ2gyJywnaDMnLCdoNCcsJ2g1JywnaDYnXTsKICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFncy5sZW5ndGg7IGkrKykgewogICAgICB2YXIgbWF0Y2ggPSBjb250YWluZXIucXVlcnlTZWxlY3Rvcih0YWdzW2ldKTsKICAgICAgaWYgKG1hdGNoKSB7CiAgICAgICAgdmFyIHRleHQgPSAobWF0Y2gudGV4dENvbnRlbnQgfHwgJycpLnJlcGxhY2UoL1xzKy9nLCAnICcpLnRyaW0oKS5zbGljZSgwLCA4MCk7CiAgICAgICAgaWYgKHRleHQpIHJldHVybiB7IHRhZzogdGFnc1tpXSwgdGV4dDogdGV4dCwgcmFuazogaSArIDEgfTsKICAgICAgfQogICAgfQogICAgcmV0dXJuIG51bGw7CiAgfQoKICBmdW5jdGlvbiByZXNvbHZlQXR0cnNUYXJnZXQocGF5bG9hZCl7CiAgICBpZiAodHlwZW9mIHBheWxvYWQuaWQgPT09ICdzdHJpbmcnKSByZXR1cm4gZmluZEJ5SWQocGF5bG9hZC5pZCk7CiAgICBpZiAocGF5bG9hZC5pZCAmJiBwYXlsb2FkLmlkLnBhdGgpIHsKICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWJsbmstaWRePSInICsgcGF5bG9hZC5pZC5wYXRoLnJlcGxhY2UoLyIvZywgJ1xcIicpICsgJzoiXScpOwogICAgfQogICAgcmV0dXJuIG51bGw7CiAgfQoKICBmdW5jdGlvbiBhcHBseUF0dHJzKHBheWxvYWQpewogICAgdHJ5IHsKICAgICAgaWYgKCFwYXlsb2FkIHx8IHR5cGVvZiBwYXlsb2FkICE9PSAnb2JqZWN0JykgcmV0dXJuOwogICAgICB2YXIgZWwgPSByZXNvbHZlQXR0cnNUYXJnZXQocGF5bG9hZCk7CiAgICAgIGlmICghZWwpIHJldHVybjsKICAgICAgdmFyIGF0dHJzID0gcGF5bG9hZC5hdHRycyB8fCB7fTsKICAgICAgaWYgKGF0dHJzLnN0eWxlICYmIHR5cGVvZiBhdHRycy5zdHlsZSA9PT0gJ29iamVjdCcpIHsKICAgICAgICBmb3IgKHZhciBrIGluIGF0dHJzLnN0eWxlKSB7CiAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGF0dHJzLnN0eWxlLCBrKSkgewogICAgICAgICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eShjYW1lbFRvS2ViYWIoayksIFN0cmluZyhhdHRycy5zdHlsZVtrXSkpOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfQogICAgICBpZiAodHlwZW9mIGF0dHJzLmNsYXNzTmFtZSA9PT0gJ3N0cmluZycpIGVsLmNsYXNzTmFtZSA9IGF0dHJzLmNsYXNzTmFtZTsKICAgICAgaWYgKHR5cGVvZiBhdHRycy50ZXh0Q29udGVudCA9PT0gJ3N0cmluZycpIGVsLnRleHRDb250ZW50ID0gYXR0cnMudGV4dENvbnRlbnQ7CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgdHJ5IHsgY29uc29sZS5lcnJvcignW2JsaW5rLXBpY2tlcl0gYXBwbHlBdHRycyBmYWlsZWQnLCBlcnIpOyB9IGNhdGNoIChlMikge30KICAgIH0KICB9CgogIGZ1bmN0aW9uIGNhbWVsVG9LZWJhYihzKXsKICAgIHJldHVybiBzLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7CiAgfQoKICBmdW5jdGlvbiBkcmF3SG92ZXIoZWwpewogICAgaWYgKCFob3Zlck91dGxpbmUpIHsKICAgICAgaG92ZXJPdXRsaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgICAgIC8vIFRoaW4gc29saWQgcmluZyAoRmlnbWEtcGFyaXR5KTogQ1NTIG91dGxpbmUgKG5vdCBib3JkZXIpIHNvIGl0IGRyYXdzCiAgICAgIC8vIHdpdGhvdXQgc2hpZnRpbmcgbGF5b3V0LiAxcHggc29saWQgYmx1ZSDigJQgY2xlYW4gYW5kIHF1aWV0OyB0aGUgaGVhdmllcgogICAgICAvLyBzZWxlY3Rpb24gY2hyb21lIChib3ggKyBoYW5kbGVzICsgc2l6ZSBiYWRnZSkgaXMgdGhlIHBhcmVudCBvdmVybGF5LgogICAgICBob3Zlck91dGxpbmUuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDtwb2ludGVyLWV2ZW50czpub25lO291dGxpbmU6MXB4IHNvbGlkIHJnYmEoNTksMTMwLDI0NiwwLjkpO291dGxpbmUtb2Zmc2V0Oi0xcHg7Ym9yZGVyLXJhZGl1czoxcHg7ei1pbmRleDoyMTQ3NDgzNjQ2O2JveC1zaXppbmc6Ym9yZGVyLWJveDt0cmFuc2l0aW9uOmFsbCA2MG1zIGVhc2Utb3V0JzsKICAgICAgaWYgKGRvY3VtZW50LmJvZHkpIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaG92ZXJPdXRsaW5lKTsKICAgIH0KICAgIGlmICghZWwpIHsgaG92ZXJPdXRsaW5lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IHJldHVybjsgfQogICAgdmFyIHIgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTsKICAgIGhvdmVyT3V0bGluZS5zdHlsZS5sZWZ0ID0gci54ICsgJ3B4JzsKICAgIGhvdmVyT3V0bGluZS5zdHlsZS50b3AgPSByLnkgKyAncHgnOwogICAgaG92ZXJPdXRsaW5lLnN0eWxlLndpZHRoID0gci53aWR0aCArICdweCc7CiAgICBob3Zlck91dGxpbmUuc3R5bGUuaGVpZ2h0ID0gci5oZWlnaHQgKyAncHgnOwogICAgaG92ZXJPdXRsaW5lLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOwogIH0KCiAgZnVuY3Rpb24gY2xlYXJIb3ZlcigpewogICAgaWYgKGhvdmVyRWwgJiYgaG92ZXJFbC5yZW1vdmVBdHRyaWJ1dGUpIGhvdmVyRWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWJsaW5rLWVkaXQtaG92ZXInKTsKICAgIGhvdmVyRWwgPSBudWxsOwogICAgaWYgKGhvdmVyT3V0bGluZSkgaG92ZXJPdXRsaW5lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgfQoKICAvLyBJLWJlYW0gYWZmb3JkYW5jZTogZWRpdGFibGUgdGV4dCBnZXRzIGN1cnNvcjp0ZXh0IG9uIGhvdmVyIHNvIGl0IHJlYWRzIGFzIGEKICAvLyB0ZXh0IGZpZWxkIGJlZm9yZSB0aGUgY2xpY2suIEluZXJ0IHdoZW4gdGhlIHBpY2tlciBpcyBvZmYgKENTUyBydWxlIGlzIGdhdGVkCiAgLy8gb24gaHRtbC5ibGluay1waWNrZXItYWN0aXZlKSwgc28gYSBsZWZ0b3ZlciBhdHRyIGNhbiBuZXZlciBibGVlZCBpbnRvIHRoZSBhcHAuCiAgZnVuY3Rpb24gc2V0RWRpdEhvdmVyKHByZXYsIG5leHQpewogICAgdHJ5IHsKICAgICAgaWYgKHByZXYgJiYgcHJldi5yZW1vdmVBdHRyaWJ1dGUpIHByZXYucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWJsaW5rLWVkaXQtaG92ZXInKTsKICAgICAgaWYgKG5leHQgJiYgbmV4dC5zZXRBdHRyaWJ1dGUgJiYgaXNJbmxpbmVFZGl0YWJsZShuZXh0KSkgbmV4dC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYmxpbmstZWRpdC1ob3ZlcicsICcxJyk7CiAgICB9IGNhdGNoIChlKSB7fQogIH0KCiAgLy8gLS0tLSBpbmxpbmUgdGV4dCBlZGl0IC0tLS0KICAvLyBFbGVtZW50IHF1YWxpZmllcyBmb3IgY2FyZXQtZWRpdCBvbiBjbGljayBpZiAoYSkgaXQgaGFzIGRpcmVjdAogIC8vIHRleHQsIChiKSBubyBlbGVtZW50IGNoaWxkcmVuICh3b3VsZCBtYW5nbGUgRE9NIGR1cmluZyBjb250ZW50RWRpdGFibGUpLAogIC8vIChjKSB0YWcgaXMgbm90IGluIHRoZSBkZW55IGxpc3QuIEtlZXBzIHRoZSBlZGl0IHBhdGggc2FmZSDigJQgY29tcG9zaXRlcwogIC8vIGxpa2UgPGJ1dHRvbj48SWNvbi8+U2F2ZTwvYnV0dG9uPiBzdGF5IG9uIHRoZSBwb3B1cCBwYXRoLgogIGZ1bmN0aW9uIGlzSW5saW5lRWRpdGFibGUoZWwpewogICAgaWYgKCFlbCB8fCAhZWwudGFnTmFtZSB8fCBJTkxJTkVfRURJVF9ERU5ZW2VsLnRhZ05hbWVdKSByZXR1cm4gZmFsc2U7CiAgICB2YXIgZGlyZWN0ID0gJyc7CiAgICB2YXIgbm9kZXMgPSBlbC5jaGlsZE5vZGVzOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykgewogICAgICB2YXIgbiA9IG5vZGVzW2ldOwogICAgICBpZiAobi5ub2RlVHlwZSA9PT0gMSkgcmV0dXJuIGZhbHNlOyAvLyBlbGVtZW50IGNoaWxkIOKAlCBiYWlsCiAgICAgIGlmIChuLm5vZGVUeXBlID09PSAzKSBkaXJlY3QgKz0gbi5ub2RlVmFsdWU7CiAgICB9CiAgICByZXR1cm4gZGlyZWN0LnRyaW0oKS5sZW5ndGggPiAwOwogIH0KCiAgLy8gUGxhY2UgdGhlIGNhcmV0IGF0IHRoZSBjbGljayBwb2ludCBzbyB0aGUgY3Vyc29yIGxhbmRzIHdoZXJlIHRoZSB1c2VyCiAgLy8gcG9pbnRlZC4gRmFsbHMgYmFjayB0byBlbmQtb2YtY29udGVudCBpZiB0aGUgYnJvd3NlciBsYWNrcyB0aGUgQVBJIG9yCiAgLy8gdGhlIHBvaW50IGlzbid0IGluc2lkZSBhIHRleHQgbm9kZS4KICBmdW5jdGlvbiBwbGFjZUNhcmV0QXRQb2ludChlbCwgeCwgeSl7CiAgICB0cnkgewogICAgICB2YXIgcmFuZ2UgPSBudWxsOwogICAgICBpZiAoZG9jdW1lbnQuY2FyZXRQb3NpdGlvbkZyb21Qb2ludCkgewogICAgICAgIHZhciBwb3MgPSBkb2N1bWVudC5jYXJldFBvc2l0aW9uRnJvbVBvaW50KHgsIHkpOwogICAgICAgIGlmIChwb3MpIHsgcmFuZ2UgPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpOyByYW5nZS5zZXRTdGFydChwb3Mub2Zmc2V0Tm9kZSwgcG9zLm9mZnNldCk7IHJhbmdlLmNvbGxhcHNlKHRydWUpOyB9CiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY2FyZXRSYW5nZUZyb21Qb2ludCkgewogICAgICAgIHJhbmdlID0gZG9jdW1lbnQuY2FyZXRSYW5nZUZyb21Qb2ludCh4LCB5KTsKICAgICAgfQogICAgICBpZiAoIXJhbmdlKSB7IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTsgcmFuZ2Uuc2VsZWN0Tm9kZUNvbnRlbnRzKGVsKTsgcmFuZ2UuY29sbGFwc2UoZmFsc2UpOyB9CiAgICAgIHZhciBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7CiAgICAgIGlmIChzZWwpIHsgc2VsLnJlbW92ZUFsbFJhbmdlcygpOyBzZWwuYWRkUmFuZ2UocmFuZ2UpOyB9CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgdHJ5IHsgY29uc29sZS5lcnJvcignW2JsaW5rLXBpY2tlcl0gcGxhY2VDYXJldEF0UG9pbnQgZmFpbGVkJywgZXJyKTsgfSBjYXRjaCAoZTIpIHt9CiAgICB9CiAgfQoKICBmdW5jdGlvbiBlbnRlcklubGluZUVkaXQoZWwsIGV2dCl7CiAgICB0cnkgewogICAgICB2YXIgb3JpZ2luYWxUZXh0ID0gZWwudGV4dENvbnRlbnQ7CiAgICAgIGVsLnNldEF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJywgJ3RydWUnKTsKICAgICAgdHJ5IHsgZWwuc3BlbGxjaGVjayA9IGZhbHNlOyB9IGNhdGNoIChlMCkge30KICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2JsaW5rLXBpY2tlci1lZGl0aW5nJyk7CiAgICAgIC8vIEhpZGUgdGhlIGhvdmVyIHJpbmcgKHNlcGFyYXRlIGluLWlmcmFtZSA8ZGl2Pikgc28gaXQgZG9lc24ndCBzaXQgdW5kZXIKICAgICAgLy8gdGhlIGVkaXRpbmcgb3V0bGluZSBhbmQgcmVuZGVyIGFzIGEgRE9VQkxFIGJsdWUgYm9yZGVyLiBUaGUgbW91c2VvdmVyCiAgICAgIC8vIGhhbmRsZXIgYWxyZWFkeSBza2lwcyByZS1kcmF3aW5nIGl0IHdoaWxlIGlubGluZUVkaXRpbmcgaXMgc2V0LgogICAgICBjbGVhckhvdmVyKCk7CiAgICAgIHRyeSB7IGVsLmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTsgfSBjYXRjaCAoZTEpIHsgZWwuZm9jdXMoKTsgfQogICAgICBwbGFjZUNhcmV0QXRQb2ludChlbCwgZXZ0LmNsaWVudFgsIGV2dC5jbGllbnRZKTsKICAgICAgdmFyIGlzU2luZ2xlTGluZSA9ICEhSU5MSU5FX0VESVRfU0lOR0xFX0xJTkVbZWwudGFnTmFtZV07CiAgICAgIHZhciBvbktleSA9IG1ha2VJbmxpbmVFZGl0S2V5SGFuZGxlcihlbCwgaXNTaW5nbGVMaW5lKTsKICAgICAgdmFyIG9uQmx1ciA9IGZ1bmN0aW9uKCl7IGV4aXRJbmxpbmVFZGl0KGVsLCB0cnVlKTsgfTsKICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5LCB0cnVlKTsKICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIG9uQmx1cik7CiAgICAgIGlubGluZUVkaXRpbmcgPSB7IGVsOiBlbCwgb3JpZ2luYWxUZXh0OiBvcmlnaW5hbFRleHQsIG9uS2V5OiBvbktleSwgb25CbHVyOiBvbkJsdXIgfTsKICAgICAgcG9zdElubGluZUVkaXRNZXNzYWdlKCdURVhUX0VESVRfU1RBUlQnLCBlbCwgeyBvcmlnaW5hbFRleHQ6IG9yaWdpbmFsVGV4dCB9KTsKICAgIH0gY2F0Y2ggKGVycikgewogICAgICB0cnkgeyBjb25zb2xlLmVycm9yKCdbYmxpbmstcGlja2VyXSBlbnRlcklubGluZUVkaXQgZmFpbGVkJywgZXJyKTsgfSBjYXRjaCAoZTIpIHt9CiAgICB9CiAgfQoKICBmdW5jdGlvbiBtYWtlSW5saW5lRWRpdEtleUhhbmRsZXIoZWwsIGlzU2luZ2xlTGluZSl7CiAgICByZXR1cm4gZnVuY3Rpb24oZSl7CiAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIHsKICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7IGUuc3RvcFByb3BhZ2F0aW9uKCk7CiAgICAgICAgZWwudGV4dENvbnRlbnQgPSBpbmxpbmVFZGl0aW5nID8gaW5saW5lRWRpdGluZy5vcmlnaW5hbFRleHQgOiBlbC50ZXh0Q29udGVudDsKICAgICAgICBleGl0SW5saW5lRWRpdChlbCwgZmFsc2UpOwogICAgICAgIHJldHVybjsKICAgICAgfQogICAgICBpZiAoZS5rZXkgIT09ICdFbnRlcicpIHJldHVybjsKICAgICAgdmFyIG1vZENvbW1pdCA9IChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5KSAmJiAhZS5zaGlmdEtleTsKICAgICAgLy8gU2luZ2xlLWxpbmUgdGFnczogcGxhaW4gRW50ZXIgY29tbWl0cyAobm8gbmV3bGluZSkuIE11bHRpLWxpbmU6IENtZC9DdHJsK0VudGVyIGNvbW1pdHMuCiAgICAgIGlmIChpc1NpbmdsZUxpbmUgJiYgIWUuc2hpZnRLZXkgJiYgIWUubWV0YUtleSAmJiAhZS5jdHJsS2V5KSB7IGUucHJldmVudERlZmF1bHQoKTsgZXhpdElubGluZUVkaXQoZWwsIHRydWUpOyB9CiAgICAgIGVsc2UgaWYgKCFpc1NpbmdsZUxpbmUgJiYgbW9kQ29tbWl0KSB7IGUucHJldmVudERlZmF1bHQoKTsgZXhpdElubGluZUVkaXQoZWwsIHRydWUpOyB9CiAgICB9OwogIH0KCiAgZnVuY3Rpb24gZXhpdElubGluZUVkaXQoZWwsIGNvbW1pdCl7CiAgICBpZiAoIWlubGluZUVkaXRpbmcgfHwgaW5saW5lRWRpdGluZy5lbCAhPT0gZWwpIHJldHVybjsKICAgIHZhciBvcmlnaW5hbFRleHQgPSBpbmxpbmVFZGl0aW5nLm9yaWdpbmFsVGV4dDsKICAgIHZhciBvbktleSA9IGlubGluZUVkaXRpbmcub25LZXk7CiAgICB2YXIgb25CbHVyID0gaW5saW5lRWRpdGluZy5vbkJsdXI7CiAgICBpbmxpbmVFZGl0aW5nID0gbnVsbDsKICAgIHRyeSB7CiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJyk7CiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSwgdHJ1ZSk7CiAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBvbkJsdXIpOwogICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYmxpbmstcGlja2VyLWVkaXRpbmcnKTsKICAgICAgdmFyIG5ld1RleHQgPSAoZWwudGV4dENvbnRlbnQgfHwgJycpLnRyaW0oKTsKICAgICAgdmFyIHByZXZUcmltID0gKG9yaWdpbmFsVGV4dCB8fCAnJykudHJpbSgpOwogICAgICB2YXIgZGlydHkgPSBjb21taXQgJiYgbmV3VGV4dC5sZW5ndGggPiAwICYmIG5ld1RleHQgIT09IHByZXZUcmltOwogICAgICB2YXIgdHlwZSA9IGRpcnR5ID8gJ1RFWFRfRURJVF9DT01NSVQnIDogJ1RFWFRfRURJVF9DQU5DRUwnOwogICAgICBwb3N0SW5saW5lRWRpdE1lc3NhZ2UodHlwZSwgZWwsIHsgb2xkVGV4dDogb3JpZ2luYWxUZXh0LCBuZXdUZXh0OiBkaXJ0eSA/IG5ld1RleHQgOiBvcmlnaW5hbFRleHQgfSk7CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgdHJ5IHsgY29uc29sZS5lcnJvcignW2JsaW5rLXBpY2tlcl0gZXhpdElubGluZUVkaXQgZmFpbGVkJywgZXJyKTsgfSBjYXRjaCAoZTIpIHt9CiAgICB9CiAgfQoKICBmdW5jdGlvbiBwb3N0SW5saW5lRWRpdE1lc3NhZ2UodHlwZSwgZWwsIGV4dHJhcyl7CiAgICB0cnkgewogICAgICB2YXIgcGF5bG9hZCA9IHsKICAgICAgICBpZDogaWRPZihlbCksCiAgICAgICAgdGFnTmFtZTogKGVsLnRhZ05hbWUgfHwgJ2RpdicpLnRvTG93ZXJDYXNlKCksCiAgICAgICAgZmliZXJTb3VyY2U6IGdldEZpYmVyU291cmNlKGVsKSwKICAgICAgfTsKICAgICAgaWYgKGV4dHJhcykgeyBmb3IgKHZhciBrIGluIGV4dHJhcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHRyYXMsIGspKSBwYXlsb2FkW2tdID0gZXh0cmFzW2tdOyB9CiAgICAgIHBvc3RUb0VkaXRvcih7IHR5cGU6IHR5cGUsIHBheWxvYWQ6IHBheWxvYWQgfSk7CiAgICB9IGNhdGNoIChlcnIpIHsKICAgICAgdHJ5IHsgY29uc29sZS5lcnJvcignW2JsaW5rLXBpY2tlcl0gcG9zdElubGluZUVkaXRNZXNzYWdlIGZhaWxlZCcsIGVycik7IH0gY2F0Y2ggKGUyKSB7fQogICAgfQogIH0KCiAgLy8gLS0tLSBjdXJzb3Igc3R5bGU6IGFkZGVkIG9uIHRoZSBmaXJzdCBhY3RpdmF0aW9uLCBuZXZlciBhdCBpbnN0YWxsIC0tLS0KICBmdW5jdGlvbiBpbnN0YWxsU3R5bGUoKXsKICAgIGlmIChzdHlsZUluc3RhbGxlZCB8fCAhZG9jdW1lbnQuaGVhZCkgcmV0dXJuOwogICAgc3R5bGVJbnN0YWxsZWQgPSB0cnVlOwogICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTsKICAgIHN0eWxlLnRleHRDb250ZW50ID0gUElDS0VSX0NTUzsKICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpOwogIH0KfSkoKTs=')));(document.head||document.documentElement).appendChild(s);s.remove()}catch(e){console.error('[blink-picker] bootstrap failed:',e)}" } }),
			/* @__PURE__ */ jsx("script", {
				src: "https://blink.new/widget.js?projectId=inventory-arabic-app-jxlm95s8",
				type: "module"
			})
		] }), /* @__PURE__ */ jsxs("body", { children: [/* @__PURE__ */ jsx(QueryClientProvider, {
			client: queryClient,
			children: /* @__PURE__ */ jsxs(TooltipProvider, {
				delayDuration: 0,
				children: [/* @__PURE__ */ jsx(Toaster$1, {}), children]
			})
		}), /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
//#endregion
//#region src/routes/app.tsx
var $$splitComponentImporter$2 = () => import("./app-CXXBTiGY.js");
/**
* App shell layout — mounted at the REAL `/app` segment (not a pathless `_app`).
*
* Everything under `src/routes/app/` renders inside this sidebar chrome:
*   src/routes/app/index.tsx     → /app          (the dashboard home)
*   src/routes/app/settings.tsx  → /app/settings (add pages like this)
*
* WHY A NAMED SEGMENT, NOT `_app`: a `_`-prefixed layout is PATHLESS — it adds no
* URL segment, so `_app/index.tsx` IS the `/` route and collides with the root
* `src/routes/index.tsx` (and a childless `_app.tsx` collides the same way). The
* build then fails with "Conflicting configuration paths … '/', '/'". Under `/app`
* that collision is impossible: `app/index.tsx` can only ever be `/app`.
*
* DASHBOARD-ONLY PRODUCT (no landing page)? Keep this shell and make the root
* redirect to it — `src/routes/index.tsx` → `beforeLoad: () => { throw redirect({ to: '/app' }) }`.
* Redirect to `/app` (a real path), never to a pathless route.
*
* LANDING / MARKETING / CONTENT / GAME? You don't need this shell: delete
* `src/routes/app.tsx` and the `src/routes/app/` folder. Deleting is always safe.
*
* Auth-gate the whole shell by wrapping <Outlet /> in your auth check here — one
* place, not per page. Browser-only state (blink.auth, localStorage, window) must
* sit inside <BlinkClientBoundary> (wrap the whole shell if the entire app is
* browser-only). Do NOT use the route's `ssr: false` — a client-only route in this
* TanStack Start template hits Start's server-context `node:async_hooks` path (a
* throwing browser stub) and ships a BLANK preview ("AsyncLocalStorage is not a
* constructor").
*/
var Route$2 = createFileRoute("/app")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$1 = () => import("./routes-9LpHmoI_.js");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "StoreWise | إدارة المخزون" }, {
		name: "description",
		content: "إدارة المنتجات والمخزون للمتاجر — StoreWise."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/app/index.tsx
var $$splitComponentImporter = () => import("./app-DlPlvBBQ.js");
/**
* Dashboard home — `/app` (this file is the index of the `/app` segment, so its
* path is `/app`, NOT `/app/index`). Rendered inside the sidebar shell defined in
* `src/routes/app.tsx`.
*
* Add sibling pages as files in this folder: `src/routes/app/orders.tsx` → /app/orders.
* Every page you add must also get a matching sidebar link (see AppSidebarShell),
* and every sidebar link must have a real page — never ship a nav link to a 404.
*
* Replace this placeholder body with the real dashboard.
*/
var Route = createFileRoute("/app/")({
	head: () => ({ meta: [{ title: "Dashboard · Blink App" }, {
		name: "description",
		content: "Your app dashboard."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var AppRoute = Route$2.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$3
});
var IndexRoute = Route$1.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$3
});
var AppRouteChildren = { AppIndexRoute: Route.update({
	id: "/",
	path: "/",
	getParentRoute: () => AppRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren)
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
/**
* TanStack Start entry — the framework imports this `createRouter` factory.
* `routeTree.gen.ts` is generated automatically by the TanStack Start Vite
* plugin from the files under `src/routes/` (do not edit it by hand).
*/
function createRouter() {
	return createRouter$1({
		routeTree,
		defaultPreload: "intent",
		scrollRestoration: true
	});
}
var getRouter = createRouter;
//#endregion
export { createRouter, getRouter };
