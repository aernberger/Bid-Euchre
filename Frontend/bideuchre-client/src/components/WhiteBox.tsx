import React from "react";
import { whiteBoxStyle } from "./WhiteBox.styles";

interface WhiteBoxProperties {
    width?: string;
    height?: string;
    children?: React.ReactNode;
}

const WhiteBox: React.FC<WhiteBoxProperties> = ({width = "clamp(533px, 60vw, 1200px)", height = "clamp(233px, 35vh, 525px)", children}) => {
    return (
        <div style={whiteBoxStyle(width, height)}>
            {children}
        </div>


    );



};

export default WhiteBox;



