import React from "react";
import "./App.css";
import { MainLayout } from "./features/mainLayout/MainLayout";
import { SoleilProvider } from "./context/SoleilContext";
import { CeramicProvider } from "./context/CeramicContext";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <CeramicProvider>
        <SoleilProvider>
          <div className="App">
            <MainLayout />
          </div>
        </SoleilProvider>
      </CeramicProvider>
    </Router>
  );
}

export default App;
