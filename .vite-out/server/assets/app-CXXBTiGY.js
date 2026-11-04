import { t as Outlet } from "../server.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip-LM5DC4Aj.js";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { LayoutDashboard, LogOut, Menu, PanelLeft, XIcon } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
			destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
			outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2 has-[>svg]:px-3",
			sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
			lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region src/components/ui/sheet.tsx
function Sheet({ ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Root, {
		"data-slot": "sheet",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Portal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Overlay, {
		"data-slot": "sheet-overlay",
		className: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(SheetPrimitive.Content, {
		"data-slot": "sheet-content",
		className: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500", side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", className),
		...props,
		children: [children, /* @__PURE__ */ jsxs(SheetPrimitive.Close, {
			className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
			children: [/* @__PURE__ */ jsx(XIcon, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
//#endregion
//#region src/Shell.tsx
/**
* Shell — Mobile-responsive app layout (shadcn/ui based).
*
* USAGE (in a route or SharedAppLayout):
*   <Shell sidebar={<MySidebarContent />}>
*     <Page>...</Page>
*   </Shell>
*
* Desktop (md+): the sidebar is a fixed column on the left, main content fills
* the rest. Mobile: the sidebar is hidden and opens in a Sheet drawer via the
* hamburger button in the mobile header. Customize freely — this is your code.
*/
function Shell({ sidebar, appName = "App", children }) {
	const [open, setOpen] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-dvh",
		children: [
			/* @__PURE__ */ jsx("aside", {
				className: "hidden md:block shrink-0",
				children: sidebar
			}),
			/* @__PURE__ */ jsx(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ jsx(SheetContent, {
					side: "left",
					className: "w-64 p-0",
					children: sidebar
				})
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "flex flex-1 min-w-0 flex-col",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-background sticky top-0 z-30",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "-ml-2",
						"aria-label": "Open menu",
						onClick: () => setOpen(true),
						children: /* @__PURE__ */ jsx(Menu, { className: "size-5" })
					}), /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-sm",
						children: appName
					})]
				}), children]
			})
		]
	});
}
//#endregion
//#region src/components/ui/avatar.tsx
function Avatar({ className, ...props }) {
	return /* @__PURE__ */ jsx(AvatarPrimitive.Root, {
		"data-slot": "avatar",
		className: cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className),
		...props
	});
}
function AvatarFallback({ className, ...props }) {
	return /* @__PURE__ */ jsx(AvatarPrimitive.Fallback, {
		"data-slot": "avatar-fallback",
		className: cn("bg-muted flex size-full items-center justify-center rounded-full", className),
		...props
	});
}
//#endregion
//#region src/components/AppSidebarShell.tsx
/**
* Collapsible SaaS sidebar — OPT-IN (rendered by SharedAppLayout, which the
* template root does NOT apply by default). Only reach for this when building a
* SaaS / dashboard app; landing & marketing pages stay full-bleed.
*
* Expands to 15rem, collapses to 3rem (icon-only).
* State is persisted to localStorage. Tooltips appear automatically when collapsed.
*
* A native flex-col implementation (shadcn Button/Avatar/Tooltip primitives) for
* full layout control — every line is yours to edit.
*/
var SIDEBAR_KEY = "sidebar_collapsed";
var NAV_ITEMS = [{
	href: "/app",
	icon: /* @__PURE__ */ jsx(LayoutDashboard, { className: "h-4 w-4" }),
	label: "Dashboard",
	active: true
}];
function NavItem({ item, collapsed }) {
	const link = /* @__PURE__ */ jsxs("a", {
		href: item.href,
		className: cn("flex items-center gap-2.5 rounded-md text-sm transition-colors cursor-pointer", collapsed ? "justify-center w-8 h-8 mx-auto" : "px-3 py-2 w-full", item.active ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
		children: [/* @__PURE__ */ jsx("span", {
			className: "shrink-0",
			children: item.icon
		}), !collapsed && /* @__PURE__ */ jsx("span", {
			className: "truncate",
			children: item.label
		})]
	});
	if (!collapsed) return link;
	return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
		asChild: true,
		children: link
	}), /* @__PURE__ */ jsx(TooltipContent, {
		side: "right",
		children: item.label
	})] });
}
function AppSidebarShell() {
	const [collapsed, setCollapsed] = useState(false);
	useEffect(() => {
		if (localStorage.getItem(SIDEBAR_KEY) === "true") setCollapsed(true);
	}, []);
	const toggle = useCallback(() => {
		setCollapsed((v) => {
			const next = !v;
			localStorage.setItem(SIDEBAR_KEY, String(next));
			return next;
		});
	}, []);
	return /* @__PURE__ */ jsx(TooltipProvider, {
		delayDuration: 0,
		children: /* @__PURE__ */ jsxs("div", {
			className: cn("flex flex-col h-full bg-background border-r border-border overflow-hidden", "transition-[width] duration-200 ease-linear shrink-0", collapsed ? "w-[3rem]" : "w-[15rem]"),
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: cn("flex items-center gap-2 shrink-0 border-b border-border h-[52px] px-3", collapsed && "justify-center px-2"),
					children: [!collapsed && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
						className: "flex items-center justify-center h-7 w-7 rounded-md bg-primary text-primary-foreground text-xs font-bold shrink-0",
						children: "A"
					}), /* @__PURE__ */ jsx("span", {
						className: "flex-1 font-semibold text-sm truncate",
						children: "App"
					})] }), /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground",
							onClick: toggle,
							children: /* @__PURE__ */ jsx(PanelLeft, { className: cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180") })
						})
					}), /* @__PURE__ */ jsx(TooltipContent, {
						side: "right",
						children: collapsed ? "Expand sidebar" : "Collapse sidebar"
					})] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5",
					children: [!collapsed && /* @__PURE__ */ jsx("p", {
						className: "px-3 pt-1 pb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider",
						children: "Main"
					}), NAV_ITEMS.map((item) => /* @__PURE__ */ jsx(NavItem, {
						item,
						collapsed
					}, item.href))]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: cn("shrink-0 border-t border-border", collapsed ? "flex flex-col items-center gap-1 p-2" : "p-3 space-y-1"),
					children: [collapsed ? /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsx("button", {
							className: "flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors cursor-pointer",
							children: /* @__PURE__ */ jsx(Avatar, {
								className: "h-6 w-6 shrink-0",
								children: /* @__PURE__ */ jsx(AvatarFallback, {
									className: "text-[10px] bg-muted",
									children: "U"
								})
							})
						})
					}), /* @__PURE__ */ jsx(TooltipContent, {
						side: "right",
						children: "User · user@example.com"
					})] }) : /* @__PURE__ */ jsxs("button", {
						className: "flex items-center gap-2 rounded-md hover:bg-accent transition-colors cursor-pointer w-full px-2 py-1.5",
						children: [/* @__PURE__ */ jsx(Avatar, {
							className: "h-6 w-6 shrink-0",
							children: /* @__PURE__ */ jsx(AvatarFallback, {
								className: "text-[10px] bg-muted",
								children: "U"
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex-1 min-w-0 text-left",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium leading-tight truncate",
								children: "User"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[10px] text-muted-foreground leading-tight truncate",
								children: "user@example.com"
							})]
						})]
					}), collapsed ? /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
						asChild: true,
						children: /* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							className: "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 shrink-0" })
						})
					}), /* @__PURE__ */ jsx(TooltipContent, {
						side: "right",
						children: "Sign out"
					})] }) : /* @__PURE__ */ jsxs(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						className: "w-full justify-start px-2 gap-2 text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 shrink-0" }), "Sign out"]
					})]
				})
			]
		})
	});
}
//#endregion
//#region src/layouts/shared-app-layout.tsx
/**
* SaaS app chrome (sidebar + main) — OPT-IN, not the default.
* The template root (__root.tsx) is full-bleed by default. This is already wired
* up for you by `src/routes/app.tsx` (the `/app` segment); add dashboard pages as
* files under `src/routes/app/`. Never mount it from a pathless `src/routes/_app.tsx`
* — a `_`-prefixed layout adds no URL segment, so it (or its `index.tsx`) claims "/"
* and collides with the root index route, failing the build. Do not wrap individual
* pages in Shell or duplicate sidebars/top bars. Landing/marketing/content apps
* don't need this at all — delete `src/routes/app.tsx` + `src/routes/app/`.
*/
var SharedLayoutContext = createContext(null);
function SharedAppLayout({ appName = "App", sidebar = /* @__PURE__ */ jsx(AppSidebarShell, {}), children }) {
	const value = React.useMemo(() => ({ appName }), [appName]);
	return /* @__PURE__ */ jsx(SharedLayoutContext.Provider, {
		value,
		children: /* @__PURE__ */ jsx("div", {
			className: "flex min-h-dvh w-full flex-1 flex-col",
			children: /* @__PURE__ */ jsx(Shell, {
				appName,
				sidebar,
				children
			})
		})
	});
}
//#endregion
//#region src/routes/app.tsx?tsr-split=component
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
function AppLayout() {
	return /* @__PURE__ */ jsx(SharedAppLayout, {
		appName: "App",
		children: /* @__PURE__ */ jsx(Outlet, {})
	});
}
//#endregion
export { AppLayout as component };
