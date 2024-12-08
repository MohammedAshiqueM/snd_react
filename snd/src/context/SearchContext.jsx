import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext({
    searchContext: 'questions', // Default context
    setSearchContext: () => {} 
});

export const SearchContextProvider = ({ children }) => {
    const [searchContext, setSearchContext] = useState('questions');
    console.log("search context is here ......................",searchContext)

    return (
        <SearchContext.Provider value={{ 
            searchContext, 
            setSearchContext 
        }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchContext = () => useContext(SearchContext);