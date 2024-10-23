import { AvatarMap, myAddress, NameMap } from "@/app/lib/mock";
import getApi from "@/app/lib/polkadot";
import {
  getActiveRoscaParticipantsOrder,
  getActiveRoscasDetails,
  getCurrentContributors,
  getDefaulters,
  getInvitedParticipants,
  getSecurityDeposits,
  getWaitingParticipiants,
} from "@/app/lib/queries";
import RoscaInfo from "@/components/detailsBlock";
import InvitedParticipantTable from "@/components/invitedParticipants";

import SecurityDepositsTable from "@/components/securityDepositsTable";
import StartRoscaBtn from "@/components/startRosca";
import { Avatar } from "@nextui-org/avatar";
import { redirect } from "next/navigation";

import { createDefaulterTableData, createDepositRows } from "@/app/lib/helpers";

import DefaultersTable from "@/components/defaultersTable";
import ContributorsTable from "@/components/contributorsTable";
import PendingContributorsTable from "@/components/pendingContributorsTable";

export default async function Page({
  params,
}: {
  params: { roscaId: string };
}) {
  const address = myAddress;
  const { roscaId } = await params;
  const roscaDetails: any = await getActiveRoscasDetails(roscaId);
  const securityDeposits: any = await getSecurityDeposits(2);
  const depositRows = createDepositRows(securityDeposits);
  const activeParticipants: any = await getActiveRoscaParticipantsOrder(
    roscaId
  );

  if (!roscaDetails || !activeParticipants.length) {
    redirect("/");
  }

  const defaultCount = await getDefaulters(1);
  const defaultRows = createDefaulterTableData(defaultCount);

  const currentContributors = await getCurrentContributors(roscaId);

  const pendingContributors = activeParticipants.filter(
    (participant: any) => !currentContributors.includes(participant)
  );

  const contributorRows: any = currentContributors.map((contributor: any) => {
    return {
      key: contributor,
      avatar: (
        <Avatar
          src={AvatarMap[contributor as string]}
          name={NameMap[contributor as string]}
          size="lg"
        />
      ),
      name: NameMap[contributor as string],
    };
  });

  const pendingContributorsRows: any = pendingContributors.map(
    (pendingContributor: any) => {
      return {
        key: pendingContributor,
        avatar: (
          <Avatar
            src={AvatarMap[pendingContributor as string]}
            name={NameMap[pendingContributor as string]}
            size="lg"
          />
        ),
        name: NameMap[pendingContributor as string],
        showButton: pendingContributor == myAddress,
      };
    }
  );

  console.log(pendingContributorsRows);

  return (
    <div>
      <section className="pb-7">
        <RoscaInfo
          name={roscaDetails.name}
          type={roscaDetails.randomOrder ? "Random" : "Fixed Order"}
          start={roscaDetails.startByBlock}
          contributionAmount={roscaDetails.contributionAmount}
          contributionFrequency={roscaDetails.contributionFrequency}
          totalParticipants={roscaDetails.numberOfParticipants}
          minParticipants={roscaDetails.minimumParticipantThreshold}
        />
      </section>

      <div className="flex justify-between space-x-10">
        {contributorRows.length ? (
          <section className="flex-1 pb-7">
            <ContributorsTable rows={contributorRows} />
          </section>
        ) : (
          ""
        )}
        {pendingContributorsRows.length ? (
          <section className="flex-1 pb-7">
            <PendingContributorsTable
              rows={pendingContributorsRows}
              roscaId={roscaId}
            />
          </section>
        ) : (
          ""
        )}
      </div>
      <section className="pb-7">
        <SecurityDepositsTable rows={depositRows} roscaId={roscaId} />
      </section>
      {defaultCount.length ? (
        <section className="pb-7">
          <DefaultersTable rows={defaultRows} />
        </section>
      ) : (
        ""
      )}
    </div>
  );
}
