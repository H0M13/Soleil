import React from "react";
import "./App.css";
import { MainLayout } from "./features/mainLayout/MainLayout";
import { SoleilProvider } from "./context/SoleilContext";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <SoleilProvider>
        <div className="App">
          <MainLayout />
        </div>
      </SoleilProvider>
    </Router>
  );
}

export default App;
