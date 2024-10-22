import { Button } from "flowbite-react";
import Input from "../components/Input";
import TextArea from "../components/Textarea";
import Typography from "../components/Typography";

const ContactPage = () => {
  return (
    <main className="min-h-main flex flex-col items-center">
      <div className="my-20 flex w-[754px] flex-col">
        <Typography
          component="span"
          className="text-center text-header font-bold"
        >
          Got anything for us? Leave a{" "}
          <span className="text-accent-color">message!</span>
        </Typography>

        <Typography
          component="p"
          className="mt-2 text-normal text-text-secondary-color"
        >
          Or contact us via Instagram, Linkedin or Customer Support.
        </Typography>

        <div className="mt-8 grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Input placeholder="Full Name" />
          </div>
          <div className="col-span-6">
            <Input placeholder="Email address" />
          </div>
          <div className="col-span-12">
            <TextArea
              rows={8}
              placeholder="Your message here"
              className="resize-none"
            />
          </div>
        </div>

        <Button color="bookadot-secondary" type={'button'} className="mt-4 hover:opacity-80 w-[50%] content-center self-center" size={'xl'}>
          Send Message --&gt;
        </Button>
      </div>
    </main>
  );
};

export default ContactPage;
