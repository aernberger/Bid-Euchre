const ContractType = Object.freeze({
  SUITED: 'Suited',
  HIGH: 'High',
  LOW: 'Low',
} as const);

export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType];
export default ContractType;
