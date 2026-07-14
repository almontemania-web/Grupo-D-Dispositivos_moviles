import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { MedicamentoInfo } from '../models/medicamento-info.model';

const OPENFDA_URL = 'https://api.fda.gov/drug/label.json';

@Injectable({ providedIn: 'root' })
export class MedicamentoApiService {
  private http = inject(HttpClient);

  buscarPorNombre(nombre: string): Observable<MedicamentoInfo | null> {
    const query = `openfda.brand_name:"${nombre}"+openfda.generic_name:"${nombre}"`;
    const url = `${OPENFDA_URL}?search=${encodeURIComponent(query)}&limit=1`;

    return this.http.get<any>(url).pipe(
      map(res => this.mapResultado(res)),
      catchError(() => of(null))
    );
  }

  private mapResultado(res: any): MedicamentoInfo | null {
    const item = res?.results?.[0];
    if (!item) return null;
    const openfda = item.openfda || {};

    return {
      nombreComercial: openfda.brand_name?.[0] || '—',
      nombreGenerico: openfda.generic_name?.[0] || '—',
      fabricante: openfda.manufacturer_name?.[0] || '—',
      proposito: (item.purpose?.[0] || item.indications_and_usage?.[0] || 'No disponible').slice(0, 300),
      advertencias: (item.warnings?.[0] || item.warnings_and_cautions?.[0] || 'No disponible').slice(0, 300),
      dosisSugerida: (item.dosage_and_administration?.[0] || 'No disponible').slice(0, 300)
    };
  }
}
