export const TransportMode = {
  Driven: 0,
  Taxi: 1,
  None: 2,
} as const;

export type TransportMode = (typeof TransportMode)[keyof typeof TransportMode];

export const AbsenceScope = {
  Full: 1,
  Morning: 2,
  Afternoon: 3,
} as const;

export type AbsenceScope = (typeof AbsenceScope)[keyof typeof AbsenceScope];

export const AbsenceType = {
  Worker: 1,
  Driver: 2,
} as const;

export type AbsenceType = (typeof AbsenceType)[keyof typeof AbsenceType];

export const Leg = {
  Morning: 1,
  Afternoon: 2,
} as const;

export type Leg = (typeof Leg)[keyof typeof Leg];

export const TaxiExpenseStatus = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
  Paid: 4,
} as const;

export type TaxiExpenseStatus = (typeof TaxiExpenseStatus)[keyof typeof TaxiExpenseStatus];
