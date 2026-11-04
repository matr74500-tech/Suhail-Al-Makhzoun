import { a as ClientOnly } from "../server.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { AlertTriangle, ArrowDownToLine, Barcode, BookOpen, Boxes, Check, CirclePlus, Download, ImagePlus, LayoutDashboard, LogOut, Package, Pencil, Plus, Printer, Search, Settings2, ShieldCheck, SlidersHorizontal, Trash2, Upload, Warehouse, X } from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@blinkdotnew/sdk";
//#region src/blink/client.ts
var blink = createClient({
	projectId: "inventory-arabic-app-jxlm95s8",
	publishableKey: "blnk_pk_Lo5hZoSDhAj_9O59YWZaab33qGrKoPxi",
	authRequired: false,
	auth: { mode: "managed" }
});
//#endregion
//#region src/components/BlinkClientBoundary.tsx
/**
* SSR-safe boundary. Every route in this template is SERVER-RENDERED / prerendered
* (TanStack Start). Anything that touches the browser AT RENDER TIME — Blink SDK
* auth state (`blink.auth`, `onAuthStateChanged`), `localStorage`/`window`, or a
* hook that reads them — throws or hydration-mismatches on the server and ships a
* blank/broken first page. Wrap that subtree here: the server renders `fallback`,
* and the real UI mounts in the browser. Keep static/marketing content OUTSIDE the
* boundary so it stays server-rendered and crawlable.
*
*   <BlinkClientBoundary fallback={<Skeleton />}>
*     <AuthedDashboard />   // reads blink.auth — browser only
*   </BlinkClientBoundary>
*
* If the WHOLE page needs the browser, wrap its entire tree in this boundary.
* Do NOT use the route's `ssr: false` option: a client-only route in this TanStack
* Start template hits Start's server-context `node:async_hooks` path (externalized
* to a throwing stub in the browser) and ships a BLANK preview ("AsyncLocalStorage
* is not a constructor"). This boundary (TanStack's `ClientOnly`) is the supported
* client-only escape hatch, and keeps the shell server-rendered (better for SEO).
*/
function BlinkClientBoundary({ children, fallback = null }) {
	return /* @__PURE__ */ jsx(ClientOnly, { fallback });
}
//#endregion
//#region src/lib/inventory.ts
function makeEan13() {
	const base = `628${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 1e3)).padStart(3, "0")}`;
	return `${base}${(10 - [...base].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0) % 10) % 10}`;
}
function isValidEan13(value) {
	if (!/^\d{13}$/.test(value)) return false;
	return (10 - [...value.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0) % 10) % 10 === Number(value[12]);
}
function makeItemCode(category, codes) {
	const prefix = Array.from(category.trim()).slice(0, 3).join("").toUpperCase() || "صنف";
	const sequence = codes.reduce((max, code) => {
		const match = code.match(/-(\d+)$/);
		return code.startsWith(`${prefix}-`) && match ? Math.max(max, Number(match[1])) : max;
	}, 0) + 1;
	return `${prefix}-${String(sequence).padStart(4, "0")}`;
}
var L = [
	"0001101",
	"0011001",
	"0010011",
	"0111101",
	"0100011",
	"0110001",
	"0101111",
	"0111011",
	"0110111",
	"0001011"
];
var G = [
	"0100111",
	"0110011",
	"0011011",
	"0100001",
	"0011101",
	"0111001",
	"0000101",
	"0010001",
	"0001001",
	"0010111"
];
var R = [
	"1110010",
	"1100110",
	"1101100",
	"1000010",
	"1011100",
	"1001110",
	"1010000",
	"1000100",
	"1001000",
	"1110100"
];
var parity = [
	"LLLLLL",
	"LLGLGG",
	"LLGGLG",
	"LLGGGL",
	"LGLLGG",
	"LGGLLG",
	"LGGGLL",
	"LGLGLG",
	"LGLGGL",
	"LGGLGL"
];
function ean13Bits(value) {
	const code = /^\d{13}$/.test(value) ? value : makeEan13();
	let bits = "101";
	for (let i = 1; i <= 6; i++) bits += (parity[Number(code[0])][i - 1] === "L" ? L : G)[Number(code[i])];
	bits += "01010";
	for (let i = 7; i < 13; i++) bits += R[Number(code[i])];
	return `${bits}101`;
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
var categoriesDefault = [
	"أدوات مكتبية",
	"مدرسية",
	"حقائب",
	"كتب",
	"خردوات",
	"ألعاب",
	"إلكترونيات",
	"أخرى"
];
var warehousesDefault = [
	"المعرض الرئيسي",
	"مخزن شارع رداع",
	"المخزن الخلفي"
];
var units = [
	"قطعة",
	"علبة",
	"دستة",
	"كرتون",
	"متر",
	"كيلوجرام",
	"لتر"
];
var table = blink.db.table("inventory_products");
var blankDraft = {
	itemName: "",
	modelNumber: "",
	primaryBarcode: "",
	specifications: "",
	category: "",
	warehouse: "",
	shelfPosition: "",
	baseUnit: "قطعة",
	majorUnit: "",
	packageCapacity: "1",
	purchaseCost: "0",
	priceSpecial: "0",
	priceRetail: "0",
	priceHalfWholesale: "0",
	priceWholesale: "0",
	priceBulkWholesale: "0",
	stockQuantity: "0",
	minStock: "5"
};
var num = (value) => Number(value || 0);
var money = (value) => new Intl.NumberFormat("ar-YE", { maximumFractionDigits: 2 }).format(num(value));
function LoadingScreen() {
	return /* @__PURE__ */ jsx("div", {
		className: "grid min-h-dvh place-items-center bg-background",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3 text-muted-foreground",
			children: [/* @__PURE__ */ jsx("span", { className: "h-5 w-5 animate-spin rounded-full border-2 border-primary border-l-transparent" }), " جارٍ تجهيز المخزون…"]
		})
	});
}
function InventoryApp() {
	const [user, setUser] = useState(null);
	const [authLoading, setAuthLoading] = useState(true);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentTime, setCurrentTime] = useState(0);
	const [view, setView] = useState("overview");
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("الكل");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [draft, setDraft] = useState(blankDraft);
	const [imageFile, setImageFile] = useState(null);
	const [saving, setSaving] = useState(false);
	const [printMode, setPrintMode] = useState(null);
	const [shopName, setShopName] = useState("مكتبة ومحلات الإخوة");
	const [labelName, setLabelName] = useState(true);
	const [labelPrice, setLabelPrice] = useState(true);
	const [labelShop, setLabelShop] = useState(true);
	const importRef = useRef(null);
	const imagePreview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);
	useEffect(() => () => {
		if (imagePreview) URL.revokeObjectURL(imagePreview);
	}, [imagePreview]);
	useEffect(() => {
		return blink.auth.onAuthStateChanged((state) => {
			setUser(state.user);
			if (!state.isLoading) setAuthLoading(false);
		});
	}, []);
	useEffect(() => {
		const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0);
		return () => window.clearTimeout(timer);
	}, []);
	const refresh = useCallback(async (uid = user?.id) => {
		if (!uid) return;
		setLoading(true);
		try {
			setProducts(await table.list({
				where: { userId: uid },
				orderBy: { updatedAt: "desc" },
				limit: 1e3
			}));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذر تحميل الأصناف");
		} finally {
			setLoading(false);
		}
	}, [user?.id]);
	useEffect(() => {
		if (!user?.id) return;
		let active = true;
		table.list({
			where: { userId: user.id },
			orderBy: { updatedAt: "desc" },
			limit: 1e3
		}).then((rows) => {
			if (active) setProducts(rows);
		}).catch((error) => {
			if (active) toast.error(error instanceof Error ? error.message : "تعذر تحميل الأصناف");
		}).finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [user?.id]);
	useEffect(() => {
		if (!user?.id) return;
		const timer = window.setInterval(() => {
			if (document.visibilityState !== "visible") return;
			table.list({
				where: { userId: user.id },
				orderBy: { updatedAt: "desc" },
				limit: 1e3
			}).then(setProducts).catch(() => void 0);
		}, 15e3);
		return () => window.clearInterval(timer);
	}, [user?.id]);
	useEffect(() => {
		if (!printMode) return;
		const timer = window.setTimeout(() => window.print(), 160);
		const finish = () => setPrintMode(null);
		window.addEventListener("afterprint", finish);
		return () => {
			window.clearTimeout(timer);
			window.removeEventListener("afterprint", finish);
		};
	}, [printMode]);
	useEffect(() => {
		const onKey = (event) => {
			if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(event.target?.tagName)) {
				event.preventDefault();
				document.getElementById("quick-search")?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const categories = useMemo(() => [...new Set([...categoriesDefault, ...products.map((p) => p.category).filter(Boolean)])], [products]);
	const warehouses = useMemo(() => [...new Set([...warehousesDefault, ...products.map((p) => p.warehouse).filter(Boolean)])], [products]);
	const filtered = useMemo(() => products.filter((product) => {
		const term = search.trim().toLocaleLowerCase();
		return (!term || [
			product.itemName,
			product.itemCode,
			product.modelNumber,
			product.primaryBarcode,
			product.customBarcode,
			product.category,
			product.specifications
		].some((value) => String(value || "").toLocaleLowerCase().includes(term))) && (categoryFilter === "الكل" || product.category === categoryFilter);
	}), [
		products,
		search,
		categoryFilter
	]);
	const lowStock = products.filter((p) => num(p.stockQuantity) <= num(p.minStock));
	const staleStock = products.filter((p) => currentTime > 0 && num(p.stockQuantity) > 0 && currentTime - Date.parse(p.lastActivityAt || p.createdAt) > 90 * 864e5);
	const totalValue = products.reduce((sum, p) => sum + num(p.stockQuantity) * num(p.purchaseCost), 0);
	function openNew() {
		setEditing(null);
		setDraft(blankDraft);
		setImageFile(null);
		setDialogOpen(true);
	}
	function openEdit(product) {
		setEditing(product);
		setImageFile(null);
		setDraft({
			itemName: product.itemName,
			modelNumber: product.modelNumber || "",
			primaryBarcode: product.primaryBarcode || "",
			specifications: product.specifications || "",
			category: product.category,
			warehouse: product.warehouse,
			shelfPosition: product.shelfPosition || "",
			baseUnit: product.baseUnit,
			majorUnit: product.majorUnit || "",
			packageCapacity: String(product.packageCapacity),
			purchaseCost: String(product.purchaseCost),
			priceSpecial: String(product.priceSpecial),
			priceRetail: String(product.priceRetail),
			priceHalfWholesale: String(product.priceHalfWholesale),
			priceWholesale: String(product.priceWholesale),
			priceBulkWholesale: String(product.priceBulkWholesale),
			stockQuantity: String(product.stockQuantity),
			minStock: String(product.minStock)
		});
		setDialogOpen(true);
	}
	function setField(key, value) {
		setDraft((current) => ({
			...current,
			[key]: value
		}));
	}
	async function saveProduct(event) {
		event.preventDefault();
		if (!user || !draft.itemName.trim() || !draft.category.trim() || !draft.warehouse.trim()) return;
		setSaving(true);
		try {
			let imageUrl = editing?.imageUrl || null;
			if (imageFile) {
				const extension = imageFile.name.split(".").pop() || "jpg";
				imageUrl = (await blink.storage.upload(imageFile, `products/${user.id}-${Date.now()}.${extension}`)).publicUrl;
			}
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const itemCode = editing?.itemCode || makeItemCode(draft.category, products.map((p) => p.itemCode));
			const customBarcode = editing?.customBarcode || makeEan13();
			const payload = {
				itemCode,
				modelNumber: draft.modelNumber.trim() || null,
				primaryBarcode: draft.primaryBarcode.trim() || null,
				customBarcode,
				itemName: draft.itemName.trim(),
				specifications: draft.specifications.trim() || null,
				category: draft.category.trim(),
				warehouse: draft.warehouse.trim(),
				shelfPosition: draft.shelfPosition.trim() || null,
				baseUnit: draft.baseUnit,
				majorUnit: draft.majorUnit.trim() || null,
				packageCapacity: num(draft.packageCapacity),
				purchaseCost: num(draft.purchaseCost),
				priceSpecial: num(draft.priceSpecial),
				priceRetail: num(draft.priceRetail),
				priceHalfWholesale: num(draft.priceHalfWholesale),
				priceWholesale: num(draft.priceWholesale),
				priceBulkWholesale: num(draft.priceBulkWholesale),
				imageUrl,
				stockQuantity: num(draft.stockQuantity),
				minStock: num(draft.minStock),
				lastActivityAt: now,
				updatedAt: now
			};
			if (editing) await table.update(editing.id, payload);
			else await table.create({
				...payload,
				userId: user.id
			});
			await refresh(user.id);
			setDialogOpen(false);
			toast.success(editing ? "تم تحديث الصنف" : "تمت إضافة الصنف");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذر حفظ الصنف");
		} finally {
			setSaving(false);
		}
	}
	async function adjustStock(product, amount) {
		try {
			await table.update(product.id, {
				stockQuantity: Math.max(0, num(product.stockQuantity) + amount),
				lastActivityAt: (/* @__PURE__ */ new Date()).toISOString(),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			await refresh();
			toast.success("تم تحديث رصيد المخزون");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذر تعديل الرصيد");
		}
	}
	async function deleteProduct(product) {
		if (!window.confirm(`هل تريد حذف «${product.itemName}»؟`)) return;
		try {
			await table.delete(product.id);
			await refresh();
			toast.success("تم حذف الصنف");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذر حذف الصنف");
		}
	}
	function exportExcel() {
		if (!products.length) return toast.error("لا توجد أصناف لتصديرها");
		const rows = products.map((p) => ({
			"كود الصنف": p.itemCode,
			"رقم الصنف / الموديل": p.modelNumber,
			"الباركود الأساسي": p.primaryBarcode,
			"الباركود الخاص": p.customBarcode,
			"اسم الصنف": p.itemName,
			"المواصفات": p.specifications,
			"القسم / الفئة": p.category,
			"المخزن": p.warehouse,
			"موقع الرف": p.shelfPosition,
			"الوحدة الأساسية": p.baseUnit,
			"الوحدة الكبرى": p.majorUnit,
			"سعة العبوة": p.packageCapacity,
			"تكلفة الشراء": p.purchaseCost,
			"سعر خاص": p.priceSpecial,
			"سعر التجزئة": p.priceRetail,
			"نصف جملة": p.priceHalfWholesale,
			"جملة": p.priceWholesale,
			"جملة الجملة": p.priceBulkWholesale,
			"الصورة": p.imageUrl,
			"الرصيد": p.stockQuantity,
			"حد التنبيه": p.minStock
		}));
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "المخزون");
		XLSX.writeFile(workbook, "storewise-inventory.xlsx");
		toast.success("تم تجهيز ملف Excel");
	}
	async function importExcel(file) {
		if (!file || !user) return;
		try {
			const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
			const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
			let imported = 0;
			const importedCodes = products.map((p) => p.itemCode);
			const importedBarcodes = new Set(products.map((p) => p.customBarcode));
			for (const row of rows) {
				const pick = (...keys) => {
					for (const key of keys) if (row[key] !== void 0 && row[key] !== "") return row[key];
					return "";
				};
				const itemName = String(pick("itemName", "اسم الصنف", "الاسم", "name")).trim();
				if (!itemName) continue;
				const category = String(pick("category", "القسم / الفئة", "الفئة", "القسم") || "أخرى");
				const importedBarcode = String(pick("customBarcode", "الباركود الخاص", "الباركود") || "");
				const custom = isValidEan13(importedBarcode) ? importedBarcode : makeEan13();
				if (importedBarcodes.has(custom)) continue;
				const now = (/* @__PURE__ */ new Date()).toISOString();
				const itemCode = String(pick("itemCode", "كود الصنف") || makeItemCode(category, importedCodes));
				await table.create({
					userId: user.id,
					itemCode,
					modelNumber: String(pick("modelNumber", "رقم الصنف / الموديل", "الموديل") || "") || null,
					primaryBarcode: String(pick("primaryBarcode", "الباركود الأساسي") || "") || null,
					customBarcode: custom,
					itemName,
					specifications: String(pick("specifications", "المواصفات", "الوصف") || "") || null,
					category,
					warehouse: String(pick("warehouse", "المخزن", "المستودع") || warehousesDefault[0]),
					shelfPosition: String(pick("shelfPosition", "موقع الرف") || "") || null,
					baseUnit: String(pick("baseUnit", "الوحدة الأساسية") || "قطعة"),
					majorUnit: String(pick("majorUnit", "الوحدة الكبرى") || "") || null,
					packageCapacity: num(String(pick("packageCapacity", "سعة العبوة") || "1")),
					purchaseCost: num(String(pick("purchaseCost", "تكلفة الشراء") || "0")),
					priceSpecial: num(String(pick("priceSpecial", "سعر خاص") || "0")),
					priceRetail: num(String(pick("priceRetail", "سعر التجزئة") || "0")),
					priceHalfWholesale: num(String(pick("priceHalfWholesale", "نصف جملة") || "0")),
					priceWholesale: num(String(pick("priceWholesale", "جملة") || "0")),
					priceBulkWholesale: num(String(pick("priceBulkWholesale", "جملة الجملة") || "0")),
					imageUrl: String(pick("imageUrl", "الصورة") || "") || null,
					stockQuantity: num(String(pick("stockQuantity", "الرصيد", "الكمية") || "0")),
					minStock: num(String(pick("minStock", "حد التنبيه") || "5")),
					lastActivityAt: now,
					updatedAt: now
				});
				importedCodes.push(itemCode);
				importedBarcodes.add(custom);
				imported++;
			}
			await refresh(user.id);
			toast.success(`تم استيراد ${imported} صنف`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "تعذر قراءة الملف");
		} finally {
			if (importRef.current) importRef.current.value = "";
		}
	}
	if (authLoading) return /* @__PURE__ */ jsx(LoadingScreen, {});
	if (!user) return /* @__PURE__ */ jsx(SignInScreen, { onSignIn: () => blink.auth.login(window.location.href) });
	const views = [
		{
			id: "overview",
			label: "نظرة عامة",
			icon: LayoutDashboard
		},
		{
			id: "products",
			label: "الأصناف",
			icon: Package,
			count: products.length
		},
		{
			id: "alerts",
			label: "تنبيهات المخزون",
			icon: AlertTriangle,
			count: lowStock.length
		},
		{
			id: "barcodes",
			label: "طباعة الباركود",
			icon: Barcode
		}
	];
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "app-shell min-h-dvh bg-background text-foreground",
			dir: "rtl",
			children: [/* @__PURE__ */ jsxs("aside", {
				className: "sidebar-panel hidden w-64 shrink-0 flex-col border-l border-border bg-card lg:flex",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 border-b border-border px-6 py-6",
						children: [/* @__PURE__ */ jsx("div", {
							className: "grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground",
							children: /* @__PURE__ */ jsx(Boxes, { size: 21 })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "font-serif text-xl font-semibold tracking-tight",
							children: "StoreWise"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground",
							children: "إدارة ذكية للمخزون"
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "px-4 pt-6",
						children: [/* @__PURE__ */ jsx("p", {
							className: "px-3 pb-2 text-[10px] font-bold tracking-[.18em] text-muted-foreground",
							children: "القائمة الرئيسية"
						}), /* @__PURE__ */ jsx("nav", {
							className: "space-y-1",
							"aria-label": "القائمة الرئيسية",
							children: views.map((item) => /* @__PURE__ */ jsxs("button", {
								onClick: () => setView(item.id),
								className: `nav-item ${view === item.id ? "nav-item-active" : ""}`,
								children: [
									/* @__PURE__ */ jsx(item.icon, { size: 18 }),
									/* @__PURE__ */ jsx("span", {
										className: "flex-1 text-right",
										children: item.label
									}),
									item.count !== void 0 && /* @__PURE__ */ jsx("span", {
										className: "rounded-full bg-background/70 px-2 py-0.5 text-xs",
										children: item.count
									})
								]
							}, item.id))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mx-5 mt-auto mb-4 rounded-2xl border border-border bg-background p-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-3 flex items-center gap-2 text-sm font-semibold",
							children: [/* @__PURE__ */ jsx(ShieldCheck, {
								size: 16,
								className: "text-primary"
							}), " بياناتك بأمان"]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs leading-5 text-muted-foreground",
							children: "كل متجر يرى سجلاته الخاصة فقط، وتتزامن تغييراتك فوراً."
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => blink.auth.logout(),
						className: "flex items-center gap-3 border-t border-border px-6 py-4 text-sm text-muted-foreground transition hover:text-foreground",
						children: [/* @__PURE__ */ jsx(LogOut, { size: 17 }), " تسجيل الخروج"]
					})
				]
			}), /* @__PURE__ */ jsxs("main", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "sticky top-0 z-20 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-7 lg:px-9",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx("div", {
										className: "grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden",
										children: /* @__PURE__ */ jsx(Boxes, { size: 19 })
									}), /* @__PURE__ */ jsxs("div", {
										className: "hidden sm:block",
										children: [/* @__PURE__ */ jsx("div", {
											className: "text-xs text-muted-foreground",
											children: "مساحة العمل / المخزون"
										}), /* @__PURE__ */ jsx("div", {
											className: "font-semibold",
											children: views.find((item) => item.id === view)?.label
										})]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "quick-search-wrap order-3 w-full lg:order-none lg:mx-6 lg:max-w-xl lg:flex-1",
									children: [
										/* @__PURE__ */ jsx(Search, {
											size: 17,
											className: "shrink-0 text-muted-foreground"
										}),
										/* @__PURE__ */ jsx("input", {
											id: "quick-search",
											value: search,
											onFocus: () => setView("products"),
											onChange: (e) => {
												setSearch(e.target.value);
												setView("products");
											},
											placeholder: "بحث سريع بالاسم أو الكود أو الباركود…"
										}),
										/* @__PURE__ */ jsx("kbd", { children: "/" })
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsxs("button", {
											onClick: () => importRef.current?.click(),
											className: "toolbar-button hidden sm:flex",
											children: [/* @__PURE__ */ jsx(Upload, { size: 16 }), " استيراد"]
										}),
										/* @__PURE__ */ jsx("input", {
											ref: importRef,
											type: "file",
											accept: ".xlsx,.xls,.csv",
											className: "hidden",
											onChange: (e) => void importExcel(e.target.files?.[0])
										}),
										/* @__PURE__ */ jsxs("button", {
											onClick: exportExcel,
											className: "toolbar-button hidden sm:flex",
											children: [/* @__PURE__ */ jsx(Download, { size: 16 }), " تصدير Excel"]
										}),
										/* @__PURE__ */ jsxs("button", {
											onClick: openNew,
											className: "primary-button",
											children: [/* @__PURE__ */ jsx(Plus, { size: 17 }), /* @__PURE__ */ jsx("span", { children: "إضافة صنف" })]
										}),
										/* @__PURE__ */ jsx("button", {
											className: "icon-button lg:hidden",
											"aria-label": "تسجيل الخروج",
											onClick: () => blink.auth.logout(),
											children: /* @__PURE__ */ jsx(LogOut, { size: 17 })
										})
									]
								})
							]
						}), /* @__PURE__ */ jsx("nav", {
							className: "mt-3 flex gap-2 overflow-x-auto pb-0.5 lg:hidden",
							"aria-label": "التنقل",
							children: views.map((item) => /* @__PURE__ */ jsxs("button", {
								onClick: () => setView(item.id),
								className: `mobile-nav ${view === item.id ? "mobile-nav-active" : ""}`,
								children: [/* @__PURE__ */ jsx(item.icon, { size: 15 }), /* @__PURE__ */ jsx("span", { children: item.label })]
							}, item.id))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-7 sm:py-8 lg:px-9",
						children: [
							view === "overview" && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsxs("section", {
									className: "hero-panel relative overflow-hidden rounded-[1.75rem] p-6 text-primary-foreground sm:p-8",
									children: [
										/* @__PURE__ */ jsx("div", { className: "hero-grain absolute inset-0 opacity-30" }),
										/* @__PURE__ */ jsxs("div", {
											className: "relative z-10 max-w-2xl",
											children: [
												/* @__PURE__ */ jsxs("span", {
													className: "mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs",
													children: [/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-accent" }), " مساحة مخزون متزامنة"]
												}),
												/* @__PURE__ */ jsxs("h1", {
													className: "font-serif text-3xl font-semibold leading-tight sm:text-4xl",
													children: [
														"كل صنف في مكانه.",
														/* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
														" وكل قرار أوضح."
													]
												}),
												/* @__PURE__ */ jsx("p", {
													className: "mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75",
													children: "تابع رصيد متجرك، حدّث الأصناف، واعثر على أي منتج بسرعة — من شاشة واحدة."
												}),
												/* @__PURE__ */ jsxs("button", {
													onClick: openNew,
													className: "mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5",
													children: [/* @__PURE__ */ jsx(CirclePlus, { size: 17 }), " أضف أول صنف"]
												})
											]
										}),
										/* @__PURE__ */ jsx("div", { className: "hero-orbit absolute -left-10 -top-24 hidden h-80 w-80 rounded-full border border-primary-foreground/15 sm:block" }),
										/* @__PURE__ */ jsx("div", { className: "hero-orbit hero-orbit-small absolute left-20 top-8 hidden h-48 w-48 rounded-full border border-primary-foreground/15 sm:block" }),
										/* @__PURE__ */ jsx(Package, {
											className: "absolute bottom-8 left-16 hidden text-primary-foreground/20 sm:block",
											size: 72,
											strokeWidth: 1
										})
									]
								}),
								/* @__PURE__ */ jsxs("section", {
									className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
									children: [
										/* @__PURE__ */ jsx(StatCard, {
											label: "إجمالي الأصناف",
											value: String(products.length),
											note: "مسجلة في المخزون",
											icon: /* @__PURE__ */ jsx(Package, { size: 18 }),
											tone: "green"
										}),
										/* @__PURE__ */ jsx(StatCard, {
											label: "قيمة المخزون",
											value: `${money(totalValue)} ر.ي.`,
											note: "بحسب تكلفة الشراء",
											icon: /* @__PURE__ */ jsx(Boxes, { size: 18 }),
											tone: "sand"
										}),
										/* @__PURE__ */ jsx(StatCard, {
											label: "تحتاج إعادة طلب",
											value: String(lowStock.length),
											note: "عند الحد الأدنى أو أقل",
											icon: /* @__PURE__ */ jsx(AlertTriangle, { size: 18 }),
											tone: "rose"
										}),
										/* @__PURE__ */ jsx(StatCard, {
											label: "أصناف راكدة",
											value: String(staleStock.length),
											note: "لا حركة منذ 90 يوماً",
											icon: /* @__PURE__ */ jsx(Warehouse, { size: 18 }),
											tone: "blue"
										})
									]
								}),
								/* @__PURE__ */ jsxs("section", {
									className: "grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "surface-card overflow-hidden",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
												className: "font-semibold",
												children: "الأصناف الأخيرة"
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: "آخر الأصناف التي تم تحديثها"
											})] }), /* @__PURE__ */ jsx("button", {
												onClick: () => setView("products"),
												className: "text-sm font-semibold text-primary hover:underline",
												children: "عرض الكل ←"
											})]
										}), /* @__PURE__ */ jsx(ProductTable, {
											products: products.slice(0, 6),
											onEdit: openEdit,
											onDelete: deleteProduct,
											onAdjust: adjustStock,
											loading
										})]
									}), /* @__PURE__ */ jsxs("aside", {
										className: "surface-card p-5",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ jsx("h2", {
													className: "font-semibold",
													children: "تحتاج انتباهك"
												}), /* @__PURE__ */ jsx("span", {
													className: "rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive",
													children: lowStock.length
												})]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: "أصناف وصلت إلى حد إعادة الطلب"
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "mt-4 space-y-3",
												children: [lowStock.slice(0, 4).map((product) => /* @__PURE__ */ jsxs("div", {
													className: "flex items-center gap-3 rounded-xl bg-muted/60 p-3",
													children: [
														/* @__PURE__ */ jsx(ProductThumb, { product }),
														/* @__PURE__ */ jsxs("div", {
															className: "min-w-0 flex-1",
															children: [/* @__PURE__ */ jsx("p", {
																className: "truncate text-sm font-medium",
																children: product.itemName
															}), /* @__PURE__ */ jsxs("p", {
																className: "mt-1 text-xs text-muted-foreground",
																children: [
																	"المتبقي ",
																	money(product.stockQuantity),
																	" ",
																	product.baseUnit
																]
															})]
														}),
														/* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-destructive" })
													]
												}, product.id)), lowStock.length === 0 && /* @__PURE__ */ jsx(EmptyMessage, {
													title: "ممتاز، المخزون مستقر",
													text: "لا توجد أصناف عند حد إعادة الطلب."
												})]
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: () => setView("alerts"),
												className: "mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-semibold transition hover:bg-muted",
												children: "فتح التنبيهات"
											})
										]
									})]
								})
							] }),
							view === "products" && /* @__PURE__ */ jsxs(Fragment, { children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-end justify-between gap-4",
									children: [/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("p", {
											className: "eyebrow",
											children: "دليل الأصناف"
										}),
										/* @__PURE__ */ jsx("h1", {
											className: "mt-1 font-serif text-3xl font-semibold",
											children: "منتجاتك، مرتبة وواضحة"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-2 text-sm text-muted-foreground",
											children: "ابحث بالاسم أو الكود أو امسح الباركود مباشرة."
										})
									] }), /* @__PURE__ */ jsxs("div", {
										className: "flex gap-2",
										children: [
											/* @__PURE__ */ jsxs("button", {
												onClick: () => setPrintMode("catalog"),
												className: "toolbar-button",
												children: [/* @__PURE__ */ jsx(BookOpen, { size: 16 }), /* @__PURE__ */ jsx("span", {
													className: "hidden sm:inline",
													children: "كتالوج PDF"
												})]
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: () => importRef.current?.click(),
												className: "icon-button sm:hidden",
												"aria-label": "استيراد ملف",
												children: /* @__PURE__ */ jsx(Upload, { size: 17 })
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: exportExcel,
												className: "icon-button sm:hidden",
												"aria-label": "تصدير إلى Excel",
												children: /* @__PURE__ */ jsx(Download, { size: 17 })
											})
										]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-1 items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground",
										children: [/* @__PURE__ */ jsx(Search, { size: 16 }), "تظهر النتائج أثناء الكتابة في شريط البحث أعلى الشاشة"]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ jsx(SlidersHorizontal, {
												size: 16,
												className: "text-muted-foreground"
											}),
											/* @__PURE__ */ jsxs("select", {
												value: categoryFilter,
												onChange: (e) => setCategoryFilter(e.target.value),
												className: "filter-select",
												children: [/* @__PURE__ */ jsx("option", { children: "الكل" }), categories.map((category) => /* @__PURE__ */ jsx("option", { children: category }, category))]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "whitespace-nowrap text-xs text-muted-foreground",
												children: [filtered.length, " صنف"]
											})
										]
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "surface-card overflow-hidden",
									children: /* @__PURE__ */ jsx(ProductTable, {
										products: filtered,
										onEdit: openEdit,
										onDelete: deleteProduct,
										onAdjust: adjustStock,
										loading
									})
								})
							] }),
							view === "alerts" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("p", {
									className: "eyebrow",
									children: "متابعة ذكية"
								}),
								/* @__PURE__ */ jsx("h1", {
									className: "mt-1 font-serif text-3xl font-semibold",
									children: "تنبيهات المخزون"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "راقب الأصناف القريبة من النفاد والمنتجات التي لم تتحرك منذ فترة."
								})
							] }), /* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 xl:grid-cols-2",
								children: [/* @__PURE__ */ jsx(AlertList, {
									title: "قارب على النفاد",
									description: "الرصيد عند الحد الأدنى أو أقل",
									products: lowStock,
									icon: /* @__PURE__ */ jsx(AlertTriangle, { size: 18 }),
									onEdit: openEdit,
									empty: "لا توجد أصناف منخفضة حالياً."
								}), /* @__PURE__ */ jsx(AlertList, {
									title: "أصناف راكدة",
									description: "لا حركة مخزون منذ أكثر من 90 يوماً",
									products: staleStock,
									icon: /* @__PURE__ */ jsx(Warehouse, { size: 18 }),
									onEdit: openEdit,
									empty: "لا توجد أصناف راكدة."
								})]
							})] }),
							view === "barcodes" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("p", {
									className: "eyebrow",
									children: "تجهيز الملصقات"
								}),
								/* @__PURE__ */ jsx("h1", {
									className: "mt-1 font-serif text-3xl font-semibold",
									children: "طباعة الباركود"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "خصص النص المطبوع فوق أو أسفل باركود EAN‑13، ثم اطبع ملصقات الأصناف المعروضة."
								})
							] }), /* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]",
								children: [/* @__PURE__ */ jsxs("section", {
									className: "surface-card h-fit p-5",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2 font-semibold",
											children: [/* @__PURE__ */ jsx(Settings2, { size: 17 }), " إعدادات النص"]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "form-label mt-5",
											children: ["اسم المتجر", /* @__PURE__ */ jsx("input", {
												className: "form-input mt-2",
												value: shopName,
												onChange: (e) => setShopName(e.target.value)
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "mt-5 space-y-3",
											children: [
												[
													labelShop,
													setLabelShop,
													"اسم المتجر"
												],
												[
													labelName,
													setLabelName,
													"اسم الصنف"
												],
												[
													labelPrice,
													setLabelPrice,
													"سعر التجزئة"
												]
											].map(([checked, setter, label]) => /* @__PURE__ */ jsxs("label", {
												className: "flex cursor-pointer items-center gap-3 text-sm",
												children: [/* @__PURE__ */ jsx("input", {
													type: "checkbox",
													checked: Boolean(checked),
													onChange: (e) => setter(e.target.checked),
													className: "accent-primary"
												}), String(label)]
											}, String(label)))
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "mt-5 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground",
											children: [
												"سيتم تجهيز ملصق لكل صنف في نتائج البحث الحالية (",
												filtered.length,
												"). اختر «طباعة الملصقات» ثم استخدم نافذة الطباعة أو الحفظ PDF."
											]
										}),
										/* @__PURE__ */ jsxs("button", {
											disabled: !filtered.length,
											onClick: () => setPrintMode("labels"),
											className: "primary-button mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50",
											children: [/* @__PURE__ */ jsx(Printer, { size: 17 }), " طباعة الملصقات"]
										})
									]
								}), /* @__PURE__ */ jsxs("section", {
									className: "surface-card p-5",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsx("h2", {
												className: "font-semibold",
												children: "معاينة الملصقات"
											}), /* @__PURE__ */ jsxs("span", {
												className: "text-xs text-muted-foreground",
												children: [filtered.length, " ملصق"]
											})]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3",
											children: filtered.slice(0, 6).map((product) => /* @__PURE__ */ jsx(BarcodeLabel, {
												product,
												shopName,
												labelShop,
												labelName,
												labelPrice
											}, product.id))
										}),
										filtered.length > 6 && /* @__PURE__ */ jsx("p", {
											className: "mt-3 text-center text-xs text-muted-foreground",
											children: "وتظهر بقية الملصقات عند الطباعة"
										})
									]
								})]
							})] })
						]
					}),
					/* @__PURE__ */ jsx("footer", {
						className: "border-t border-border px-5 py-4 text-center text-xs text-muted-foreground",
						children: "StoreWise · إدارة المخزون بسهولة ووضوح"
					})
				]
			})]
		}),
		dialogOpen && /* @__PURE__ */ jsx("div", {
			className: "dialog-backdrop",
			role: "presentation",
			onMouseDown: (e) => {
				if (e.target === e.currentTarget) setDialogOpen(false);
			},
			children: /* @__PURE__ */ jsxs("section", {
				className: "product-dialog",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "product-dialog-title",
				dir: "rtl",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between border-b border-border px-5 py-4 sm:px-7",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "بيانات المخزون"
						}),
						/* @__PURE__ */ jsx("h2", {
							id: "product-dialog-title",
							className: "mt-1 font-serif text-2xl font-semibold",
							children: editing ? "تعديل بيانات الصنف" : "إضافة صنف جديد"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "أدخل تفاصيل المنتج والأسعار والرصيد."
						})
					] }), /* @__PURE__ */ jsx("button", {
						onClick: () => setDialogOpen(false),
						className: "icon-button",
						"aria-label": "إغلاق",
						children: /* @__PURE__ */ jsx(X, { size: 18 })
					})]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: saveProduct,
					className: "min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "grid gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3",
						children: [
							/* @__PURE__ */ jsxs("label", {
								className: "form-label sm:col-span-2 xl:col-span-3",
								children: ["اسم الصنف *", /* @__PURE__ */ jsx("input", {
									required: true,
									autoFocus: true,
									className: "form-input mt-2",
									value: draft.itemName,
									onChange: (e) => setField("itemName", e.target.value),
									placeholder: "مثال: دفتر مدرسي 80 ورقة"
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: [
									"القسم / الفئة *",
									/* @__PURE__ */ jsx("input", {
										required: true,
										list: "category-options",
										className: "form-input mt-2",
										value: draft.category,
										onChange: (e) => setField("category", e.target.value),
										placeholder: "اختر أو اكتب فئة جديدة"
									}),
									/* @__PURE__ */ jsx("datalist", {
										id: "category-options",
										children: categories.map((item) => /* @__PURE__ */ jsx("option", { value: item }, item))
									})
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: [
									"المخزن / الموقع *",
									/* @__PURE__ */ jsx("input", {
										required: true,
										list: "warehouse-options",
										className: "form-input mt-2",
										value: draft.warehouse,
										onChange: (e) => setField("warehouse", e.target.value),
										placeholder: "اختر أو أضف مخزناً"
									}),
									/* @__PURE__ */ jsx("datalist", {
										id: "warehouse-options",
										children: warehouses.map((item) => /* @__PURE__ */ jsx("option", { value: item }, item))
									})
								]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: ["رقم الصنف / الموديل", /* @__PURE__ */ jsx("input", {
									className: "form-input mt-2",
									value: draft.modelNumber,
									onChange: (e) => setField("modelNumber", e.target.value)
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: ["الباركود الأساسي", /* @__PURE__ */ jsx("input", {
									className: "form-input mt-2 font-mono",
									value: draft.primaryBarcode,
									onChange: (e) => setField("primaryBarcode", e.target.value),
									placeholder: "امسح باركود المصنع"
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: ["موقع الرف أو الخزنة", /* @__PURE__ */ jsx("input", {
									className: "form-input mt-2",
									value: draft.shelfPosition,
									onChange: (e) => setField("shelfPosition", e.target.value),
									placeholder: "رف A3، دولاب العرض 2"
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label sm:col-span-2 xl:col-span-3",
								children: ["الوصف والمواصفات", /* @__PURE__ */ jsx("textarea", {
									className: "form-input mt-2 min-h-20 resize-y",
									value: draft.specifications,
									onChange: (e) => setField("specifications", e.target.value),
									placeholder: "لون، مقاس، خامة، ملاحظات…"
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "rounded-2xl border border-dashed border-border bg-muted/40 p-3 sm:col-span-2 xl:col-span-3",
								children: /* @__PURE__ */ jsxs("label", {
									className: "form-label flex cursor-pointer items-center gap-3",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-background text-primary",
											children: imageFile && imagePreview ? /* @__PURE__ */ jsx("img", {
												src: imagePreview,
												alt: "معاينة صورة الصنف",
												className: "h-full w-full object-cover"
											}) : editing?.imageUrl ? /* @__PURE__ */ jsx("img", {
												src: editing.imageUrl,
												alt: "صورة الصنف الحالية",
												className: "h-full w-full object-cover"
											}) : /* @__PURE__ */ jsx(ImagePlus, { size: 19 })
										}),
										/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
											className: "block",
											children: "صورة الصنف"
										}), /* @__PURE__ */ jsx("span", {
											className: "mt-1 block text-xs text-muted-foreground",
											children: "اختر صورة JPG أو PNG"
										})] }),
										/* @__PURE__ */ jsx("input", {
											type: "file",
											accept: "image/*",
											className: "sr-only",
											onChange: (e) => setImageFile(e.target.files?.[0] || null)
										})
									]
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "section-rule sm:col-span-2 xl:col-span-3",
								children: /* @__PURE__ */ jsx("span", { children: "الوحدات والكميات" })
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: ["الوحدة الأساسية", /* @__PURE__ */ jsx("select", {
									className: "form-input mt-2",
									value: draft.baseUnit,
									onChange: (e) => setField("baseUnit", e.target.value),
									children: units.map((unit) => /* @__PURE__ */ jsx("option", { children: unit }, unit))
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "form-label",
								children: [
									"الوحدة الكبرى",
									/* @__PURE__ */ jsx("input", {
										list: "unit-options",
										className: "form-input mt-2",
										value: draft.majorUnit,
										onChange: (e) => setField("majorUnit", e.target.value),
										placeholder: "مثال: كرتون"
									}),
									/* @__PURE__ */ jsx("datalist", {
										id: "unit-options",
										children: units.map((unit) => /* @__PURE__ */ jsx("option", { value: unit }, unit))
									})
								]
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "سعة العبوة",
								value: draft.packageCapacity,
								onChange: (value) => setField("packageCapacity", value),
								min: "1"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "الرصيد الحالي",
								value: draft.stockQuantity,
								onChange: (value) => setField("stockQuantity", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "حد تنبيه النفاد",
								value: draft.minStock,
								onChange: (value) => setField("minStock", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "section-rule sm:col-span-2 xl:col-span-3",
								children: /* @__PURE__ */ jsx("span", { children: "التكلفة وشرائح البيع" })
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "تكلفة الشراء",
								value: draft.purchaseCost,
								onChange: (value) => setField("purchaseCost", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "سعر خاص",
								value: draft.priceSpecial,
								onChange: (value) => setField("priceSpecial", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "سعر التجزئة",
								value: draft.priceRetail,
								onChange: (value) => setField("priceRetail", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "سعر نصف الجملة",
								value: draft.priceHalfWholesale,
								onChange: (value) => setField("priceHalfWholesale", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "سعر الجملة",
								value: draft.priceWholesale,
								onChange: (value) => setField("priceWholesale", value),
								min: "0"
							}),
							/* @__PURE__ */ jsx(NumberField, {
								label: "سعر جملة الجملة",
								value: draft.priceBulkWholesale,
								onChange: (value) => setField("priceBulkWholesale", value),
								min: "0"
							}),
							!editing && /* @__PURE__ */ jsx("p", {
								className: "rounded-xl bg-primary/5 p-3 text-xs leading-5 text-muted-foreground sm:col-span-2 xl:col-span-3",
								children: "سيتم توليد كود الصنف حسب الفئة ورمز EAN‑13 يبدأ بـ 628 تلقائياً عند الحفظ."
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "sticky bottom-0 -mx-5 mt-6 flex justify-end gap-2 border-t border-border bg-card/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setDialogOpen(false),
							className: "toolbar-button",
							children: "إلغاء"
						}), /* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: saving,
							className: "primary-button disabled:opacity-50",
							children: saving ? "جارٍ الحفظ…" : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Check, { size: 16 }), editing ? "حفظ التعديلات" : "إضافة الصنف"] })
						})]
					})]
				})]
			})
		}),
		printMode && /* @__PURE__ */ jsx("div", {
			className: "print-area",
			dir: "rtl",
			children: printMode === "catalog" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
				className: "print-heading",
				children: [/* @__PURE__ */ jsx("h1", { children: shopName }), /* @__PURE__ */ jsx("p", { children: "كتالوج المنتجات" })]
			}), /* @__PURE__ */ jsx("div", {
				className: "catalog-print-grid",
				children: products.map((product) => /* @__PURE__ */ jsxs("article", {
					className: "catalog-print-card",
					children: [
						product.imageUrl ? /* @__PURE__ */ jsx("img", {
							src: product.imageUrl,
							alt: product.itemName
						}) : /* @__PURE__ */ jsx("div", {
							className: "catalog-print-placeholder",
							children: /* @__PURE__ */ jsx(Package, { size: 32 })
						}),
						/* @__PURE__ */ jsx("strong", { children: product.itemName }),
						/* @__PURE__ */ jsxs("span", { children: [money(product.priceRetail), " ر.ي."] })
					]
				}, product.id))
			})] }) : /* @__PURE__ */ jsx("div", {
				className: "label-print-grid",
				children: filtered.map((product) => /* @__PURE__ */ jsx(BarcodeLabel, {
					product,
					shopName,
					labelShop,
					labelName,
					labelPrice
				}, product.id))
			})
		})
	] });
}
function SignInScreen({ onSignIn }) {
	const [useUsernameMode, setUseUsernameMode] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [localError, setLocalError] = useState("");
	const ADMIN_USER = "admin";
	const ADMIN_PASS = "123456";
	const handleCustomLogin = (e) => {
		e.preventDefault();
		if (username === ADMIN_USER && password === ADMIN_PASS) {
			setLocalError("");
			toast.success("تم تسجيل الدخول بنجاح!");
			onSignIn();
		} else setLocalError("اسم المستخدم أو كلمة السر غير صحيحة");
	};
	return /* @__PURE__ */ jsx("div", {
		className: "grid min-h-dvh place-items-center bg-background p-4",
		dir: "rtl",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-sm space-y-5 surface-card p-6 rounded-2xl shadow-lg border border-border",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "text-center space-y-1",
					children: [/* @__PURE__ */ jsx("h1", {
						className: "text-xl font-bold tracking-tight text-foreground",
						children: "محلات ومكتبة الإخوة"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: "نظام سهيل المخزن للخدمات والمبيعات"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex border-b border-border text-xs",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: `flex-1 py-2 font-medium border-b-2 transition-colors ${useUsernameMode ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground"}`,
						onClick: () => setUseUsernameMode(true),
						children: "اسم المستخدم وكلمة السر"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: `flex-1 py-2 font-medium border-b-2 transition-colors ${!useUsernameMode ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground"}`,
						onClick: () => setUseUsernameMode(false),
						children: "البريد الإلكتروني (السابق)"
					})]
				}),
				useUsernameMode ? /* @__PURE__ */ jsxs("form", {
					onSubmit: handleCustomLogin,
					className: "space-y-4 text-sm",
					children: [
						localError && /* @__PURE__ */ jsx("div", {
							className: "p-2 text-xs text-red-600 bg-red-50 rounded text-center border border-red-200",
							children: localError
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block form-label mb-1",
							children: "اسم المستخدم"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							value: username,
							onChange: (e) => setUsername(e.target.value),
							placeholder: "أدخل اسم المستخدم",
							required: true,
							className: "w-full px-3 py-2 border rounded-lg bg-background text-foreground"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block form-label mb-1",
							children: "كلمة السر"
						}), /* @__PURE__ */ jsx("input", {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "أدخل كلمة السر",
							required: true,
							className: "w-full px-3 py-2 border rounded-lg bg-background text-foreground"
						})] }),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							className: "w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition",
							children: "تسجيل الدخول السريع"
						})
					]
				}) : /* @__PURE__ */ jsxs("div", {
					className: "space-y-3 text-center py-2",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: "تسجيل الدخول التلقائي عبر مزود الخدمة:"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onSignIn,
						className: "w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:opacity-90 transition text-sm",
						children: "متابعة بالبريد الإلكتروني"
					})]
				})
			]
		})
	});
}
function StatCard({ label, value, note, icon, tone }) {
	return /* @__PURE__ */ jsxs("article", {
		className: "surface-card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-sm text-muted-foreground",
					children: label
				}), /* @__PURE__ */ jsx("span", {
					className: `stat-icon stat-${tone}`,
					children: icon
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-5 text-2xl font-semibold tracking-tight",
				children: value
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: note
			})
		]
	});
}
function ProductThumb({ product }) {
	return /* @__PURE__ */ jsx("div", {
		className: "grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground",
		children: product.imageUrl ? /* @__PURE__ */ jsx("img", {
			src: product.imageUrl,
			alt: product.itemName,
			className: "h-full w-full object-cover"
		}) : /* @__PURE__ */ jsx(Package, { size: 18 })
	});
}
function ProductTable({ products, onEdit, onDelete, onAdjust, loading }) {
	if (loading && !products.length) return /* @__PURE__ */ jsx("div", {
		className: "p-12 text-center text-sm text-muted-foreground",
		children: "جارٍ تحميل الأصناف…"
	});
	if (!products.length) return /* @__PURE__ */ jsxs("div", {
		className: "p-12 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-primary",
				children: /* @__PURE__ */ jsx(Package, { size: 24 })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-4 font-semibold",
				children: "لا توجد أصناف بعد"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "أضف صنفاً جديداً أو استورد قائمة المنتجات من ملف Excel."
			})
		]
	});
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: "hidden overflow-x-auto md:block",
		children: /* @__PURE__ */ jsxs("table", {
			className: "w-full text-right",
			children: [/* @__PURE__ */ jsx("thead", {
				className: "bg-muted/50 text-[11px] font-semibold text-muted-foreground",
				children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", {
						className: "px-5 py-3",
						children: "الصنف"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "الكود / الباركود"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "القسم والموقع"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "الرصيد"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-4 py-3",
						children: "سعر التجزئة"
					}),
					/* @__PURE__ */ jsx("th", {
						className: "px-5 py-3",
						children: "إجراءات"
					})
				] })
			}), /* @__PURE__ */ jsx("tbody", {
				className: "divide-y divide-border",
				children: products.map((product) => /* @__PURE__ */ jsxs("tr", {
					className: "group transition hover:bg-muted/30",
					children: [
						/* @__PURE__ */ jsx("td", {
							className: "px-5 py-3",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(ProductThumb, { product }), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("p", {
										className: "max-w-52 truncate text-sm font-semibold",
										children: product.itemName
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1 max-w-52 truncate text-xs text-muted-foreground",
										children: product.specifications || "—"
									})]
								})]
							})
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "font-mono text-xs",
								children: product.itemCode
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-1 font-mono text-[10px] text-muted-foreground",
								children: product.customBarcode
							})]
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs",
								children: product.category
							}), /* @__PURE__ */ jsxs("div", {
								className: "mt-1 text-[10px] text-muted-foreground",
								children: [product.warehouse, product.shelfPosition ? ` · ${product.shelfPosition}` : ""]
							})]
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ jsx(StockPill, { product }), /* @__PURE__ */ jsx("div", {
								className: "mt-1 text-[10px] text-muted-foreground",
								children: product.baseUnit
							})]
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-4 py-3 text-sm font-semibold",
							children: [
								money(product.priceRetail),
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-normal text-muted-foreground",
									children: "ر.ي."
								})
							]
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-5 py-3",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1 opacity-80 transition group-hover:opacity-100",
								children: [
									/* @__PURE__ */ jsx("button", {
										onClick: () => onAdjust(product, 1),
										title: "زيادة الرصيد",
										className: "small-action",
										children: /* @__PURE__ */ jsx(Plus, { size: 14 })
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: () => onAdjust(product, -1),
										title: "تقليل الرصيد",
										className: "small-action",
										children: /* @__PURE__ */ jsx(ArrowDownToLine, { size: 14 })
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: () => onEdit(product),
										title: "تعديل",
										className: "small-action",
										children: /* @__PURE__ */ jsx(Pencil, { size: 14 })
									}),
									/* @__PURE__ */ jsx("button", {
										onClick: () => onDelete(product),
										title: "حذف",
										className: "small-action text-destructive",
										children: /* @__PURE__ */ jsx(Trash2, { size: 14 })
									})
								]
							})
						})
					]
				}, product.id))
			})]
		})
	}), /* @__PURE__ */ jsx("div", {
		className: "space-y-3 p-3 md:hidden",
		children: products.map((product) => /* @__PURE__ */ jsx("article", {
			className: "rounded-2xl border border-border bg-background p-3",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ jsx(ProductThumb, { product }), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("p", {
									className: "truncate text-sm font-semibold",
									children: product.itemName
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: [
										product.category,
										" · ",
										product.warehouse
									]
								})]
							}), /* @__PURE__ */ jsx(StockPill, { product })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "font-mono text-[10px] text-muted-foreground",
								children: [
									product.itemCode,
									" · ",
									product.customBarcode
								]
							}), /* @__PURE__ */ jsxs("strong", {
								className: "text-sm",
								children: [money(product.priceRetail), " ر.ي."]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex gap-1 border-t border-border pt-2",
							children: [
								/* @__PURE__ */ jsx("button", {
									onClick: () => onAdjust(product, 1),
									className: "small-action",
									children: /* @__PURE__ */ jsx(Plus, { size: 15 })
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => onAdjust(product, -1),
									className: "small-action",
									children: /* @__PURE__ */ jsx(ArrowDownToLine, { size: 15 })
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => onEdit(product),
									className: "small-action",
									children: /* @__PURE__ */ jsx(Pencil, { size: 15 })
								}),
								/* @__PURE__ */ jsx("button", {
									onClick: () => onDelete(product),
									className: "small-action text-destructive",
									children: /* @__PURE__ */ jsx(Trash2, { size: 15 })
								})
							]
						})
					]
				})]
			})
		}, product.id))
	})] });
}
function StockPill({ product }) {
	const low = num(product.stockQuantity) <= num(product.minStock);
	return /* @__PURE__ */ jsxs("span", {
		className: `stock-pill ${low ? "stock-low" : "stock-ok"}`,
		children: [money(product.stockQuantity), low && /* @__PURE__ */ jsx(AlertTriangle, { size: 12 })]
	});
}
function EmptyMessage({ title, text }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl bg-muted/60 px-4 py-6 text-center",
		children: [
			/* @__PURE__ */ jsx(Check, {
				size: 20,
				className: "mx-auto text-primary"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-sm font-semibold",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: text
			})
		]
	});
}
function AlertList({ title, description, products, icon, onEdit, empty }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "surface-card overflow-hidden",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3 border-b border-border p-5",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "stat-icon stat-rose",
					children: icon
				}),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "font-semibold",
					children: title
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: description
				})] }),
				/* @__PURE__ */ jsx("span", {
					className: "mr-auto rounded-full bg-muted px-2.5 py-1 text-xs",
					children: products.length
				})
			]
		}), products.length ? /* @__PURE__ */ jsx("div", {
			className: "divide-y divide-border",
			children: products.map((product) => /* @__PURE__ */ jsxs("button", {
				onClick: () => onEdit(product),
				className: "flex w-full items-center gap-3 p-4 text-right transition hover:bg-muted/40",
				children: [
					/* @__PURE__ */ jsx(ProductThumb, { product }),
					/* @__PURE__ */ jsxs("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block truncate text-sm font-semibold",
							children: product.itemName
						}), /* @__PURE__ */ jsxs("span", {
							className: "mt-1 block truncate text-xs text-muted-foreground",
							children: [
								product.category,
								" · ",
								product.warehouse
							]
						})]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-left",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "block text-sm font-semibold",
							children: [
								money(product.stockQuantity),
								" ",
								product.baseUnit
							]
						}), /* @__PURE__ */ jsxs("span", {
							className: "mt-1 block text-[10px] text-muted-foreground",
							children: ["الحد ", money(product.minStock)]
						})]
					})
				]
			}, product.id))
		}) : /* @__PURE__ */ jsx("p", {
			className: "p-8 text-center text-sm text-muted-foreground",
			children: empty
		})]
	});
}
function BarcodeLabel({ product, shopName, labelShop, labelName, labelPrice }) {
	const bits = ean13Bits(product.customBarcode);
	return /* @__PURE__ */ jsxs("article", {
		className: "barcode-label",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "truncate text-center text-[10px] font-semibold",
				children: labelShop ? shopName : ""
			}),
			labelName && /* @__PURE__ */ jsx("div", {
				className: "truncate text-center text-xs font-medium",
				children: product.itemName
			}),
			/* @__PURE__ */ jsxs("svg", {
				className: "barcode-svg",
				viewBox: "0 0 190 56",
				role: "img",
				"aria-label": `باركود ${product.itemName}`,
				children: [
					/* @__PURE__ */ jsx("rect", {
						width: "190",
						height: "56",
						fill: "white"
					}),
					[...bits].map((bit, index) => bit === "1" ? /* @__PURE__ */ jsx("rect", {
						x: index * 2,
						y: index < 3 || index >= 45 && index < 50 || index >= 92 ? 0 : 5,
						width: "2",
						height: index < 3 || index >= 45 && index < 50 || index >= 92 ? 42 : 34,
						fill: "#171a15"
					}, index) : null),
					/* @__PURE__ */ jsx("text", {
						x: "95",
						y: "54",
						textAnchor: "middle",
						fontSize: "9",
						fontFamily: "monospace",
						fill: "#171a15",
						children: product.customBarcode
					})
				]
			}),
			labelPrice && /* @__PURE__ */ jsxs("div", {
				className: "text-center text-sm font-semibold",
				children: [money(product.priceRetail), " ر.ي."]
			})
		]
	});
}
function NumberField({ label, value, onChange, min = "0" }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "form-label",
		children: [label, /* @__PURE__ */ jsx("input", {
			type: "number",
			inputMode: "decimal",
			min,
			step: "any",
			className: "form-input mt-2",
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ jsx(BlinkClientBoundary, {
	fallback: /* @__PURE__ */ jsx(LoadingScreen, {}),
	children: /* @__PURE__ */ jsx(InventoryApp, {})
});
//#endregion
export { SplitComponent as component };
