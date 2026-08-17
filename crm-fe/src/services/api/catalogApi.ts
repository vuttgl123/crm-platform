import { apiFetch } from './apiClient';

export interface CategoryItem {
  id: string;
  categoryCode?: string;
  code?: string;
  name: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  productsCount?: number;
  active?: boolean;
  isActive?: boolean;
  version?: number;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  categoryId?: string | null;
  categoryName?: string;
  unit?: string;
  unitPrice?: number;
  basePrice?: number;
  currencyCode?: string;
  inventoryCount?: number;
  active?: boolean;
  status?: 'ACTIVE' | 'DISCONTINUED';
  description?: string;
  version?: number;
}

export interface ProductPageResult {
  items: ProductItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PriceBookEntry {
  id?: string;
  productId: string;
  productSku?: string;
  productName?: string;
  unitPrice: number;
  minQuantity?: number;
  active?: boolean;
}

export interface PriceBookItem {
  id: string;
  bookCode?: string;
  code?: string;
  name: string;
  description?: string;
  currencyCode?: string;
  currency?: string;
  validFrom?: string;
  validTo?: string;
  isStandard?: boolean;
  standard?: boolean;
  active?: boolean;
  isActive?: boolean;
  entriesCount?: number;
  entries?: PriceBookEntry[];
  version?: number;
}

export const catalogApi = {
  // Categories
  listCategories: async (params?: { search?: string }): Promise<CategoryItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<CategoryItem[]>(`/catalog/categories${qs}`);
    return (res || []).map((c) => ({
      ...c,
      code: c.categoryCode || c.code || '',
      isActive: c.active !== undefined ? c.active : (c.isActive ?? true),
      productsCount: c.productsCount || 0,
    }));
  },

  getCategory: async (id: string): Promise<CategoryItem> => {
    const res = await apiFetch<CategoryItem>(`/catalog/categories/${id}`);
    return {
      ...res,
      code: res.categoryCode || res.code || '',
      isActive: res.active !== undefined ? res.active : (res.isActive ?? true),
    };
  },

  createCategory: async (data: { categoryCode: string; name: string; description?: string; parentId?: string }): Promise<CategoryItem> => {
    return apiFetch<CategoryItem>('/catalog/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory: async (id: string, data: { version: number; name: string; description?: string; active?: boolean }): Promise<CategoryItem> => {
    return apiFetch<CategoryItem>(`/catalog/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/catalog/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  // Products
  listProducts: async (params?: {
    search?: string;
    category?: string;
    categoryId?: string;
    page?: number;
    size?: number;
  }): Promise<{ content: ProductItem[]; totalElements: number; totalPages: number; page: number; size: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<ProductPageResult | ProductItem[]>(`/catalog/products${qs}`);

    const normalize = (p: ProductItem): ProductItem => ({
      ...p,
      unitPrice: p.basePrice !== undefined ? p.basePrice : (p.unitPrice || 0),
      status: p.active === false ? 'DISCONTINUED' : 'ACTIVE',
      categoryName: p.categoryName || 'Sản phẩm chung',
      inventoryCount: p.inventoryCount || 999,
    });

    if (Array.isArray(res)) {
      const content = res.map(normalize);
      return { content, totalElements: content.length, totalPages: 1, page: 0, size: content.length };
    }

    const content = (res.items || []).map(normalize);
    return {
      content,
      totalElements: res.totalElements || 0,
      totalPages: res.totalPages || 1,
      page: (res.pageNumber || 1) - 1,
      size: res.pageSize || 10,
    };
  },

  getProduct: async (id: string): Promise<ProductItem> => {
    const p = await apiFetch<ProductItem>(`/catalog/products/${id}`);
    return {
      ...p,
      unitPrice: p.basePrice !== undefined ? p.basePrice : (p.unitPrice || 0),
      status: p.active === false ? 'DISCONTINUED' : 'ACTIVE',
    };
  },

  createProduct: async (data: {
    sku: string;
    name: string;
    categoryId?: string;
    unit?: string;
    basePrice?: number;
    unitPrice?: number;
    description?: string;
  }): Promise<ProductItem> => {
    const payload = {
      sku: data.sku,
      name: data.name,
      categoryId: data.categoryId,
      unit: data.unit || 'Cái',
      basePrice: data.basePrice !== undefined ? data.basePrice : (data.unitPrice || 0),
      currencyCode: 'VND',
      description: data.description,
    };
    return apiFetch<ProductItem>('/catalog/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateProduct: async (
    id: string,
    data: {
      version: number;
      name: string;
      categoryId?: string;
      unit?: string;
      basePrice?: number;
      unitPrice?: number;
      active?: boolean;
      description?: string;
    }
  ): Promise<ProductItem> => {
    const payload = {
      version: data.version,
      name: data.name,
      categoryId: data.categoryId,
      unit: data.unit || 'Cái',
      basePrice: data.basePrice !== undefined ? data.basePrice : (data.unitPrice || 0),
      active: data.active !== undefined ? data.active : true,
      description: data.description,
    };
    return apiFetch<ProductItem>(`/catalog/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteProduct: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/catalog/products/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },

  // Price Books
  listPriceBooks: async (params?: { search?: string }): Promise<PriceBookItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch<PriceBookItem[]>(`/catalog/price-books${qs}`);
    return (res || []).map((pb) => ({
      ...pb,
      code: pb.bookCode || pb.code || '',
      currency: pb.currencyCode || pb.currency || 'VND',
      isStandard: pb.standard !== undefined ? pb.standard : (pb.isStandard ?? false),
      isActive: pb.active !== undefined ? pb.active : (pb.isActive ?? true),
      entriesCount: pb.entries ? pb.entries.length : (pb.entriesCount || 0),
    }));
  },

  getPriceBook: async (id: string): Promise<PriceBookItem> => {
    const pb = await apiFetch<PriceBookItem>(`/catalog/price-books/${id}`);
    return {
      ...pb,
      code: pb.bookCode || pb.code || '',
      currency: pb.currencyCode || pb.currency || 'VND',
      isStandard: pb.standard !== undefined ? pb.standard : (pb.isStandard ?? false),
      isActive: pb.active !== undefined ? pb.active : (pb.isActive ?? true),
      entriesCount: pb.entries ? pb.entries.length : (pb.entriesCount || 0),
    };
  },

  createPriceBook: async (data: {
    bookCode: string;
    name: string;
    currencyCode?: string;
    standard?: boolean;
    validFrom?: string;
    validTo?: string;
    description?: string;
  }): Promise<PriceBookItem> => {
    return apiFetch<PriceBookItem>('/catalog/price-books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePriceBook: async (
    id: string,
    data: {
      version: number;
      name: string;
      validFrom?: string;
      validTo?: string;
      active?: boolean;
      description?: string;
    }
  ): Promise<PriceBookItem> => {
    return apiFetch<PriceBookItem>(`/catalog/price-books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePriceBook: async (id: string, version: number = 1): Promise<void> => {
    return apiFetch<void>(`/catalog/price-books/${id}`, {
      method: 'DELETE',
      headers: {
        'If-Match': `"${version}"`,
      },
    });
  },
};
