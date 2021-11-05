import React from "react";
import "./App.css";
import { MainLayout } from "./MainLayout";
import { SoleilProvider } from "./context/SoleilContext";

function App() {
  return (
    <SoleilProvider>
      <div className="App">
        <MainLayout />
      </div>
    </SoleilProvider>
  );
}

export default App;
