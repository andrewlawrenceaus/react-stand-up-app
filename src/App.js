import { React, useState } from 'react';
import ManageStandUp from './components/manage-stand-up/ManageStandUp';
import RunStandUp from './components/run-stand-up/RunStandUp';
import Header from './components/header/Header';


const App = () => {
    
    const defaultStandUps = new Map();
    defaultStandUps.set('Billabong',['Andrew L','Anthony'
,'Evan','Jono','Kathleen','Kane','Sam','Nik','Tim','Nikunj',
'Andrew B','Tanvi', 'Grant', 'Sharon','David'])

    const [standUps, setStandUps] = useState(defaultStandUps);
    const [activeStandUp, setActiveStandUp] = useState('Billabong');
    const [activePage, setActivePage] = useState('Manage Stand-Ups');
    
    const pageButtonClickHandler = page => {
        setActivePage(page);
        console.log(page);
    }




    return (
        <div>
            <Header onPageButtonClick={pageButtonClickHandler}></Header>
            {activePage === 'Manage Stand-Ups' ?
            <ManageStandUp></ManageStandUp>
            :
            <RunStandUp standUp={standUps.get(activeStandUp)}
            activeStandUp={activeStandUp}></RunStandUp>
    }
        </div>
    );
};

export default App;