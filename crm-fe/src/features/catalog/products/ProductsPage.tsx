import React, { useState, useEffect, useCallback } from 'react';
import {
  catalogApi,
  ProductItem,
} from '@/services/api/catalogApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ActionTooltip } from '@/components/ui/action-tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/common/StandardPageHeader';
import { StandardFilterBar, ViewTabItem } from '@/components/common/StandardFilterBar';
import { StandardPagination } from '@/components/common/StandardPagination';
import {
  Package,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Software Licenses');
  const [unit, setUnit] = useState('User / Year');
  const [unitPrice, setUnitPrice] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogApi.listProducts({
        search: searchQuery,
        category: selectedCategory,
        page,
        size: pageSize,
      });
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      toast.error('Unable to load products from server');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, page, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setPage(0);
    fetchProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setSku(`PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setName('');
    setCategoryName('Software Licenses');
    setUnit('User / Year');
    setUnitPrice('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prd: ProductItem) => {
    setEditingProduct(prd);
    setSku(prd.sku);
    setName(prd.name);
    setCategoryName(prd.categoryName || 'Software Licenses');
    setUnit(prd.unit || 'Unit');
    setUnitPrice((prd.unitPrice || 0).toString());
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitPrice.trim()) {
      toast.error('Please specify Product Name and Unit Price');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await catalogApi.updateProduct(editingProduct.id, {
          version: editingProduct.version || 1,
          name,
          unit,
          unitPrice: parseFloat(unitPrice),
        });
        toast.success('Product updated successfully!');
      } else {
        await catalogApi.createProduct({
          sku,
          name,
          unit,
          unitPrice: parseFloat(unitPrice),
        });
        toast.success('New product catalog item created successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch {
      toast.error('Unable to save product details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      await catalogApi.deleteProduct(id);
      toast.success(`Deleted product "${name}"`);
      fetchProducts();
    } catch {
      toast.error('Unable to delete product');
    }
  };

  // KPI Metrics
  const softwareCount = products.filter((p) => (p.categoryName || '').toLowerCase().includes('software') || (p.categoryName || '').toLowerCase().includes('phần mềm')).length;
  const serviceCount = products.filter((p) => (p.categoryName || '').toLowerCase().includes('service') || (p.categoryName || '').toLowerCase().includes('dịch vụ')).length;

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== 'ALL' ? 1 : 0);

  // View Tabs Config
  const viewTabs: ViewTabItem[] = [
    { id: 'ALL', label: 'All Products', count: totalElements },
    { id: 'SOFTWARE', label: 'SaaS / Licenses', count: softwareCount, icon: Layers, dotColor: 'bg-indigo-500' },
    { id: 'SERVICE', label: 'Implementation Services', count: serviceCount, icon: CheckCircle2, dotColor: 'bg-emerald-500' },
  ];

  const currentActiveTab = selectedCategory === 'Bản quyền Phần mềm' || selectedCategory === 'Software Licenses' ? 'SOFTWARE' : selectedCategory === 'Dịch vụ Triển khai & Đào tạo' || selectedCategory === 'Professional Services' ? 'SERVICE' : 'ALL';

  const handleTabChange = (tabId: string) => {
    if (tabId === 'SOFTWARE') {
      setSelectedCategory('Bản quyền Phần mềm');
    } else if (tabId === 'SERVICE') {
      setSelectedCategory('Dịch vụ Triển khai & Đào tạo');
    } else {
      setSelectedCategory('ALL');
    }
    setPage(0);
  };

  return (
    <div className="space-y-4 pb-12 font-sans w-full">
      {/* Standard Page Header */}
      <StandardPageHeader
        title="Product &amp; Services Catalog"
        subtitle="Manage master SKU catalog, SaaS licensing tiers, professional services &amp; base pricing"
        badgeCount={totalElements}
        badgeLabel="products"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
              className="text-xs font-medium text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1.5 h-8 rounded-[3px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="text-xs font-semibold bg-[#0C66E4] hover:bg-[#0052CC] text-white gap-1.5 shadow-none h-8 rounded-[3px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Product</span>
            </Button>
          </>
        }
      />

      {/* Standard Filter & Search Bar */}
      <StandardFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
        searchPlaceholder="Search by SKU code, product name..."
        viewTabs={viewTabs}
        activeTab={currentActiveTab}
        onTabChange={handleTabChange}
        activeFiltersCount={activeFiltersCount}
        onResetFilters={handleResetFilters}
        filterControls={
          <div className="w-52">
            <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setPage(0); }}>
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-[3px]">
                <SelectValue placeholder="Product Category" />
              </SelectTrigger>
              <SelectContent className="rounded-[3px]">
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Bản quyền Phần mềm">Software Licenses</SelectItem>
                <SelectItem value="Dịch vụ Triển khai & Đào tạo">Professional Services</SelectItem>
                <SelectItem value="Phần cứng & Thiết bị">Hardware &amp; Devices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Products Table */}
      <Card className="overflow-hidden border border-slate-200 rounded-[4px] bg-white shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F9] border-b border-slate-200 hover:bg-[#F7F8F9]">
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">SKU &amp; Product Name</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Category</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Unit</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">List Price</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3">Commercial Status</TableHead>
                <TableHead className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider py-2.5 px-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Loading product catalog...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Package}
                      title="No products found"
                      description="Try adjusting your search criteria or register a new product item."
                      actionLabel="Create Product"
                      onAction={handleOpenCreate}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-[#F1F2F4] transition-colors border-b border-[#EBECF0] text-xs">
                    {/* SKU & Name */}
                    <TableCell className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-[3px] bg-[#E9F2FF] text-[#0C66E4] border border-[#C0D9FF] font-bold text-xs flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-2 px-3">
                      <span className="bg-[#EBECF0] text-[#42526E] font-semibold text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]">
                        {product.categoryName}
                      </span>
                    </TableCell>

                    {/* Unit */}
                    <TableCell className="py-2 px-3 text-slate-600 font-medium">
                      {product.unit}
                    </TableCell>

                    {/* Unit Price */}
                    <TableCell className="py-2 px-3">
                      <div className="font-semibold text-slate-900 font-mono text-xs">
                        {(product.unitPrice || 0).toLocaleString('en-US')} ₫
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2 px-3">
                      {product.status === 'ACTIVE' ? (
                        <span className="bg-[#E3FCEF] text-[#006644] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="bg-[#FFFAE6] text-[#974F0C] font-bold rounded-[3px] text-[11px] uppercase tracking-wider px-1.5 py-0.5">
                          INACTIVE
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2 px-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <ActionTooltip label="Edit Product">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(product)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-[#0C66E4] hover:bg-[#E9F2FF]"
                            aria-label="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                        <ActionTooltip label="Delete Product">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="h-7 w-7 rounded-[3px] text-slate-600 hover:text-red-600 hover:bg-red-50"
                            aria-label="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </ActionTooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Standard Pagination Bar */}
        {!loading && (
          <StandardPagination
            currentPage={page + 1}
            totalPages={Math.max(totalPages, 1)}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)}
            itemLabel="products"
          />
        )}
      </Card>

      {/* Create / Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl p-0 rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingProduct ? 'Edit Product Item' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {editingProduct ? `SKU: ${editingProduct.sku}` : 'Register SKU item, pricing model & commercial unit'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Product Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. CRM Enterprise Multi-Tenant License"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs border-slate-200 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">SKU Code</Label>
                <Input
                  disabled={!!editingProduct}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono bg-slate-50"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Category</Label>
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Software Licenses"
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Pricing Unit</Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. User / Year"
                  className="h-9 text-xs border-slate-200 mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  List Price (VND) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  type="number"
                  placeholder="1,200,000"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="h-9 text-xs border-slate-200 mt-1 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs border-slate-200 h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs h-9"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
