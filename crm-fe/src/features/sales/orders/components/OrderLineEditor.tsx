import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { catalogApi, type ProductItem } from '@/services/api/catalogApi';
import type { OrderFormLineItem } from '../model/orderTypes';

interface OrderLineEditorProps {
  lines: OrderFormLineItem[];
  onChange: (lines: OrderFormLineItem[]) => void;
  currencyCode?: string;
  isQuoteDerived?: boolean;
}

function calculateLineValues(
  qtyStr: string,
  priceStr: string,
  discPctStr: string,
  taxPctStr: string
) {
  const qty = parseFloat(qtyStr || '0') || 0;
  const price = parseFloat(priceStr || '0') || 0;
  const discPct = parseFloat(discPctStr || '0') || 0;
  const taxPct = parseFloat(taxPctStr || '0') || 0;

  const subtotal = qty * price;
  const discountAmount = discPct > 0 ? (subtotal * discPct) / 100 : 0;
  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxPct > 0 ? (taxableBase * taxPct) / 100 : 0;
  const lineTotal = taxableBase + taxAmount;

  return {
    discountAmount: discountAmount.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    lineTotal: lineTotal.toFixed(2),
  };
}

export const OrderLineEditor: React.FC<OrderLineEditorProps> = ({
  lines,
  onChange,
  isQuoteDerived = false,
}) => {
  const [catalogProducts, setCatalogProducts] = useState<ProductItem[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');

  useEffect(() => {
    catalogApi
      .listProducts({ size: 100 })
      .then((res) => setCatalogProducts(res.content || []))
      .catch(() => {});
  }, []);

  const handleAddCustomLine = () => {
    const newLine: OrderFormLineItem = {
      id: crypto.randomUUID(),
      lineNumber: lines.length + 1,
      nameSnapshot: 'Custom Product / Service',
      quantity: '1',
      unitPrice: '0',
      discountPercent: '0',
      discountAmount: '0',
      taxPercent: '0',
      taxAmount: '0',
      lineTotal: '0',
    };
    onChange([...lines, newLine]);
  };

  const handleSelectCatalogProduct = (p: ProductItem) => {
    const newLine: OrderFormLineItem = {
      id: crypto.randomUUID(),
      lineNumber: lines.length + 1,
      productId: p.id,
      skuSnapshot: p.sku || undefined,
      nameSnapshot: p.name,
      descriptionSnapshot: p.description || undefined,
      unitOfMeasureSnapshot: 'Unit',
      quantity: '1',
      unitPrice: '0',
      discountPercent: '0',
      discountAmount: '0',
      taxPercent: '0',
      taxAmount: '0',
      lineTotal: '0',
    };
    onChange([...lines, newLine]);
    setIsCatalogOpen(false);
  };

  const handleUpdateLine = (index: number, updates: Partial<OrderFormLineItem>) => {
    const updated = [...lines];
    const current = { ...updated[index], ...updates };

    const { discountAmount, taxAmount, lineTotal } = calculateLineValues(
      current.quantity,
      current.unitPrice,
      current.discountPercent,
      current.taxPercent
    );

    current.discountAmount = discountAmount;
    current.taxAmount = taxAmount;
    current.lineTotal = lineTotal;

    updated[index] = current;
    onChange(updated);
  };

  const handleRemoveLine = (index: number) => {
    const updated = lines
      .filter((_, i) => i !== index)
      .map((line, idx) => ({ ...line, lineNumber: idx + 1 }));
    onChange(updated);
  };

  const filteredProducts = catalogProducts.filter((p) =>
    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(catalogSearch.toLowerCase()))
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden font-sans w-full space-y-0">
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Order Items ({lines.length})
          </h3>
        </div>

        {!isQuoteDerived && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCatalogOpen(true)}
              className="h-7 text-xs font-semibold rounded-[3px] text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Catalog Item</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomLine}
              className="h-7 text-xs font-semibold rounded-[3px] gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Custom Item</span>
            </Button>
          </div>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <p className="text-xs text-slate-500">No items added to this order yet.</p>
          {!isQuoteDerived && (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsCatalogOpen(true)}
              className="h-8 text-xs font-semibold rounded-[3px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-2.5 w-8 text-center">#</th>
                <th className="p-2.5 min-w-[220px]">Description & SKU</th>
                <th className="p-2.5 w-24 text-right">Quantity</th>
                <th className="p-2.5 w-28 text-right">Unit Price</th>
                <th className="p-2.5 w-20 text-right">Disc %</th>
                <th className="p-2.5 w-20 text-right">Tax %</th>
                <th className="p-2.5 w-28 text-right">Line Total</th>
                {!isQuoteDerived && <th className="p-2.5 w-10 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line, idx) => (
                <tr key={line.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 text-center font-mono text-slate-400">{line.lineNumber}</td>
                  <td className="p-2.5 space-y-1">
                    <Input
                      value={line.nameSnapshot}
                      onChange={(e) => handleUpdateLine(idx, { nameSnapshot: e.target.value })}
                      placeholder="Item name / description"
                      className="h-7 text-xs rounded-[3px] font-semibold"
                      disabled={isQuoteDerived}
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <Input
                        value={line.skuSnapshot || ''}
                        onChange={(e) => handleUpdateLine(idx, { skuSnapshot: e.target.value })}
                        placeholder="SKU (opt)"
                        className="h-6 text-[11px] rounded-[3px] font-mono"
                        disabled={isQuoteDerived}
                      />
                      <Input
                        value={line.unitOfMeasureSnapshot || ''}
                        onChange={(e) =>
                          handleUpdateLine(idx, { unitOfMeasureSnapshot: e.target.value })
                        }
                        placeholder="Unit (e.g. EA)"
                        className="h-6 text-[11px] rounded-[3px]"
                        disabled={isQuoteDerived}
                      />
                    </div>
                  </td>
                  <td className="p-2.5 text-right">
                    <Input
                      type="number"
                      min="1"
                      step="any"
                      value={line.quantity}
                      onChange={(e) => handleUpdateLine(idx, { quantity: e.target.value })}
                      className="h-7 text-xs text-right font-mono rounded-[3px]"
                      disabled={isQuoteDerived}
                    />
                  </td>
                  <td className="p-2.5 text-right">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={line.unitPrice}
                      onChange={(e) => handleUpdateLine(idx, { unitPrice: e.target.value })}
                      className="h-7 text-xs text-right font-mono rounded-[3px]"
                      disabled={isQuoteDerived}
                    />
                  </td>
                  <td className="p-2.5 text-right">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={line.discountPercent}
                      onChange={(e) =>
                        handleUpdateLine(idx, { discountPercent: e.target.value })
                      }
                      className="h-7 text-xs text-right font-mono rounded-[3px]"
                      disabled={isQuoteDerived}
                    />
                  </td>
                  <td className="p-2.5 text-right">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={line.taxPercent}
                      onChange={(e) => handleUpdateLine(idx, { taxPercent: e.target.value })}
                      className="h-7 text-xs text-right font-mono rounded-[3px]"
                      disabled={isQuoteDerived}
                    />
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    {line.lineTotal}
                  </td>
                  {!isQuoteDerived && (
                    <td className="p-2.5 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLine(idx)}
                        className="h-6 w-6 rounded-[3px] text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Catalog Product Picker Modal */}
      <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DialogContent className="max-w-lg rounded-[4px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Select Product from Catalog
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pick a product to add to this order with default specifications.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Search catalog products..."
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            className="h-8 text-xs rounded-[3px]"
          />

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-[3px]">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectCatalogProduct(p)}
                className="p-2.5 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  {p.sku && <div className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</div>}
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-[11px] font-semibold text-blue-600">
                  Select
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
