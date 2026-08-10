export interface OverviewKPI {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  icon: string;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number; // In Millions VND
  target: number;  // In Millions VND
}

export interface PipelineStageData {
  stage: string;
  count: number;
  value: number; // In Millions VND
  percentage: number;
  color: string;
}

export interface LeadSourceData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface ProductRevenueData {
  product: string;
  revenue: number; // In Millions VND
  deals: number;
}

export interface TopDeal {
  id: string;
  customerName: string;
  company: string;
  value: number; // In Millions VND
  stage: string;
  probability: number;
  ownerName: string;
  ownerAvatar: string;
  expectedClose: string;
}

export interface RecentActivity {
  id: string;
  type: 'DEAL' | 'CUSTOMER' | 'CALL' | 'MEETING';
  title: string;
  description: string;
  timeAgo: string;
  user: string;
}

export interface PendingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
  relatedTo: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  dealsClosed: number;
  revenue: number; // In Millions VND
  quotaPercentage: number;
}

export interface CampaignPerformance {
  id: string;
  name: string;
  leads: number;
  deals: number;
  roi: string;
  conversionRate: number;
}

export interface CustomerHealthMetric {
  title: string;
  value: string;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING';
  detail: string;
}

export const OVERVIEW_KPI_DATA: OverviewKPI[] = [
  {
    title: 'Doanh thu Dự kiến',
    value: '1.850.000.000 ₫',
    change: '+14.2%',
    isPositive: true,
    subtext: 'so với tháng trước',
    icon: 'DollarSign',
  },
  {
    title: 'Cơ hội Kinh doanh',
    value: '42 Hợp đồng',
    change: '+8 deals',
    isPositive: true,
    subtext: 'đang trong pipeline',
    icon: 'Briefcase',
  },
  {
    title: 'Khách hàng Khả thi',
    value: '128 Leads',
    change: '+24.5%',
    isPositive: true,
    subtext: 'nguồn Marketing & Referral',
    icon: 'Users',
  },
  {
    title: 'Tỷ lệ Chốt thành công',
    value: '34.8%',
    change: '+3.1%',
    isPositive: true,
    subtext: 'KPI quy chuẩn 30%',
    icon: 'TrendingUp',
  },
  {
    title: 'Chu kỳ Bán hàng TB',
    value: '18 Ngày',
    change: '-2.4 ngày',
    isPositive: true,
    subtext: 'rút ngắn thời gian chốt',
    icon: 'Clock',
  },
  {
    title: 'Giá trị Hợp đồng TB',
    value: '145.000.000 ₫',
    change: '+5.8%',
    isPositive: true,
    subtext: 'quy mô đơn trung bình',
    icon: 'Award',
  },
];

export const MONTHLY_REVENUE_DATA: MonthlyRevenueData[] = [
  { month: 'T3/2026', revenue: 980, target: 1000 },
  { month: 'T4/2026', revenue: 1250, target: 1100 },
  { month: 'T5/2026', revenue: 1420, target: 1300 },
  { month: 'T6/2026', revenue: 1350, target: 1400 },
  { month: 'T7/2026', revenue: 1680, target: 1500 },
  { month: 'T8/2026', revenue: 1850, target: 1600 },
];

export const PIPELINE_STAGE_DATA: PipelineStageData[] = [
  { stage: 'Tiếp cận ban đầu', count: 18, value: 450, percentage: 85, color: '#3b82f6' },
  { stage: 'Phân tích nhu cầu', count: 12, value: 680, percentage: 65, color: '#8b5cf6' },
  { stage: 'Gửi Báo giá & Proposal', count: 8, value: 520, percentage: 45, color: '#f59e0b' },
  { stage: 'Đang thương lượng', count: 6, value: 410, percentage: 30, color: '#ec4899' },
  { stage: 'Chốt Hợp đồng', count: 4, value: 290, percentage: 15, color: '#10b981' },
];

export const LEAD_SOURCE_DATA: LeadSourceData[] = [
  { name: 'Inbound Website', value: 48, percentage: 38, color: '#3b82f6' },
  { name: 'Giới thiệu (Referral)', value: 33, percentage: 26, color: '#10b981' },
  { name: 'Outreach & Cold Call', value: 28, percentage: 22, color: '#f59e0b' },
  { name: 'Sự kiện & Hội thảo', value: 19, percentage: 14, color: '#8b5cf6' },
];

export const PRODUCT_REVENUE_DATA: ProductRevenueData[] = [
  { product: 'VUM CRM Enterprise', revenue: 850, deals: 14 },
  { product: 'VUM CRM Professional', revenue: 520, deals: 18 },
  { product: 'Dịch vụ Tùy biến Custom', revenue: 320, deals: 5 },
  { product: 'Gói Starter SMB', revenue: 160, deals: 25 },
];

export const TOP_DEALS_DATA: TopDeal[] = [
  {
    id: 'DEAL-001',
    customerName: 'Nguyễn Văn Minh',
    company: 'Công ty Cổ phần Tập đoàn Hòa Phát',
    value: 450000000,
    stage: 'Đang thương lượng',
    probability: 85,
    ownerName: 'Phạm Tuấn Vũ',
    ownerAvatar: 'PV',
    expectedClose: '15/08/2026',
  },
  {
    id: 'DEAL-002',
    customerName: 'Trần Thị Thu Hà',
    company: 'Ngân hàng TMCP Quân Đội (MB Bank)',
    value: 380000000,
    stage: 'Gửi Báo giá',
    probability: 70,
    ownerName: 'Nguyễn Đức Anh',
    ownerAvatar: 'DA',
    expectedClose: '20/08/2026',
  },
  {
    id: 'DEAL-003',
    customerName: 'Lê Hoàng Nam',
    company: 'Tổng Công ty Viễn thông Viettel',
    value: 320000000,
    stage: 'Chốt Hợp đồng',
    probability: 95,
    ownerName: 'Đặng Ngọc Kim',
    ownerAvatar: 'NK',
    expectedClose: '12/08/2026',
  },
  {
    id: 'DEAL-004',
    customerName: 'Phạm Bảo Ngọc',
    company: 'Tập đoàn Vingroup',
    value: 290000000,
    stage: 'Phân tích nhu cầu',
    probability: 50,
    ownerName: 'Phạm Tuấn Vũ',
    ownerAvatar: 'PV',
    expectedClose: '28/08/2026',
  },
  {
    id: 'DEAL-005',
    customerName: 'Vũ Quốc Khánh',
    company: 'Công ty TNHH FPT Software',
    value: 210000000,
    stage: 'Tiếp cận ban đầu',
    probability: 30,
    ownerName: 'Nguyễn Đức Anh',
    ownerAvatar: 'DA',
    expectedClose: '30/08/2026',
  },
  {
    id: 'DEAL-006',
    customerName: 'Đỗ Mạnh Cường',
    company: 'Công ty Cổ phần MISA',
    value: 180000000,
    stage: 'Gửi Báo giá',
    probability: 65,
    ownerName: 'Đặng Ngọc Kim',
    ownerAvatar: 'NK',
    expectedClose: '22/08/2026',
  },
];

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: 'ACT-101',
    type: 'DEAL',
    title: 'Hợp đồng MB Bank được cập nhật',
    description: 'Đã hoàn thiện báo giá gói Enterprise 380tr VNĐ',
    timeAgo: '10 phút trước',
    user: 'Trần Thị Thu Hà',
  },
  {
    id: 'ACT-102',
    type: 'CALL',
    title: 'Cuộc gọi tư vấn thành công',
    description: 'Liên hệ anh Lê Hoàng Nam xác nhận điều khoản hợp đồng Viettel',
    timeAgo: '35 phút trước',
    user: 'Đặng Ngọc Kim',
  },
  {
    id: 'ACT-103',
    type: 'CUSTOMER',
    title: 'Khách hàng tiềm năng mới',
    description: 'Thêm mới Lead "Công ty TNHH Sữa TH True Milk" từ Website',
    timeAgo: '2 giờ trước',
    user: 'Hệ thống CRM',
  },
  {
    id: 'ACT-104',
    type: 'MEETING',
    title: 'Lịch họp Demo giải pháp',
    description: 'Họp demo VUM CRM với Ban Giám đốc Hòa Phát qua Google Meet',
    timeAgo: '4 giờ trước',
    user: 'Phạm Tuấn Vũ',
  },
];

export const PENDING_TASKS_DATA: PendingTask[] = [
  {
    id: 'TASK-1',
    title: 'Họp chốt điều khoản dịch vụ với Ban Giám đốc Hòa Phát',
    dueDate: 'Hôm nay, 15:30',
    priority: 'HIGH',
    completed: false,
    relatedTo: 'Hòa Phát Group',
  },
  {
    id: 'TASK-2',
    title: 'Gửi lại bản thảo Báo giá bổ sung cho MB Bank',
    dueDate: 'Ngày mai, 10:00',
    priority: 'HIGH',
    completed: false,
    relatedTo: 'MB Bank',
  },
  {
    id: 'TASK-3',
    title: 'Gọi điện chăm sóc khách hàng sau demo Viettel',
    dueDate: '12/08/2026',
    priority: 'MEDIUM',
    completed: true,
    relatedTo: 'Viettel Telecom',
  },
  {
    id: 'TASK-4',
    title: 'Rà soát hợp đồng pháp lý cho gói Vingroup Enterprise',
    dueDate: '14/08/2026',
    priority: 'LOW',
    completed: false,
    relatedTo: 'Vingroup',
  },
];

export const CAMPAIGN_PERFORMANCE_DATA: CampaignPerformance[] = [
  {
    id: 'CAMP-1',
    name: 'Chiến dịch Q3 Digital B2B LeadGen',
    leads: 64,
    deals: 18,
    roi: '4.2x ROI',
    conversionRate: 28.1,
  },
  {
    id: 'CAMP-2',
    name: 'Hội thảo Giải pháp CRM 2026 (Webinar)',
    leads: 42,
    deals: 14,
    roi: '5.1x ROI',
    conversionRate: 33.3,
  },
  {
    id: 'CAMP-3',
    name: 'Email Marketing Nurturing Q2',
    leads: 38,
    deals: 9,
    roi: '3.6x ROI',
    conversionRate: 23.6,
  },
];

export const CUSTOMER_HEALTH_DATA: CustomerHealthMetric[] = [
  {
    title: 'Chỉ số Hài lòng CSAT',
    value: '94.6%',
    status: 'EXCELLENT',
    detail: 'Khảo sát 120 doanh nghiệp',
  },
  {
    title: 'Tỷ lệ Giữ chân (Retention)',
    value: '92.4%',
    status: 'EXCELLENT',
    detail: 'Gia hạn hợp đồng hàng năm',
  },
  {
    title: 'Chỉ số Quảng bá NPS',
    value: '+68 Score',
    status: 'EXCELLENT',
    detail: 'Tỷ lệ Promoters vượt bậc',
  },
  {
    title: 'SLA Hỗ trợ Kỹ thuật',
    value: '100% SLA',
    status: 'EXCELLENT',
    detail: '12/12 Yêu cầu đã giải quyết',
  },
];

export const TOP_PERFORMERS: TopPerformer[] = [
  {
    id: 'PERF-1',
    name: 'Phạm Tuấn Vũ',
    role: 'Senior Account Executive',
    avatar: 'PV',
    dealsClosed: 8,
    revenue: 740,
    quotaPercentage: 123,
  },
  {
    id: 'PERF-2',
    name: 'Nguyễn Đức Anh',
    role: 'Enterprise Sales Spec',
    avatar: 'DA',
    dealsClosed: 6,
    revenue: 590,
    quotaPercentage: 105,
  },
  {
    id: 'PERF-3',
    name: 'Đặng Ngọc Kim',
    role: 'Account Executive',
    avatar: 'NK',
    dealsClosed: 5,
    revenue: 480,
    quotaPercentage: 96,
  },
];
