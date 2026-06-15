const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/plabr/DEV2/keyring-os/apps/admin';
const routes = {
  'src/app/page.tsx': `'use client';\n\nimport { useOperatorData, CommandCenterView } from '@/features/operator';\n\nexport default function BriefingPage() {\n  const { data, totals, loaded, token, refresh } = useOperatorData();\n  return <CommandCenterView data={data} totals={totals} loaded={loaded} token={token} onRefresh={refresh} />;\n}`,
  
  'src/app/operator/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function OperatorRedirect() {\n  redirect('/');\n}`,
  
  'src/app/applications/page.tsx': `'use client';\n\nimport { useOperatorData, ApplicationsView } from '@/features/operator';\n\nexport default function ApplicationsPage() {\n  const { data, loaded, token, refresh } = useOperatorData();\n  return <ApplicationsView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;\n}`,
  
  'src/app/leasing/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function LeasingRedirect() {\n  redirect('/applications');\n}`,
  
  'src/app/screening/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function ScreeningRedirect() {\n  redirect('/applications');\n}`,

  'src/app/leasing/signing/page.tsx': `'use client';\n\nimport { useOperatorData, LeaseSigningView } from '@/features/operator';\n\nexport default function LeaseSigningPage() {\n  const { data, totals, loaded, token, refresh } = useOperatorData();\n  return <LeaseSigningView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;\n}`,

  'src/app/maintenance/page.tsx': `'use client';\n\nimport { useOperatorData, MaintenanceDispatchView } from '@/features/operator';\n\nexport default function MaintenancePage() {\n  const { data, loaded, token, refresh } = useOperatorData();\n  return <MaintenanceDispatchView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;\n}`,

  'src/app/repairs/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function RepairsRedirect() {\n  redirect('/maintenance');\n}`,

  'src/app/inspections/page.tsx': `'use client';\n\nimport { useOperatorData, InspectionEstimatesView } from '@/features/operator';\n\nexport default function InspectionsPage() {\n  const { data, loaded, token, refresh } = useOperatorData();\n  return <InspectionEstimatesView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;\n}`,

  'src/app/estimates/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function EstimatesRedirect() {\n  redirect('/inspections');\n}`,

  'src/app/renewals/page.tsx': `'use client';\n\nimport { useOperatorData, RenewalsView } from '@/features/operator';\n\nexport default function RenewalsPage() {\n  const { data, loaded, token, refresh } = useOperatorData();\n  return <RenewalsView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;\n}`,

  'src/app/rent-optimization/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function RentOptimizationRedirect() {\n  redirect('/renewals');\n}`,

  'src/app/payments/page.tsx': `'use client';\n\nimport { useState } from 'react';\nimport { useOperatorData, WorkflowsView } from '@/features/operator';\n\nexport default function PaymentsPage() {\n  const { data, loaded } = useOperatorData();\n  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);\n  return <WorkflowsView data={data} loaded={loaded} selectedWorkflowId={selectedWorkflowId} onSelectWorkflow={(w) => setSelectedWorkflowId(w.id)} onOpenWorkflow={() => {}} />;\n}`,

  'src/app/billing/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function BillingRedirect() {\n  redirect('/payments');\n}`,

  'src/app/financials/page.tsx': `'use client';\n\nimport { useOperatorData, OwnerStatementsView } from '@/features/operator';\n\nexport default function FinancialsPage() {\n  const { data, totals, loaded, token, refresh } = useOperatorData();\n  return <OwnerStatementsView data={data} loaded={loaded} token={token} onRefresh={refresh} workflowFocus={null} onClearWorkflowFocus={() => {}} />;\n}`,

  'src/app/owner-portal/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function OwnerPortalRedirect() {\n  redirect('/financials');\n}`,

  'src/app/portfolio/page.tsx': `'use client';\n\nimport { useOperatorData, PortfolioView } from '@/features/operator';\n\nexport default function PortfolioPage() {\n  const { data, totals, loaded, token, refresh } = useOperatorData();\n  return <PortfolioView data={data} totals={totals} loaded={loaded} token={token} onRefresh={refresh} />;\n}`,

  'src/app/properties/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function PropertiesRedirect() {\n  redirect('/portfolio');\n}`,

  'src/app/property/page.tsx': `import { redirect } from 'next/navigation';\n\nexport default function PropertyRedirect() {\n  redirect('/portfolio');\n}`,

  'src/app/workflows/page.tsx': `'use client';\n\nimport { useState } from 'react';\nimport { useOperatorData, WorkflowsView } from '@/features/operator';\n\nexport default function WorkflowsPage() {\n  const { data, loaded } = useOperatorData();\n  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);\n  return <WorkflowsView data={data} loaded={loaded} selectedWorkflowId={selectedWorkflowId} onSelectWorkflow={(w) => setSelectedWorkflowId(w.id)} onOpenWorkflow={() => {}} />;\n}`
};

for (const [relPath, content] of Object.entries(routes)) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log('Routes generated');
