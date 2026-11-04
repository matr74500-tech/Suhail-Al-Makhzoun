import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  AlertTriangle, ArrowDownToLine, Barcode, BookOpen, Boxes, Check, ChevronDown,
  CirclePlus, Download, ImagePlus, LayoutDashboard, LogOut,
  Package, Pencil, Plus, Printer, Search, Settings2, ShieldCheck, SlidersHorizontal,
  Trash2, Upload, Warehouse, X,
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { blink } from '@/blink/client'
import { BlinkClientBoundary } from '@/components/BlinkClientBoundary'
import type { InventoryProductsRow } from '@/lib/db-types'
import { ean13Bits, isValidEan13, makeEan13, makeItemCode } from '@/lib/inventory'

const categoriesDefault = ['أدوات مكتبية', 'مدرسية', 'حقائب', 'كتب', 'خردوات', 'ألعاب', 'إلكترونيات', 'أخرى']
const warehousesDefault = ['المعرض الرئيسي', 'مخزن شارع رداع', 'المخزن الخلفي']
const units = ['قطعة', 'علبة', 'دستة', 'كرتون', 'متر', 'كيلوجرام', 'لتر']
const table = blink.db.table<InventoryProductsRow>('inventory_products')
type User = { id: string; displayName?: string; email?: string }
type View = 'overview' | 'products' | 'alerts' | 'barcodes'
type Draft = {
  itemName: string; modelNumber: string; primaryBarcode: string; specifications: string
  category: string; warehouse: string; shelfPosition: string; baseUnit: string; majorUnit: string
  packageCapacity: string; purchaseCost: string; priceSpecial: string; priceRetail: string
  priceHalfWholesale: string; priceWholesale: string; priceBulkWholesale: string
  stockQuantity: string; minStock: string
}
const blankDraft: Draft = {
  itemName: '', modelNumber: '', primaryBarcode: '', specifications: '', category: '', warehouse: '',
  shelfPosition: '', baseUnit: 'قطعة', majorUnit: '', packageCapacity: '1', purchaseCost: '0',
  priceSpecial: '0', priceRetail: '0', priceHalfWholesale: '0', priceWholesale: '0',
  priceBulkWholesale: '0', stockQuantity: '0', minStock: '5',
}
const num = (value: string | number | null | undefined) => Number(value || 0)
const money = (value: string | number) => new Intl.NumberFormat('ar-YE', { maximumFractionDigits: 2 }).format(num(value))

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'StoreWise | إدارة المخزون' },
      { name: 'description', content: 'إدارة المنتجات والمخزون للمتاجر — StoreWise.' },
    ],
  }),
  component: () => <BlinkClientBoundary fallback={<LoadingScreen />}><InventoryApp /></BlinkClientBoundary>,
})

function LoadingScreen() {
  return <div className="grid min-h-dvh place-items-center bg-background"><div className="flex items-center gap-3 text-muted-foreground"><span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-l-transparent" /> جارٍ تجهيز المخزون…</div></div>
}

function InventoryApp() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [products, setProducts] = useState<InventoryProductsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [view, setView] = useState<View>('overview')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('الكل')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryProductsRow | null>(null)
  const [draft, setDraft] = useState<Draft>(blankDraft)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [printMode, setPrintMode] = useState<'catalog' | 'labels' | null>(null)
  const [shopName, setShopName] = useState('مكتبة ومحلات الإخوة')
  const [labelName, setLabelName] = useState(true)
  const [labelPrice, setLabelPrice] = useState(true)
  const [labelShop, setLabelShop] = useState(true)
  const importRef = useRef<HTMLInputElement>(null)
  const imagePreview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile])

  useEffect(() => () => { if (imagePreview) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user as User | null)
      if (!state.isLoading) setAuthLoading(false)
    })
    return unsubscribe
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => setCurrentTime(Date.now()), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const refresh = useCallback(async (uid = user?.id) => {
    if (!uid) return
    setLoading(true)
    try {
      setProducts(await table.list({ where: { userId: uid }, orderBy: { updatedAt: 'desc' }, limit: 1000 }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر تحميل الأصناف')
    } finally { setLoading(false) }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    let active = true
    void table.list({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, limit: 1000 })
      .then(rows => { if (active) setProducts(rows) })
      .catch(error => { if (active) toast.error(error instanceof Error ? error.message : 'تعذر تحميل الأصناف') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user?.id])
  useEffect(() => {
    if (!user?.id) return
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      void table.list({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, limit: 1000 })
        .then(setProducts)
        .catch(() => undefined)
    }, 15000)
    return () => window.clearInterval(timer)
  }, [user?.id])
  useEffect(() => {
    if (!printMode) return
    const timer = window.setTimeout(() => window.print(), 160)
    const finish = () => setPrintMode(null)
    window.addEventListener('afterprint', finish)
    return () => { window.clearTimeout(timer); window.removeEventListener('afterprint', finish) }
  }, [printMode])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault(); document.getElementById('quick-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const categories = useMemo(() => [...new Set([...categoriesDefault, ...products.map(p => p.category).filter(Boolean)])], [products])
  const warehouses = useMemo(() => [...new Set([...warehousesDefault, ...products.map(p => p.warehouse).filter(Boolean)])], [products])
  const filtered = useMemo(() => products.filter((product) => {
    const term = search.trim().toLocaleLowerCase()
    const matchesSearch = !term || [product.itemName, product.itemCode, product.modelNumber, product.primaryBarcode, product.customBarcode, product.category, product.specifications].some(value => String(value || '').toLocaleLowerCase().includes(term))
    return matchesSearch && (categoryFilter === 'الكل' || product.category === categoryFilter)
  }), [products, search, categoryFilter])
  const lowStock = products.filter(p => num(p.stockQuantity) <= num(p.minStock))
  const staleStock = products.filter(p => currentTime > 0 && num(p.stockQuantity) > 0 && currentTime - Date.parse(p.lastActivityAt || p.createdAt) > 90 * 86400000)
  const totalValue = products.reduce((sum, p) => sum + num(p.stockQuantity) * num(p.purchaseCost), 0)

  function openNew() { setEditing(null); setDraft(blankDraft); setImageFile(null); setDialogOpen(true) }
  function openEdit(product: InventoryProductsRow) {
    setEditing(product); setImageFile(null)
    setDraft({
      itemName: product.itemName, modelNumber: product.modelNumber || '', primaryBarcode: product.primaryBarcode || '',
      specifications: product.specifications || '', category: product.category, warehouse: product.warehouse,
      shelfPosition: product.shelfPosition || '', baseUnit: product.baseUnit, majorUnit: product.majorUnit || '',
      packageCapacity: String(product.packageCapacity), purchaseCost: String(product.purchaseCost),
      priceSpecial: String(product.priceSpecial), priceRetail: String(product.priceRetail),
      priceHalfWholesale: String(product.priceHalfWholesale), priceWholesale: String(product.priceWholesale),
      priceBulkWholesale: String(product.priceBulkWholesale), stockQuantity: String(product.stockQuantity), minStock: String(product.minStock),
    })
    setDialogOpen(true)
  }
  function setField<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(current => ({ ...current, [key]: value })) }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !draft.itemName.trim() || !draft.category.trim() || !draft.warehouse.trim()) return
    setSaving(true)
    try {
      let imageUrl = editing?.imageUrl || null
      if (imageFile) {
        const extension = imageFile.name.split('.').pop() || 'jpg'
        const uploaded = await blink.storage.upload(imageFile, `products/${user.id}-${Date.now()}.${extension}`)
        imageUrl = uploaded.publicUrl
      }
      const now = new Date().toISOString()
      const itemCode = editing?.itemCode || makeItemCode(draft.category, products.map(p => p.itemCode))
      const customBarcode = editing?.customBarcode || makeEan13()
      const payload = {
        itemCode, modelNumber: draft.modelNumber.trim() || null, primaryBarcode: draft.primaryBarcode.trim() || null,
        customBarcode, itemName: draft.itemName.trim(), specifications: draft.specifications.trim() || null,
        category: draft.category.trim(), warehouse: draft.warehouse.trim(), shelfPosition: draft.shelfPosition.trim() || null,
        baseUnit: draft.baseUnit, majorUnit: draft.majorUnit.trim() || null, packageCapacity: num(draft.packageCapacity),
        purchaseCost: num(draft.purchaseCost), priceSpecial: num(draft.priceSpecial), priceRetail: num(draft.priceRetail),
        priceHalfWholesale: num(draft.priceHalfWholesale), priceWholesale: num(draft.priceWholesale), priceBulkWholesale: num(draft.priceBulkWholesale),
        imageUrl, stockQuantity: num(draft.stockQuantity), minStock: num(draft.minStock), lastActivityAt: now, updatedAt: now,
      }
      if (editing) await table.update(editing.id, payload)
      else await table.create({ ...payload, userId: user.id })
      await refresh(user.id); setDialogOpen(false); toast.success(editing ? 'تم تحديث الصنف' : 'تمت إضافة الصنف')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر حفظ الصنف')
    } finally { setSaving(false) }
  }

  async function adjustStock(product: InventoryProductsRow, amount: number) {
    try {
      await table.update(product.id, { stockQuantity: Math.max(0, num(product.stockQuantity) + amount), lastActivityAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      await refresh(); toast.success('تم تحديث رصيد المخزون')
    } catch (error) { toast.error(error instanceof Error ? error.message : 'تعذر تعديل الرصيد') }
  }
  async function deleteProduct(product: InventoryProductsRow) {
    if (!window.confirm(`هل تريد حذف «${product.itemName}»؟`)) return
    try { await table.delete(product.id); await refresh(); toast.success('تم حذف الصنف') }
    catch (error) { toast.error(error instanceof Error ? error.message : 'تعذر حذف الصنف') }
  }
  function exportExcel() {
    if (!products.length) return toast.error('لا توجد أصناف لتصديرها')
    const rows = products.map(p => ({ 'كود الصنف': p.itemCode, 'رقم الصنف / الموديل': p.modelNumber, 'الباركود الأساسي': p.primaryBarcode, 'الباركود الخاص': p.customBarcode, 'اسم الصنف': p.itemName, 'المواصفات': p.specifications, 'القسم / الفئة': p.category, 'المخزن': p.warehouse, 'موقع الرف': p.shelfPosition, 'الوحدة الأساسية': p.baseUnit, 'الوحدة الكبرى': p.majorUnit, 'سعة العبوة': p.packageCapacity, 'تكلفة الشراء': p.purchaseCost, 'سعر خاص': p.priceSpecial, 'سعر التجزئة': p.priceRetail, 'نصف جملة': p.priceHalfWholesale, 'جملة': p.priceWholesale, 'جملة الجملة': p.priceBulkWholesale, 'الصورة': p.imageUrl, 'الرصيد': p.stockQuantity, 'حد التنبيه': p.minStock }))
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'المخزون')
    XLSX.writeFile(workbook, 'storewise-inventory.xlsx'); toast.success('تم تجهيز ملف Excel')
  }
  async function importExcel(file?: File) {
    if (!file || !user) return
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: '' })
      let imported = 0
      const importedCodes = products.map(p => p.itemCode)
      const importedBarcodes = new Set(products.map(p => p.customBarcode))
      for (const row of rows) {
        const pick = (...keys: string[]) => { for (const key of keys) if (row[key] !== undefined && row[key] !== '') return row[key]; return '' }
        const itemName = String(pick('itemName', 'اسم الصنف', 'الاسم', 'name')).trim()
        if (!itemName) continue
        const category = String(pick('category', 'القسم / الفئة', 'الفئة', 'القسم') || 'أخرى')
        const importedBarcode = String(pick('customBarcode', 'الباركود الخاص', 'الباركود') || '')
        const custom = isValidEan13(importedBarcode) ? importedBarcode : makeEan13()
        if (importedBarcodes.has(custom)) continue
        const now = new Date().toISOString()
        const itemCode = String(pick('itemCode', 'كود الصنف') || makeItemCode(category, importedCodes))
        await table.create({
          userId: user.id, itemCode,
          modelNumber: String(pick('modelNumber', 'رقم الصنف / الموديل', 'الموديل') || '') || null,
          primaryBarcode: String(pick('primaryBarcode', 'الباركود الأساسي') || '') || null, customBarcode: custom, itemName,
          specifications: String(pick('specifications', 'المواصفات', 'الوصف') || '') || null, category,
          warehouse: String(pick('warehouse', 'المخزن', 'المستودع') || warehousesDefault[0]),
          shelfPosition: String(pick('shelfPosition', 'موقع الرف') || '') || null,
          baseUnit: String(pick('baseUnit', 'الوحدة الأساسية') || 'قطعة'), majorUnit: String(pick('majorUnit', 'الوحدة الكبرى') || '') || null,
          packageCapacity: num(String(pick('packageCapacity', 'سعة العبوة') || '1')),
          purchaseCost: num(String(pick('purchaseCost', 'تكلفة الشراء') || '0')),
          priceSpecial: num(String(pick('priceSpecial', 'سعر خاص') || '0')), priceRetail: num(String(pick('priceRetail', 'سعر التجزئة') || '0')),
          priceHalfWholesale: num(String(pick('priceHalfWholesale', 'نصف جملة') || '0')), priceWholesale: num(String(pick('priceWholesale', 'جملة') || '0')),
          priceBulkWholesale: num(String(pick('priceBulkWholesale', 'جملة الجملة') || '0')),
          imageUrl: String(pick('imageUrl', 'الصورة') || '') || null,
          stockQuantity: num(String(pick('stockQuantity', 'الرصيد', 'الكمية') || '0')),
          minStock: num(String(pick('minStock', 'حد التنبيه') || '5')), lastActivityAt: now, updatedAt: now,
        })
        importedCodes.push(itemCode)
        importedBarcodes.add(custom)
        imported++
      }
      await refresh(user.id); toast.success(`تم استيراد ${imported} صنف`)
    } catch (error) { toast.error(error instanceof Error ? error.message : 'تعذر قراءة الملف') }
    finally { if (importRef.current) importRef.current.value = '' }
  }

  if (authLoading) return <LoadingScreen />
  if (!user) return <SignInScreen onSignIn={() => blink.auth.login(window.location.href)} />
  const views: { id: View; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'products', label: 'الأصناف', icon: Package, count: products.length },
    { id: 'alerts', label: 'تنبيهات المخزون', icon: AlertTriangle, count: lowStock.length },
    { id: 'barcodes', label: 'طباعة الباركود', icon: Barcode },
  ]

  return <>
    <div className="app-shell min-h-dvh bg-background text-foreground" dir="rtl">
      <aside className="sidebar-panel hidden w-64 shrink-0 flex-col border-l border-border bg-card lg:flex">
        <div className="flex items-center gap-3 border-b border-border px-6 py-6">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground"><Boxes size={21} /></div>
          <div><div className="font-serif text-xl font-semibold tracking-tight">StoreWise</div><div className="text-xs text-muted-foreground">إدارة ذكية للمخزون</div></div>
        </div>
        <div className="px-4 pt-6"><p className="px-3 pb-2 text-[10px] font-bold tracking-[.18em] text-muted-foreground">القائمة الرئيسية</p>
          <nav className="space-y-1" aria-label="القائمة الرئيسية">{views.map(item => <button key={item.id} onClick={() => setView(item.id)} className={`nav-item ${view === item.id ? 'nav-item-active' : ''}`}><item.icon size={18} /><span className="flex-1 text-right">{item.label}</span>{item.count !== undefined && <span className="rounded-full bg-background/70 px-2 py-0.5 text-xs">{item.count}</span>}</button>)}</nav>
        </div>
        <div className="mx-5 mt-auto mb-4 rounded-2xl border border-border bg-background p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={16} className="text-primary" /> بياناتك بأمان</div><p className="text-xs leading-5 text-muted-foreground">كل متجر يرى سجلاته الخاصة فقط، وتتزامن تغييراتك فوراً.</p></div>
        <button onClick={() => blink.auth.logout()} className="flex items-center gap-3 border-t border-border px-6 py-4 text-sm text-muted-foreground transition hover:text-foreground"><LogOut size={17} /> تسجيل الخروج</button>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground lg:hidden"><Boxes size={19} /></div><div className="hidden sm:block"><div className="text-xs text-muted-foreground">مساحة العمل / المخزون</div><div className="font-semibold">{views.find(item => item.id === view)?.label}</div></div></div>
            <div className="quick-search-wrap order-3 w-full lg:order-none lg:mx-6 lg:max-w-xl lg:flex-1"><Search size={17} className="shrink-0 text-muted-foreground" /><input id="quick-search" value={search} onFocus={() => setView('products')} onChange={e => { setSearch(e.target.value); setView('products') }} placeholder="بحث سريع بالاسم أو الكود أو الباركود…" /><kbd>/</kbd></div>
            <div className="flex items-center gap-2"><button onClick={() => importRef.current?.click()} className="toolbar-button hidden sm:flex"><Upload size={16} /> استيراد</button><input ref={importRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => void importExcel(e.target.files?.[0])} /><button onClick={exportExcel} className="toolbar-button hidden sm:flex"><Download size={16} /> تصدير Excel</button><button onClick={openNew} className="primary-button"><Plus size={17} /><span>إضافة صنف</span></button><button className="icon-button lg:hidden" aria-label="تسجيل الخروج" onClick={() => blink.auth.logout()}><LogOut size={17} /></button></div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-0.5 lg:hidden" aria-label="التنقل">{views.map(item => <button key={item.id} onClick={() => setView(item.id)} className={`mobile-nav ${view === item.id ? 'mobile-nav-active' : ''}`}><item.icon size={15} /><span>{item.label}</span></button>)}</nav>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          {view === 'overview' && <>
            <section className="hero-panel relative overflow-hidden rounded-[1.75rem] p-6 text-primary-foreground sm:p-8">
              <div className="hero-grain absolute inset-0 opacity-30" /><div className="relative z-10 max-w-2xl"><span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full bg-accent" /> مساحة مخزون متزامنة</span><h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">كل صنف في مكانه.<br className="hidden sm:block" /> وكل قرار أوضح.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">تابع رصيد متجرك، حدّث الأصناف، واعثر على أي منتج بسرعة — من شاشة واحدة.</p><button onClick={openNew} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5"><CirclePlus size={17} /> أضف أول صنف</button></div><div className="hero-orbit absolute -left-10 -top-24 hidden h-80 w-80 rounded-full border border-primary-foreground/15 sm:block" /><div className="hero-orbit hero-orbit-small absolute left-20 top-8 hidden h-48 w-48 rounded-full border border-primary-foreground/15 sm:block" /><Package className="absolute bottom-8 left-16 hidden text-primary-foreground/20 sm:block" size={72} strokeWidth={1} />
            </section>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="إجمالي الأصناف" value={String(products.length)} note="مسجلة في المخزون" icon={<Package size={18} />} tone="green" />
              <StatCard label="قيمة المخزون" value={`${money(totalValue)} ر.ي.`} note="بحسب تكلفة الشراء" icon={<Boxes size={18} />} tone="sand" />
              <StatCard label="تحتاج إعادة طلب" value={String(lowStock.length)} note="عند الحد الأدنى أو أقل" icon={<AlertTriangle size={18} />} tone="rose" />
              <StatCard label="أصناف راكدة" value={String(staleStock.length)} note="لا حركة منذ 90 يوماً" icon={<Warehouse size={18} />} tone="blue" />
            </section>
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="surface-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="font-semibold">الأصناف الأخيرة</h2><p className="mt-1 text-xs text-muted-foreground">آخر الأصناف التي تم تحديثها</p></div><button onClick={() => setView('products')} className="text-sm font-semibold text-primary hover:underline">عرض الكل ←</button></div><ProductTable products={products.slice(0, 6)} onEdit={openEdit} onDelete={deleteProduct} onAdjust={adjustStock} loading={loading} /></div>
              <aside className="surface-card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">تحتاج انتباهك</h2><span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">{lowStock.length}</span></div><p className="mt-1 text-xs text-muted-foreground">أصناف وصلت إلى حد إعادة الطلب</p><div className="mt-4 space-y-3">{lowStock.slice(0, 4).map(product => <div key={product.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"><ProductThumb product={product} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.itemName}</p><p className="mt-1 text-xs text-muted-foreground">المتبقي {money(product.stockQuantity)} {product.baseUnit}</p></div><span className="h-2 w-2 rounded-full bg-destructive" /></div>)}{lowStock.length === 0 && <EmptyMessage title="ممتاز، المخزون مستقر" text="لا توجد أصناف عند حد إعادة الطلب." />}</div><button onClick={() => setView('alerts')} className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-semibold transition hover:bg-muted">فتح التنبيهات</button></aside>
            </section>
          </>}

          {view === 'products' && <>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">دليل الأصناف</p><h1 className="mt-1 font-serif text-3xl font-semibold">منتجاتك، مرتبة وواضحة</h1><p className="mt-2 text-sm text-muted-foreground">ابحث بالاسم أو الكود أو امسح الباركود مباشرة.</p></div><div className="flex gap-2"><button onClick={() => setPrintMode('catalog')} className="toolbar-button"><BookOpen size={16} /><span className="hidden sm:inline">كتالوج PDF</span></button><button onClick={() => importRef.current?.click()} className="icon-button sm:hidden" aria-label="استيراد ملف"><Upload size={17} /></button><button onClick={exportExcel} className="icon-button sm:hidden" aria-label="تصدير إلى Excel"><Download size={17} /></button></div></div>
            <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center"><div className="flex flex-1 items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground"><Search size={16} />تظهر النتائج أثناء الكتابة في شريط البحث أعلى الشاشة</div><div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-muted-foreground" /><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="filter-select"><option>الكل</option>{categories.map(category => <option key={category}>{category}</option>)}</select><span className="whitespace-nowrap text-xs text-muted-foreground">{filtered.length} صنف</span></div></div>
            <div className="surface-card overflow-hidden"><ProductTable products={filtered} onEdit={openEdit} onDelete={deleteProduct} onAdjust={adjustStock} loading={loading} /></div>
          </>}

          {view === 'alerts' && <>
            <div><p className="eyebrow">متابعة ذكية</p><h1 className="mt-1 font-serif text-3xl font-semibold">تنبيهات المخزون</h1><p className="mt-2 text-sm text-muted-foreground">راقب الأصناف القريبة من النفاد والمنتجات التي لم تتحرك منذ فترة.</p></div>
            <div className="grid gap-5 xl:grid-cols-2"><AlertList title="قارب على النفاد" description="الرصيد عند الحد الأدنى أو أقل" products={lowStock} icon={<AlertTriangle size={18} />} onEdit={openEdit} empty="لا توجد أصناف منخفضة حالياً." /><AlertList title="أصناف راكدة" description="لا حركة مخزون منذ أكثر من 90 يوماً" products={staleStock} icon={<Warehouse size={18} />} onEdit={openEdit} empty="لا توجد أصناف راكدة." /></div>
          </>}

          {view === 'barcodes' && <>
            <div><p className="eyebrow">تجهيز الملصقات</p><h1 className="mt-1 font-serif text-3xl font-semibold">طباعة الباركود</h1><p className="mt-2 text-sm text-muted-foreground">خصص النص المطبوع فوق أو أسفل باركود EAN‑13، ثم اطبع ملصقات الأصناف المعروضة.</p></div>
            <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]"><section className="surface-card h-fit p-5"><div className="flex items-center gap-2 font-semibold"><Settings2 size={17} /> إعدادات النص</div><label className="form-label mt-5">اسم المتجر<input className="form-input mt-2" value={shopName} onChange={e => setShopName(e.target.value)} /></label><div className="mt-5 space-y-3">{[[labelShop, setLabelShop, 'اسم المتجر'], [labelName, setLabelName, 'اسم الصنف'], [labelPrice, setLabelPrice, 'سعر التجزئة']].map(([checked, setter, label]) => <label key={String(label)} className="flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(checked)} onChange={e => (setter as (value: boolean) => void)(e.target.checked)} className="accent-primary" />{String(label)}</label>)}</div><p className="mt-5 rounded-xl bg-muted p-3 text-xs leading-5 text-muted-foreground">سيتم تجهيز ملصق لكل صنف في نتائج البحث الحالية ({filtered.length}). اختر «طباعة الملصقات» ثم استخدم نافذة الطباعة أو الحفظ PDF.</p><button disabled={!filtered.length} onClick={() => setPrintMode('labels')} className="primary-button mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"><Printer size={17} /> طباعة الملصقات</button></section><section className="surface-card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">معاينة الملصقات</h2><span className="text-xs text-muted-foreground">{filtered.length} ملصق</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{filtered.slice(0, 6).map(product => <BarcodeLabel key={product.id} product={product} shopName={shopName} labelShop={labelShop} labelName={labelName} labelPrice={labelPrice} />)}</div>{filtered.length > 6 && <p className="mt-3 text-center text-xs text-muted-foreground">وتظهر بقية الملصقات عند الطباعة</p>}</section></div>
          </>}
        </div>
        <footer className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">StoreWise · إدارة المخزون بسهولة ووضوح</footer>
      </main>
    </div>

    {dialogOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setDialogOpen(false) }}><section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" dir="rtl"><div className="flex items-start justify-between border-b border-border px-5 py-4 sm:px-7"><div><p className="eyebrow">بيانات المخزون</p><h2 id="product-dialog-title" className="mt-1 font-serif text-2xl font-semibold">{editing ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}</h2><p className="mt-1 text-xs text-muted-foreground">أدخل تفاصيل المنتج والأسعار والرصيد.</p></div><button onClick={() => setDialogOpen(false)} className="icon-button" aria-label="إغلاق"><X size={18} /></button></div>
      <form onSubmit={saveProduct} className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7"><div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="form-label sm:col-span-2 xl:col-span-3">اسم الصنف *<input required autoFocus className="form-input mt-2" value={draft.itemName} onChange={e => setField('itemName', e.target.value)} placeholder="مثال: دفتر مدرسي 80 ورقة" /></label>
        <label className="form-label">القسم / الفئة *<input required list="category-options" className="form-input mt-2" value={draft.category} onChange={e => setField('category', e.target.value)} placeholder="اختر أو اكتب فئة جديدة" /><datalist id="category-options">{categories.map(item => <option key={item} value={item} />)}</datalist></label>
        <label className="form-label">المخزن / الموقع *<input required list="warehouse-options" className="form-input mt-2" value={draft.warehouse} onChange={e => setField('warehouse', e.target.value)} placeholder="اختر أو أضف مخزناً" /><datalist id="warehouse-options">{warehouses.map(item => <option key={item} value={item} />)}</datalist></label>
        <label className="form-label">رقم الصنف / الموديل<input className="form-input mt-2" value={draft.modelNumber} onChange={e => setField('modelNumber', e.target.value)} /></label>
        <label className="form-label">الباركود الأساسي<input className="form-input mt-2 font-mono" value={draft.primaryBarcode} onChange={e => setField('primaryBarcode', e.target.value)} placeholder="امسح باركود المصنع" /></label>
        <label className="form-label">موقع الرف أو الخزنة<input className="form-input mt-2" value={draft.shelfPosition} onChange={e => setField('shelfPosition', e.target.value)} placeholder="رف A3، دولاب العرض 2" /></label>
        <label className="form-label sm:col-span-2 xl:col-span-3">الوصف والمواصفات<textarea className="form-input mt-2 min-h-20 resize-y" value={draft.specifications} onChange={e => setField('specifications', e.target.value)} placeholder="لون، مقاس، خامة، ملاحظات…" /></label>
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-3 sm:col-span-2 xl:col-span-3"><label className="form-label flex cursor-pointer items-center gap-3"><span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-background text-primary">{imageFile && imagePreview ? <img src={imagePreview} alt="معاينة صورة الصنف" className="h-full w-full object-cover" /> : editing?.imageUrl ? <img src={editing.imageUrl} alt="صورة الصنف الحالية" className="h-full w-full object-cover" /> : <ImagePlus size={19} />}</span><span><span className="block">صورة الصنف</span><span className="mt-1 block text-xs text-muted-foreground">اختر صورة JPG أو PNG</span></span><input type="file" accept="image/*" className="sr-only" onChange={e => setImageFile(e.target.files?.[0] || null)} /></label></div>
        <div className="section-rule sm:col-span-2 xl:col-span-3"><span>الوحدات والكميات</span></div>
        <label className="form-label">الوحدة الأساسية<select className="form-input mt-2" value={draft.baseUnit} onChange={e => setField('baseUnit', e.target.value)}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></label>
        <label className="form-label">الوحدة الكبرى<input list="unit-options" className="form-input mt-2" value={draft.majorUnit} onChange={e => setField('majorUnit', e.target.value)} placeholder="مثال: كرتون" /><datalist id="unit-options">{units.map(unit => <option key={unit} value={unit} />)}</datalist></label>
        <NumberField label="سعة العبوة" value={draft.packageCapacity} onChange={value => setField('packageCapacity', value)} min="1" />
        <NumberField label="الرصيد الحالي" value={draft.stockQuantity} onChange={value => setField('stockQuantity', value)} min="0" />
        <NumberField label="حد تنبيه النفاد" value={draft.minStock} onChange={value => setField('minStock', value)} min="0" />
        <div className="section-rule sm:col-span-2 xl:col-span-3"><span>التكلفة وشرائح البيع</span></div>
        <NumberField label="تكلفة الشراء" value={draft.purchaseCost} onChange={value => setField('purchaseCost', value)} min="0" />
        <NumberField label="سعر خاص" value={draft.priceSpecial} onChange={value => setField('priceSpecial', value)} min="0" />
        <NumberField label="سعر التجزئة" value={draft.priceRetail} onChange={value => setField('priceRetail', value)} min="0" />
        <NumberField label="سعر نصف الجملة" value={draft.priceHalfWholesale} onChange={value => setField('priceHalfWholesale', value)} min="0" />
        <NumberField label="سعر الجملة" value={draft.priceWholesale} onChange={value => setField('priceWholesale', value)} min="0" />
        <NumberField label="سعر جملة الجملة" value={draft.priceBulkWholesale} onChange={value => setField('priceBulkWholesale', value)} min="0" />
        {!editing && <p className="rounded-xl bg-primary/5 p-3 text-xs leading-5 text-muted-foreground sm:col-span-2 xl:col-span-3">سيتم توليد كود الصنف حسب الفئة ورمز EAN‑13 يبدأ بـ 628 تلقائياً عند الحفظ.</p>}
      </div><div className="sticky bottom-0 -mx-5 mt-6 flex justify-end gap-2 border-t border-border bg-card/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7"><button type="button" onClick={() => setDialogOpen(false)} className="toolbar-button">إلغاء</button><button type="submit" disabled={saving} className="primary-button disabled:opacity-50">{saving ? 'جارٍ الحفظ…' : <><Check size={16} />{editing ? 'حفظ التعديلات' : 'إضافة الصنف'}</>}</button></div></form></section></div>}

    {printMode && <div className="print-area" dir="rtl">{printMode === 'catalog' ? <><div className="print-heading"><h1>{shopName}</h1><p>كتالوج المنتجات</p></div><div className="catalog-print-grid">{products.map(product => <article className="catalog-print-card" key={product.id}>{product.imageUrl ? <img src={product.imageUrl} alt={product.itemName} /> : <div className="catalog-print-placeholder"><Package size={32} /></div>}<strong>{product.itemName}</strong><span>{money(product.priceRetail)} ر.ي.</span></article>)}</div></> : <div className="label-print-grid">{filtered.map(product => <BarcodeLabel key={product.id} product={product} shopName={shopName} labelShop={labelShop} labelName={labelName} labelPrice={labelPrice} />)}</div>}</div>}
  </>
}

function SignInScreen({ onSignIn }: { onSignIn: () => void }) {
  const [useUsernameMode, setUseUsernameMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // يمكنك تغيير اسم المستخدم وكلمة السر من هنا
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "123456";

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setLocalError('');
      toast.success("تم تسجيل الدخول بنجاح!");
      onSignIn(); // استدعاء الدالة الأصلية في المشروع للدخول مباشرة
    } else {
      setLocalError("اسم المستخدم أو كلمة السر غير صحيحة");
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-sm space-y-5 surface-card p-6 rounded-2xl shadow-lg border border-border">
        
        {/* عنوان الشاشة */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">محلات ومكتبة الإخوة</h1>
          <p className="text-xs text-muted-foreground">نظام سهيل المخزن للخدمات والمبيعات</p>
        </div>

        {/* أزرار التنقل بين الخيارين */}
        <div className="flex border-b border-border text-xs">
          <button
            type="button"
            className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
              useUsernameMode ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setUseUsernameMode(true)}
          >
            اسم المستخدم وكلمة السر
          </button>
          <button
            type="button"
            className={`flex-1 py-2 font-medium border-b-2 transition-colors ${
              !useUsernameMode ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setUseUsernameMode(false)}
          >
            البريد الإلكتروني (السابق)
          </button>
        </div>

        {/* الخيار الأول: اسم المستخدم وكلمة السر */}
        {useUsernameMode ? (
          <form onSubmit={handleCustomLogin} className="space-y-4 text-sm">
            {localError && (
              <div className="p-2 text-xs text-red-600 bg-red-50 rounded text-center border border-red-200">
                {localError}
              </div>
            )}
            <div>
              <label className="block form-label mb-1">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block form-label mb-1">كلمة السر</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة السر"
                required
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition"
            >
              تسجيل الدخول السريع
            </button>
          </form>
        ) : (
          /* الخيار الثاني: الدخول بالبريد القديم */
          <div className="space-y-3 text-center py-2">
            <p className="text-xs text-muted-foreground">تسجيل الدخول التلقائي عبر مزود الخدمة:</p>
            <button
              type="button"
              onClick={onSignIn}
              className="w-full py-2 bg-secondary text-secondary-foreground font-medium rounded-lg hover:opacity-90 transition text-sm"
            >
              متابعة بالبريد الإلكتروني
            </button>
          </div>
        )}

      </div>
    </div>
  );
}


function StatCard({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: ReactNode; tone: string }) {
  return <article className="surface-card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={`stat-icon stat-${tone}`}>{icon}</span></div><div className="mt-5 text-2xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-xs text-muted-foreground">{note}</div></article>
}
function ProductThumb({ product }: { product: InventoryProductsRow }) {
  return <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground">{product.imageUrl ? <img src={product.imageUrl} alt={product.itemName} className="h-full w-full object-cover" /> : <Package size={18} />}</div>
}
function ProductTable({ products, onEdit, onDelete, onAdjust, loading }: { products: InventoryProductsRow[]; onEdit: (p: InventoryProductsRow) => void; onDelete: (p: InventoryProductsRow) => void; onAdjust: (p: InventoryProductsRow, n: number) => void; loading: boolean }) {
  if (loading && !products.length) return <div className="p-12 text-center text-sm text-muted-foreground">جارٍ تحميل الأصناف…</div>
  if (!products.length) return <div className="p-12 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-primary"><Package size={24} /></div><h3 className="mt-4 font-semibold">لا توجد أصناف بعد</h3><p className="mt-2 text-sm text-muted-foreground">أضف صنفاً جديداً أو استورد قائمة المنتجات من ملف Excel.</p></div>
  return <><div className="hidden overflow-x-auto md:block"><table className="w-full text-right"><thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground"><tr><th className="px-5 py-3">الصنف</th><th className="px-4 py-3">الكود / الباركود</th><th className="px-4 py-3">القسم والموقع</th><th className="px-4 py-3">الرصيد</th><th className="px-4 py-3">سعر التجزئة</th><th className="px-5 py-3">إجراءات</th></tr></thead><tbody className="divide-y divide-border">{products.map(product => <tr key={product.id} className="group transition hover:bg-muted/30"><td className="px-5 py-3"><div className="flex items-center gap-3"><ProductThumb product={product} /><div className="min-w-0"><p className="max-w-52 truncate text-sm font-semibold">{product.itemName}</p><p className="mt-1 max-w-52 truncate text-xs text-muted-foreground">{product.specifications || '—'}</p></div></div></td><td className="px-4 py-3"><div className="font-mono text-xs">{product.itemCode}</div><div className="mt-1 font-mono text-[10px] text-muted-foreground">{product.customBarcode}</div></td><td className="px-4 py-3"><div className="text-xs">{product.category}</div><div className="mt-1 text-[10px] text-muted-foreground">{product.warehouse}{product.shelfPosition ? ` · ${product.shelfPosition}` : ''}</div></td><td className="px-4 py-3"><StockPill product={product} /><div className="mt-1 text-[10px] text-muted-foreground">{product.baseUnit}</div></td><td className="px-4 py-3 text-sm font-semibold">{money(product.priceRetail)} <span className="text-[10px] font-normal text-muted-foreground">ر.ي.</span></td><td className="px-5 py-3"><div className="flex items-center gap-1 opacity-80 transition group-hover:opacity-100"><button onClick={() => onAdjust(product, 1)} title="زيادة الرصيد" className="small-action"><Plus size={14} /></button><button onClick={() => onAdjust(product, -1)} title="تقليل الرصيد" className="small-action"><ArrowDownToLine size={14} /></button><button onClick={() => onEdit(product)} title="تعديل" className="small-action"><Pencil size={14} /></button><button onClick={() => onDelete(product)} title="حذف" className="small-action text-destructive"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div><div className="space-y-3 p-3 md:hidden">{products.map(product => <article key={product.id} className="rounded-2xl border border-border bg-background p-3"><div className="flex gap-3"><ProductThumb product={product} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.itemName}</p><p className="mt-1 text-xs text-muted-foreground">{product.category} · {product.warehouse}</p></div><StockPill product={product} /></div><div className="mt-3 flex items-center justify-between"><span className="font-mono text-[10px] text-muted-foreground">{product.itemCode} · {product.customBarcode}</span><strong className="text-sm">{money(product.priceRetail)} ر.ي.</strong></div><div className="mt-3 flex gap-1 border-t border-border pt-2"><button onClick={() => onAdjust(product, 1)} className="small-action"><Plus size={15} /></button><button onClick={() => onAdjust(product, -1)} className="small-action"><ArrowDownToLine size={15} /></button><button onClick={() => onEdit(product)} className="small-action"><Pencil size={15} /></button><button onClick={() => onDelete(product)} className="small-action text-destructive"><Trash2 size={15} /></button></div></div></div></article>)}</div></>
}
function StockPill({ product }: { product: InventoryProductsRow }) {
  const low = num(product.stockQuantity) <= num(product.minStock)
  return <span className={`stock-pill ${low ? 'stock-low' : 'stock-ok'}`}>{money(product.stockQuantity)}{low && <AlertTriangle size={12} />}</span>
}
function EmptyMessage({ title, text }: { title: string; text: string }) { return <div className="rounded-xl bg-muted/60 px-4 py-6 text-center"><Check size={20} className="mx-auto text-primary" /><p className="mt-2 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div> }
function AlertList({ title, description, products, icon, onEdit, empty }: { title: string; description: string; products: InventoryProductsRow[]; icon: ReactNode; onEdit: (p: InventoryProductsRow) => void; empty: string }) {
  return <section className="surface-card overflow-hidden"><div className="flex items-center gap-3 border-b border-border p-5"><span className="stat-icon stat-rose">{icon}</span><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><span className="mr-auto rounded-full bg-muted px-2.5 py-1 text-xs">{products.length}</span></div>{products.length ? <div className="divide-y divide-border">{products.map(product => <button key={product.id} onClick={() => onEdit(product)} className="flex w-full items-center gap-3 p-4 text-right transition hover:bg-muted/40"><ProductThumb product={product} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{product.itemName}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{product.category} · {product.warehouse}</span></span><span className="text-left"><span className="block text-sm font-semibold">{money(product.stockQuantity)} {product.baseUnit}</span><span className="mt-1 block text-[10px] text-muted-foreground">الحد {money(product.minStock)}</span></span></button>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">{empty}</p>}</section>
}
function BarcodeLabel({ product, shopName, labelShop, labelName, labelPrice }: { product: InventoryProductsRow; shopName: string; labelShop: boolean; labelName: boolean; labelPrice: boolean }) {
  const bits = ean13Bits(product.customBarcode)
  return <article className="barcode-label"><div className="truncate text-center text-[10px] font-semibold">{labelShop ? shopName : ''}</div>{labelName && <div className="truncate text-center text-xs font-medium">{product.itemName}</div>}<svg className="barcode-svg" viewBox="0 0 190 56" role="img" aria-label={`باركود ${product.itemName}`}><rect width="190" height="56" fill="white" />{[...bits].map((bit, index) => bit === '1' ? <rect key={index} x={index * 2} y={index < 3 || (index >= 45 && index < 50) || index >= 92 ? 0 : 5} width="2" height={index < 3 || (index >= 45 && index < 50) || index >= 92 ? 42 : 34} fill="#171a15" /> : null)}<text x="95" y="54" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#171a15">{product.customBarcode}</text></svg>{labelPrice && <div className="text-center text-sm font-semibold">{money(product.priceRetail)} ر.ي.</div>}</article>
}
function NumberField({ label, value, onChange, min = '0' }: { label: string; value: string; onChange: (value: string) => void; min?: string }) {
  return <label className="form-label">{label}<input type="number" inputMode="decimal" min={min} step="any" className="form-input mt-2" value={value} onChange={e => onChange(e.target.value)} /></label>
}
