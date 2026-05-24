export interface Trip {
  id: number;

  tripCode: string;

  vehicleId: number;
  plateNumber: string;

  driverId: number;
  driverName: string;

  routeId: number;
  routeName: string;

  departureTime: string;
  arrivalTime?: string;

  status: string;
}