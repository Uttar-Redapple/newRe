// connecting with sockets.
//const socket = io('http://localhost:9090/gangwar');
// let socketUrl;
// let urlSet = (data)=>{
//   socketUrl = data;
// }

//const socket = io(socketUrl);
//const socket = io('http://52.66.82.72:9090/gangwar');

var output;
window.addEventListener("load", init, false);

function init()
{
  output = document.getElementById("output");
  chatSocket();
}

function writeToScreen(message)
{
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  output.appendChild(pre);
}

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IjRiX08zQWZLaSIsImlhdCI6MTU5MDc0MDAxNTk0MywiZXhwaXJlc0luIjoiMzY1ZCIsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6InJlZEFwcGxlIiwiZGF0YSI6eyJmYl9pZCI6InV0dGFyQnVnRklYMSIsInVzZXJfbmFtZSI6InV0dGFyX2J1Z2ZpeDEiLCJpbWdfdXJsIjoiYXNkc2Fkc2RhZHRyeXllcmFqaGZqa3Nkb2kiLCJjcmVhdGVkX2F0IjoiMjAyMC0wNS0yOVQwODoxMzozNS45MTZaIn19.pIGquujO78hCgH9PI5njhSynbQpEmO4ng-vEpJ6ah8A"


let chatSocket = () => {
  //const socket = io(document.urlForm.url.value);
  const socket = io('http://52.66.82.72:9090/gangwar');

  socket.on('verifyUser', (data) => {

    writeToScreen("socket trying to verify user");

    socket.emit("setuser", authToken);

  });

  socket.on('authConf', (data) => {
    writeToScreen('authConf called');

    //writeToScreen(`you received a message from server : `,`${data}`);

  });

  socket.emit("create_room", {room_name:"room#123",user_id:'uttarBugFIX1'});

  socket.on('room_details', (data) => {
    // writeToScreen('room_details received')
    // writeToScreen(data)
    let message = JSON.stringify(data);

    writeToScreen('socket connected and room created');

    writeToScreen(`you received a message from server : ${message}`);

  });


}// end chat socket function




//chatSocket();
