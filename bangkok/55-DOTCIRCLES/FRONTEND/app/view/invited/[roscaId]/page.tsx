import { AvatarMap, myAddress, NameMap } from "@/app/lib/mock";
import getApi from "@/app/lib/polkadot";
import {
  getInvitedParticipants,
  getPendingRoscasDetails,
  getSecurityDeposits,
  getWaitingParticipiants,
} from "@/app/lib/queries";
import RoscaInfo from "@/components/detailsBlock";
import InvitedParticipantTable from "@/components/invitedParticipants";
import SecurityDepositsTable from "@/components/securityDepositsTable";
import StartRoscaBtn from "@/components/startRosca";
import { Avatar } from "@nextui-org/avatar";
import { redirect } from "next/navigation";
import { title } from "@/components/primitives";
import { createDepositRows } from "@/app/lib/helpers";

export default async function Page({
  params,
}: {
  params: { roscaId: string };
}) {
  const address = myAddress;
  const { roscaId } = await params;
  const roscaDetails: any = await getPendingRoscasDetails(roscaId);
  const securityDeposits: any = await getSecurityDeposits(roscaId);
  const depositRows = createDepositRows(securityDeposits);
  if (!roscaDetails) {
    redirect("/");
  }
  const invitedParticipants = await getInvitedParticipants(roscaId);
  const joinedParticipants: any = await getWaitingParticipiants(roscaId);

  const displayRows: any = [];

  let currentJoinCount = 0;

  invitedParticipants.forEach((participant: any) => {
    let joined = joinedParticipants.includes(participant[0] as string);
    let row: any = {
      key: participant[0],
      avatar: (
        <Avatar
          src={AvatarMap[participant[0] as string]}
          name={NameMap[participant[0] as string]}
          size="lg"
        />
      ),
      name: (
        <div className="font-extrabold text-2xl">
          <span className={joined ? "text-green-400" : ""}>
            {NameMap[participant[0] as string]}
          </span>
        </div>
      ),
      joined,
    };
    if (participant[0] == address) {
      row["showButton"] = joinedParticipants.includes(address)
        ? "leave"
        : "join";
    }
    displayRows.push(row);
    if (joined) currentJoinCount++;
  });

  return (
    <div>
      <section className="pb-7">
        <RoscaInfo
          name={roscaDetails.name}
          type={roscaDetails.randomOrder ? "Random" : "Fixed Order"}
          start={roscaDetails.startByBlock}
          contributionFrequency={roscaDetails.contributionFrequency}
          totalParticipants={roscaDetails.numberOfParticipants}
          minParticipants={roscaDetails.minimumParticipantThreshold}
        />
      </section>
      <section className="pb-7 flex justify-center">
        <div>
          <StartRoscaBtn roscaId={roscaId} startable={currentJoinCount} />
        </div>
      </section>

      <section className="pb-7 text-center">
        <div className={title()}>Invited Participants</div>
        <InvitedParticipantTable rows={displayRows} roscaId={roscaId} />
      </section>

      <section className="pb-7">
        <SecurityDepositsTable rows={depositRows} roscaId={roscaId} />
      </section>
    </div>
  );
}
