import { useContext } from "react";
import { AppContext } from "./appContext.js";

export const useApp = () => useContext(AppContext);
