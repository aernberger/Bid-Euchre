import { Heart, Diamond, Club, Spade} from "lucide-react";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";

interface PlayingCardProperties {
    suit: Suit;
    value: string;
    invalid?: boolean;
    selected?: boolean;
    onclick?: () => void;

}

