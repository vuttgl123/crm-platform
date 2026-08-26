import React from 'react';
import { EditorialSection } from '../components/EditorialSection';
import { EditorialEyebrow } from '../components/EditorialEyebrow';
import { FadeIn } from '../components/FadeIn';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqItem {
  question: string;
  answer: string;
}

const faqList: FaqItem[] = [
  {
    question: 'Chuyển dữ liệu từ Excel hoặc CRM cũ sang VUM CRM mất bao lâu?',
    answer:
      'Thông thường quá trình chuyển đổi dữ liệu mất từ 1 đến 3 ngày làm việc. Đội ngũ chuyên gia kỹ thuật của chúng tôi sẽ hỗ trợ doanh nghiệp chuẩn hóa, map các trường dữ liệu danh bạ, lịch sử deal và import hoàn toàn miễn phí.',
  },
  {
    question: 'Phần mềm có chạy được khi nhân viên sales mất kết nối mạng (offline) không?',
    answer:
      'Ứng dụng di động (iOS & Android) hỗ trợ chế độ lưu cache cục bộ, cho phép nhân sự tra cứu danh bạ và ghi chú biên bản cuộc họp khi đi thị trường ngoài vùng sóng. Khi có mạng trở lại, hệ thống sẽ tự động đồng bộ lên máy chủ.',
  },
  {
    question: 'Chi phí được tính theo số lượng người dùng (user) hay theo số lượng deal?',
    answer:
      'Chi phí dịch vụ được tính cố định theo số lượng tài khoản người dùng (user) thực tế đăng ký hàng tháng. Doanh nghiệp không bị giới hạn số lượng khách hàng, số lượng báo giá hay số lượng hợp đồng tạo ra trên hệ thống.',
  },
  {
    question: 'Hệ thống có Open API để tích hợp phần mềm kế toán hoặc ERP có sẵn không?',
    answer:
      'Có. VUM CRM cung cấp hệ thống Open REST API và Webhooks chuẩn hóa, sẵn sàng kết nối và đồng bộ 2 chiều dữ liệu khách hàng, hóa đơn và trạng thái hợp đồng với MISA, FAST, Bravo, SAP và các hệ thống ERP nội bộ.',
  },
  {
    question: 'Ai là người trực tiếp hỗ trợ doanh nghiệp trong quá trình triển khai?',
    answer:
      'Mỗi khách hàng doanh nghiệp sẽ có một Chuyên gia Giải pháp (Solution Specialist) chuyên trách đồng hành trực tiếp từ khâu khảo sát luồng duyệt, thiết lập ma trận chiết khấu CPQ đến đào tạo sử dụng cho toàn bộ nhân sự.',
  },
  {
    question: 'Thời hạn hợp đồng dịch vụ tối thiểu là bao lâu?',
    answer:
      'Thời hạn hợp đồng dịch vụ tối thiểu là 12 tháng. Doanh nghiệp được áp dụng chính sách cam kết hoàn tiền trong 30 ngày đầu tiên nếu hệ thống không đáp ứng đúng yêu cầu vận hành đã thống nhất.',
  },
];

export const FaqSection: React.FC = () => {
  return (
    <EditorialSection id="faq" className="w-full">
      <FadeIn>
        <div className="max-w-3xl">
          <EditorialEyebrow>Hỏi đáp thường gặp</EditorialEyebrow>
          <h2 className="editorial-h2">
            Những thắc mắc phổ biến trước khi triển khai
          </h2>
          <p className="editorial-body text-[#57534E] text-[17px] mt-3">
            Giải đáp minh bạch về kỹ thuật, chi phí và quy trình chuyển đổi dữ liệu.
          </p>
        </div>
      </FadeIn>

      {/* Accordion with Smooth Sliding Height Animation (Shadcn / Radix UI) */}
      <div className="mt-12 sm:mt-16 w-full max-w-4xl">
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-0">
          {faqList.map((faq, index) => (
            <FadeIn key={faq.question} stagger={((Math.min(index + 1, 5)) as 1 | 2 | 3 | 4 | 5)}>
              <AccordionItem
                value={`item-${index}`}
                className="border-b border-[#E7E5E4] py-2 border-t-0"
              >
                <AccordionTrigger className="text-left font-semibold text-[18px] text-[#1C1917] hover:text-[#1D4ED8] hover:no-underline py-5 group transition-colors duration-150">
                  <span className="group-hover:text-[#1D4ED8] transition-colors">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-[16px] leading-relaxed text-[#57534E] pb-6 pr-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </FadeIn>
          ))}
        </Accordion>
      </div>
    </EditorialSection>
  );
};

export default FaqSection;
