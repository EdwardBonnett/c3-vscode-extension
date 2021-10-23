import  * as express from 'express';
import { Server, Socket } from 'socket.io';
import * as http from 'http';

export default class SocketServer {
    app: express.Express;
    server: http.Server;
    io: Server;
    constructor (connected: (socket: Socket) => void, disconnected: (socket: Socket) => void) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: ["https://editor.construct.net", "https://preview.construct.net"],
                methods: ["GET", "POST"]
              },
              transports: ["polling"],
        });

        this.app.get('/', (req, res) => {
            res.send('C3 extension server live');
          });
          

          this.io.on("connection", (socket) => {
            socket.on("disconnect", (reason) => {
                if (socket.handshake.query.environment === 'editor') {
                    disconnected(socket);
                    console.log('C3 Disconnected', socket);
                } else {
                    console.log('C3 Debug disconnected');
                }
            });
        
          });

     
        
          this.io.on('connect', (socket) => {
              if (socket.handshake.query.environment === 'editor') {
                  connected(socket);
                  console.log('C3 Connected', socket);
            } else {
                console.log('C3 Debug connected');
            }

        });

          this.server.listen(3000, () => {
            console.log('listening on *:3000');
          });
        
    }

    debug () {
        this.io.emit('run-debug');
    }

    stopDebug () {
        this.io.emit('stop-debug');
    }

    destroy () {
        this.io.close();
        this.server.close();
    }
}