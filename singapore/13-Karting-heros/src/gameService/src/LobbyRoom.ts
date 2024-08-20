import { Room, Client, matchMaker } from "colyseus";
import { KartRoomState } from "./schema/KartRoomState";
import { LobbyState } from "./schema/LobbyRoomState";

export class LobbyRoom extends Room<LobbyState> {
  maxClients = 20;
  rooms: { [id: string]: KartRoomState } = {};

  onInit() {
    console.log("Lobby created!");
  }

  onJoin(client: Client, options?: any) {
    console.log(client.id, "joined the lobby!");
  }

  onLeave(client: Client, consented?: boolean) {
    console.log(client.id, "left the lobby!");
  }

  onDispose() {
    console.log("Disposing Lobby!");
  }

  async createRoom() {
    const room = new KartRoomState();
    const roomName = `kart_${Object.keys(this.rooms).length}`;
    await matchMaker.create(roomName, { room });
    return room;
  }

  async JoinRoom(client: Client, roomId: string) {
    const reservation = await matchMaker.join(roomId, { mode: "duo" });
    return reservation.room;
  }

  getRooms() {
    return Object.values(this.rooms);
  }
}
