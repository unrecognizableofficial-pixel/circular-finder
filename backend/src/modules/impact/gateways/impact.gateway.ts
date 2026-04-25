import { ConnectedSocket, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "/impact",
  cors: { origin: "*" }
})
export class ImpactGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(userId);
    }
  }

  @SubscribeMessage("impact.join")
  joinUserRoom(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(userId);
    }
  }

  emitPointsUpdate(userId: string, payload: unknown) {
    if (!this.server) {
      return;
    }
    this.server.to(userId).emit("impact.points.updated", payload);
  }
}
