import { AdminClient } from './AdminClient'
import { AppClient } from './AppClient'
import { UserClient } from './UserClient'

export class OpenAuthClient {
  public readonly admin: AdminClient
  public readonly app: AppClient
  public readonly user: UserClient

  constructor(baseURL: string) {
    this.admin = new AdminClient(baseURL)
    this.app = new AppClient(baseURL)
    this.user = new UserClient(baseURL)
  }
}
