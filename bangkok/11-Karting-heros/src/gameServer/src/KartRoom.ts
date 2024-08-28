import { Room, Client } from "colyseus";
import { KartRoomState } from "./schema/KartRoomState";
import { ContractAPI } from "./utils/ContractAPI";
export class KartRoom extends Room<KartRoomState> {
  maxClients = 2;
  gameStartTimeout: NodeJS.Timeout | null = null;
  gameEndTimeout: NodeJS.Timeout | null = null;
  contractApi: ContractAPI | null = null;


  async onCreate(options: any) {
    console.log("KartRoom created!", options);

    this.setState(new KartRoomState());
    this.contractApi = new ContractAPI();
    await this.contractApi!.init();


    this.onMessage("move", (client, data) => {
      console.log(
        "KartRoom received message from",
        client.sessionId,
        ":",
        data
      );
      this.state.movePlayer(client.sessionId, data);
    });

    this.onMessage("ready", (client) => {
      this.state.setPlayerReady(client.sessionId);
      if (this.state.allPlayersReady(this.maxClients)) {
        this.startGameCountdown();
      }
    });

    this.onMessage("finished", (client) => {
      console.log("finished!sss", client.state);
      this.state.playerFinished(client.sessionId);
      if (this.state.finishedCount === this.maxClients) {
        this.endGame();
      }
    });

  }

  async updateContractScore(roomId: string, player: string,score: number) {
    try {

      await this.contractApi!.updateScore(roomId, player, score);
    } catch (error) {
      console.error(`Failed to update contract score:`, error);
    }
  }


  onJoin(client: Client, options: { address: string; name: string; appearance: any; }) {
    console.log(client.sessionId, "joined!", options);
    if (options.address) {
      this.state.createPlayer(options.address, client.sessionId, options.name, options.appearance);
    }

  }

  onLeave(client: { sessionId: string }) {
    console.log(client.sessionId, "left!");
    this.state.removePlayer(client.sessionId);
  }
  startGameCountdown() {
    this.state.status = "loading";
    this.broadcast("loading");
    
    this.gameStartTimeout = setTimeout(() => {
      this.startGame();
    }, 5000);
  }
  startGame() {
    this.state.status = "playing";
    this.state.startTime = Date.now();
    this.broadcast("start");

    // Set a timeout to end the game after 1 minute if not all players have finished
    this.gameEndTimeout = setTimeout(() => {
      this.endGame();
    }, 60000);
  }

  async endGame() {
    if (this.gameEndTimeout) {
      clearTimeout(this.gameEndTimeout);
    }

    this.state.status = "finished";
    const results = Array.from(this.state.players.entries())
      .map(([sessionId, player]) => ({
        sessionId,
        name: player.name,
        address: player.address,
        finished: player.finished,
        finishTime: player.finishTime,
        score: player.score
      }))
      .sort((a, b) => b.score - a.score);

       // 更新每个玩家的合约分数
    for (const result of results) {
      console.log(this.roomId);
      console.log(`Updating contract score for ${result.address}: ${result.score}`);
      await this.updateContractScore(this.roomId, result.address, result.score);
    }

    this.broadcast("gameOver", { results });
  }

  onDispose() {
    console.log("Dispose StateHandlerRoom");
  }
}
