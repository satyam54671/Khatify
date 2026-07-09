import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  ChevronRight,
  Moon,
  Sun,
  Palette,
  Receipt,
  FileText,
  Clock,
  IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/app/ThemeProvider';

type SettingsTab = 'general' | 'billing' | 'notifications' | 'security';

const TABS: { id: SettingsTab; label: string; icon: typeof SettingsIcon }[] = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { theme, setTheme } = useTheme();

  // Mock form data
  const [companyName, setCompanyName] = useState('Khatify Business Solutions');
  const [companyEmail, setCompanyEmail] = useState('accounts@khatify.com');
  const [companyPhone, setCompanyPhone] = useState('+91 98765 43210');
  const [companyAddress, setCompanyAddress] = useState('100 Pine Street, Suite 1200, Mumbai, MH 400001');
  const [currency, setCurrency] = useState('INR');
  const [taxRate, setTaxRate] = useState('18');
  const [paymentTerms, setPaymentTerms] = useState('net_15');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for your business! Payment is due within the specified terms.');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-[15px] font-medium text-muted-foreground mt-1">
            Manage your business profile, preferences, and application configuration.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto hidden lg:block" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <>
              {/* Business Profile */}
              <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-transparent">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    Business Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-6 pb-6 border-b border-border/40">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-3xl shadow-sm ring-4 ring-background">
                      K
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{companyName}</h3>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">Business Platform · Active Plan</p>
                      <Button variant="outline" size="sm" className="mt-3 rounded-full text-xs font-semibold px-4 h-8">
                        Change Logo
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" /> Company Name
                      </label>
                      <Input className="h-11 rounded-lg" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" /> Email Address
                      </label>
                      <Input className="h-11 rounded-lg" type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" /> Phone Number
                      </label>
                      <Input className="h-11 rounded-lg" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Website
                      </label>
                      <Input className="h-11 rounded-lg" placeholder="www.khatify.com" />
                    </div>
                  </div>

                  {/* Tax Information for Indian Merchants */}
                  <div className="grid gap-5 sm:grid-cols-2 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> GSTIN (Optional)
                      </label>
                      <Input className="h-11 rounded-lg uppercase" placeholder="e.g. 27ABCDE1234F1Z5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" /> PAN Number
                      </label>
                      <Input className="h-11 rounded-lg uppercase" placeholder="e.g. ABCDE1234F" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" /> Business Address
                    </label>
                    <Input className="h-11 rounded-lg" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <Button className="gap-2 rounded-full font-semibold px-8 shadow-sm">
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Appearance */}
              <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-transparent">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Theme Preference</h4>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">Choose how the application looks to you.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40">
                      {[
                        { value: 'light' as const, icon: Sun, label: 'Light' },
                        { value: 'dark' as const, icon: Moon, label: 'Dark' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setTheme(opt.value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            theme === opt.value
                              ? 'bg-background dark:bg-zinc-800 text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-transparent">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  Invoice & Billing Defaults
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <IndianRupee className="h-3.5 w-3.5" /> Default Currency
                    </label>
                    <Select className="h-11 rounded-lg" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="INR">₹ Indian Rupee (INR)</option>
                      <option value="USD">$ US Dollar (USD)</option>
                      <option value="EUR">€ Euro (EUR)</option>
                      <option value="GBP">£ British Pound (GBP)</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">GST / Tax Rate (%)</label>
                    <Input type="number" className="h-11 rounded-lg" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Payment Terms
                    </label>
                    <Select className="h-11 rounded-lg" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                      <option value="due_on_receipt">Due on Receipt</option>
                      <option value="net_7">Net 7 Days</option>
                      <option value="net_15">Net 15 Days</option>
                      <option value="net_30">Net 30 Days</option>
                      <option value="net_60">Net 60 Days</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> Invoice Prefix
                    </label>
                    <Input className="h-11 rounded-lg" placeholder="INV-" defaultValue="INV-" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Default Invoice Footer</label>
                  <Input className="h-11 rounded-lg" value={invoiceFooter} onChange={e => setInvoiceFooter(e.target.value)} />
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button className="gap-2 rounded-full font-semibold px-8 shadow-sm">
                    <Save className="h-4 w-4" /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-transparent">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-1">
                {[
                  { title: 'Invoice Reminders', desc: 'Get notified when invoices are approaching due dates or overdue.', enabled: true },
                  { title: 'Payment Alerts', desc: 'Receive alerts when payments are recorded against customer accounts.', enabled: true },
                  { title: 'Low Stock Alerts', desc: 'Get notified when inventory items fall below minimum threshold.', enabled: true },
                  { title: 'Weekly Summary', desc: 'Receive a weekly email digest of business performance metrics.', enabled: false },
                  { title: 'New Customer Registration', desc: 'Get notified when a new customer profile is created.', enabled: false },
                  { title: 'System Updates', desc: 'Stay informed about platform updates, maintenance, and new features.', enabled: true },
                ].map((notif, idx) => (
                  <div key={notif.title} className={`flex items-center justify-between py-5 ${idx > 0 ? 'border-t border-border/40' : ''}`}>
                    <div className="flex-1 pr-4">
                      <h4 className="font-semibold text-foreground text-[15px]">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked={notif.enabled} />
                      <div className="w-11 h-6 bg-muted/80 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm" />
                    </label>
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button className="gap-2 rounded-full font-semibold px-8 shadow-sm">
                    <Save className="h-4 w-4" /> Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-transparent">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Current Password</label>
                    <Input type="password" className="h-11 rounded-lg" placeholder="Enter current password" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">New Password</label>
                      <Input type="password" className="h-11 rounded-lg" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Confirm New Password</label>
                      <Input type="password" className="h-11 rounded-lg" placeholder="Confirm new password" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/40">
                    <Button className="gap-2 rounded-full font-semibold px-8 shadow-sm">
                      <Save className="h-4 w-4" /> Update Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        Two-Factor Authentication
                        <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-50 dark:bg-amber-900/30 text-[10px] font-bold uppercase px-2 py-0.5">Disabled</Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">Add an extra layer of security with 2FA via authenticator app or SMS.</p>
                    </div>
                    <Button variant="outline" className="rounded-full font-semibold px-6 shrink-0">
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-rose-200 dark:border-rose-800/50 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-rose-600 dark:text-rose-400">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Button variant="outline" className="rounded-full font-semibold px-6 shrink-0 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
