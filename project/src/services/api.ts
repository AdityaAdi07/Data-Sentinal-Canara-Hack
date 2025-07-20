const API_BASE_URL = 'http://localhost:5000';
const API_KEY = '007085';

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  // Authentication
  async login(userId: string, apiKey: string) {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        api_key: apiKey,
      }),
    });
  }

  // User management
  async getUsers() {
    return this.makeRequest('/users');
  }

  // File management
  async getFiles(userId?: string, ownerId?: string) {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (ownerId) params.append('owner_id', ownerId);
    
    return this.makeRequest(`/files?${params.toString()}`);
  }

  async uploadFile(file: File, userId: string, description: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  async downloadFile(fileId: string, userId: string) {
    return this.makeRequest(`/download/${fileId}?user_id=${userId}`);
  }

  async getPartnerFiles(userId: string) {
    return this.makeRequest(`/partner-files?user_id=${userId}`);
  }

  // Access request management
  async requestAccess(fileId: string, requesterId: string, message?: string, honeytoken?: string) {
    return this.makeRequest('/request-access', {
      method: 'POST',
      body: JSON.stringify({
        file_id: fileId,
        requester_id: requesterId,
        message: message || '',
        honeytoken: honeytoken || '',
      }),
    });
  }

  async getAccessRequests(userId: string) {
    return this.makeRequest(`/access-requests?user_id=${userId}`);
  }

  async approveAccess(requestId: string, action: 'approve' | 'deny') {
    return this.makeRequest('/approve-access', {
      method: 'POST',
      body: JSON.stringify({
        request_id: requestId,
        action: action,
      }),
    });
  }

  // File access
  async accessFile(fileId: string, userId: string) {
    return this.makeRequest(`/file/${fileId}/access`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
      }),
    });
  }

  // File alerts
  async getFileAlerts(userId: string) {
    return this.makeRequest(`/file-alerts?user_id=${userId}`);
  }

  // Consent management
  async getConsent(userId: string) {
    return this.makeRequest(`/get_consent/${userId}`);
  }

  async updateConsent(userId: string, consentData: any) {
    return this.makeRequest(`/update_consent/${userId}`, {
      method: 'POST',
      body: JSON.stringify(consentData),
    });
  }

  // Honeytokens
  async generateHoneytoken(userId: string, partnerId?: string) {
    const params = new URLSearchParams({ user_id: userId });
    if (partnerId) params.append('partner_id', partnerId);
    
    return this.makeRequest(`/generate_honeytoken?${params.toString()}`);
  }

  // Watermarking
  async generateWatermark(partnerId: string, userId: string, timestamp: string) {
    return this.makeRequest('/generate_watermark', {
      method: 'POST',
      body: JSON.stringify({
        partner_id: partnerId,
        user_id: userId,
        timestamp: timestamp,
      }),
    });
  }

  // Policy management
  async generatePolicy(purpose: string, daysValid: number, region: string, userId: string) {
    return this.makeRequest('/generate_policy', {
      method: 'POST',
      body: JSON.stringify({
        purpose,
        days_valid: daysValid,
        region,
        user_id: userId,
      }),
    });
  }

  // Access logs
  async getAccessLogs() {
    return this.makeRequest('/access_log');
  }

  // User notifications
  async getUserNotifications(userId: string) {
    return this.makeRequest(`/user_notifications?user_id=${userId}`);
  }

  // Partner data requests
  async partnerRequestData(partnerId: string, region: string, requestedUsers: string[], purpose: string) {
    return this.makeRequest('/partner_request_data', {
      method: 'POST',
      body: JSON.stringify({
        partner_id: partnerId,
        region,
        requested_users: requestedUsers,
        purpose,
      }),
    });
  }

  // Bulk partner requests
  async bulkPartnerRequest(requests: any[]) {
    return this.makeRequest('/bulk_partner_request', {
      method: 'POST',
      body: JSON.stringify({ requests }),
    });
  }

  // Alerts
  async getAlerts(userId: string) {
    return this.makeRequest(`/alerts/${userId}`);
  }

  // Admin endpoints
  async getAdminTrapLogs() {
    return this.makeRequest('/admin/trap_logs');
  }

  async getRestrictedPartnersDetailed() {
    return this.makeRequest('/admin/restricted_partners_detailed');
  }

  async getPartnerActivitySummary() {
    return this.makeRequest('/admin/partner_activity_summary');
  }

  async getUserActivitySummary() {
    return this.makeRequest('/admin/user_activity_summary');
  }

  // Request admin action
  async requestAdminAction(userId: string, partnerId: string, reason: string) {
    return this.makeRequest('/request_admin_action', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        partner_id: partnerId,
        reason,
      }),
    });
  }

  // Simulate trap hit (for demo purposes)
  async simulateTrapHit(partnerId: string, userId: string) {
    return this.generateHoneytoken(userId, partnerId);
  }
}

export const apiService = new ApiService();