export interface IncidentRequest {
  tripId: number;
  vehicleId: number;
  driverId: number;
  incidentType: string;
  description: string;
  incidentTime: string;
  status: string;
}

export interface IncidentResponse {
  id: number;
  tripId: number;
  tripCode: string;
  vehicleId: number;
  plateNumber: string;
  driverId: number;
  driverName: string;
  incidentType: string;
  description: string;
  incidentTime: string;
  status: string;
  createdAt: string;
}