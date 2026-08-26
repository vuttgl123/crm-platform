import React from 'react';
import { Link } from 'react-router-dom';
import { EditorialContainer } from '../components/EditorialContainer';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E7E5E4] bg-[#FAFAF9] text-[#1C1917] py-16 sm:py-20">
      <EditorialContainer>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Contact Info */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group inline-flex" aria-label="VUM CRM">
              <div className="w-7 h-7 rounded-[6px] bg-[#1C1917] flex items-center justify-center text-[#FAFAF9] font-mono font-semibold text-xs transition-colors duration-150 group-hover:bg-[#1D4ED8]">
                V
              </div>
              <span className="font-semibold text-[16px] tracking-tight text-[#1C1917] group-hover:text-[#1D4ED8] transition-colors duration-150">
                VUM CRM Platform
              </span>
            </Link>

            <p className="editorial-small max-w-sm">
              Nền tảng CRM, CPQ và tự động hóa phê duyệt báo giá cho doanh nghiệp B2B Việt Nam. Rút ngắn chu kỳ bán hàng và bảo vệ biên lợi nhuận.
            </p>

            <div className="pt-2 space-y-1.5 text-[13px] text-[#57534E]">
              <p>
                Hotline tư vấn:{' '}
                <a href="tel:0909123456" className="text-[#1C1917] font-mono tabular-nums font-semibold hover:text-[#1D4ED8] transition-colors">
                  0909.123.456
                </a>
              </p>
              <p>
                Email hỗ trợ:{' '}
                <a href="mailto:sales@vumcrm.vn" className="text-[#1C1917] font-semibold hover:text-[#1D4ED8] transition-colors">
                  sales@vumcrm.vn
                </a>
              </p>
              <p className="text-[#78716C]">Trụ sở: Tòa nhà Tech Tower, Quận Cầu Giấy, Hà Nội</p>
            </div>
          </div>

          {/* Col 2: Sản phẩm */}
          <div className="space-y-3">
            <p className="text-[12px] uppercase font-semibold tracking-wider text-[#A8A29E]">Sản phẩm</p>
            <ul className="space-y-2 text-[14px] text-[#57534E]">
              <li><a href="#solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Quản trị Pipeline</a></li>
              <li><a href="#solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Hợp đồng &amp; Audit Log</a></li>
              <li><a href="#solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Ma trận phê duyệt</a></li>
              <li><a href="#features" className="hover:text-[#1D4ED8] transition-colors duration-150">Ứng dụng Mobile</a></li>
            </ul>
          </div>

          {/* Col 3: Giải pháp */}
          <div className="space-y-3">
            <p className="text-[12px] uppercase font-semibold tracking-wider text-[#A8A29E]">Giải pháp</p>
            <ul className="space-y-2 text-[14px] text-[#57534E]">
              <li><Link to="/solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Sản xuất &amp; Phân phối</Link></li>
              <li><Link to="/solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Dược phẩm &amp; Y tế</Link></li>
              <li><Link to="/solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Bất động sản &amp; Xây dựng</Link></li>
              <li><Link to="/solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Logistics &amp; Vận tải</Link></li>
              <li><Link to="/solutions" className="hover:text-[#1D4ED8] transition-colors duration-150">Công nghệ &amp; Dịch vụ B2B</Link></li>
            </ul>
          </div>

          {/* Col 4: Pháp lý & Công ty */}
          <div className="space-y-3">
            <p className="text-[12px] uppercase font-semibold tracking-wider text-[#A8A29E]">Pháp lý &amp; Quy định</p>
            <ul className="space-y-2 text-[14px] text-[#57534E]">
              <li><a href="#security" className="hover:text-[#1D4ED8] transition-colors duration-150">Chính sách bảo mật</a></li>
              <li><a href="#security" className="hover:text-[#1D4ED8] transition-colors duration-150">Điều khoản dịch vụ</a></li>
              <li><a href="#security" className="hover:text-[#1D4ED8] transition-colors duration-150">Cam kết an toàn dữ liệu</a></li>
              <li><Link to="/pricing" className="hover:text-[#1D4ED8] transition-colors duration-150">Bảng giá dịch vụ</Link></li>
              <li><Link to="/login" className="hover:text-[#1D4ED8] transition-colors duration-150">Đăng nhập tài khoản</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#A8A29E]">
          <p>© 2026 VUM CRM Platform. Toàn bộ bản quyền được bảo lưu.</p>
        </div>
      </EditorialContainer>
    </footer>
  );
};

export default Footer;
