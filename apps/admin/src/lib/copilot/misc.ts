import {
  fetchAuditLogs,
  fetchPolicyEvaluation,
  fetchWorkflows,
  fetchWorkflowExecutions,
  triggerWorkflow,
} from './legacy-compat';

export const copilotMiscApi = {
  fetchPolicyEvaluation,
  fetchAuditLogs,
  fetchWorkflows,
  fetchWorkflowExecutions,
  triggerWorkflow,
};
