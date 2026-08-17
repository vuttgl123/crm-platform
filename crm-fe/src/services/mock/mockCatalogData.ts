export interface CategoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  productsCount: number;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  categoryName: string;
  unit: string;
  unitPrice: number;
  inventoryCount: number;
  status: 'ACTIVE' | 'DISCONTINUED';
}

export interface PriceBookItem {
  id: string;
  code: string;
  name: string;
  currency: string;
  validFrom: string;
  validTo?: string;
  isStandard: boolean;
  isActive: boolean;
  entriesCount: number;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat-01', code: 'SOFT_LIC', name: 'Bản quyền Phần mềm (Software License)', description: 'License vĩnh viễn và thuê bao định kỳ', productsCount: 6, isActive: true },
  { id: 'cat-02', code: 'SRV_IMP', name: 'Dịch vụ Triển khai & Tích hợp', description: 'Gói triển khai kỹ thuật, đào tạo và kết nối API', productsCount: 4, isActive: true },
  { id: 'cat-03', code: 'SRV_MAINT', name: 'Dịch vụ Bảo trì & Hỗ trợ Kỹ thuật SLA', description: 'Gói bảo dưỡng, nâng cấp và hỗ trợ 24/7', productsCount: 3, isActive: true },
  { id: 'cat-04', code: 'CLOUD_ADD', name: 'Dung lượng & Tài nguyên Cloud', description: 'Mở rộng lưu trữ file, tin nhắn ZNS, SMS Brandname', productsCount: 5, isActive: true },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 'prod-01', sku: 'CRM-ENT-USER', name: 'Gói CRM Enterprise User (1 Năm)', categoryName: 'Bản quyền Phần mềm', unit: 'User / Năm', unitPrice: 3600000, inventoryCount: 9999, status: 'ACTIVE' },
  { id: 'prod-02', sku: 'CRM-PRO-USER', name: 'Gói CRM Professional User (1 Năm)', categoryName: 'Bản quyền Phần mềm', unit: 'User / Năm', unitPrice: 2400000, inventoryCount: 9999, status: 'ACTIVE' },
  { id: 'prod-03', sku: 'IMP-CORE-PKG', name: 'Gói Dịch vụ Triển khai Tiêu chuẩn', categoryName: 'Dịch vụ Triển khai & Tích hợp', unit: 'Gói', unitPrice: 150000000, inventoryCount: 50, status: 'ACTIVE' },
  { id: 'prod-04', sku: 'IMP-ERP-INT', name: 'Module Tích hợp Hệ thống SAP / ERP', categoryName: 'Dịch vụ Triển khai & Tích hợp', unit: 'Module', unitPrice: 350000000, inventoryCount: 20, status: 'ACTIVE' },
  { id: 'prod-05', sku: 'SLA-247-YR', name: 'Gói Hỗ trợ Kỹ thuật 24/7 Platinum (1 Năm)', categoryName: 'Dịch vụ Bảo trì & Hỗ trợ Kỹ thuật SLA', unit: 'Năm', unitPrice: 180000000, inventoryCount: 100, status: 'ACTIVE' },
  { id: 'prod-06', sku: 'CLOUD-STOR-100G', name: 'Gói Lưu trữ Tài liệu 100GB Cloud', categoryName: 'Dung lượng & Tài nguyên Cloud', unit: '100GB / Năm', unitPrice: 12000000, inventoryCount: 1000, status: 'ACTIVE' },
];

export const INITIAL_PRICE_BOOKS: PriceBookItem[] = [
  { id: 'pb-01', code: 'PB-STANDARD-2026', name: 'Bảng giá Niêm yết Chuẩn 2026', currency: 'VND', validFrom: '2026-01-01', isStandard: true, isActive: true, entriesCount: 6 },
  { id: 'pb-02', code: 'PB-ENTERPRISE-VIP', name: 'Bảng giá Khách hàng Doanh nghiệp Lớn (VIP)', currency: 'VND', validFrom: '2026-01-01', isStandard: false, isActive: true, entriesCount: 6 },
  { id: 'pb-03', code: 'PB-PARTNER-RESELLER', name: 'Chính sách Chiết khấu Đại lý & Đối tác', currency: 'VND', validFrom: '2026-03-01', isStandard: false, isActive: true, entriesCount: 5 },
];

let categoriesStore = [...INITIAL_CATEGORIES];
let productsStore = [...INITIAL_PRODUCTS];
let priceBooksStore = [...INITIAL_PRICE_BOOKS];

export const mockCatalogApi = {
  // Categories
  listCategories: async (params?: { search?: string }) => {
    let result = [...categoriesStore];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    return result;
  },

  // Products
  listProducts: async (params?: { search?: string; category?: string; page?: number; size?: number }) => {
    let result = [...productsStore];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (params?.category && params.category !== 'ALL') {
      result = result.filter((p) => p.categoryName === params.category);
    }
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);
    return { content, totalElements, totalPages, page, size };
  },

  createProduct: async (data: Omit<ProductItem, 'id'>) => {
    const newItem: ProductItem = {
      ...data,
      id: `prod-${Date.now().toString().slice(-4)}`,
    };
    productsStore.unshift(newItem);
    return newItem;
  },

  updateProduct: async (id: string, data: Partial<ProductItem>) => {
    productsStore = productsStore.map((p) => (p.id === id ? { ...p, ...data } : p));
    const found = productsStore.find((p) => p.id === id);
    return found!;
  },

  deleteProduct: async (id: string) => {
    productsStore = productsStore.filter((p) => p.id !== id);
    return true;
  },

  // Price Books
  listPriceBooks: async (params?: { search?: string }) => {
    let result = [...priceBooksStore];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((pb) => pb.name.toLowerCase().includes(q) || pb.code.toLowerCase().includes(q));
    }
    return result;
  },
};
