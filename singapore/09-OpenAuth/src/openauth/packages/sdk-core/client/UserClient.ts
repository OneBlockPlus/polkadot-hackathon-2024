import { BaseClient } from './BaseClient'

export class UserClient extends BaseClient {
  async bindWithDiscord(data: { discordId: string, token: string }) {
    return (await this.http.post<{ data: any }>(`/user/bind-discord`, data)).data.data
  }

  async bindWithEthereum(data: { ethAddress: string, signature: string }) {
    return (await this.http.post<{ data: any }>(`/user/bind-ethereum`, data)).data.data
  }

  async bindWithGoogle(data: { email: string, token: string }) {
    return (await this.http.post<{ data: any }>(`/user/bind-google`, data)).data.data
  }

  async bindWithSolana(data: { solAddress: string, signature: string }) {
    return (await this.http.post<{ data: any }>(`/user/bind-solana`, data)).data.data
  }

  async getConfig(params: { appId: string }) {
    return (await this.http.get<{ data: { production: boolean, brand: string, message: string, googleClientId: string | null, discordApplicationId: string | null } }>(`/user/config`, { params })).data.data
  }

  async getProfile() {
    return (await this.http.get<{ data: { id: string, email: string | null, google: string | null, discord: string | null, tiktok: string | null, github: string | null, huggingface: string | null, twitter: string | null, apple: string | null, telegram: string | null, ethAddress: string | null, solAddress: string | null, username: string | null, referCode: string, avatar: string | null, displayName: string | null, createdAt: number, lastSeenAt: number, referrer: string | null } }>(`/user/profile`)).data.data
  }

  async getWallets() {
    return (await this.http.get<{ data: { solWallet: string, ethWallet: string, dotWallet: string } }>(`/user/wallets`)).data.data
  }

  async logInWithDiscord(data: { appId: string, discord: string, token: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-discord`, data)).data.data
  }

  async logInWithEthereum(data: { appId: string, ethAddress: string, signature: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-ethereum`, data)).data.data
  }

  async logInWithGithub(data: { appId: string, token: string, tokenType?: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-github`, data)).data.data
  }

  async logInWithGoogle(data: { appId: string, email: string, token: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-google`, data)).data.data
  }

  async logInWithHuggingFace(data: { appId: string, token: string, tokenType?: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-huggingface`, data)).data.data
  }

  async logInWithSolana(data: { appId: string, solAddress: string, signature: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-solana`, data)).data.data
  }

  async logInWithTelegram(data: { appId: string, data: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-telegram`, data)).data.data
  }

  async logInWithTikTok(data: { appId: string, openId: string, token: string }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-tiktok`, data)).data.data
  }

  async logInWithUsername(data: { appId: string, username: string, password: string, type: 'login' | 'register' }) {
    return (await this.http.post<{ data: { token: string } }>(`/user/login-username`, data)).data.data
  }

  async updatePassword(data: { oldPassword: string, newPassword: string }) {
    return (await this.http.post<{ data: any }>(`/user/update-password`, data)).data.data
  }

  async updateProfile(data: { avatar: string, displayName: string }) {
    return (await this.http.post<{ data: any }>(`/user/update-profile`, data)).data.data
  }

  async exportSolanaPrivateKey() {
    return (await this.http.post<{ data: string }>(`/user/solana/private-key`)).data.data
  }

  async sendSolanaToken(data: { rpcUrl: string, address: string, token: string, amount: number }) {
    return (await this.http.post<{ data: { signature: string } }>(`/user/solana/send-token`, data)).data.data
  }

  async signSolanaTransaction(data: { rpcUrl: string, transaction: string }) {
    return (await this.http.post<{ data: { signature: string } }>(`/user/solana/sign-transaction`, data)).data.data
  }
}
