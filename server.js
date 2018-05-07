var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var apis = require('./api/apis.js')
var bodyParser = require('body-parser')
var session = require('express-session')
var mysql = require('mysql');



var pool_connection = mysql.createPool({
    host: 'url',
    user: 'dbuser',
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
        pool_connection.getConnection(function (err, connection) {
            connection.query(sSQL, function (err, rows, fields) {
                connection.release();
                if (err) throw err
                resolve(rows)
            })
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
            upinfo: '創建成功'
        })
    }
})


app.post('/signIn', async function (req, res) {
    var dbresult = await dbopen(`SELECT name FROM user WHERE name = '${req.body.nickName}'`)
    if (dbresult.length > 0) {
        req.session.nickName = req.body.nickName
        res.render("chat.pug", {
            nickName: req.session.nickName,
            random: false,
            nsp: ""
        })
    } else {
        res.render('signIn.pug', {
            ininfo: '無此帳號'
        })
    }


})
app.post('/loadmsg', async function (req, res) {
    var time = apis.getTime_Str()

    if (req.body.inputtime) {
        time = req.body.inputtime
        console.log(`time = ${time}`)
    }
    var dbresult = await dbopen(`select c.message ,c.inputtime ,u.name from chat_message c ,user u where c.id = u.id and inputtime < '${time}' order by inputtime DESC Limit 30`)
    console.log(dbresult.length)
    res.send(dbresult)
})

app.post('/randomChat', function (req, res) {
    for (var key in rooms) {
        if (rooms[key] < 2) {
            if (rooms[key] == 0) {
                apis.newchatroom(io, `/${key}`, rooms)
            }
            rooms[key]++
            res.render('randomchat.pug', {
                nickName: `user${rooms[key]}`,
                random: true,
                nsp: `/${key}`,

            })
            break
        }
    }
})

var rooms = {
    roomA: 0,
    roomB: 0,
    roomC: 0,
    roomD: 0,
    roomE: 0,
    roomF: 0,
    roomG: 0,
    roomH: 0,
    roomI: 0,
    roomJ: 0,
}

function doubleSignin(generalroom, nickName) {
    var socketids = Object.keys(generalroom.connected)
    for (var i = 0; i < socketids.length; i++) {
        if (generalroom.connected[socketids[i]].nickName == nickName) {
            return true
        }
    }
    return false
}

var generalroom = io.of('/general')
generalroom.on('connection', function (socket) {
    var date = apis.getTime_Str()
    console.log(`[${new Date(date)}]a user come in!`)

    socket.on('welcome chat', async function (nickName) {
        var flag = doubleSignin(generalroom, nickName)
        var dbresult = await dbopen(`SELECT * FROM user Where name ='${nickName}'`)
        socket['nickName'] = dbresult[0].name
        socket['db_id'] = dbresult[0].id
        var msg = `comming...`
        var inputtime = apis.getTime_Str()
        
        if (!flag) {
            await dbopen(`INSERT INTO chat_message (message,inputtime,id) VALUES ('${msg}','${inputtime}','${socket.db_id}')`)
            generalroom.emit('chat message', `${socket.nickName} : ${msg}`)
        }
    })

    socket.on('chat message', async function (msg) {
        var inputtime = apis.getTime_Str()
        await dbopen(`INSERT INTO chat_message (message,inputtime,id) VALUES ('${msg}','${inputtime}','${socket.db_id}')`)
        console.log(`${socket.nickName} : ${msg}`)
        generalroom.emit('chat message', `${socket.nickName} : ${msg}`)
    })

    socket.on('disconnect', async function () {
        var inputtime = apis.getTime_Str()
        console.log(`[${new Date(inputtime)}]${socket.nickName} user offline!`)
        var msg = `leave....`
        
        if (!doubleSignin(generalroom, socket.nickName)) {
            await dbopen(`INSERT INTO chat_message (message,inputtime,id) VALUES ('${msg}','${inputtime}','${socket.db_id}')`)
            generalroom.emit('chat message', `${socket.nickName} : ${msg}`)
        }


    })
})


http.listen(3000, function () {
    console.log("port 3000 listend.....")
})