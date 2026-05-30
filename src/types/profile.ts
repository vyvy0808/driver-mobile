export interface DriverProfile {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
  createdAt: string;
}

export interface DriverAssignment {
  id: number;
  vehicleId: number;
  plateNumber: string;
  driverId: number;
  driverName: string;
  assignedDate: string;
  status: string;
}