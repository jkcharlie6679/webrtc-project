
var peers = {}
module.exports = (io) => {
    io.on('connect', (socket) => {
        // console.log('1231234123')
        socket.emit('message','welcome to chatcord!');
        
        socket.on('join', (roomId) => {
            console.log('a client is connected')

            // Initiate the connection process as soon as the client connects
            //console.log(socket)
            room = roomId.toString()
            if(!peers[room]){
                peers[room] = {}
            }
            peers[room][socket.id] = socket

            // Asking all other clients to setup the peer connection receiver
            for(let id in peers[room]) {
                if(id === socket.id) continue
                console.log('sending init receive to ' + socket.id)
                peers[room][id].emit('initReceive', socket.id)
                // socket.broadcast.emit('message','A user has joined the chat');
            }
            /**
             * relay a peerconnection signal to a specific socket
             */
            socket.on('signal', data => {
                console.log('sending signal from ' + socket.id + ' to ', data)
                if(!peers[room][data.socket_id])return
                peers[room][data.socket_id].emit('signal', {
                    socket_id: socket.id,
                    signal: data.signal,
                })
            })

            socket.on('SendData', (send) => {
                //console.log('sending signal from ' + socket.id + ' to ', data)
                console.log(send)
            })
            /**
             * remove the disconnected peer connection from all other connected clients
             */
            socket.on('disconnect', () => {
                console.log('socket disconnected ' + socket.id)
                socket.broadcast.emit('removePeer', socket.id)
                delete peers[room][socket.id]
            })
            /**
             * Send message to client to initiate a connection
             * The sender has already setup a peer connection receiver
             */
            socket.on('initSend', init_socket_id => {
                console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
                peers[room][init_socket_id].emit('initSend', socket.id)
            })


            // sent mes
            socket.on('chatMessage', (msg) => {
                console.log(msg);
                io.emit('message', msg);
            });

            socket.on('close', () => {
                io.emit('sent_close');
            });

            socket.on('reward', (msg) => {
                io.emit('sent_reward', msg);
            });
            socket.on('reward_word', (msg) => {
                io.emit('sent_reward_word', msg);
            });
        })
    })
}