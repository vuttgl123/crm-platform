import React, { useState } from 'react';
import { useAuth } from '@/core/session/useAuth';
import { toast } from 'sonner';
import { ProfileHeaderCard } from '@/components/common/ProfileHeaderCard';
import {
  User,
  Shield,
  Key,
  Clock,
  Building,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Camera,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
  Users,
  FileText,
  LifeBuoy,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface PermissionMeta {
  id: string;
  name: string;
  desc: string;
}

const PERMISSION_GROUPS: { module: string; title: string; icon: React.ElementType; items: PermissionMeta[] }[] = [
  {
    module: 'crm',
    title: 'Customer, Lead & Opportunity Management (CRM)',
    icon: Users,
    items: [
      { id: 'crm_account.read', name: 'View Account List & Details', desc: 'Access business and individual customer profiles' },
      { id: 'crm_account.write', name: 'Create & Update Accounts', desc: 'Create, edit company details, identifiers, and billing addresses' },
      { id: 'crm_contact.read', name: 'View Contact Details', desc: 'Access partner and client contact representatives' },
      { id: 'crm_contact.write', name: 'Create & Edit Contacts', desc: 'Update phone numbers, emails, and job titles' },
      { id: 'crm_lead.read', name: 'View Inbound Leads', desc: 'Track leads collected from website and inbound marketing campaigns' },
      { id: 'crm_lead.write', name: 'Assign & Qualify Leads', desc: 'Assign leads to sales reps and update qualification status' },
      { id: 'crm_opportunity.read', name: 'View Opportunity Pipeline', desc: 'Track sales deals, deal values, and closing probabilities' },
      { id: 'crm_opportunity.write', name: 'Update Deal Stages & Value', desc: 'Advance deal stages and modify expected revenue' },
    ],
  },
  {
    module: 'sales',
    title: 'Sales, Quotes & Orders',
    icon: FileText,
    items: [
      { id: 'sales_quote.read', name: 'View Quotations & Terms', desc: 'Access quotation details, discount structures, and line items' },
      { id: 'sales_quote.write', name: 'Create & Draft Quotations', desc: 'Generate new quote drafts and submit for approval' },
      { id: 'sales_quote.approve', name: 'Approve Quotes & Discounts', desc: 'Authority to approve special discount tiers and custom pricing' },
      { id: 'sales_order.read', name: 'View Sales Orders & Contracts', desc: 'Access commercial contracts and order fulfillment status' },
      { id: 'sales_order.write', name: 'Create & Confirm Orders', desc: 'Generate official sales orders and dispatch confirmations' },
    ],
  },
  {
    module: 'service',
    title: 'Customer Service & Support',
    icon: LifeBuoy,
    items: [
      { id: 'service_ticket.read', name: 'View Support Tickets', desc: 'Track customer incidents, issues, and inquiries' },
      { id: 'service_ticket.write', name: 'Manage & Resolve Tickets', desc: 'Update resolution status and dispatch client responses' },
    ],
  },
  {
    module: 'platform',
    title: 'Security & Platform Administration',
    icon: ShieldCheck,
    items: [
      { id: 'platform_user.manage', name: 'Manage Users & Role Assignments', desc: 'Invite members, assign roles, and manage permissions' },
      { id: 'audit_read', name: 'View Audit Logs', desc: 'Access immutable activity and data change history' },
      { id: 'privacy_consent.read', name: 'View Privacy Consents', desc: 'Verify customer data processing consent status (Compliance/GDPR)' },
      { id: 'privacy_consent.write', name: 'Update Privacy Policies', desc: 'Manage data protection agreements and consent forms' },
    ],
  },
];

export const UserProfilePage: React.FC = () => {
  const { session } = useAuth();

  // Personal Info Form State
  const [displayName, setDisplayName] = useState(session?.user.display_name || '');
  const [email] = useState(session?.user.email || '');
  const [phone, setPhone] = useState((session?.user as any)?.phone || '');
  const [jobTitle, setJobTitle] = useState(
    session?.membership?.is_tenant_admin
      ? 'Tenant Administrator'
      : session?.activeRole?.name || 'Enterprise Member'
  );
  const [department, setDepartment] = useState(session?.tenant?.display_name || 'Executive Directorate');
  const [employeeCode] = useState(
    session?.membership?.user_id
      ? `EMP-${session.membership.user_id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`
      : `EMP-${session?.user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'USER'}`
  );
  const [timezone, setTimezone] = useState(session?.tenant?.default_timezone || 'Asia/Ho_Chi_Minh');
  const [isSaving, setIsSaving] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Collapsible Open/Closed State for Permission Groups
  const [openGroupMap, setOpenGroupMap] = useState<Record<string, boolean>>({});

  if (!session) return null;

  const toggleGroup = (moduleKey: string) => {
    setOpenGroupMap((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleExpandAll = () => {
    const allOpen: Record<string, boolean> = {};
    PERMISSION_GROUPS.forEach((g) => {
      allOpen[g.module] = true;
    });
    setOpenGroupMap(allOpen);
  };

  const handleCollapseAll = () => {
    setOpenGroupMap({});
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully!');
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 12) {
      toast.error('New password must contain at least 12 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setIsChangingPass(true);
    setTimeout(() => {
      setIsChangingPass(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    }, 600);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const areAllOpen = PERMISSION_GROUPS.every((g) => openGroupMap[g.module]);

  return (
    <ProfileHeaderCard
      coverTag="Verified System Identity"
      avatarText={getInitials(displayName)}
      avatarAction={
        <button
          type="button"
          className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-slate-200 shadow-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
          title="Change profile avatar"
        >
          <Camera className="w-4 h-4" />
        </button>
      }
      title={displayName}
      subtitle={`${jobTitle} • ${department}`}
      verified={true}
      badges={
        <>
          {session.tenant.display_name && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold gap-1.5 text-xs py-1 px-3">
              <Building className="w-3.5 h-3.5" />
              {session.tenant.display_name} {session.tenant.tenant_code ? `(${session.tenant.tenant_code})` : ''}
            </Badge>
          )}
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold gap-1.5 text-xs py-1 px-3">
            <Shield className="w-3.5 h-3.5" />
            {session.activeRole.name}
          </Badge>
          <Badge variant="outline" className="bg-slate-100 text-slate-700 font-mono text-xs py-1 px-3">
            Scope: {session.effectiveScopeType}
          </Badge>
        </>
      }
    >
      {/* Main Tabs Navigation */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 shadow-2xs w-full justify-start flex-wrap sm:flex-nowrap h-auto overflow-hidden">
          <TabsTrigger value="info" className="gap-2 text-xs font-semibold py-2 px-4">
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs font-semibold py-2 px-4">
            <Key className="w-4 h-4" />
            <span>Security &amp; Password</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2 text-xs font-semibold py-2 px-4">
            <Shield className="w-4 h-4" />
            <span>Roles &amp; Permissions Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 text-xs font-semibold py-2 px-4">
            <Clock className="w-4 h-4" />
            <span>Activity Log</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Information */}
        <TabsContent value="info" className="mt-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="shadow-xs border-slate-200 w-full">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">User Profile Details</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Manage your personal identity, contact channels, and system timezone
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-xs font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Full Name
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Nguyen"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Work Email (Login ID)
                    </Label>
                    <Input id="email" value={email} disabled className="bg-slate-50 font-mono text-slate-600" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Mobile Phone
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+84 988 xxx xxx"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="employeeCode" className="text-xs font-semibold flex items-center gap-1.5">
                      <Badge variant="outline" className="p-0 border-none text-slate-400">#</Badge>
                      Employee Code
                    </Label>
                    <Input id="employeeCode" value={employeeCode} disabled className="bg-slate-50 font-mono text-slate-600" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle" className="text-xs font-semibold flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Commercial Director"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-xs font-semibold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Department / Organization Unit
                    </Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Sales & Commercial Directorate"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="timezone" className="text-xs font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      System Timezone
                    </Label>
                    <Input
                      id="timezone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Organization / Tenant Info Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span>Active Organization Profile</span>
                    </h3>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>ACTIVE</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">Legal Organization Name</div>
                      <div className="font-bold text-slate-900 text-sm">{session.tenant.display_name}</div>
                      {session.tenant.legal_name && <div className="text-[11px] text-slate-500">{session.tenant.legal_name}</div>}
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">Tenant Identifier (Slug Code)</div>
                      <div className="font-mono font-bold text-blue-600 text-sm">{session.tenant.tenant_code || session.tenant.id}</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                      <div className="text-[11px] text-slate-400 font-semibold">Tenant Authority Level</div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>{session.membership.is_tenant_admin ? 'Tenant Administrator' : 'Member'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
                <Button type="submit" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Password Change Form */}
          <form onSubmit={handleChangePassword}>
            <Card className="shadow-xs border-slate-200 w-full">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  New password must contain at least 12 characters under system security policy
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password (Min. 12 characters)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
                <Button type="submit" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700" disabled={isChangingPass}>
                  <Key className="w-4 h-4" />
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* 2FA & Active Sessions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Two-Factor Authentication (2FA)
                  </span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Enabled (Authenticator)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs text-slate-600 space-y-2">
                <p>
                  Your account is protected by an Authenticator app. Each new device login requires a 6-digit OTP code.
                </p>
                <Button variant="outline" size="sm" className="text-xs mt-2">
                  Reconfigure 2FA
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Active Device Sessions
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                    1 Active Session
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Chrome on Windows 11</div>
                    <div className="text-[11px] text-slate-500">Current Session • Verified</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Active Now
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: RBAC Permissions Matrix */}
        <TabsContent value="permissions" className="mt-6 space-y-6">
          <Card className="shadow-xs border-slate-200 w-full">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Role &amp; Operations Permission Matrix</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Click each functional module below to inspect granted action permissions and data scopes
                </CardDescription>
              </div>

              {/* Action Controls: Expand/Collapse All */}
              <Button
                variant="outline"
                size="sm"
                onClick={areAllOpen ? handleCollapseAll : handleExpandAll}
                className="h-7 text-xs px-3 font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shrink-0"
              >
                {areAllOpen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Expand All
                  </>
                )}
              </Button>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-600 text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-blue-900/60 uppercase">Organization</div>
                    <div className="text-sm font-bold text-blue-950 mt-0.5">{session.tenant.display_name}</div>
                    <div className="text-[11px] text-blue-700 font-mono">Code: {session.tenant.tenant_code}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-600 text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-purple-900/60 uppercase">Assigned Role</div>
                    <div className="text-sm font-bold text-purple-950 mt-0.5">{session.activeRole.name}</div>
                    <div className="text-[11px] text-purple-700 font-mono">Code: {session.activeRole.role_code}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-600 text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-900/60 uppercase">Data Scope</div>
                    <div className="text-sm font-bold text-emerald-950 mt-0.5">{session.effectiveScopeType}</div>
                    <div className="text-[11px] text-emerald-700">Enforced by system RBAC</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Collapsible Operations Permission Matrix */}
              <div className="space-y-3">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  const isOpen = Boolean(openGroupMap[group.module]);

                  return (
                    <Collapsible
                      key={group.module}
                      open={isOpen}
                      onOpenChange={() => toggleGroup(group.module)}
                      className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all bg-white"
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="w-full bg-slate-50/90 hover:bg-slate-100/90 px-4 py-3 border-b border-transparent data-[state=open]:border-slate-200 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-white border border-slate-200 text-blue-600 shadow-2xs">
                              <GroupIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900">{group.title}</h3>
                              <p className="text-[11px] text-slate-500">Contains {group.items.length} granular operational permissions</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
                              {group.items.length} Granted
                            </Badge>
                            <div className="p-1 text-slate-400 hover:text-slate-600 transition-transform">
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="divide-y divide-slate-100 bg-white">
                        {group.items.map((item) => (
                          <div key={item.id} className="p-3.5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <h4 className="font-semibold text-xs text-slate-900">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500">{item.desc}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Granted
                              </span>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Activity Log */}
        <TabsContent value="activity" className="mt-6">
          <Card className="shadow-xs border-slate-200 w-full">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Operational Audit &amp; Session Log</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Active session authentication metadata and security audit log
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l border-slate-200 ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Active Authentication Session</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Account {session.user.email} signed into {session.tenant.display_name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleString('en-US') : 'Persistent'}
                    </span>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Assigned RBAC Security Role</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {session.activeRole?.name || 'Member'} (Data Scope: {session.effectiveScopeType || 'OWN'})
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {session.grantedPermissions?.length || 0} active permissions enforced
                    </span>
                  </div>
                </div>

                {session.user.created_at && (
                  <div className="relative pl-6">
                    <div className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      <Key className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">System User Record</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">User profile record {session.user.email} indexed in database</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Created: {new Date(session.user.created_at).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ProfileHeaderCard>
  );
};

export default UserProfilePage;
