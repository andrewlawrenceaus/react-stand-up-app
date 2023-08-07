import { React, useEffect, useState } from "react";
import ManageStandUp from "./components/manage-stand-up/ManageStandUp";
import RunStandUp from "./components/run-stand-up/RunStandUp";
import Header from "./components/header/Header";
import { Container } from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const App = () => {
  //TODO: replace with React Router
  const [activeStandUp, setActiveStandUp] = useState("Billabong");
  const [activePage, setActivePage] = useState("Manage Stand-Ups");

  const [standUps, setStandUps] = useState();
  useEffect(() => {
    fetchStandUpData(setStandUps);
  }, []);

  const pageButtonClickHandler = (page) => {
    setActivePage(page);
    console.log(page);
  };
  return (
    <div>
      <Header onPageButtonClick={pageButtonClickHandler}></Header>
      <Container sx={{ marginY: 3 }}>
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

const fetchStandUpData = (setStandUps) => {
  fetch("standUpData.json", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((standUpJson) => {
      const standUpMap = new Map(Object.entries(standUpJson));
      console.log(standUpMap);
      setStandUps(standUpMap);
    });
};
