import { Routes, Route } from "react-router-dom";
import Landing from "../features/landing";
import { RegisterSite } from "../features/registerSite";
import { SubmitFunds } from "../features/submitFunds";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="submit-funds" element={<SubmitFunds />} />
    <Route path="register-site" element={<RegisterSite />} />
  </Routes>
)

export default AppRoutes;