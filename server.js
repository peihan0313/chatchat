var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var apis = require('./api/apis.js')
var bodyParser = require('body-parser')
var session = require('express-session')



app.use(session(
    {
        secret: 'peipeichat',
        cookie: {
            maxAge: 600 * 1000,
        }
    }
))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views/')

app.get('/', function (req, res) {
    res.render("signIn.pug")
})
app.post('/signIn', function (req, res) {
    console.log(req.body)
    req.session.nickName = req.body.nickName
    res.render("chat.pug",{
       nickName: req.session.nickName,
    })
})
io.on('connection', function (socket) {
    var date = apis.getTime_Str()
    console.log(`[${date}]a user come in!`)

    socket.on('welcome chat',function(nickName){
        socket['nickName'] = nickName
        io.sockets.emit('chat message', `${socket.nickName} comming...`)
    })

    socket.on('chat message', function (msg) {
        console.log(`message : ${msg}`)
        io.sockets.emit('chat message', `${socket.nickName} : ${msg}`)
    })

    socket.on('disconnect', function () {
        var date = apis.getTime_Str()
        console.log(`[${date}]a user offline!`)
    })
})

http.listen(3000, function () {
    console.log("port 3000 listend.....")
})