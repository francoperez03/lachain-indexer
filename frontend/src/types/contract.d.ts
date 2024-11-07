export interface Contract {
  id: number;
  address: string;
  name: string;
  abi: object | null;
  createdAt: string;
}
