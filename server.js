var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var apis = require('./api/apis.js')
var bodyParser = require('body-parser')
var session = require('express-session')
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'aws url',
    user: 'username',
    password: 'password',
    database: 'db',
})


app.use(session(
    {
        secret: 'peipeichat',
        cookie: {
            maxAge: 600 * 1000,//保存10分鐘
        }
    }
))
app.use(bodyParser.urlencoded({ extended: false }))//處裡參數的轉碼
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views/')

function dbopen(sSQL) {
    return new Promise(function (resolve, reject) {
        connection.query(sSQL, function (err, rows, fields) {
            if (err) throw err
            console.log(rows)
            resolve(rows)
        })
    })
}

app.get('/', function (req, res) {
    res.render("signIn.pug")
})

app.get('/signIn', function (req, res) {
    if (req.session.nickName) {
        res.render('chat.pug', {
            nickName: req.session.nickName,
        })
        console.log(`${req.session.nickName} come back!`)
    } else {
        res.render('signIn.pug')
    }
})

app.post('/signUp', async function (req, res) {
    var dbresult = await dbopen(`select name, id from user where name = '${req.body.nickName}'`)
    if (dbresult.length != 0) {
        res.render('signIn.pug', {
            upinfo: '帳號重複'
        })
    } else {
        await dbopen(`INSERT INTO user (name) VALUES ('${req.body.nickName}')`)

        res.render('signIn.pug', {
            upinfo: '創見成功'
        })
    }
})

app.post('/signIn', async function (req, res) {
    var dbresult = await dbopen(`SELECT name FROM user WHERE name = '${req.body.nickName}'`)
    if (dbresult.length > 0) {
        req.session.nickName = req.body.nickName
        res.render("chat.pug", {
            nickName: req.session.nickName,
        })
    }else{
        res.render('signIn.pug',{
            ininfo:'無此帳號'
        })
    }

})


io.on('connection', function (socket) {
    var date = apis.getTime_Str()
    console.log(`[${date}]a user come in!`)

    socket.on('welcome chat', function (nickName) {
        socket['nickName'] = nickName
        io.sockets.emit('chat message', `${socket.nickName} comming...`)
    })

    socket.on('chat message', function (msg) {
        console.log(`${socket.nickName} : ${msg}`)
        io.sockets.emit('chat message', `${socket.nickName} : ${msg}`)
    })

    socket.on('disconnect', function () {
        var date = apis.getTime_Str()
        console.log(`[${date}]a user offline!`)
        io.sockets.emit('chat message', `${socket.nickName} leave....`)
    })
})

http.listen(3000, function () {
    console.log("port 3000 listend.....")
})