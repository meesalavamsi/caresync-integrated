import axios, { AxiosInstance } from 'axios';

/**
 * ServiceNowClient — the single layer that talks to the ServiceNow Table API.
 * Credentials live ONLY here, on the server, sourced from environment variables.
 * Ported and consolidated from the SOURCE project's modules/servicenow.js so
 * that every route reuses one authenticated axios instance instead of
 * hand-rolling `axios.create(...)` in each handler.
 */
class ServiceNowClient {
  instanceUrl: string;
  username: string;
  password: string;
  client: AxiosInstance;
  configured: boolean;

  constructor() {
    this.instanceUrl = (process.env.SERVICENOW_INSTANCE || '').trim().replace(/\/$/, '');
    this.username = (process.env.SERVICENOW_USERNAME || '').trim();
    this.password = (process.env.SERVICENOW_PASSWORD || '').trim();
    // Only treat the client as usable if all three are present.
    this.configured = Boolean(this.instanceUrl && this.username && this.password);

    this.client = axios.create({
      baseURL: `${this.instanceUrl || 'https://placeholder.service-now.com'}/api`,
      auth: { username: this.username, password: this.password },
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      timeout: 15000,
    });
  }

  /** Lightweight reachability probe used by /api/health. */
  async ping(): Promise<{ ok: boolean; message: string }> {
    if (!this.configured) {
      return { ok: false, message: 'ServiceNow credentials not configured in .env' };
    }
    try {
      // sysparm_limit=1 keeps this cheap; any 2xx means auth + reachability are good.
      await this.client.get('/now/table/sys_user', { params: { sysparm_limit: 1 } });
      return { ok: true, message: 'ServiceNow reachable and authenticated' };
    } catch (err: any) {
      const status = err?.response?.status;
      return {
        ok: false,
        message: status
          ? `ServiceNow returned HTTP ${status}`
          : `ServiceNow unreachable: ${err?.message || 'network error'}`,
      };
    }
  }

  private getCandidateTables(table: string): string[] {
    const TABLE_ALIASES: Record<string, string[]> = {
      'x_snc_caresync_1_patient': ['x_1850353_caresy_0_patient', 'x_snc_caresync_1_patient'],
      'x_snc_caresync_1_clinical_task': ['x_1850353_caresy_0_clin_task', 'x_snc_caresync_1_clinical_task'],
      'x_snc_caresync_1_bed_management': ['x_1850353_caresy_0_bed_mgmt', 'x_snc_caresync_1_bed_management'],
      'x_snc_caresync_1_medication_administration_record': ['x_1850353_caresy_0_med_admin', 'x_snc_caresync_1_med_admin', 'x_snc_caresync_1_medication_administration_record'],
      'x_snc_caresync_1_care_plan': ['x_1850353_caresy_0_care_plan', 'x_snc_caresync_1_care_plan'],
    };
    return TABLE_ALIASES[table] || [table];
  }

  async getTableRecords(table: string, query = '', displayValue: boolean | 'all' = true, limit = 200) {
    const candidates = this.getCandidateTables(table);
    let lastError: any = null;
    for (const t of candidates) {
      try {
        const response = await this.client.get(`/now/table/${t}`, {
          params: { sysparm_query: query, sysparm_limit: limit, sysparm_display_value: displayValue },
        });
        return response.data.result as any[];
      } catch (err: any) {
        lastError = err;
        if (err?.response?.status !== 404) throw err;
      }
    }
    throw lastError;
  }

  async getRecord(table: string, sysId: string, displayValue = true) {
    const candidates = this.getCandidateTables(table);
    let lastError: any = null;
    for (const t of candidates) {
      try {
        const response = await this.client.get(`/now/table/${t}/${sysId}`, {
          params: { sysparm_display_value: displayValue },
        });
        return response.data.result as any;
      } catch (err: any) {
        lastError = err;
        if (err?.response?.status !== 404) throw err;
      }
    }
    throw lastError;
  }

  async createRecord(table: string, data: Record<string, any>) {
    const candidates = this.getCandidateTables(table);
    let lastError: any = null;
    for (const t of candidates) {
      try {
        const response = await this.client.post(`/now/table/${t}`, data);
        return response.data.result as any;
      } catch (err: any) {
        lastError = err;
        if (err?.response?.status !== 404) throw err;
      }
    }
    throw lastError;
  }

  async updateRecord(table: string, sysId: string, data: Record<string, any>) {
    const candidates = this.getCandidateTables(table);
    let lastError: any = null;
    for (const t of candidates) {
      try {
        const response = await this.client.put(`/now/table/${t}/${sysId}`, data);
        return response.data.result as any;
      } catch (err: any) {
        lastError = err;
        if (err?.response?.status !== 404) throw err;
      }
    }
    throw lastError;
  }

  async deleteRecord(table: string, sysId: string) {
    const candidates = this.getCandidateTables(table);
    let lastError: any = null;
    for (const t of candidates) {
      try {
        await this.client.delete(`/now/table/${t}/${sysId}`);
        return { success: true };
      } catch (err: any) {
        lastError = err;
        if (err?.response?.status !== 404) throw err;
      }
    }
    throw lastError;
  }

  // ── User helpers (used by auth) ───────────────────────────────────────────
  async findUserByEmail(email: string) {
    const response = await this.client.get('/now/table/sys_user', {
      params: { sysparm_query: `email=${email}`, sysparm_limit: 1 },
    });
    const result = response.data.result;
    return result && result.length > 0 ? result[0] : null;
  }

  async findUserByUsername(userId: string) {
    const response = await this.client.get('/now/table/sys_user', {
      params: { sysparm_query: `user_name=${userId}`, sysparm_limit: 1 },
    });
    const result = response.data.result;
    return result && result.length > 0 ? result[0] : null;
  }

  /** Assign an x_snc_caresync_1.<roleName> role to a sys_user by sys_id. */
  async assignRole(userSysId: string, roleName: string) {
    const roleRes = await this.client.get('/now/table/sys_user_role', {
      params: { sysparm_query: `name=x_snc_caresync_1.${roleName}`, sysparm_limit: 1 },
    });
    if (roleRes.data.result && roleRes.data.result.length > 0) {
      const roleSysId = roleRes.data.result[0].sys_id;
      await this.client.post('/now/table/sys_user_has_role', {
        user: userSysId,
        role: roleSysId,
      });
      return true;
    }
    console.warn(`[ServiceNow] Role x_snc_caresync_1.${roleName} not found; skipped assignment.`);
    return false;
  }
}

export const snClient = new ServiceNowClient();
export default snClient;