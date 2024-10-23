import React, { createContext, useState, useContext } from 'react';

// Create the DataContext
const DataContext = createContext();

// SuccessProvider component that will wrap your app and provide context
export const DataProvider = ({ children }) => {
    const [dataModalOpen, setDataModalOpen] = useState(false);
    const [dataInfo, setDataInfo] = useState([]);

    const openDataModal = (data) => {
        setDataInfo(data);
        setDataModalOpen(true);
    };

    const closeDataModal = () => {
        setDataInfo([]);
        setDataModalOpen(false);
    };

    return (
        <DataContext.Provider value={{ dataInfo, setDataInfo, dataModalOpen, openDataModal, closeDataModal }}>
            {children}
        </DataContext.Provider>
    );
};

// Custom hook to use the DataContext
export const useData = () => {
    return useContext(DataContext);
};

export default DataContext;
