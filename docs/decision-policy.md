# Decision Policies - keyring-os Admin Portal

## Overview

The system has a comprehensive **PolicyBundle** that defines decision rules per property. Policies are stored in `PolicyBundle` and fetched per-property at runtime.

---

## Where Policies Are Defined

### Core Policy System
- **Path:** `src/policy/`
- **Service:** `PolicyService` - manages active policy bundles per property
- **Schema:** `PolicyBundleSchema` (in `policy.types.ts`)
- **Storage:** `policyBundle` table in database (propertyId, version, bundleJson, isActive)

### AI Guardrails (Payments)
- **Path:** `src/payments/ai/guardrail-policy.ts`
- **Class:** `AIPaymentGuardrailPolicy` - runtime guardrails for payment reminders & AI messaging

---

## Policy Categories

| Category | Purpose | Key Fields |
|----------|---------|------------|
| **underwriting** | Tenant screening thresholds | itrMin, creditBand, evictionYears |
| **jurisdiction** | Late fees, notices, legal | gracePeriodDays, lateFeeType, noticeType |
| **denialCompliance** | Adverse action notices | autoSend, channels |
| **paymentPlan** | Installment plans | maxDurationDays, requireManagerApproval |
| **attorneyHandoff** | Legal referral rules | enabled, requiredArtifacts |
| **maintenanceTaxonomy** | Categories, priorities, SLAs | categories, slaHours |
| **afterHoursDispatch** | Emergency dispatch rules | businessHours, strategy |
| **reminders** | Tenant/operator reminder schedules | offsetsDays, channels |
| **renewalOffers** | Lease renewal workflows | autoSendStandardRenewal |
| **closeRules** | Monthly close accounting | lockPeriodAfterClose |

---

## Decision Outcomes

```typescript
type Decision = 
  | 'APPROVE'
  | 'CONDITIONAL_APPROVE'
  | 'DENY'
  | 'WAITLIST'
  | 'ESCALATE'
  | 'NO_ACTION'
  | 'GENERATE_NOTICE'
  | 'GENERATE_PAYMENT_PLAN'
  | 'REFER_ATTORNEY'
  | 'APPLY_LATE_FEE';
```

---

## Gap Analysis

### Currently Implemented
- ✅ PolicyBundle schema defined
- ✅ Property-level policy storage
- ✅ Payment AI guardrails
- ✅ Password policy

### Not Yet Exposed in Admin Portal
- ❌ Underwriting thresholds UI (credit, ITR, eviction checks)
- ❌ Payment plan configuration UI
- ❌ Maintenance category/priority/SLA configuration
- ❌ After-hours dispatch rules
- ❌ Denial notice templates / adverse action flow
- ❌ Attorney referral configuration

---

## Recommendations

1. **Create PolicyConfigForm** - admin UI to edit policy bundles per property
2. **Build UnderwritingRulesCard** - display/edit tenant screening thresholds
3. **Add MaintenanceSLAConfig** - define categories, priorities, SLAs
4. **Expose PaymentPlanSettings** - plan duration, installment limits, approval flags

---

## File References

- `src/policy/policy.types.ts` - PolicyBundleSchema
- `src/policy/policy.service.ts` - getActiveBundle, upsertBundle  
- `src/policy/policy-runner.service.ts` - executes decisions
- `src/policy/policy-approval.service.ts` - approval task handling
- `src/payments/ai/guardrail-policy.ts` - AI guardrails