function getTime_Str() {
    var date = Date.now()
    //var date = `${date.getUTCFullYear()}-${(date.getUTCMonth()+1)<10?'0'+(date.getUTCMonth()+1):(date.getUTCMonth()+1)}-${date.getUTCDate()<10?'0'+date.getUTCDate():date.getUTCDate()} ${date.getUTCHours()<10?'0'+date.getUTCHours():date.getUTCHours()}:${date.getUTCMinutes()<10?'0'+date.getUTCMinutes():date.getUTCMinutes()}:${date.getUTCSeconds()<10?'0'+date.getUTCSeconds():date.getUTCSeconds()}`
    return date
}

function newchatroom(io, nsp,rooms) {
    (function (io, nsp) {
        var room = io.of(nsp)
        room.on('connection', function (socket) {
            console.log('someone coming')
            console.log(Object.keys(room.sockets))
            socket.on('welcome chat', function (nickName) {
                console.log('random chat welcome!')

                socket['nickName'] = nickName
                var msg = 'comming...'
                room.emit('chat message', `${socket.nickName} ${msg}`)
            })
            socket.on('chat message', function (msg) {
                console.log(`catch ${msg}!`)
                room.emit('chat message', `${socket.nickName} : ${msg}`)
            })

            socket.on('disconnect', function () {
                if (Object.keys(room.sockets).length == 0) {
                    const connectedNameSpaceSockets = Object.keys(room.connected); // Get Object with Connected SocketIds as properties
                    connectedNameSpaceSockets.forEach(socketId => {
                        room.connected[socketId].disconnect(); // Disconnect Each socket
                    });
                    room.removeAllListeners(); // Remove all Listeners for the event emitter
                    delete io.nsps[nsp];
                    console.log(rooms)
                    rooms[nsp.slice(1,nsp.length)] = 0
                    console.log(rooms)
                } else {
                    var msg = 'leave...'
                    room.emit('chat message', `${socket.nickName} ${msg}`)
                }
            })

        })


    })(io, nsp)


}

module.exports = {
    getTime_Str,
    newchatroom,
}