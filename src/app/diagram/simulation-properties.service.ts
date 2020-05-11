import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SimulationParametersListItemDTO } from '../models/dto/simulation-parameters-list-item-dto';
import { environment } from '../../environments/environment';
import { SimulationParametersDTO } from '../models/dto/simulation-parameters-dto';

@Injectable({
  providedIn: 'root'
})
export class SimulationPropertiesService {
  private apiEndpoint = environment.apiServer + '/simProperties';

  constructor(private httpClient: HttpClient) { }

  getDiagramSimulationProperties(diagramId: number) {
    const params = new HttpParams()
      .set('diagramId', String(diagramId));
    return this.httpClient.get<SimulationParametersListItemDTO[]>(`${this.apiEndpoint}`, {params});
  }

  getSimulationProperties(id: number) {
    return this.httpClient.get<SimulationParametersDTO>(`${this.apiEndpoint}/${id}`);
  }

  createSimulationProperties(diagramId: number, simProperties: SimulationParametersDTO) {
    const params = new HttpParams()
      .set('diagramId', String(diagramId));
    return this.httpClient.post<SimulationParametersDTO>(`${this.apiEndpoint}`, simProperties, {params});
  }

  updateSimulationProperties(id: number, simProperties: SimulationParametersDTO) {
    return this.httpClient.put<SimulationParametersDTO>(`${this.apiEndpoint}/${id}`, simProperties);
  }

  deleteSimulationProperties(id: number) {
    this.httpClient.delete(`${this.apiEndpoint}/${id}`).subscribe();
  }

}
