import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SearchResult } from '../models/search.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  searchFixes(params: {
    q: string;
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    sessionId?: string;
  }) {
    let httpParams = new HttpParams().set('q', params.q);
    if (params.make) httpParams = httpParams.set('make', params.make);
    if (params.model) httpParams = httpParams.set('model', params.model);
    if (params.year) httpParams = httpParams.set('year', String(params.year));
    if (params.vin) httpParams = httpParams.set('vin', params.vin);
    if (params.sessionId)
      httpParams = httpParams.set('sessionId', params.sessionId);

    return this.http.get<SearchResult>(`${this.apiUrl}/search/fixes`, {
      params: httpParams,
    });
  }

  trackMechanicView(
    mechanicId: string,
    options: {
      sessionId?: string;
      source?: string;
      clickedLink?: boolean;
    } = {},
  ) {
    return this.http.post(
      `${this.apiUrl}/search/mechanics/${mechanicId}/view`,
      options,
    );
  }
}
