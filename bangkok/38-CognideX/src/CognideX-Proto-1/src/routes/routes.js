import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import DGPT from '../pages/DGPT.jsx';
import Account from '../pages/Account.jsx';
import DataPool from '../pages/DataPool.jsx';
import NavigationBar from '../components/navigation/NavigationBar.jsx';
import ContributeDataPool from '../pages/ContributeDataPool.jsx';

const AppRouter = () => {

    return (
        <Router>
            <Routes>
                <Route element={<NavigationBar />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/D-GPT" element={<DGPT />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/datapool" element={<DataPool />} />
                    <Route path="/datapool/contribute/:name" element={<ContributeDataPool />} />
                </Route>
            </Routes>
        </Router>
    )
};

export default AppRouter;