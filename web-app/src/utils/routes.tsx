import { Routes, Route } from "react-router-dom";
import Landing from "../features/landing";
import Dashboard from "../features/dashboard";
import { RegisterSite } from "../features/registerSite";
import { SubmitFunds } from "../features/submitFunds";
import { ClaimDai } from "../features/claimTokens/ClaimDai";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="submit-funds" element={<SubmitFunds />} />
    <Route path="register-site" element={<RegisterSite />} />
    <Route path="claim-dai" element={<ClaimDai />} />
  </Routes>
)

export default AppRoutes;