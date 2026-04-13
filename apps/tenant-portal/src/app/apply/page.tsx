'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { ApplicationShell } from '@/components/rental-application/application-shell';
import { IdentityStep, type IdentityValues } from '@/components/rental-application/identity-step';
import { HousingStep, type HousingValues } from '@/components/rental-application/housing-step';
import { EmploymentStep, type EmploymentValues } from '@/components/rental-application/employment-step';
import { OccupantsStep, type OccupantsValues } from '@/components/rental-application/occupants-step';
import { BackgroundStep, type BackgroundValues } from '@/components/rental-application/background-step';
import { DocumentsStep, type DocumentsValues } from '@/components/rental-application/documents-step';
import { ReviewStep } from '@/components/rental-application/review-step';
import { Card, CardContent } from '@/components/ui/card';
import { createRentalApplication, submitRentalApplication, updateRentalApplication } from '@/lib/tenant-api';

const TOTAL_STEPS = 7;

const INITIAL_IDENTITY: IdentityValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  email: '',
  phone: '',
};

const INITIAL_HOUSING: HousingValues = {
  currentAddress: '',
  landlordName: '',
  monthlyRent: '',
  reasonForLeaving: '',
};

const INITIAL_EMPLOYMENT: EmploymentValues = {
  employer: '',
  position: '',
  monthlyIncome: '',
  employmentStartDate: '',
};

const INITIAL_OCCUPANTS: OccupantsValues = {
  coApplicantCount: '',
  dependents: '',
  pets: '',
  vehicles: '',
};

const INITIAL_BACKGROUND: BackgroundValues = {
  evictionHistory: '',
  bankruptcyDisclosure: '',
  criminalDisclosureAcknowledgment: '',
};

const INITIAL_DOCUMENTS: DocumentsValues = {
  idUpload: '',
  incomeProofUpload: '',
};

export default function ApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [identity, setIdentity] = useState<IdentityValues>(INITIAL_IDENTITY);
  const [housing, setHousing] = useState<HousingValues>(INITIAL_HOUSING);
  const [employment, setEmployment] = useState<EmploymentValues>(INITIAL_EMPLOYMENT);
  const [occupants, setOccupants] = useState<OccupantsValues>(INITIAL_OCCUPANTS);
  const [background, setBackground] = useState<BackgroundValues>(INITIAL_BACKGROUND);
  const [documents, setDocuments] = useState<DocumentsValues>(INITIAL_DOCUMENTS);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const payload = useMemo(
    () => ({
      propertyId: 'demo-property-id',
      applicant: identity,
      housing,
      employment,
      occupants,
      background,
      documents,
      consents: { consentAccepted },
      progressPercent: Math.round((step / TOTAL_STEPS) * 100),
    }),
    [background, consentAccepted, documents, employment, housing, identity, occupants, step],
  );

  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!applicationId) {
        const created = await createRentalApplication(payload as Record<string, unknown>) as { id?: string };
        if (created?.id) {
          setApplicationId(created.id);
        }
        return created;
      }
      return updateRentalApplication(applicationId, payload as Record<string, unknown>);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      let currentId = applicationId;
      if (!currentId) {
        const created = await createRentalApplication(payload as Record<string, unknown>) as { id?: string };
        currentId = created?.id ?? null;
        if (currentId) {
          setApplicationId(currentId);
        }
      } else {
        await updateRentalApplication(currentId, payload as Record<string, unknown>);
      }

      if (!currentId) {
        throw new Error('Application ID missing after draft save.');
      }

      await submitRentalApplication(currentId);
      router.push(`/apply/${currentId}`);
    },
  });

  const steps = useMemo(
    () => [
      {
        title: 'Tell us about yourself',
        helper: 'Start with your identity details so we can prepare your application record.',
        label: 'Identity details',
        body: (
          <IdentityStep
            value={identity}
            onChange={(field, value) => setIdentity((current) => ({ ...current, [field]: value }))}
          />
        ),
      },
      {
        title: 'Current housing',
        helper: 'Share your current rental details and why you are planning a move.',
        label: 'Housing history',
        body: (
          <HousingStep
            value={housing}
            onChange={(field, value) => setHousing((current) => ({ ...current, [field]: value }))}
          />
        ),
      },
      {
        title: 'Employment details',
        helper: 'Add your current work information and monthly income range.',
        label: 'Employment verification',
        body: (
          <EmploymentStep
            value={employment}
            onChange={(field, value) => setEmployment((current) => ({ ...current, [field]: value }))}
          />
        ),
      },
      {
        title: 'Occupants and household',
        helper: 'Tell us who will live with you, along with pets and vehicles.',
        label: 'Occupants and household',
        body: (
          <OccupantsStep
            value={occupants}
            onChange={(field, value) => setOccupants((current) => ({ ...current, [field]: value }))}
          />
        ),
      },
      {
        title: 'Background questions',
        helper: 'Answer the required background and disclosure questions for review.',
        label: 'Background disclosures',
        body: (
          <BackgroundStep
            value={background}
            onChange={(field, value) => setBackground((current) => ({ ...current, [field]: value }))}
          />
        ),
      },
      {
        title: 'Documents',
        helper: 'Prepare the supporting uploads your leasing team will need.',
        label: 'Supporting documents',
        body: (
          <DocumentsStep
            value={documents}
            onChange={(field, value) => setDocuments((current) => ({ ...current, [field]: value }))}
          />
        ),
      },
      {
        title: 'Review and consent',
        helper: 'Review the summary, confirm consent, and submit your application.',
        label: 'Review and consent',
        body: (
          <ReviewStep
            sections={[
              { label: 'Applicant', value: `${identity.firstName} ${identity.lastName}`.trim() || 'Not provided yet' },
              { label: 'Current housing', value: housing.currentAddress || 'Not provided yet' },
              { label: 'Employment', value: employment.employer || 'Not provided yet' },
              { label: 'Occupants', value: occupants.coApplicantCount || occupants.dependents || occupants.pets || occupants.vehicles ? `Co-applicants: ${occupants.coApplicantCount || '0'}, Dependents: ${occupants.dependents || '0'}, Pets: ${occupants.pets || 'none'}, Vehicles: ${occupants.vehicles || 'none'}` : 'Not provided yet' },
              { label: 'Background', value: background.evictionHistory || background.bankruptcyDisclosure || background.criminalDisclosureAcknowledgment ? `Evictions: ${background.evictionHistory || 'n/a'}, Bankruptcy: ${background.bankruptcyDisclosure || 'n/a'}` : 'Not provided yet' },
              { label: 'Documents', value: documents.idUpload || documents.incomeProofUpload ? `ID: ${documents.idUpload || 'missing'}, Income proof: ${documents.incomeProofUpload || 'missing'}` : 'Not provided yet' },
            ]}
            value={{ consentAccepted }}
            onConsentChange={setConsentAccepted}
          />
        ),
      },
    ],
    [background, consentAccepted, documents, employment, housing, identity, occupants],
  );

  const currentStep = steps[step - 1];

  const handleAdvance = async () => {
    if (step < TOTAL_STEPS) {
      await saveDraftMutation.mutateAsync();
      setStep((current) => Math.min(TOTAL_STEPS, current + 1));
      return;
    }

    if (!consentAccepted) {
      return;
    }

    await submitMutation.mutateAsync();
  };

  const isBusy = saveDraftMutation.isPending || submitMutation.isPending;

  return (
    <WorkspaceShell title="Rental Application" backHref="/" backLabel="Dashboard">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <ApplicationShell
          step={step}
          totalSteps={TOTAL_STEPS}
          title={currentStep.title}
          onBack={step > 1 ? () => setStep((current) => Math.max(1, current - 1)) : undefined}
          onNext={isBusy ? undefined : handleAdvance}
        >
          <p className="text-sm text-[#94A3B8]">{currentStep.helper}</p>
          {currentStep.body}
          {(saveDraftMutation.isError || submitMutation.isError) && (
            <div className="rounded-xl border border-[#F43F5E]/20 bg-[#F43F5E]/10 px-4 py-3 text-sm text-[#FDA4AF]">
              We could not save your application just yet. Please try again.
            </div>
          )}
          {step === TOTAL_STEPS && !consentAccepted && (
            <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#FCD34D]">
              Please confirm consent before submitting your application.
            </div>
          )}
        </ApplicationShell>

        <Card className="h-fit border-[#1E3350] bg-[#13233C]/95">
          <CardContent className="space-y-5 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#38BDF8]">Application Snapshot</p>
              <h2 className="mt-2 text-lg font-semibold text-[#F8FAFC]">What happens next</h2>
            </div>
            <div className="space-y-3">
              {steps.map((entry, index) => {
                const active = step === index + 1;
                const complete = step > index + 1;

                return (
                  <div
                    key={entry.label}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm ${
                      active
                        ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#F8FAFC]'
                        : 'border-[#1E3350] bg-[#0F1B31] text-[#94A3B8]'
                    }`}
                  >
                    <CheckCircle2
                      size={16}
                      className={complete || active ? 'text-[#38BDF8]' : 'text-[#64748B]'}
                    />
                    <span>{entry.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-dashed border-[#1E3350] bg-[#0F1B31] px-4 py-3 text-sm text-[#94A3B8]">
              {applicationId
                ? `Draft saved as ${applicationId}. Your changes are persisted as you move through the flow.`
                : 'A draft will be created automatically as you move through the application.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
