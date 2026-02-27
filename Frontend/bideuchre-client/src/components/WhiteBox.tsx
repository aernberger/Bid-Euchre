import React from "react";

interface WhiteBoxProperties {
    width?: string;
    height?: string;
    children?: React.ReactNode;
}

const WhiteBox: React.FC<WhiteBoxProperties> = ({width = "800px", height = "350px", children}) => {
    return (
        <div style={{
            width,
            height,
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px',
            boxSizing: 'border-box',
            alignItems: 'center',
            justifyContent: 'center'
        

        }}>
            {children}
        </div>


    );



};

export default WhiteBox;



