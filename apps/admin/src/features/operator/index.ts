// Operator feature module - decomposed from read-only-shell.tsx monolith

// Types and shared utilities
export type { ActiveView, WorkflowFocus } from './types';
export { navItems, activeViewIds, parseActiveView, updateOperatorUrl } from './types';
export { formatCurrency, formatNumber, priorityLabel, decisionPriorityLabel, propertyAddress, cents, countUnitsByStatus } from './utils';

// Data context (Phase 2)
export { OperatorDataProvider, useOperatorData, useOperatorSignals } from './context/operator-data-context';
export type { OperatorDataContextValue, OperatorTotals } from './context/operator-data-context';

// Shared components
export { MetricTile } from './components/metric-tile';
export { FilterSelect, SetupInput } from './components/filter-select';
export { DecisionEvidencePanel } from './components/decision-evidence-panel';
export {
  WorkflowFocusBanner,
  workflowItemMatchesDecision,
  workflowTargetView,
  workflowTargetLabel,
  workflowFocusMatchesEntity,
  useFocusedRowScroll,
} from './components/workflow-focus-banner';
export { ApprovalGate } from './components/approval-gate';

// Domain views
export { CommandCenterView } from './views/command-center-view';
export { ApplicationsView, ApplicationQueueRow } from './views/applications-view';
export { LeaseSigningView, LeaseSigningRow } from './views/lease-signing-view';
export { MaintenanceDispatchView, MaintenanceDispatchRow } from './views/maintenance-dispatch-view';
export { PredictiveMaintenanceView } from './views/predictive-maintenance-view';
export { InspectionEstimatesView, InspectionEstimateRow } from './views/inspection-estimates-view';
export { RenewalsView, RenewalRow } from './views/renewals-view';
export { RentOptimizationView } from './views/rent-optimization-view';
export { OwnerStatementsView } from './views/owner-statements-view';
export { WorkflowsView } from './views/workflows-view';
export { PortfolioView } from './views/portfolio-view';
export { ApprovalQueueView } from './views/approval-queue-view';
