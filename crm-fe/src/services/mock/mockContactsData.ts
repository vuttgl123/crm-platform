export interface ContactItem {
  id: string;
  fullName: string;
  salutation?: 'MR' | 'MS' | 'MRS' | 'DR';
  jobTitle: string;
  department: string;
  accountId: string;
  accountName: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimaryContact: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  city: string;
  createdAt: string;
  lastContactedAt?: string;
}

export const INITIAL_MOCK_CONTACTS: ContactItem[] = [
  {
    id: 'ct-001',
    fullName: 'Trần Minh Đức',
    salutation: 'MR',
    jobTitle: 'Giám đốc Công nghệ (CTO)',
    department: 'Ban Công nghệ & Chuyển đổi số',
    accountId: 'acc-001',
    accountName: 'Tập đoàn Công nghệ FPT Software',
    email: 'duc.tran@fpt-software.com',
    phone: '024 7300 7300',
    mobile: '0912 345 678',
    isPrimaryContact: true,
    status: 'ACTIVE',
    city: 'Hà Nội',
    createdAt: '2026-01-15',
    lastContactedAt: '2026-08-12',
  },
  {
    id: 'ct-002',
    fullName: 'Nguyễn Thị Thu Hà',
    salutation: 'MS',
    jobTitle: 'Trưởng phòng Mua sắm & Đấu thầu',
    department: 'Phòng Cung ứng & Mua sắm',
    accountId: 'acc-002',
    accountName: 'Tập đoàn Vingroup JSC',
    email: 'ha.ntt@vingroup.net',
    phone: '024 3974 9999',
    mobile: '0988 123 456',
    isPrimaryContact: true,
    status: 'ACTIVE',
    city: 'Hà Nội',
    createdAt: '2026-02-10',
    lastContactedAt: '2026-08-14',
  },
  {
    id: 'ct-003',
    fullName: 'Lê Hoàng Nam',
    salutation: 'MR',
    jobTitle: 'Giám đốc Kinh doanh Toàn quốc',
    department: 'Khối Kinh doanh Doanh nghiệp',
    accountId: 'acc-003',
    accountName: 'Tổng Công ty Viễn thông Viettel',
    email: 'namlh@viettel.com.vn',
    phone: '024 6255 6789',
    mobile: '0977 888 999',
    isPrimaryContact: false,
    status: 'ACTIVE',
    city: 'Hà Nội',
    createdAt: '2026-03-01',
    lastContactedAt: '2026-08-10',
  },
  {
    id: 'ct-004',
    fullName: 'Phạm Quỳnh Nga',
    salutation: 'MRS',
    jobTitle: 'Phó Tổng Giám đốc Vận hành',
    department: 'Ban Điều hành',
    accountId: 'acc-004',
    accountName: 'Công ty CP Sữa Việt Nam (Vinamilk)',
    email: 'pqnga@vinamilk.com.vn',
    phone: '028 5415 5555',
    mobile: '0903 111 222',
    isPrimaryContact: true,
    status: 'ACTIVE',
    city: 'TP. Hồ Chí Minh',
    createdAt: '2026-03-20',
    lastContactedAt: '2026-08-05',
  },
  {
    id: 'ct-005',
    fullName: 'Vũ Quốc Toàn',
    salutation: 'MR',
    jobTitle: 'Trưởng phòng IT',
    department: 'Phòng CNTT',
    accountId: 'acc-005',
    accountName: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    email: 'toanvq.ho@vietcombank.com.vn',
    phone: '024 3934 3137',
    mobile: '0915 666 777',
    isPrimaryContact: false,
    status: 'ACTIVE',
    city: 'Hà Nội',
    createdAt: '2026-04-12',
    lastContactedAt: '2026-08-13',
  },
  {
    id: 'ct-006',
    fullName: 'Đỗ Thùy Linh',
    salutation: 'MS',
    jobTitle: 'Chuyên viên Quản trị Hệ thống',
    department: 'Khối Vận hành Công nghệ',
    accountId: 'acc-006',
    accountName: 'Công ty CP Thế Giới Di Động (MWG)',
    email: 'linh.dothuy@thegioididong.com',
    phone: '028 3812 5960',
    mobile: '0934 222 333',
    isPrimaryContact: false,
    status: 'INACTIVE',
    city: 'TP. Hồ Chí Minh',
    createdAt: '2026-05-18',
    lastContactedAt: '2026-06-25',
  },
  {
    id: 'ct-007',
    fullName: 'Hoàng Văn Bách',
    salutation: 'MR',
    jobTitle: 'Giám đốc Chi nhánh Đà Nẵng',
    department: 'Chi nhánh Miền Trung',
    accountId: 'acc-007',
    accountName: 'Công ty CP Tập đoàn Masan',
    email: 'bach.hoang@masangroup.com',
    phone: '0236 388 9999',
    mobile: '0905 444 555',
    isPrimaryContact: true,
    status: 'ACTIVE',
    city: 'Đà Nẵng',
    createdAt: '2026-06-02',
    lastContactedAt: '2026-08-11',
  },
];

let contactsStore = [...INITIAL_MOCK_CONTACTS];

export const mockContactsApi = {
  list: async (params?: {
    search?: string;
    accountId?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    let result = [...contactsStore];

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.accountName.toLowerCase().includes(q) ||
          c.jobTitle.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter((c) => c.status === params.status);
    }

    if (params?.accountId) {
      result = result.filter((c) => c.accountId === params.accountId);
    }

    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = result.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = result.slice(page * size, (page + 1) * size);

    return {
      content,
      totalElements,
      totalPages,
      page,
      size,
    };
  },

  getById: async (id: string) => {
    return contactsStore.find((c) => c.id === id) || null;
  },

  create: async (data: Omit<ContactItem, 'id' | 'createdAt'>) => {
    const newItem: ContactItem = {
      ...data,
      id: `ct-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    contactsStore.unshift(newItem);
    return newItem;
  },

  update: async (id: string, data: Partial<ContactItem>) => {
    const index = contactsStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      contactsStore[index] = { ...contactsStore[index], ...data };
      return contactsStore[index];
    }
    throw new Error('Contact not found');
  },

  delete: async (id: string) => {
    contactsStore = contactsStore.filter((c) => c.id !== id);
    return true;
  },
};
