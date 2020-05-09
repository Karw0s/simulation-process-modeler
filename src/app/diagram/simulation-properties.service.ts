import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Simulation } from '../models/simulation';
import { SimulationParametersListItemDTO } from '../models/dto/simulation-parameters-list-item-dto';
import { environment } from '../../environments/environment';
import { SimulationParametersDTO } from '../models/dto/simulation-parameters-dto';

@Injectable({
  providedIn: 'root'
})
export class SimulationPropertiesService {

  constructor(private httpClient: HttpClient) { }

  getDiagramSimulationProperties(diagramId: number) {
    return this.httpClient.get<SimulationParametersListItemDTO[]>(`${environment.apiServer}/diagrams/${diagramId}/simProperties`);
  }

  getSimulationProperties(id: number) {
    return this.httpClient.get<SimulationParametersDTO>(`${environment.apiServer}/simProperties/${id}`);
  }

  createSimulationProperties(diagramId: number, simProperties: Simulation) {
    return this.httpClient.post(`${environment.apiServer}/diagrams/${diagramId}/simProperties`, simProperties);
  }

  updateSimulationProperties(id: number, simProperties: Simulation) {
    return this.httpClient.post(`${environment.apiServer}/simProperties/${id}`, simProperties);
  }

  deleteSimulationProperties(id: number) {
    this.httpClient.delete(`${environment.apiServer}/simProperties/${id}`).subscribe();
  }

}
