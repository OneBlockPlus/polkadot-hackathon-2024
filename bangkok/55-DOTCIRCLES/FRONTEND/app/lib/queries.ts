import getApi from "./polkadot";

const addressToNameMap = {
  "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY": "Alice",
  "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc": "Bob",
  "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y": "Charlie",
};

export async function getAllPendingRoscas() {
  const api = await getApi();

  const data = await api.query.rosca.pendingRoscaDetails.entries();

  const listingData = data.map(([key, exposure]) => {
    let listingId = key.args[0].toHuman() as number;
    return [listingId, exposure.toJSON()];
  });

  return listingData;
}

export async function getPendingRoscasDetails(roscaId: any) {
  const api = await getApi();

  const data = await api.query.rosca.pendingRoscaDetails(roscaId);

  return data.toHuman();
}

export async function getActiveRoscasDetails(roscaId: any) {
  const api = await getApi();

  const data = await api.query.rosca.activeRoscas(roscaId);

  return data.toHuman();
}

export async function getActiveRoscaParticipantsOrder(roscaId: any) {
  const api = await getApi();

  const data = await api.query.rosca.activeRoscaParticipantsOrder(roscaId);

  return data.toHuman();
}

export async function getDefaulters(roscaId: any) {
  const api = await getApi();

  const data = await api.query.rosca.defaultCount.entries(roscaId);

  const defaulters = data.map(([key, exposure]) => {
    return [key.args[1].toHuman(), exposure.toHuman()];
  });
  return defaulters;
}

export async function getSecurityDeposits(roscaId: any) {
  const api = await getApi();

  const data = await api.query.rosca.roscaSecurityDeposits.entries(roscaId);

  const securityDepositDetails = data.map(([key, exposure]) => {
    return [key.args[1].toHuman(), exposure.toHuman()];
  });
  return securityDepositDetails;
}

export async function getCurrentContributors(roscaId: any) {
  const api = await getApi();

  const data = await api.query.rosca.currentContributors.entries(roscaId);

  const contributors = data.map(([key, exposure]: any) => {
    return key.args[1].toHuman();
  });
  return contributors;
}

export async function getAllActiveRoscas() {
  const api = await getApi();
  const data = await api.query.rosca.activeRoscas.entries();

  const listingData = data.map(([key, exposure]) => {
    let listingId = key.args[0].toHuman() as number;
    return [listingId, exposure.toJSON()];
  });

  return listingData;
}

export async function getCurrentPendingParticipantsCount() {
  const api = await getApi();
  const data = await api.query.rosca.roscaParticipantsCount.entries();

  let listingData: any = {};

  const roscas = data.forEach(([key, exposure]) => {
    let listingId = key.args[0].toHuman() as number;
    listingData[listingId] = exposure.toJSON();
  });

  return listingData;
}

export async function getAllRoscaInvites() {
  const api = await getApi();
  const data =
    await api.query.rosca.roscaInvitedPreverifiedParticipants.entries();

  let accountToRoscaIDs: any = {};

  const roscas = data.forEach(([key, exposure]) => {
    let rosca_id = key.args[0].toHuman() as number;
    let account = key.args[1].toHuman() as number;
    accountToRoscaIDs[account] = [
      ...(accountToRoscaIDs[account] || []),
      rosca_id,
    ];
  });
  return accountToRoscaIDs;
}

export async function pendingInvitedRoscas(address: any) {
  const roscas = await getAllPendingRoscas();
  const invites = await getAllRoscaInvites();
  let invitedRoscas = roscas.filter(([roscaId, roscaDetails]: any) => {
    return invites[address] && invites[address].includes(roscaId);
  });
  return invitedRoscas;
}

export async function activeRoscasForAddress(address: any) {
  const api = await getApi();
  const data = await api.query.rosca.activeRoscaParticipantsOrder.entries();

  const rosca = data.filter(([key, exposure]) => {
    let participants = exposure.toHuman() as string[];

    return participants.includes(address);
  });

  const roscaDetails = await Promise.all(
    rosca.map(async ([key, exposure]) => {
      let rosca_id = key.args[0].toHuman() as number;

      const details = (await api.query.rosca.activeRoscas(rosca_id)).toHuman();
      return [rosca_id, details];
      // return details.map(([key, exposure]) => {
      //   return exposure.toJSON();
      // });
    })
  );
  return roscaDetails;
}

export async function getWaitingParticipiants(roscaId: any) {
  const api = await getApi();
  const data = await api.query.rosca.pendingRoscaParticipantsOrder(roscaId);

  return data.toHuman();
}

export async function getInvitedParticipants(roscaId: any) {
  const api = await getApi();
  const data =
    await api.query.rosca.roscaInvitedPreverifiedParticipants.entries(roscaId);

  const invitedParticipants = data.map(([key, exposure]) => {
    return [key.args[1].toHuman()];
  });
  return invitedParticipants;
}
