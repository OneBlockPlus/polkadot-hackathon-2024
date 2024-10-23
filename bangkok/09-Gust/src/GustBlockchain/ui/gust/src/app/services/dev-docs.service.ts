import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DevDocsService {

  constructor(private http: HttpClient) {}

  fetchReadme(): Observable<string> {
    return this.http.get('assets/GUST.md', { responseType: 'text' });
  }

}
