import { ContractType } from "./enums/contractType.js";
import Suit, { SuitType } from "../models/enums/suit.js";

export class Bid {
    constructor(
        readonly bidderId: string,
        readonly tricks: number,
        readonly contractType: ContractType,
        readonly suitType?: SuitType,
        readonly loner: boolean = false
    ) {
        if (tricks < 0 || tricks > 6) {
            throw new Error("Invalid number of tricks");
        }

        if (loner && tricks !== 6) {
            throw new Error("Loner bid must be for 6 tricks");
        }

        if (contractType === ContractType.SUITED && !suitType) {
            throw new Error("Suited bid must have a suit type");
        }

        if (contractType !== ContractType.SUITED && suitType !== undefined) {
            throw new Error("Non-suited bids cannot have a suit type");
        }
    }

    /**
     * Should return:
     * > 0 if this bid is higher
     * < 0 if lower
     * 0 if equal
     */
    compareTo(other: Bid): number {
        // Primary comparison: trick count
        if (this.tricks !== other.tricks) {
            return this.tricks - other.tricks;
        }

        // Secondary comparison: contract type
        if (this.contractType !== other.contractType) {
            return this.contractType - other.contractType;
        }

        // Same tricks + contract: loner outranks non-loner (only valid for 6-trick bids)
        if (this.loner !== other.loner) {
            return (this.loner ? 1 : 0) - (other.loner ? 1 : 0);
        }

        return 0;
    }

    beats(other: Bid): boolean {
        return this.compareTo(other) > 0;
    }

    equals(other: Bid): boolean {
        return this.compareTo(other) === 0;
    }

    isPass(): boolean {
        return this.tricks === 0 && this.contractType === ContractType.LOW;
    }
}
