"use client";

import { useContext } from "react";
import { UserDetailsContext } from "./userDetailsContext";

const useUserDetailsContext = () => {
  return useContext(UserDetailsContext);
};

export default useUserDetailsContext;
