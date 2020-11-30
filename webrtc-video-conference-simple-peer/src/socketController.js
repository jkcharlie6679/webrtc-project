
room = []

module.exports = (io) => {
    io.on('connect', (socket) => {
        socket.on('join', (roomId) => {

            // if(roomId == 1){
                if(!room[roomId]){
                    room[roomId] = {}
                }
                console.log('a client is connected')
                // Initiate the connection process as soon as the client connects
                room[roomId][socket.id] = socket
                // Asking all other clients to setup the peer connection receiver
                console.log(room[roomId])
                for(let id in room[roomId]) {
                    if(id === socket.id) continue
                    console.log('sending init receive to ' + socket.id)
                    room[roomId][id].emit('initReceive', socket.id)
                }
                /**
                 * relay a peerconnection signal to a specific socket
                 */
                socket.on('signal', data => {
                    console.log('sending signal from ' + socket.id + ' to ', data)
                    if(!room[roomId][data.socket_id])return
                    room[roomId][data.socket_id].emit('signal', {
                        socket_id: socket.id,
                        signal: data.signal
                    })
                })
                /**
                 * remove the disconnected peer connection from all other connected clients
                 */
                socket.on('disconnect', () => {
                    console.log('socket disconnected ' + socket.id)
                    socket.broadcast.emit('removePeer', socket.id)
                    delete room[roomId][socket.id]
                })
                /**
                 * Send message to client to initiate a connection
                 * The sender has already setup a peer connection receiver
                 */
                socket.on('initSend', init_socket_id => {
                    console.log('INIT SEND by ' + socket.id + ' for ' + init_socket_id)
                    room[roomId][init_socket_id].emit('initSend', socket.id)
                })
            // }
        })
    })
}