export interface Prescription {
  id: number;
  userId: number;
  medicineId: number;
  quantity: number;
  date: Date;
}

export type CreatePrescription = Pick<
  Prescription,
  'userId' | 'medicineId' | 'quantity'
>;
export type UpdatePrescription = Partial<CreatePrescription>;
