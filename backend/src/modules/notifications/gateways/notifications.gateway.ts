import { ConnectedSocket, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "/notifications",
  cors: { origin: "*" }
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(userId);
    }
  }

  @SubscribeMessage("notifications.join")
  joinUserRoom(@ConnectedSocket() client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      client.join(userId);
    }
  }

  notifyUser(userId: string, payload: unknown) {
    if (!this.server) {
      return;
    }
    this.server.to(userId).emit("notifications.created", payload);
  }
}
