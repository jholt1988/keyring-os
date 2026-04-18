'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Home, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface RentalApplicationProps {
  propertyId?: string;
  unitId?: string;
  propertyName?: string;
  unitNumber?: string;
  monthlyRent?: number;
}

export default function RentalApplicationPage({
  propertyId = 'prop_001',
  unitId = 'unit_101',
  propertyName = 'Riverside Apartments',
  unitNumber = '101',
  monthlyRent = 2200
}: RentalApplicationProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    
    // Current address
    currentAddress: '',
    currentCity: '',
    currentState: '',
    currentZip: '',
    yearsAtCurrentAddress: '',
    
    // Employment
    employerName: '',
    employerPhone: '',
    jobTitle: '',
    yearsAtEmployer: '',
    monthlyIncome: '',
    
    // References
    reference1Name: '',
    reference1Phone: '',
    reference1Relation: '',
    reference2Name: '',
    reference2Phone: '',
    reference2Relation: '',
    
    // Move details
    desiredMoveInDate: '',
    leaseTerm: '12',
    occupants: '1',
    
    // Consent
    consentCreditCheck: false,
    consentBackgroundCheck: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#07111F] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#17304E] via-[#07111F] to-[#07111F] opacity-50" />
        
        <Card className="relative w-full max-w-md border-white/10 bg-[#13233C]/95 shadow-[0_18px_60px_rgba(2,8,23,0.28)] backdrop-blur-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
            <p className="mt-2 text-[#94A3B8]">
              Thank you for your application. We'll review it and contact you within 24-48 hours.
            </p>
            <div className="mt-6 rounded-lg bg-[#0F1B31] p-4 text-left">
              <p className="text-sm text-[#64748B]">Application Reference</p>
              <p className="font-mono text-lg text-[#38BDF8]">APP-{Date.now().toString(36).toUpperCase()}</p>
            </div>
            <Button 
              onClick={() => router.push('/')} 
              className="mt-6 w-full bg-[#3B82F6] hover:bg-[#2563EB]"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111F] p-4 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#17304E] via-[#07111F] to-[#07111F] opacity-50" />
      
      {/* Header with Logo */}
      <div className="relative mx-auto max-w-3xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#1e3a5f] to-[#0f2744]">
            <Zap className="h-6 w-6 text-[#38BDF8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-[#38BDF8]">Keyring</span>OS
            </h1>
            <p className="text-xs text-[#64748B]">Rental Application</p>
          </div>
        </div>

        {/* Property Info Card */}
        <Card className="border-white/10 bg-[#13233C]/80 backdrop-blur">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#3B82F6]/20">
              <Home className="h-7 w-7 text-[#38BDF8]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{propertyName}</h3>
              <p className="text-sm text-[#94A3B8]">Unit {unitNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">${monthlyRent.toLocaleString()}</p>
              <p className="text-xs text-[#64748B]">per month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Steps */}
      <div className="relative mx-auto max-w-3xl mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                step >= s 
                  ? 'border-[#38BDF8] bg-[#38BDF8]/20 text-[#38BDF8]' 
                  : 'border-white/20 text-white/40'
              }`}>
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`h-0.5 w-12 md:w-24 ${step > s ? 'bg-[#38BDF8]' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#64748B]">
          <span>Personal</span>
          <span>Employment</span>
          <span>References</span>
          <span>Review</span>
        </div>
      </div>

      {/* Form */}
      <Card className="relative mx-auto max-w-3xl border-white/10 bg-[#13233C]/95 shadow-[0_18px_60px_rgba(2,8,23,0.28)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Employment & Income'}
            {step === 3 && 'References'}
            {step === 4 && 'Review & Submit'}
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            {step === 1 && 'Tell us about yourself'}
            {step === 2 && 'Your work and income details'}
            {step === 3 && 'Emergency contacts or references'}
            {step === 4 && 'Review your application'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">First Name *</Label>
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="John"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Last Name *</Label>
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Doe"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <Input 
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="john@example.com"
                      className="border-white/10 bg-[#0F1B31] pl-10 text-white placeholder:text-[#64748B]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <Input 
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="border-white/10 bg-[#0F1B31] pl-10 text-white placeholder:text-[#64748B]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input 
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="border-white/10 bg-[#0F1B31] pl-10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Social Security Number *</Label>
                <Input 
                  value={formData.ssn}
                  onChange={(e) => updateField('ssn', e.target.value)}
                  placeholder="XXX-XX-XXXX"
                  className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                />
                <p className="text-xs text-[#64748B]">Used for background check only</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Current Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#64748B]" />
                  <Input 
                    value={formData.currentAddress}
                    onChange={(e) => updateField('currentAddress', e.target.value)}
                    placeholder="123 Main Street"
                    className="border-white/10 bg-[#0F1B31] pl-10 text-white placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">City</Label>
                  <Input 
                    value={formData.currentCity}
                    onChange={(e) => updateField('currentCity', e.target.value)}
                    placeholder="Chicago"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">State</Label>
                  <Input 
                    value={formData.currentState}
                    onChange={(e) => updateField('currentState', e.target.value)}
                    placeholder="IL"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">ZIP</Label>
                  <Input 
                    value={formData.currentZip}
                    onChange={(e) => updateField('currentZip', e.target.value)}
                    placeholder="60601"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Employer Name *</Label>
                  <Input 
                    value={formData.employerName}
                    onChange={(e) => updateField('employerName', e.target.value)}
                    placeholder="Acme Corp"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Job Title *</Label>
                  <Input 
                    value={formData.jobTitle}
                    onChange={(e) => updateField('jobTitle', e.target.value)}
                    placeholder="Software Engineer"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Employer Phone</Label>
                  <Input 
                    value={formData.employerPhone}
                    onChange={(e) => updateField('employerPhone', e.target.value)}
                    placeholder="(555) 000-0000"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Years at Employer</Label>
                  <Input 
                    value={formData.yearsAtEmployer}
                    onChange={(e) => updateField('yearsAtEmployer', e.target.value)}
                    placeholder="2"
                    className="border-white/10 bg-[#0F1B31] text-white placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#94A3B8]">Monthly Gross Income *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <Input 
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => updateField('monthlyIncome', e.target.value)}
                    placeholder="5000"
                    className="border-white/10 bg-[#0F1B31] pl-10 text-white placeholder:text-[#64748B]"
                  />
                </div>
                <p className="text-xs text-[#64748B]">Monthly income must be at least 3x monthly rent (${(monthlyRent * 3).toLocaleString()})</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Desired Move-in Date</Label>
                  <Input 
                    type="date"
                    value={formData.desiredMoveInDate}
                    onChange={(e) => updateField('desiredMoveInDate', e.target.value)}
                    className="border-white/10 bg-[#0F1B31] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#94A3B8]">Lease Term</Label>
                  <select 
                    value={formData.leaseTerm}
                    onChange={(e) => updateField('leaseTerm', e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 text-white"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months</option>
                    <option value="18">18 Months</option>
                    <option value="24">24 Months</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: References */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-[#0F1B31] p-4">
                <h4 className="font-medium text-white mb-4">Reference 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Name</Label>
                    <Input 
                      value={formData.reference1Name}
                      onChange={(e) => updateField('reference1Name', e.target.value)}
                      placeholder="Jane Smith"
                      className="border-white/10 bg-[#13233C] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Phone</Label>
                    <Input 
                      value={formData.reference1Phone}
                      onChange={(e) => updateField('reference1Phone', e.target.value)}
                      placeholder="(555) 111-2222"
                      className="border-white/10 bg-[#13233C] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Relationship</Label>
                    <Input 
                      value={formData.reference1Relation}
                      onChange={(e) => updateField('reference1Relation', e.target.value)}
                      placeholder="Former Landlord"
                      className="border-white/10 bg-[#13233C] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#0F1B31] p-4">
                <h4 className="font-medium text-white mb-4">Reference 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Name</Label>
                    <Input 
                      value={formData.reference2Name}
                      onChange={(e) => updateField('reference2Name', e.target.value)}
                      placeholder="Bob Johnson"
                      className="border-white/10 bg-[#13233C] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Phone</Label>
                    <Input 
                      value={formData.reference2Phone}
                      onChange={(e) => updateField('reference2Phone', e.target.value)}
                      placeholder="(555) 333-4444"
                      className="border-white/10 bg-[#13233C] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#94A3B8]">Relationship</Label>
                    <Input 
                      value={formData.reference2Relation}
                      onChange={(e) => updateField('reference2Relation', e.target.value)}
                      placeholder="Personal Reference"
                      className="border-white/10 bg-[#13233C] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-[#0F1B31] p-4">
                <h4 className="font-medium text-white mb-3">Application Summary</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#64748B]">Property</dt>
                    <dd className="text-white">{propertyName} - Unit {unitNumber}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#64748B]">Monthly Rent</dt>
                    <dd className="text-white">${monthlyRent.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#64748B]">Applicant</dt>
                    <dd className="text-white">{formData.firstName} {formData.lastName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#64748B]">Email</dt>
                    <dd className="text-white">{formData.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#64748B]">Phone</dt>
                    <dd className="text-white">{formData.phone}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.consentCreditCheck}
                    onChange={(e) => updateField('consentCreditCheck', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6]"
                  />
                  <span className="text-sm text-[#94A3B8]">
                    I consent to a credit check being performed *
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.consentBackgroundCheck}
                    onChange={(e) => updateField('consentBackgroundCheck', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6]"
                  />
                  <span className="text-sm text-[#94A3B8]">
                    I consent to a background check being performed *
                  </span>
                </label>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/8 p-3">
                <AlertCircle className="h-5 w-5 text-[#F59E0B] mt-0.5" />
                <p className="text-sm text-[#FCD34D]">
                  By submitting this application, you confirm all information is accurate. 
                  Providing false information may result in denial or lease termination.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button 
              variant="ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="text-[#94A3B8]"
            >
              Back
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={() => setStep(s => Math.min(4, s + 1))}
                className="bg-[#3B82F6] hover:bg-[#2563EB]"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !formData.consentCreditCheck || !formData.consentBackgroundCheck}
                className="bg-[#3B82F6] hover:bg-[#2563EB]"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}