import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BeakerIcon, UserGroupIcon, CurrencyDollarIcon, ArrowCircleLeftIcon } from '@heroicons/react/solid';
import Cookies from 'js-cookie'
import navicationIcon from '../assets/navigation-panel-logo.svg'
import './DashboardLayout.css'
function DashboardLayout() {
   let navigate = useNavigate();
   let location = useLocation();


   const ROUTES = [
      {
         id: 'studies',
         IconComponent: BeakerIcon,
         title: 'Studies',
         route: '/studies',
      },
      {
         id: 'team',
         IconComponent: UserGroupIcon,
         title: 'Team',
         route: '/team',
      },
      {
         id: 'payment',
         IconComponent: CurrencyDollarIcon,
         title: 'Payment',
         route: '/payment',
      },
   ];

   return (
      <div className="h-screen flex overflow-hidden">
         <div className="bottomBar bg-white flex flex-col">
           <div className="bottomIcon border-b border-b-gray-200 bg-gray-100 flex justify-center" >
              <img src={navicationIcon} className="h-full w-10"/>
           </div>
           {ROUTES.map(({id, IconComponent, title, route }) => {
              const active = location.pathname.includes(route);

              return (
               <div
                  key={id}
                  className="aspect-square w-full border-b border-b-gray-200 flex flex-col items-center justify-center hover:cursor-pointer"
                  onClick={() => window.location.href =(route)}
               >
                  <IconComponent className={`h-6 w-6 ${active && 'text-orange-400'}`} />
                  <p className={`text-md ${active && 'text-orange-400'}`}>{title}</p>
               </div>
              );
            })}
            <div className="flex-1" />
            <div
               className="aspect-square w-full border-b border-b-gray-200 flex flex-col items-center justify-center hover:cursor-pointer"
               onClick={() =>{Cookies.remove("login");Cookies.remove("userid");    window.localStorage.removeItem("type");window.location.href="/";} }
            >
               <ArrowCircleLeftIcon className="h-6 w-6" />
               <p className={`text-md`}>Log out</p>
            </div>
         </div>
         <div style={{"background":"#7CD1E3"}} className="flex-1 overflow-y-auto scroll-smooth">
            <div className="px-40 py-20 container mx-auto">
               <Outlet />
            </div>
         </div>
      </div>
   );
 }

 export default DashboardLayout;
 