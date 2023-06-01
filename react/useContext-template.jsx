// Example template of useContext api
import React, { createContext, useContext, useState } from "react";

var initFILLINState = false; // initial state
export const FILLINContext = createContext(initFILLINState);

const reducer = (state, action) => {
    if (action.type === undefined) { return state }
    switch (action.type) {
        default:
            return state;
    }
}

export const useFILLINContextState = (useReactState) => {
    const [FILLINState, setFILLINState] = useContext(FILLINContext);
    if (useReactState) {
        return [FILLINState, setFILLINState]; // Expects to be in [-, -] format like useState
    }
    else if (useReactState === false) {
        return FILLINState; // return state
    } else {
        return setFILLINState; // return setState
    }
}

const FILLINContextProvider = ({ children }) => {
    // provide general React hook useState
    const [FILLINState, setFILLIN] = useState(initFILLINState);
    return (<FILLINContext.Provider value={[FILLINState, setFILLIN]}>
        {children}
    </FILLINContext.Provider>)
}

export default FILLINContextProvider;
