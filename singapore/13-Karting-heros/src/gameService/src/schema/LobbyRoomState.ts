import { Room, LobbyRoom, Client, matchMaker } from "colyseus";
import { KartRoomState } from "./KartRoomState";
import { Schema } from "@colyseus/schema";

export class LobbyState extends Schema {
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
}
