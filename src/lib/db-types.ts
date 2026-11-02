// Auto-generated from your database schema — do not edit by hand.
// Regenerates automatically whenever a table is created or altered.

export type InventoryProductsRow = {
  id: string
  userId: string
  itemCode: string
  modelNumber: string | null
  primaryBarcode: string | null
  customBarcode: string
  itemName: string
  specifications: string | null
  category: string
  warehouse: string
  shelfPosition: string | null
  baseUnit: string
  majorUnit: string | null
  packageCapacity: number | string
  purchaseCost: number | string
  priceSpecial: number | string
  priceRetail: number | string
  priceHalfWholesale: number | string
  priceWholesale: number | string
  priceBulkWholesale: number | string
  imageUrl: string | null
  stockQuantity: number | string
  minStock: number | string
  lastActivityAt: string | null
  createdAt: string
  updatedAt: string
}
