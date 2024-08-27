import type { AxiosInstance } from 'axios'

import type { ErrorHandler } from '../utils/buildHttpClient'
import { buildHttpClient } from '../utils/buildHttpClient'

export class BaseClient {
  private readonly baseURL: string
  protected http: AxiosInstance
  private token?: string
  public onError?: ErrorHandler

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL
    this.token = token
    this.http = buildHttpClient(this.baseURL, token, this.onError)
  }

  public updateToken(token?: string) {
    this.token = token
    this.http = buildHttpClient(this.baseURL, token, this.onError)
  }

  public isAuthorized() {
    return !!this.token
  }
}
