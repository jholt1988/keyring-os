# Decision Policy Configuration UI - Implementation Plan

**目标：** Build admin portal UI components that expose decision policy configuration gaps identified in docs/decision-policy.md, enabling property managers to configure underwriting rules, payment plans, maintenance SLAs, and denial compliance settings.

**架构：** Add policy configuration cards to the admin portal's property settings workflow. Each card maps to a PolicyBundle sub-schema. Follow the existing feature structure: `features/[domain]/components/*-card.tsx` pattern with dark theme styling consistent with recently added components like PropertyOnboardingCard and TenantViolationCard.

**技术栈：** React, TypeScript, existing UI component library (Button, Input, Card from @/components/ui), React Query for API state management, Server Actions for mutations following the pattern in keyring-os/apps/admin.

---

## File Structure

**New files:**
- `apps/admin/src/features/policy/components/underwriting-rules-card.tsx`
- `apps/admin/src/features/policy/components/payment-plan-settings-card.tsx`
- `apps/admin/src/features/policy/components/maintenance-config-card.tsx`
- `apps/admin/src/features/policy/components/denial-compliance-card.tsx`
- `apps/admin/src/features/policy/components/policy-api.ts` (shared API functions)
- `apps/admin/src/features/policy/components/index.ts` (exports)
- `apps/admin/src/features/policy/components/policy-settings-page.tsx` (settings page)
- `docs/superpowers/plans/2026-04-17-decision-policy-config.md` (this plan)

**Reference files (existing patterns to follow):**
- `apps/admin/src/features/portfolio/components/property-onboarding-card.tsx` - Card styling pattern
- `apps/admin/src/features/tenant/components/tenant-violation-card.tsx` - Form input pattern
- `apps/admin/src/features/payments/components/payment-plan-form.tsx` - Dropdown/checkbox patterns

---

## Task 1: Underwriting Rules Card

**文件：**
- 创建：`apps/admin/src/features/policy/components/underwriting-rules-card.tsx`
- API ref: `packages/types/src/index.ts` (check for existing policy types, add if missing)
- Test: `apps/admin/src/features/policy/components/underwriting-rules-card.spec.tsx`

- [ ] **步骤 1：Create wireframe skeleton**

```tsx
'use client';

import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UnderwritingRulesCardProps {
  propertyId: string;
  initialRules?: UnderwritingRules;
  onSave: (rules: UnderwritingRules) => void;
}

interface UnderwritingRules {
  approveMinITR: number;
  conditionalMinITR: number;
  denyBelowITR: number;
  requireNoRecentEvictionYears: number;
  minimumCreditBand: 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';
  allowThinCreditConditional: boolean;
  requireSecondApprovalForDenyToApproveOverride: boolean;
}

export function UnderwritingRulesCard({ propertyId, initialRules, onSave }: UnderwritingRulesCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rules, setRules] = useState<UnderwritingRules>(initialRules || {
    approveMinITR: 0.8,
    conditionalMinITR: 0.5,
    denyBelowITR: 0.3,
    requireNoRecentEvictionYears: 5,
    minimumCreditBand: 'FAIR',
    allowThinCreditConditional: true,
    requireSecondApprovalForDenyToApproveOverride: false,
  });

  // render collapsed state with summary
  // render expanded state with form inputs
  // handle save with onSave callback
}
```

- [ ] **步骤 2：Run build check**

运行：`cd apps/admin && npx tsc --noEmit`
预期：FAIL - component references undefined UnderwritingRules type

- [ ] **步骤 3: Add PolicyBundle types to @keyring/types package**

Create or update `packages/types/src/policy.ts` with the underwriting interface matching `PolicyBundleSchema.underwriting`. Export for use across packages.

- [ ] **步骤 4: Verify import resolves**

运行：`cd apps/admin && npx tsc --noEmit`
预期：PASS

- [ ] **步骤 5: Implement full card UI**

Expand the skeleton to include:
- Collapsed summary showing key thresholds
- Expandable form with all underwriting fields
- Credit band dropdown (POOR | FAIR | GOOD | VERY_GOOD | EXCELLENT)
- Numeric inputs for ITR thresholds (0.0-1.0 range)
- Years input for eviction requirement
- Checkboxes for conditional approval flags

- [ ] **步骤 6: Run build check**

运行：`cd apps/admin && npx tsc --noEmit`
预期：PASS

- [ ] **步骤 7: Commit**

```bash
git add apps/admin/src/features/policy/ packages/types/src/policy.ts
git commit -m "feat(admin): add underwriting rules policy card"
```

---

## Task 2: Payment Plan Settings Card

**文件：**
- 创建：`apps/admin/src/features/policy/components/payment-plan-settings-card.tsx`
- 修改：`apps/admin/src/features/policy/components/index.ts` (add export)
- Test: `apps/admin/src/features/policy/components/payment-plan-settings-card.spec.tsx`

- [ ] **步骤 1: Create card following Task 1 patterns**

```tsx
interface PaymentPlanSettings {
  enabled: boolean;
  maxPlanDurationDays: number;
  defaultInstallmentCountMin: number;
  defaultInstallmentCountMax: number;
  minimumInstallmentAmount: number;
  requireManagerApproval: boolean;
  continueCurrentRentDuringPlan: boolean;
  reportingEnabled: boolean;
}

export function PaymentPlanSettingsCard({ propertyId, initialSettings, onSave }: PaymentPlanSettingsCardProps) {
  // Collapsed: show enabled/disabled status, key limits
  // Expanded: full form with all payment plan config fields
}
```

- [ ] **步骤 2: Run build check**

运行：`cd apps/admin && npx tsc --noEmit`
预期：PASS (types already in PolicyBundleSchema)

- [ ] **步骤 3: Commit**

```bash
git add apps/admin/src/features/policy/components/payment-plan-settings-card.tsx
git commit -m "feat(admin): add payment plan settings card"
```

---

## Task 3: Maintenance Configuration Card

**文件：**
- 创建：`apps/admin/src/features/policy/components/maintenance-config-card.tsx`
- Test: `apps/admin/src/features/policy/components/maintenance-config-card.spec.tsx`

- [ ] **步骤 1: Create card with dynamic category management**

```tsx
interface MaintenanceCategory {
  code: string;
  name: string;
  subcategories: { code: string; name: string }[];
  defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  slaHours?: number;
}

interface MaintenanceConfig {
  categories: MaintenanceCategory[];
  // plus afterHoursDispatch config from PolicyBundleSchema
  afterHoursDispatch: {
    enabled: boolean;
    emergencyOnly: boolean;
    strategy: 'ROUND_ROBIN' | 'PRIORITY_LIST';
  };
}
```

- [ ] **步骤 2: Implement add/edit/delete category UI**

- Add category form: name, code, priority dropdown, SLA hours input
- Add subcategory inline
- Drag reorder (or simple up/down)
- After-hours dispatch toggles

- [ ] **步骤 3: Run build check**

运行：`cd apps/admin && npx tsc --noEmit`
预期：PASS

- [ ] **步骤 4: Commit**

```bash
git add apps/admin/src/features/policy/components/maintenance-config-card.tsx
git commit -m "feat(admin): add maintenance policy configuration card"
```

---

## Task 4: Denial Compliance Card

**文件：**
- 创建：`apps/admin/src/features/policy/components/denial-compliance-card.tsx`
- Test: `apps/admin/src/features/policy/components/denial-compliance-card.spec.tsx`

- [ ] **步骤 1: Create card for adverse action settings**

```tsx
interface DenialComplianceSettings {
  requireAdverseActionNotice: boolean;
  autoSend: boolean;
  allowedChannels: ('EMAIL' | 'SMS' | 'IN_APP' | 'PHYSICAL')[];
  includeConsumerReportingAgencyBlock: boolean;
  includeDisputeRightsBlock: boolean;
  templateVersion: string;
}

export function DenialComplianceCard({ propertyId, initialSettings, onSave }: DenialComplianceCardProps) {
  // Checkbox for requireAdverseActionNotice
  // Checkbox for autoSend
  // Multi-select for channels (EMAIL, SMS, IN_APP, PHYSICAL)
  // Checkboxes for CRAG block, dispute rights
  // Template version input
}
```

- [ ] **步骤 2: Run build check**

运行：`cd apps/admin && npx tsc --noEmit`
预期：PASS

- [ ] **步骤 3: Commit**

```bash
git add apps/admin/src/features/policy/components/denial-compliance-card.tsx
git commit -m "feat(admin): add denial compliance policy card"
```

---

## Task 5: Policy Settings Page

**文件：**
- 创建：`apps/admin/src/features/policy/components/policy-settings-page.tsx`
- 修改：`apps/admin/src/app/property/settings/page.tsx` (or create property settings if not exists)

- [ ] **步骤 1: Create page that composes all 4 cards**

```tsx
export default function PolicySettingsPage({ params }: { params: { propertyId: string } }) {
  const { propertyId } = params;
  
  // Fetch current policy bundle via React Query
  // Render UnderwritingRulesCard, PaymentPlanSettingsCard, 
  //   MaintenanceConfigCard, DenialComplianceCard
  // Each card saves to policy bundle via server action
}
```

- [ ] **步骤 2: Add to routing**

Ensure `apps/admin/src/app/property/[id]/settings/page.tsx` (or similar) imports and renders the policy settings section, or create a dedicated route.

- [ ] **步骤 3: Run build check**

运行：`cd apps/admin && npx tsc --noEmit`
预期：PASS

- [ ] **步骤 4: Commit**

```bash
git add apps/admin/src/features/policy/
git commit -m "feat(admin): add policy settings page with configuration cards"
```

---

## Task 6: Integration with Backend

**文件：**
- 修改：`apps/admin/src/features/policy/components/policy-api.ts`
- 修改 (backend): `tenant_portal_backend/src/policy/policy.service.ts` check for updateBundle method

- [ ] **步骤 1: Verify backend has update endpoint**

Check `policy.controller.ts` for a PATCH or PUT route. If none exists, add endpoint that accepts partial policy bundle for the specific section (underwriting, paymentPlan, etc.) and merges with existing bundle.

- [ ] **步骤 2: Add frontend API client**

Create `policy-api.ts` with:
```ts
export async function fetchPropertyPolicy(propertyId: string): Promise<PolicyBundle>
export async function updatePropertyPolicy(propertyId: string, section: keyof PolicyBundle, data: unknown): Promise<PolicyBundle>
```

- [ ] **步骤 3: Wire up cards to use API**

Update each card's onSave to call appropriate API function.

- [ ] **步骤 4: Verify end-to-end**

运行: Manual test - navigate to property settings, modify underwriting threshold, save, reload, verify persisted.

- [ ] **步骤 5: Commit**

```bash
git add apps/admin/src/features/policy/components/policy-api.ts
git commit -m "feat(admin): integrate policy settings with backend API"
```

---

## Coverage Verification

| Requirement from docs/decision-policy.md | Task |
|------------------------------------------|------|
| Underwriting thresholds UI | Task 1 |
| Payment plan settings UI | Task 2 |
| Maintenance SLA rules UI | Task 3 |
| Denial compliance/adverse action flow | Task 4 |
| Compose in settings page | Task 5 |
| Backend integration | Task 6 |

---

## Post-Implementation

After all tasks complete:
1. Run full TypeScript check: `cd apps/admin && npx tsc --noEmit`
2. Verify、政策 settings page loads without errors in browser
3. Check that policy updates persist via UI -> API -> DB round-trip

---

## Execution Options

**计划写完保存到 `docs/superpowers/plans/2026-04-17-decision-policy-config.md`。两种执行选项：**

**1. 子 Agent 驱动（推荐）** — 我为每个任务 dispatch 新的 subagent，任务间审查，快速迭代

**2. 顺序执行** — 在本 session 按批次执行任务，有审查检查点

**选择哪种？**