// Importar las bibliotecas necesarias
const http = require('http');
const httpServer = http.createServer();
const path = require('path');
const { client } = require('websocket/lib/websocket');
const app = require("express")();
app.listen(9001, ()=>{
    console.log("Escuchando en 9001");
})



/*app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'))
})*/

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'))
})
const WebSocketServer = require('websocket/lib/WebSocketServer');
const websocket = require('websocket').server;

const clients = {};
const games = {};
const rooms = {};

const wsServer = new WebSocketServer({
    "httpServer":httpServer
})

wsServer.on("request", req => {
    const connection = req.accept(null, req.origin);

    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!"))

    connection.on("message", message => {
        const result = JSON.parse(message.utf8Data)
        
        //Un usuario quiere entrar
        if(result.method === "login"){
            const clientID = result.clientID;

            clients[clientID].nickname = result.nickname
            
            //Información de nuevo conectado a todos los usuarios
            wsServer.broadcast(JSON.stringify({
                method: 'broadcast',
                message: {'type':'newUser', 'nickname': result.nickname}
            }))

            ///Mensaje al usuario conectado 
            connection.send(JSON.stringify({
                method: 'communication',
                message: {'type':'logged', 'value': 'in', 'clientID': clientID, 'nickname': result.nickname}
            }))

            
        } else if(result.method === "chatMessage"){
            const clientID = result.clientID;
            const nickname = clients[clientID].nickname;
            const chatMessage = result.message
            

            wsServer.broadcast(JSON.stringify({
                method: 'broadcast',
                message: {'type':'newChatMessage', 'clientID': clientID, 'nickname': nickname, 'message': chatMessage}
            }))
        }

        
    })

    const clientID = generateGUID();
    clients[clientID] = {
        "connection":connection,
        "nickname" : null
    }

    const payLoad ={
        "method" : "connect",
        "clientID" : clientID
    }

    connection.send(JSON.stringify(payLoad));
})


function generateGUID() {
    let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return guid;
  }

// Iniciar el servidor
const PORT = 9000;
httpServer.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});