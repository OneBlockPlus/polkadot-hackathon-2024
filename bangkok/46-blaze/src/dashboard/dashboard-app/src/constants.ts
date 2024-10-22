import { TbSmartHome } from "react-icons/tb";
import { GrGroup } from "react-icons/gr";
import { GiSettingsKnobs } from "react-icons/gi";
import { Calendar } from "lucide-react";

export const  END_POINT_URL =  "https://sapo-rdii.onrender.com"

export const  sideBarMenu = [
    {
      title  :  "Home",
      icon :  TbSmartHome,
      link : "/dashboard"
    },
    {
        title  :  "Communities",
        icon :  GrGroup,
        link : "/communities"
      },
      {
        title  :  "Subscription",
        icon :  Calendar,
        link : "/subscriptions"
      },
      {
        title  :  "Settings",
        icon :  GiSettingsKnobs,
        link : "/settings"
      },
]