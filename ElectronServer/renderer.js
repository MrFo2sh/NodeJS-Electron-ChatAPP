// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
net = require('net');
JsonSocket = require('json-socket');
var clients = [];

var portField = document.getElementById('portField');
var startBtn = document.getElementById('startServer');
var connectedUsersList = document.getElementById('connectedUsers');
var usersChat = document.getElementById('usersChat');
var stopBtn = document.getElementById('stopServer');


var server = net.createServer(function (socket) {
  // Identify this client
  socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    socket.on('message', function(message) {
        if(message.head == "username"){
            socket.name = message.body;
            if(!usernameExists(message.head)){
                addConnectedClient(socket);
                // Send a nice welcome message and announce
                socket.sendMessage({head:"notification",body:"Welcome " + socket.name});
                broadcast(socket.name + " joined the chat\n", socket);

            }else{
                socket.sendEndMessage({head:"error",body:"usernameExists"});
            }
        }
        else if(message.head == "msg"){
            broadcast("msg", socket.name + "> " +message.body, socket);
            addUserMsg(socket, message.body)
        }
    });



  // Handle incoming messages from clients.

//   socket.on('data', function (data) {
//     broadcast(socket.name + "> " + data, socket);
//   });



  // Remove the client from the list when it leaves

  socket.on('end', function () {
    removeConnectedClient(socket);
    broadcast("notification", socket.name + " left the chat.");
  });

  socket.on('error', function () {
    removeConnectedClient(socket);
    broadcast("notification", socket.name + " has an error and left the chat.");
  });

});

 // Send a message to all clients
  function broadcast(head, body, sender) {

    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.sendMessage({head:head,body:body});
    });
    // Log it to the server output too
    process.stdout.write(body)
  }

function startServer() {
    var port = portField.value;
  server.listen(port, function () {
    console.log('server started on port '+ port);
  });
}

function stopServer() {
  server.close(function () {
    console.log('server stopped');
  });
}

function usernameExists(username){
    for(var i = 0 ; i < clients.length ; i ++){
        if(client[i].name == username){
            console.log("name already exists")
            return true;
        }
    }
    return false;
}

function addUserMsg(sender,msg){
    var node = document.createElement("li");                 // Create a <li> node
    node.style.color = "green";
    var textnode = document.createTextNode(sender.name+"> "+msg);         // Create a text node
    node.appendChild(textnode);
    usersChat.appendChild(node);
}

function addConnectedClient(client){
    var node = document.createElement("li");                 // Create a <li> node
    node.style.color = "red";
    node.id = client.name;
    var textnode = document.createTextNode(client.name);         // Create a text node
    node.appendChild(textnode);
    connectedUsersList.appendChild(node);
    clients.push(client);
}

function removeConnectedClient(client){
    clients.splice(clients.indexOf(client), 1);
    var node = document.getElementById(client.name);
    node.parentNode.removeChild(node);
}

// add actions
startBtn.addEventListener('click', startServer,false);
stopBtn.addEventListener('click', stopServer,false);
