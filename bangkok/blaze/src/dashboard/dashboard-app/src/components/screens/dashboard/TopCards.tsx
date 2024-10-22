import { BookAIcon, Code, Link, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInvoice } from "@tabler/icons-react";
import { Card, HoverEffect} from "../../ui/card-hover-effect";




const CreateLink  =  ()  =>  {
    return(
         <div  className="w-full p-4 h-56  relative">
              <Link   className="text-muted-foreground m-5" />
                <div>
                     <h1  className="font-bold text-xl mb-3">Create payment link</h1>

              <h2>Recieve crypto payment for  anything.</h2>
                </div>

                 <div  className="absolute bottom-1">
                      <Button  variant={"ghost"} className="flex space-x-2 items-center">
                        <Plus className="w-4 h-4"  />
                        <p>Create</p>      
                    </Button>
                 </div>
             
         </div>
    )
}

const Integarte  =  ()  =>  {
    return(
         <div  className="w-full p-4 h-56  relative">
              <Code   className="text-muted-foreground m-5" />
                <div>
                     <h1  className="font-bold text-xl mb-3">
                     Integrate payments</h1>

              <h2>Powered your app with crypto payments through a powerful API</h2>
                </div>

                 <div  className="absolute bottom-1">
                      <Button  variant={"ghost"} className="flex space-x-2 items-center">
                        <BookAIcon className="w-4 h-4"  />
                        <p>Read docs</p>      
                    </Button>
                 </div>
             
         </div>
    )
}

const CreateInvoice  =  ()  =>  {
    return(
         <div  className="w-full p-4 h-56  relative">
              <IconInvoice   className="text-muted-foreground m-5" />
                <div>
                     <h1  className="font-bold text-xl mb-3">
                     Create an invoice</h1>

              <h2>Create and send crypto invoices to your customers or clients</h2>
                </div>

                 <div  className="absolute bottom-1">
                      <Button  variant={"ghost"} className="flex space-x-2 items-center">
                        <Plus className="w-4 h-4"  />
                        <p>Create</p>      
                    </Button>
                 </div>
             
         </div>
    )
}

export function TopCrads() {
  return (
    <div className="w-full mx-auto px-1">
  <HoverEffect    items={projects}  />
     
    </div>
  );
}
export const projects = [
  {
    title: "Create paylink",
    description: "Powered your app with crypto payments through a powerful API",
    link: "/dashboard/payment-links",
    children : CreateLink()
    
  },
  {
    title: "Create invoice",
    description:
      "Create and send crypto invoices to your customers or clients",
    link: "/dashboard/invoices",
    children : CreateInvoice()
  },
  {
    title: "Docs",
    description:
      "Powered your app with crypto payments through a powerful API",
    link: "/docs",
    children : Integarte()
    
  },

];

