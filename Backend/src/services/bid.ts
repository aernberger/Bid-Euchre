import { ContractType } from "./enums/contractType.js";
import Suit, { SuitType } from "../models/properties/suit.js";

export class Bid {
    constructor(
        readonly bidderId: string,
        readonly tricks: number,
        readonly contractType: ContractType,
        readonly suitType?: SuitType,
        readonly loner: boolean = false
    ) {
        if (tricks < 1 || tricks > 6) {
            throw new Error("Invalid number of tricks");
        }

        if (loner && tricks !== 6) {
            throw new Error("Loner bid must be for 6 tricks");
        }

        if (contractType === ContractType.SUITED && !suitType) {
            throw new Error("Suited bid must have a suit type");
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
        return this.contractType - other.contractType;
    }

    beats(other: Bid): boolean {
        return this.compareTo(other) > 0;
    }

    equals(other: Bid): boolean {
        return this.compareTo(other) === 0;
    }
}
