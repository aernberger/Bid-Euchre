import { Contract } from "../services/contract.js";
import { ContractType } from "../services/enums/contractType.js";
import Card from "./card.js"
import  { SuitType } from "./enums/suit.js";

interface PlayedCard {
    playerId: string
    card: Card
  }

export default class Trick{
    plays: PlayedCard[] = []
    leadSuit?: SuitType
    
    constructor(private readonly contract: Contract,
        private readonly maxPlays: number) {}

    playCard(playerId: string, card: Card){
        if (this.isComplete()) {
            throw new Error("Trick already complete")
          }
      
          if (this.plays.length === 0) {
            this.leadSuit = card.suit
          }
      
          this.plays.push({ playerId, card })
        }

    isComplete(): boolean {
        return this.plays.length === this.maxPlays
        }

    getLeadSuit(): SuitType | undefined {
        return this.leadSuit
        }
    
        getWinner(): string {
        if (!this.isComplete()) {
            throw new Error("Trick not complete")
        }
    
        let winningPlay = this.plays[0]
    
        for (let i = 1; i < this.plays.length; i++) {
            const current = this.plays[i]
    
            const comparison = this.contract.compareCards(
            current.card,
            winningPlay.card,
            this.leadSuit!
            )
    
            if (comparison > 0) {
            winningPlay = current
            }
        }
    
        return winningPlay.playerId
        }
    
        getPlays(): PlayedCard[] {
        return [...this.plays]
        }
}









    

    

