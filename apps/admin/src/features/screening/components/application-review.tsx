'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Home, 
  Briefcase, 
  FileText,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface RentalApplication {
  id: string;
  status: 'pending' | 'under-review' | 'approved' | 'rejected';
  submittedAt: string;
  property: {
    id: string;
    address: string;
    unit?: string;
    rent: number;
  };
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    currentAddress: string;
  };
  employment: {
    employer: string;
    position: string;
    income: number;
    employmentLength: string;
  };
  background: {
    creditScore?: number;
    evictionHistory: boolean;
    criminalHistory: boolean;
  };
  occupants: Array<{
    name: string;
    relationship: string;
    dateOfBirth: string;
  }>;
  documents: Array<{
    type: string;
    name: string;
    uploadedAt: string;
  }>;
}

interface ApplicationReviewProps {
  application: RentalApplication;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onRequestInfo?: (id: string, fields: string[]) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: Clock },
  'under-review': { label: 'Under Review', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', icon: Clock },
  approved: { label: 'Approved', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', icon: XCircle },
};

function SectionCard({ 
  title, 
  icon: Icon, 
  children,
  defaultOpen = true 
}: { 
  title: string; 
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#38BDF8]" />
          <span className="font-medium text-[#F8FAFC]">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-[#64748B]" /> : <ChevronDown className="h-4 w-4 text-[#64748B]" />}
      </button>
      {isOpen && (
        <div className="border-t border-white/8 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="mt-0.5 h-4 w-4 text-[#64748B]" />}
      <div>
        <div className="text-xs uppercase tracking-wider text-[#64748B]">{label}</div>
        <div className="text-sm text-[#F8FAFC]">{value}</div>
      </div>
    </div>
  );
}

export function ApplicationReview({
  application,
  onApprove,
  onReject,
  onRequestInfo,
}: ApplicationReviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'applicant' | 'employment' | 'documents'>('overview');
  const status = STATUS_CONFIG[application.status];
  const StatusIcon = status.icon;

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'applicant', label: 'Applicant' },
    { id: 'employment', label: 'Employment' },
    { id: 'documents', label: 'Documents' },
  ] as const;

  return (
    <Card className="overflow-hidden border-white/10 bg-[#13233C]/95 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.02] px-5 py-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#F8FAFC]">
              {application.applicant.firstName} {application.applicant.lastName}
            </h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4 text-sm text-[#94A3B8]">
            <span className="flex items-center gap-1">
              <Building size={14} />
              {application.property.address}
              {application.property.unit && `, Unit ${application.property.unit}`}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              Submitted {formatDate(application.submittedAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {application.status === 'pending' || application.status === 'under-review' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject?.(application.id, 'Does not meet requirements')}
                className="border-[#F43F5E]/30 text-[#FCA5A5] hover:bg-[#F43F5E]/10 hover:text-[#F43F5E]"
              >
                <XCircle size={14} />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove?.(application.id)}
                className="bg-[#10B981] hover:bg-[#059669]"
              >
                <CheckCircle size={14} />
                Approve
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/8">
        <div className="flex gap-1 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#3B82F6] text-[#38BDF8]'
                  : 'text-[#94A3B8] hover:text-[#CBD5E1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5">
        {activeTab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard title="Property Details" icon={Home}>
              <div className="space-y-3">
                <InfoRow label="Address" value={`${application.property.address}${application.property.unit ? `, Unit ${application.property.unit}` : ''}`} icon={MapPin} />
                <InfoRow label="Monthly Rent" value={formatCurrency(application.property.rent)} icon={DollarSign} />
              </div>
            </SectionCard>

            <SectionCard title="Background Check" icon={AlertTriangle}>
              <div className="space-y-3">
                <InfoRow 
                  label="Credit Score" 
                  value={application.background.creditScore ? application.background.creditScore.toString() : 'Not run'} 
                />
                <InfoRow 
                  label="Eviction History" 
                  value={application.background.evictionHistory ? 'Found' : 'None'} 
                />
                <InfoRow 
                  label="Criminal History" 
                  value={application.background.criminalHistory ? 'Found' : 'None'} 
                />
              </div>
            </SectionCard>

            <SectionCard title="Occupants" icon={User}>
              {application.occupants.length > 0 ? (
                <div className="space-y-2">
                  {application.occupants.map((occupant, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                      <span className="text-sm text-[#F8FAFC]">{occupant.name}</span>
                      <span className="text-xs text-[#64748B]">{occupant.relationship}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">No additional occupants</p>
              )}
            </SectionCard>

            <SectionCard title="Summary" icon={FileText}>
              <div className="space-y-3">
                <InfoRow label="Application ID" value={application.id} />
                <InfoRow label="Submitted" value={formatDate(application.submittedAt)} icon={Calendar} />
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'applicant' && (
          <SectionCard title="Applicant Information" icon={User} defaultOpen={false}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Full Name" value={`${application.applicant.firstName} ${application.applicant.lastName}`} icon={User} />
              <InfoRow label="Email" value={application.applicant.email} icon={Mail} />
              <InfoRow label="Phone" value={application.applicant.phone} icon={Phone} />
              <InfoRow label="Date of Birth" value={application.applicant.dateOfBirth} icon={Calendar} />
              <InfoRow label="Current Address" value={application.applicant.currentAddress} icon={MapPin} />
            </div>
          </SectionCard>
        )}

        {activeTab === 'employment' && (
          <SectionCard title="Employment Information" icon={Briefcase}>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Employer" value={application.employment.employer} icon={Briefcase} />
              <InfoRow label="Position" value={application.employment.position} />
              <InfoRow label="Annual Income" value={formatCurrency(application.employment.income)} icon={DollarSign} />
              <InfoRow label="Employment Length" value={application.employment.employmentLength} />
            </div>
          </SectionCard>
        )}

        {activeTab === 'documents' && (
          <SectionCard title="Submitted Documents" icon={FileText} defaultOpen={false}>
            {application.documents.length > 0 ? (
              <div className="space-y-2">
                {application.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#38BDF8]" />
                      <span className="text-sm text-[#F8FAFC]">{doc.name}</span>
                    </div>
                    <span className="text-xs text-[#64748B]">{formatDate(doc.uploadedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No documents uploaded</p>
            )}
          </SectionCard>
        )}
      </CardContent>
    </Card>
  );
}