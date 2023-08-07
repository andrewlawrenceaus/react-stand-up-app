import { React, useState } from "react";
import ManageStandUp from "./components/manage-stand-up/ManageStandUp";
import RunStandUp from "./components/run-stand-up/RunStandUp";
import Header from "./components/header/Header";
import { Container } from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const App = () => {
  const defaultStandUps = new Map();
  defaultStandUps.set("Billabong", [
    "Andrew L",
    "Anthony",
    "Evan",
    "Jono",
    "Kathleen",
    "Kane",
    "Sam",
    "Nik",
    "Tim",
    "Nikunj",
    "Andrew B",
    "Tanvi",
    "Grant",
    "Sharon",
    "David",
  ]);
  defaultStandUps.set("Soledad", ["Sharon", "Keerthi", "Chris"]);

  const [standUps, setStandUps] = useState(defaultStandUps);
  const [activeStandUp, setActiveStandUp] = useState("Billabong");
  const [activePage, setActivePage] = useState("Manage Stand-Ups");

  const pageButtonClickHandler = (page) => {
    setActivePage(page);
    console.log(page);
  };
  return (
    <div>
      <Header onPageButtonClick={pageButtonClickHandler}></Header>
      <Container>
        {activePage === "Manage Stand-Ups" ? (
          <ManageStandUp
            standUps={standUps}
            setStandUps={setStandUps}
            setActiveStandUp={setActiveStandUp}
          ></ManageStandUp>
        ) : (
          <RunStandUp
            standUp={standUps.get(activeStandUp)}
            activeStandUp={activeStandUp}
          ></RunStandUp>
        )}
      </Container>
    </div>
  );
};

export default App;
