declare const ContractType: Readonly<{
    readonly SUITED: "Suited";
    readonly HIGH: "High";
    readonly LOW: "Low";
}>;
export type ContractTypeValue = (typeof ContractType)[keyof typeof ContractType];
export default ContractType;
