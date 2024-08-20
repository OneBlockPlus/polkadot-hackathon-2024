import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("number") x: number = 0; // x position
  @type("number") y: number = 0; // y position
  @type("number") z: number = 0; // z position
  @type("number") rotX: number = 0; // x rotation
  @type("number") rotY: number = 0; // y rotation
  @type("number") rotZ: number = 0; // z rotation
  @type("number") rotW: number = 0; // w rotation
  @type("string") name = "Unknown"; // player name
}

export class KartRoomState extends Schema {
  @type({ map: PlayerState })
  players: MapSchema<PlayerState> = new MapSchema<PlayerState>();

  @type("string") status: string = "waiting"; // waiting, playing, finished

  createPlayer(sessionId: string) {
    this.players.set(sessionId, new PlayerState());
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }

  movePlayer(sessionId: string, movement: any) {
    const player = this.players.get(sessionId);
    if (player) {
      player.x += movement.x;
      player.y += movement.y;
      player.z += movement.z;

      player.rotX = movement.rotX;
      player.rotY = movement.rotY;
      player.rotZ = movement.rotZ;
      player.rotW = movement.rotW;

      // this.players.set(sessionId, player);
    }
  }
}
