import type { Decision, DecisionAction } from './copilot';

const action: DecisionAction = {
  label: 'Approve',
  endpoint: '/decisions/1/approve',
  method: 'POST',
  variant: 'primary',
  tooltip: 'Approve this decision',
  confirmRequired: true,
  confirmation: {
    title: 'Approve decision?',
    message: 'This action cannot be undone.',
  },
  metadata: {
    trackingId: 'decision-1-approve',
    estimatedTime: '2m',
    dependencies: ['policy-check'],
  },
};

const decision: Decision = {
  id: 'd1',
  domain: 'payments',
  entityType: 'invoice',
  entityId: 'inv_1',
  title: 'Approve payment plan',
  context: 'Resident requested 2-part payment plan.',
  urgency: 'today',
  type: 'approval',
  priority: 8,
  confidenceScore: 91,
  reasoning: ['Resident paid on time 11 of last 12 months'],
  impact: { financial: 1250, risk: 'low', timeline: 'today' },
  relatedDecisionIds: ['d0'],
  workflow: { stage: 'review', totalStages: 3, currentStageIndex: 2, eta: '15m' },
  actions: [action],
  aiRecommendation: 'Approve with reminder',
};

void decision;
void action;
