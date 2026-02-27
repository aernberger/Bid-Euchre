import { Heart, Diamond, Club, Spade} from "lucide-react";

type Suit = "hearts" | "spades" | "diamonds" | "clubs";

interface PlayingCardProperties {
    suit: Suit;
    value: string;
    invalid?: boolean;
    selected?: boolean;
    onclick?: () => void;

}

const suitIcons = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
}

const suitColors = {
    hearts: "text-red-500",
    diamonds: "text-red-500",
    clubs: "text-gray-900",
    spades: "text-gray-900"
}



