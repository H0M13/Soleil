import { Routes, Route } from "react-router-dom";
import Landing from "../features/benefitsExplainers";
import { RegisterSite } from "../features/registerSite/RegisterSite";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="register-site" element={<RegisterSite />} />
  </Routes>
)

export default AppRoutes;