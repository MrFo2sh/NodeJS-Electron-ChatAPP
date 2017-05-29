// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// const remote = require('electron').remote
// const main = remote.require('./main.js')


var net = require('net');
JsonSocket = require('json-socket');
var client = null;


var IpTextField = document.createElement('input')
IpTextField.setAttribute("type","text")
IpTextField.placeholder = "Server IP"

var usernameField = document.createElement('input')
usernameField.setAttribute("type","text")
usernameField.placeholder = "Username"

var chatList = document.createElement('ul');
chatList.style.width=document.body.width;

var PortTextField = document.createElement('input')
PortTextField.setAttribute("type","text")
PortTextField.placeholder = "Server Port"

var msgTextField = document.createElement('input')
msgTextField.setAttribute("type","text")
msgTextField.placeholder = "Enter a message"

var connectBtn = document.createElement('button')
connectBtn.textContent = 'Connect'
connectBtn.addEventListener('click',connectToServer,false)

var sendMsgBtn = document.createElement('button')
sendMsgBtn.textContent = 'Send'
sendMsgBtn.addEventListener('click',()=>{
    //get ip and port
    var msg = msgTextField.value
    if(client != null){
        client.sendMessage({head:"msg",body:msg})
        var node = document.createElement("li");                 // Create a <li> node
        node.style.color = "blue"
        var textnode = document.createTextNode("Me> "+msg);         // Create a text node
        node.appendChild(textnode);
        chatList.appendChild(node);
    }else{
        alert("You are not connected")
    }
},false)

var disconnectBtn = document.createElement('button')
disconnectBtn.textContent = 'Disconnect'
disconnectBtn.addEventListener('click',()=>{
    //get ip and port
    var msg = msgTextField.value
    if(client != null){
        client.sendEndMessage("bye");
        client = null;
    }else{
        alert("You are not connected")
    }
},false)



//view part
document.body.appendChild(usernameField);
document.body.appendChild(IpTextField);
document.body.appendChild(PortTextField);
document.body.appendChild(connectBtn);
document.body.appendChild(document.createElement("br"));
document.body.appendChild(document.createElement("br"));
document.body.appendChild(document.createElement("hr"));
document.body.appendChild(chatList);
document.body.appendChild(document.createElement("br"));
document.body.appendChild(document.createElement("br"));
document.body.appendChild(document.createElement("hr"));
document.body.appendChild(msgTextField);
document.body.appendChild(sendMsgBtn);
document.body.appendChild(document.createElement("br"));
document.body.appendChild(document.createElement("br"));
document.body.appendChild(disconnectBtn);



function connectToServer(){
    //get ip and port
    var Username = usernameField.value
    var ip = IpTextField.value
    var port = PortTextField.value
    client = new JsonSocket(new net.Socket()); 
    client.connect(port, ip)

    client.on('connect', function() { //Don't send until we're connected
    client.sendMessage({head: "username", body: Username});
    });

    client.on('message', function(message) {
        switch(message.head){
            case "error":
                if(message.body == "usernameExists"){
                    alert("Username already exists");
                    client.sendEndMessage("bye");
                    client = null;
                }
                break;
            case "msg":
                var node = document.createElement("li");                 // Create a <li> node
                node.style.color = "green";
                var textnode = document.createTextNode(message.body);         // Create a text node
                node.appendChild(textnode);
                chatList.appendChild(node);
                break;
            case "notification":
                var node = document.createElement("li");                 // Create a <li> node
                node.style.color = "red";
                var textnode = document.createTextNode(message.body);         // Create a text node
                node.appendChild(textnode);
                chatList.appendChild(node);
                break;
            case "bye":
                client.sendEndMessage("bye");
                client = null;
                break;
        }
    }); 

    client.on('end', function(data) {
        alert("Disconnected")
    });

    
    client.on('error', function() {
        alert('Connection error');
    });
}