export interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrls?: string[];
}

export type CreateMedicine = Omit<Medicine, 'id'>;
export type UpdateMedicine = Partial<CreateMedicine>;
