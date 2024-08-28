import { BaseClient } from './BaseClient'

export class AdminClient extends BaseClient {
  async getConfig() {
    return (await this.http.get<{ data: { initialized: boolean } }>(`/admin/config`)).data.data
  }

  async login(data: { username: string, password: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/admin/login`, data)).data.data
  }

  async setup(data: { username: string, password: string }) {
    return (await this.http.post<{ data: any }>(`/admin/setup`, data)).data.data
  }

  async createAdmin(data: { username: string, password: string }) {
    return (await this.http.post<{ data: { id: number, username: string } }>(`/admin/admins`, data)).data.data
  }

  async deleteAdmin(id: number) {
    return (await this.http.delete<{ data: any }>(`/admin/admins/${id}`)).data.data
  }

  async listAdmins() {
    return (await this.http.get<{ data: Array<{ id: number, username: string }> }>(`/admin/admins`)).data.data
  }

  async updateAdmin(id: number, data: { username: string, password: string }) {
    return (await this.http.patch<{ data: any }>(`/admin/admins/${id}`, data)).data.data
  }

  async getAdmin(id: number) {
    return (await this.http.get<{ data: { id: number, username: string } }>(`/admin/admins/${id}`)).data.data
  }

  async createApp(data: { name: string }) {
    return (await this.http.post<{ data: { id: string, name: string, description: string | null, logoUrl: string | null, emailEnabled: boolean, googleEnabled: boolean, discordEnabled: boolean, twitterEnabled: boolean, tiktokEnabled: boolean, githubEnabled: boolean, huggingfaceEnabled: boolean, appleEnabled: boolean, telegramEnabled: boolean, ethEnabled: boolean, solEnabled: boolean, jwtTTL: number, googleClientId: string | null, telegramBotToken: string | null, tiktokClientKey: string | null, tiktokClientSecret: string | null, githubClientId: string | null, githubClientSecret: string | null, huggingfaceClientId: string | null, huggingfaceAppSecret: string | null, discordApplicationId: string | null } }>(`/admin/apps`, data)).data.data
  }

  async listApps() {
    return (await this.http.get<{ data: Array<{ id: string, name: string, description: string | null, logoUrl: string | null, emailEnabled: boolean, googleEnabled: boolean, discordEnabled: boolean, twitterEnabled: boolean, tiktokEnabled: boolean, githubEnabled: boolean, huggingfaceEnabled: boolean, appleEnabled: boolean, telegramEnabled: boolean, ethEnabled: boolean, solEnabled: boolean, jwtTTL: number, googleClientId: string | null, telegramBotToken: string | null, tiktokClientKey: string | null, tiktokClientSecret: string | null, githubClientId: string | null, githubClientSecret: string | null, huggingfaceClientId: string | null, huggingfaceAppSecret: string | null, discordApplicationId: string | null }> }>(`/admin/apps`)).data.data
  }

  async deleteApp(appId: string) {
    return (await this.http.delete<{ data: any }>(`/admin/apps/${appId}`)).data.data
  }

  async getAppSecret(appId: string) {
    return (await this.http.get<{ data: { appSecret: string, jwtSecret: string } }>(`/admin/apps/${appId}/secret`)).data.data
  }

  async updateApp(appId: string, data: { name?: string, description?: string, logoUrl?: string, emailEnabled?: boolean, googleEnabled?: boolean, discordEnabled?: boolean, twitterEnabled?: boolean, tiktokEnabled?: boolean, githubEnabled?: boolean, huggingfaceEnabled?: boolean, telegramEnabled?: boolean, appleEnabled?: boolean, ethEnabled?: boolean, solEnabled?: boolean, jwtTTL?: number, googleClientId?: string, telegramBotToken?: string, tiktokClientKey?: string, tiktokClientSecret?: string, githubClientId?: string, githubClientSecret?: string, huggingfaceClientId?: string, huggingfaceAppSecret?: string, discordApplicationId?: string }) {
    return (await this.http.patch<{ data: any }>(`/admin/apps/${appId}`, data)).data.data
  }

  async getApp(appId: string) {
    return (await this.http.get<{ data: { id: string, name: string, description: string | null, logoUrl: string | null, emailEnabled: boolean, googleEnabled: boolean, discordEnabled: boolean, twitterEnabled: boolean, tiktokEnabled: boolean, githubEnabled: boolean, huggingfaceEnabled: boolean, appleEnabled: boolean, telegramEnabled: boolean, ethEnabled: boolean, solEnabled: boolean, jwtTTL: number, googleClientId: string | null, telegramBotToken: string | null, tiktokClientKey: string | null, tiktokClientSecret: string | null, githubClientId: string | null, githubClientSecret: string | null, huggingfaceClientId: string | null, huggingfaceAppSecret: string | null, discordApplicationId: string | null } }>(`/admin/apps/${appId}`)).data.data
  }
}
