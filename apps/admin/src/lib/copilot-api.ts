export * from './copilot/briefing';
export * from './copilot/workspaces';
export * from './copilot/payments';
export * from './copilot/notifications';
export * from './copilot/vendors';
export * from './copilot/misc';
// Prefer operator API implementations where available
export {
	createMessageThread,
	fetchAdminConversations,
	fetchConversationMessages,
	fetchMessagingTenants,
	fetchMessageStats,
	replyToConversation,
} from './operator/messaging';
export { recordTenantNotice } from './operator/leases';

// Fall back to legacy wrappers for anything not yet migrated
export * from './copilot/legacy-compat';
