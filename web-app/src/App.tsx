import React from "react";
import "./App.css";
import { MainLayout } from "./MainLayout";
import { StpProvider } from "./context/StpContext";

function App() {
  return (
    <StpProvider>
      <div className="App">
        <MainLayout />
      </div>
    </StpProvider>
  );
}

export default App;
