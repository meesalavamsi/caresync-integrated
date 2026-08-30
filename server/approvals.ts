/**
 * In-memory pending-staff-approval store.
 * NOTE (carried over from SOURCE): this resets on restart and won't work across
 * multiple Node instances. Fine for a demo; swap for Redis or a ServiceNow
 * table for durability. This version includes the addRequest()/getRequest()
 * methods that were missing in the SOURCE modules/approvals.js and caused staff
 * registration to crash.
 */
export interface ApprovalRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  dept?: string;
  password?: string;
  uniqueUserId?: string;
  status: 'pending' | 'approved' | 'rejected';
}

class ApprovalManager {
  pendingApprovals: ApprovalRequest[] = [];

  addRequest(data: Omit<ApprovalRequest, 'id' | 'status'>): string {
    const id = 'APP-' + Math.floor(1000 + Math.random() * 9000);
    this.pendingApprovals.push({ id, status: 'pending', ...data });
    return id;
  }

  getRequest(id: string): ApprovalRequest | undefined {
    return this.pendingApprovals.find((r) => r.id === id);
  }

  getPending(): ApprovalRequest[] {
    return this.pendingApprovals.filter((r) => r.status === 'pending');
  }

  reviewAccount(id: string, action: 'approve' | 'reject') {
    const req = this.pendingApprovals.find((r) => r.id === id);
    if (req) req.status = action === 'approve' ? 'approved' : 'rejected';
    return { success: true, action, request: req || null };
  }
}

export const approvalManager = new ApprovalManager();
export default approvalManager;
