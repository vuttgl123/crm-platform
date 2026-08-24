import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { catalogApi } from '@/services/api/catalogApi';
import type { QuoteFormLineItem } from '../model/quoteTypes';

interface QuoteLineEditorProps {
  lines: QuoteFormLineItem[];
  onChange: (lines: QuoteFormLineItem[]) => void;
  priceBookId: string;
  currencyCode: string;
  isReadOnly?: boolean;
}

function calculateProvisionalLine(line: QuoteFormLineItem): QuoteFormLineItem {
  const qty = line.quantity > 0 ? line.quantity : 1;
  const price = line.salesUnitPrice >= 0 ? line.salesUnitPrice : 0;
  const discPct = line.discountPercent >= 0 && line.discountPercent <= 100 ? line.discountPercent : 0;
  const taxPct = line.taxPercent >= 0 && line.taxPercent <= 100 ? line.taxPercent : 0;

  const subtotal = qty * price;
  const discountAmount = (subtotal * discPct) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * taxPct) / 100;
  const lineTotal = taxable + taxAmount;

  return {
    ...line,
    quantity: qty,
    salesUnitPrice: price,
    discountPercent: discPct,
    taxPercent: taxPct,
    subtotal,
    discountAmount,
    taxAmount,
    lineTotal,
  };
}

export const QuoteLineEditor: React.FC<QuoteLineEditorProps> = ({
  lines,
  onChange,
  priceBookId,
  currencyCode,
  isReadOnly = false,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<{
    productId: string;
    priceBookItemId: string;
    sku: string;
    name: string;
    unit: string;
    listPrice: number;
    description: string;
  }[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');

  useEffect(() => {
    if (priceBookId) {
      catalogApi.getPriceBook(priceBookId).then((res) => {
        const entries = res.entries || [];
        setAvailableProducts(
          entries.map((it) => ({
            productId: it.productId,
            priceBookItemId: it.id || it.productId,
            sku: it.productSku || 'SKU',
            name: it.productName || 'Product',
            unit: 'Unit',
            listPrice: it.unitPrice || 0,
            description: '',
          }))
        );
      }).catch(() => {});
    }
  }, [priceBookId]);

  const handleAddProduct = (prod: (typeof availableProducts)[0]) => {
    const newLine: QuoteFormLineItem = calculateProvisionalLine({
      position: lines.length + 1,
      productId: prod.productId,
      priceBookItemId: prod.priceBookItemId,
      sku: prod.sku,
      productName: prod.name,
      unit: prod.unit,
      description: prod.description,
      quantity: 1,
      listUnitPrice: prod.listPrice,
      salesUnitPrice: prod.listPrice,
      discountPercent: 0,
      taxPercent: 0,
      subtotal: prod.listPrice,
      discountAmount: 0,
      taxAmount: 0,
      lineTotal: prod.listPrice,
    });

    onChange([...lines, newLine]);
    setIsPickerOpen(false);
  };

  const handleUpdateLine = (index: number, updates: Partial<QuoteFormLineItem>) => {
    const updated = [...lines];
    updated[index] = calculateProvisionalLine({ ...updated[index], ...updates });
    onChange(updated);
  };

  const handleRemoveLine = (index: number) => {
    const filtered = lines.filter((_, i) => i !== index);
    const reordered = filtered.map((l, i) => calculateProvisionalLine({ ...l, position: i + 1 }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === lines.length - 1) return;

    const updated = [...lines];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((l, i) => calculateProvisionalLine({ ...l, position: i + 1 }));
    onChange(reordered);
  };

  const filteredCatalog = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
            <span>Quote Line Items ({lines.length})</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real products sourced from active price book records. Subtotal and taxes are server-calculated.
          </p>
        </div>

        {!isReadOnly && (
          <Button
            size="sm"
            onClick={() => setIsPickerOpen(true)}
            disabled={!priceBookId}
            className="h-8 rounded-[3px] text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Button>
        )}
      </div>

      {/* Table / List */}
      {lines.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">No Line Items Added</p>
          <p className="text-slate-400">
            {priceBookId
              ? 'Click "Add Product" to select line items and configure quantity and pricing.'
              : 'Please select a Price Book in Quote Context first before adding line items.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-4 min-w-[200px]">Product / Sku</th>
                <th className="py-2.5 px-3 w-24">Qty</th>
                <th className="py-2.5 px-3 w-28">Unit Price</th>
                <th className="py-2.5 px-3 w-20">Disc %</th>
                <th className="py-2.5 px-3 w-20">Tax %</th>
                <th className="py-2.5 px-4 text-right min-w-[110px]">Line Total</th>
                {!isReadOnly && <th className="py-2.5 px-3 w-24 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lines.map((line, idx) => (
                <tr key={line.id || idx} className="hover:bg-slate-50/40">
                  {/* Position */}
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {line.position}
                  </td>

                  {/* Product Details */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{line.productName}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <span>SKU: {line.sku}</span>
                      {line.unit && <span>• {line.unit}</span>}
                    </div>
                    {!isReadOnly ? (
                      <Input
                        value={line.description || ''}
                        onChange={(e) => handleUpdateLine(idx, { description: e.target.value })}
                        placeholder="Line note / specifications (optional)..."
                        className="h-7 text-[11px] rounded-[3px] border-slate-200 mt-1.5"
                      />
                    ) : (
                      line.description && (
                        <p className="text-[11px] text-slate-500 italic mt-1">{line.description}</p>
                      )
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3">
                    {!isReadOnly ? (
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(e) =>
                          handleUpdateLine(idx, { quantity: parseFloat(e.target.value) || 1 })
                        }
                        className="h-8 text-xs rounded-[3px] border-slate-200 font-mono"
                      />
                    ) : (
                      <span className="font-mono font-medium text-slate-800">{line.quantity}</span>
                    )}
                  </td>

                  {/* Sales Unit Price */}
                  <td className="py-3 px-3">
                    {!isReadOnly ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.salesUnitPrice}
                        onChange={(e) =>
                          handleUpdateLine(idx, { salesUnitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs rounded-[3px] border-slate-200 font-mono"
                      />
                    ) : (
                      <span className="font-mono font-medium text-slate-800">
                        {line.salesUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </td>

                  {/* Discount % */}
                  <td className="py-3 px-3">
                    {!isReadOnly ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={line.discountPercent}
                        onChange={(e) =>
                          handleUpdateLine(idx, { discountPercent: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs rounded-[3px] border-slate-200 font-mono"
                      />
                    ) : (
                      <span className="font-mono text-slate-700">{line.discountPercent}%</span>
                    )}
                  </td>

                  {/* Tax % */}
                  <td className="py-3 px-3">
                    {!isReadOnly ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={line.taxPercent}
                        onChange={(e) =>
                          handleUpdateLine(idx, { taxPercent: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs rounded-[3px] border-slate-200 font-mono"
                      />
                    ) : (
                      <span className="font-mono text-slate-700">{line.taxPercent}%</span>
                    )}
                  </td>

                  {/* Line Total */}
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-bold text-slate-900">
                      {line.lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencyCode}
                    </span>
                  </td>

                  {/* Actions (Move, Delete) */}
                  {!isReadOnly && (
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="h-6 w-6 rounded-[2px] text-slate-400 hover:text-slate-700"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === lines.length - 1}
                          className="h-6 w-6 rounded-[2px] text-slate-400 hover:text-slate-700"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLine(idx)}
                          className="h-6 w-6 rounded-[2px] text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Selection Modal */}
      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="rounded-[4px] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-600" />
              <span>Select Product from Price Book</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <Input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search product name, sku..."
              className="h-8.5 text-xs rounded-[3px] border-slate-200"
            />

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-[3px] max-h-72 overflow-y-auto">
              {filteredCatalog.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No active products found in this price book.
                </div>
              ) : (
                filteredCatalog.map((prod) => (
                  <div
                    key={prod.priceBookItemId}
                    onClick={() => handleAddProduct(prod)}
                    className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{prod.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        SKU: {prod.sku} • {prod.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900">
                        {prod.listPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currencyCode}
                      </p>
                      <span className="text-[10px] text-slate-400">List Price</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
