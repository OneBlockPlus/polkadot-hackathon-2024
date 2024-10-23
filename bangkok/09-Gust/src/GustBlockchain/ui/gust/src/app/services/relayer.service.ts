import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroment/enviroment.development';
import { Observable } from 'rxjs';
import { DeploymentRequest } from '../model/deploy_smart-object';
import { SendTransactionRequest } from '../model/send_transaction-object';


interface DeployResponse {
  logs: string[];
  success: boolean;
  message: string;
}

interface SendTransactionResponse {
  logs: string[];
  success: boolean;
  message: string;
}
@Injectable({
  providedIn: 'root'
})
export class TransactionRelayerService {
  private URL: string = environment.TXN_API_URL;

  constructor(private http: HttpClient) {}

  deploy(formBody: DeploymentRequest): Observable<DeployResponse> {
    const route: string = "/api/deploy-contract";
    return this.http.post<DeployResponse>(this.URL + route, formBody,{ withCredentials: true });
  }

  sendAndSign(formBody: SendTransactionRequest): Observable<SendTransactionResponse> {
    const route: string = "/api/relay-transaction";
    return this.http.post<SendTransactionResponse>(this.URL + route, formBody,{ withCredentials: true });
  }
}

