export interface LeaseCreatedPayload {
  key: string;
  expiresAt: Date;
}

export interface ListItemPayload {
  key: string;
  status: string;
  rentDuration: string;
}

export interface StatusData {
  statusAfter: string;
}
