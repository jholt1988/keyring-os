import {
  fetchAuditLogs,
  fetchPolicyEvaluation,
  fetchWorkflows,
  fetchWorkflowExecutions,
  triggerWorkflow,
} from './legacy';

export const copilotMiscApi = {
  fetchPolicyEvaluation,
  fetchAuditLogs,
  fetchWorkflows,
  fetchWorkflowExecutions,
  triggerWorkflow,
};
