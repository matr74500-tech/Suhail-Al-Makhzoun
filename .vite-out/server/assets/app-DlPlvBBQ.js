import { t as cn } from "./utils-C_uf36nf.js";
import "react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/ui/card.tsx
function Card({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card",
		className: cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-header",
		className: cn("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-title",
		className: cn("leading-none font-semibold", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-content",
		className: cn("px-6", className),
		...props
	});
}
//#endregion
//#region src/routes/app/index.tsx?tsr-split=component
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
function DashboardHome() {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "Dashboard"
		}), /* @__PURE__ */ jsxs("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: [
				"Replace this with your real dashboard. Add pages under",
				" ",
				/* @__PURE__ */ jsx("code", {
					className: "rounded bg-muted px-1",
					children: "src/routes/app/"
				}),
				"."
			]
		})] }), /* @__PURE__ */ jsx("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: [
				"Overview",
				"Activity",
				"Getting started"
			].map((title) => /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, {
				className: "text-sm font-medium",
				children: title
			}) }), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Placeholder card — swap in real data."
			}) })] }, title))
		})]
	});
}
//#endregion
export { DashboardHome as component };
