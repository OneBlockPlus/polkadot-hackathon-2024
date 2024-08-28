import { ApiCommunity } from '../data-model/api-community';

export class CommunityService {
  static async getAll(): Promise<ApiCommunity[]> {
    const response = await fetch('/api/communities');
    if (!response.ok) {
      throw new Error('Failed to fetch communities');
    }
    const data = await response.json();
    return data as ApiCommunity[];
  }

  static async create(community: Omit<ApiCommunity, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<ApiCommunity> {
    const response = await fetch('/api/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(community)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create community');
    }

    const data = await response.json();
    return data as ApiCommunity;
  }

  static async getByPolkadotReferenceId(polkadotReferenceId: string): Promise<ApiCommunity> {
    const response = await fetch(`/api/communities/${polkadotReferenceId}`);
    if (!response.ok) {
      return { template: null } as any;
    }
    const data = await response.json();
    return data as ApiCommunity;
  }

  static async getBySubdomain(subdomain: string): Promise<ApiCommunity> {
    const response = await fetch(`/api/communities/subdomain/${subdomain}`);

    if (!response.ok) {
      window.location.href = window.location.protocol + '//' + window.location.host.split('.').splice(1).join('.') + '/joined';
      return;
    }

    const data = await response.json();
    return data as ApiCommunity;
  }

  static async updateByPolkadotReferenceId(polkadotReferenceId: string, updateData: Partial<ApiCommunity>): Promise<ApiCommunity> {
    const response = await fetch(`/api/communities/${polkadotReferenceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update community');
    }

    const data = await response.json();
    return data as ApiCommunity;
  }

  static async deleteByPolkadotReferenceId(polkadotReferenceId: string): Promise<void> {
    const response = await fetch(`/api/communities/${polkadotReferenceId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete community');
    }
  }
}
