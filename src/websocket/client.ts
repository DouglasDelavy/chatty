import { io } from '../http';
import { ConnectionsService } from '../services/ConnectionsService';
import { MessagesService } from '../services/MessagesService';
import { UsersService } from '../services/UsersService';

interface IParams {
  text: string;
  email: string;
}

io.on("connect",(socket) => {
  const connectionsService = new ConnectionsService();
  const usersService = new UsersService();
  const messagesService = new MessagesService();

  socket.on("client_first_access", async ({ text, email } : IParams) => {
    const socket_id = socket.id;

    const user = await usersService.create(email);

    const connection = await connectionsService.findByUserId(user.id);

    if (!connection) {
      await connectionsService.create({
        socket_id,
        user_id: user.id
      })
    } else {
      connection.socket_id = socket_id;
      await connectionsService.create(connection);
    }

    await messagesService.create({
      text,
      user_id: user.id
    })
  })
});