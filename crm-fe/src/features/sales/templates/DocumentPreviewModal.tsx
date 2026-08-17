import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  Download,
  X,
  Building2,
  FileText,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatVietnameseReading } from '@/components/ui/BusinessNumberInput';

interface DocumentLineItem {
  id?: string;
  name: string;
  sku?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
}

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentType: 'QUOTE' | 'CONTRACT';
  documentNumber: string;
  documentDate: string;
  validUntilDate?: string;
  clientName: string;
  clientTaxCode?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientRepresentative?: string;
  items: DocumentLineItem[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  grandTotal: number;
  terms?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  open,
  onClose,
  documentType,
  documentNumber,
  documentDate,
  validUntilDate,
  clientName,
  clientTaxCode,
  clientAddress,
  clientPhone,
  clientRepresentative,
  items,
  subtotal,
  discountTotal = 0,
  taxTotal = 0,
  grandTotal,
  terms,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  const isContract = documentType === 'CONTRACT';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              {isContract ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {isContract ? 'Hợp đồng Cung cấp Dịch vụ & Giải pháp' : 'Bảng Báo giá Thương mại & Dịch vụ'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">Mã số: {documentNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Tài liệu (Print / PDF)</span>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-[800px] bg-white border border-slate-200 shadow-lg p-8 sm:p-10 space-y-6 text-slate-900 rounded-sm"
          >
            {/* Header: Company Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-blue-700 text-white font-black text-xs flex items-center justify-center">
                    CRM
                  </div>
                  <h1 className="font-black text-lg uppercase tracking-tight text-slate-900">
                    CÔNG TY CỔ PHẦN CÔNG NGHỆ DOANH NGHIỆP SMARTCRM
                  </h1>
                </div>
                <p className="text-[11px] text-slate-600">Tầng 18, Tòa nhà Landmark 72, Đường Phạm Hùng, Cầu Giấy, Hà Nội</p>
                <p className="text-[11px] text-slate-600">Mã số thuế: <strong className="font-mono">0108999888</strong> | Hotline: 1900 6868 | Email: contact@smartcrm.vn</p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isContract ? 'HỢP ĐỒNG KINH TẾ' : 'BẢNG BÁO GIÁ'}
                </div>
                <div className="text-sm font-black font-mono text-blue-700">{documentNumber}</div>
                <div className="text-[11px] text-slate-500 mt-1">Ngày lập: {documentDate}</div>
                {validUntilDate && (
                  <div className="text-[11px] text-slate-500">Hiệu lực đến: {validUntilDate}</div>
                )}
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2">
              <h2 className="text-xl font-black uppercase tracking-wide text-slate-900">
                {isContract ? 'HỢP ĐỒNG CUNG CẤP GIẢI PHÁP PHẦN MỀM' : 'BẢNG BÁO GIÁ SẢN PHẨM & DỊCH VỤ CRM'}
              </h2>
            </div>

            {/* Party Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-800 border-b border-slate-200 pb-1 mb-1.5">
                  Đơn vị cung cấp (Bên A):
                </div>
                <div>Đại diện: <strong>CÔNG TY CP CÔNG NGHỆ SMARTCRM</strong></div>
                <div>MST: <strong>0108999888</strong></div>
                <div>Hotline: <strong>1900 6868</strong></div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase text-[11px] text-blue-800 border-b border-slate-200 pb-1 mb-1.5">
                  Khách hàng / Đối tác (Bên B):
                </div>
                <div>Tên đơn vị: <strong className="text-slate-900">{clientName}</strong></div>
                <div>Mã số thuế: <strong>{clientTaxCode || 'Chưa cập nhật'}</strong></div>
                <div>Địa chỉ: <strong>{clientAddress || 'Hà Nội, Việt Nam'}</strong></div>
                <div>Điện thoại: <strong>{clientPhone || '0901 234 567'}</strong></div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 p-2 text-center w-10">STT</th>
                    <th className="border border-slate-300 p-2 text-left">Tên Hàng hóa / Dịch vụ</th>
                    <th className="border border-slate-300 p-2 text-center w-16">ĐVT</th>
                    <th className="border border-slate-300 p-2 text-right w-16">SL</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Đơn giá (₫)</th>
                    <th className="border border-slate-300 p-2 text-right w-28">Thành tiền (₫)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-400">
                        Chưa có hạng mục sản phẩm / dịch vụ nào trong tài liệu này
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          {item.sku && <div className="text-[10px] text-slate-500 font-mono">Mã: {item.sku}</div>}
                        </td>
                        <td className="border border-slate-300 p-2 text-center">{item.unit || 'Gói'}</td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-semibold">{item.quantity}</td>
                        <td className="border border-slate-300 p-2 text-right font-mono">
                          {item.unitPrice.toLocaleString('vi-VN')}
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-900">
                          {item.totalAmount.toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary & Totals */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-xs pt-2">
              <div className="space-y-1.5 flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Số tiền bằng chữ:</div>
                <div className="font-bold text-blue-900 italic text-xs leading-relaxed">
                  {formatVietnameseReading(grandTotal, 'đồng')}
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tiền hàng (Tạm tính):</span>
                  <span className="font-semibold">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Chiết khấu thương mại:</span>
                    <span>-{discountTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {taxTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Thuế GTGT (VAT 10%):</span>
                    <span>+{taxTotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-blue-700">{grandTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800 uppercase text-[10px]">Điều khoản thương mại & Bảo hành:</div>
              <p>1. Báo giá / Hợp đồng đã bao gồm chi phí bản quyền sử dụng phần mềm và hỗ trợ kỹ thuật 24/7 trong 12 tháng.</p>
              <p>2. Phương thức thanh toán: Chuyển khoản ngân hàng 100% trong vòng 15 ngày kể từ ngày nghiệm thu bàn giao.</p>
              <p>3. Mọi tranh chấp phát sinh sẽ được giải quyết trên tinh thần thương lượng và tuân thủ Pháp luật Việt Nam.</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs">
              <div className="space-y-14">
                <div>
                  <div className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN B (KHÁCH HÀNG)</div>
                  <div className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên và đóng dấu)</div>
                </div>
                <div className="font-bold text-slate-800">{clientRepresentative || clientName}</div>
              </div>

              <div className="space-y-14">
                <div>
                  <div className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN A (SMARTCRM)</div>
                  <div className="text-[11px] text-slate-400 italic">(Ký, ghi rõ họ tên và đóng dấu)</div>
                </div>
                <div className="font-bold text-slate-800">Tổng Giám Đốc</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
