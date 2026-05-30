export interface FuelTransaction {
  id: number;
  vehicleId: number;
  plateNumber: string;
  tripId: number;
  driverId: number;
  driverName: string;
  fuelDate: string;
  quantityLiters: number;
  unitPrice: number;
  totalAmount: number;
  invoiceNumber: string;
  createdAt: string;
}

export interface FuelTransactionRequest {
  vehicleId: number;
  tripId: number;
  driverId: number;
  fuelDate: string;
  quantityLiters: number;
  unitPrice: number;
  invoiceNumber: string;
}