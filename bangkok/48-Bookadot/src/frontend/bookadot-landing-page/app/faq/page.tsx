"use client";
import Link from "next/link";
import Typography from "../components/Typography";
import Accordion from "../components/Accordition";

const FAQ_ITEMS: Array<{
  title: string | React.ReactNode;
  content: string | React.ReactNode;
}> = [
  {
    title: "What is TicketBooker?",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "What kind of tickets can I buy?",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Is there a return policy?",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #4",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #5",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #6",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #7",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #8",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #9",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
  {
    title: "Question #10",
    content:
      "Lorem ipsum dolor sit amet consectetur. Risus id dolor vel metus ornare amet. In faucibus pellentesque gravida platea augue et sit. Consequat pharetra odio lorem dignissim. Nam ut praesent dignissim eget pharetra morbi.",
  },
];

function FAQ() {
  return (
    <section className="flex flex-col items-center">
      <div className="my-20 flex w-[700px] flex-col items-center">
        <Typography
          component="h1"
          className="text-center text-header font-bold"
        >
          Frequently Asked Questions
        </Typography>
        <Typography
          component="label"
          className="mt-2 text-text-secondary-color"
        >
          Got another question for us?{" "}
          <Link className="text-accent-color" href={"/contact"}>
            Contact us
          </Link>{" "}
          via email!
        </Typography>

        <div className="mt-8 flex w-full flex-col">
          <Accordion
            items={FAQ_ITEMS.map(({ title, content }) => ({
              title:
                typeof title === "string" ? (
                  <span className={"font-medium"}>{title}</span>
                ) : (
                  title
                ),
              content:
                typeof content === "string" ? (
                  <Typography
                    component="p"
                    className="text-text-secondary-color"
                  >
                    {content}
                  </Typography>
                ) : (
                  content
                ),
            }))}

            //   [
            //   {
            //     title: <span>ddadd</span>,
            //     content: (
            //       <Typography component="p">
            //         Lorem ipsum dolor sit amet consectetur. Risus id dolor vel
            //         metus ornare amet. In faucibus pellentesque gravida platea
            //         augue et sit. Consequat pharetra odio lorem dignissim. Nam
            //         ut praesent dignissim eget pharetra morbi.
            //       </Typography>
            //     ),
            //   },
            //   {
            //     title: <span>xxxx</span>,
            //     content: <>adda</>,
            //   },
            // ]}
          ></Accordion>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
