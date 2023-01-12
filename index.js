//Set up Variables
const express = require('express');
const socketio = require("socket.io");
const cookieParser = require('cookie-parser');
const http = require("http");
const path = require("path");
const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

let plrs = []
let plrUsers = []

//Make the home screen
app.use("/", express.static(path.join(__dirname, "main/home/")));

app.use(cookieParser());

app.get("/api/isAuthed", (req, res) => {
  const username = req.get("X-Replit-User-Name");
  if (username) res.send({ authed: true });
  else res.send({ authed: false });
});

//Listen for the server to start
httpserver.listen(3000, () => {
  console.log("Server Started")
});

const allowedColors = [ "yellow", "orange", "red", "purple", "skyblue", "cadetblue", "purple" ];

//Connect to each client
io.on('connection', function(socket) {
  const username = socket.request.headers["x-replit-user-name"];
  const profileImage = socket.request.headers["x-replit-user-profile-image"] || "https://i0.wp.com/repl.it/public/images/evalbot/evalbot_43.png";

  const color = socket.handshake.query.color;
  
  if (
    !username ||
    plrUsers.some(u => u && u.username === username) ||
    !allowedColors.includes(color)
  ) return socket.disconnect();
  
  plrs[plrs.length] = socket.id
  plrUsers[plrUsers.length] = { username, profileImage, color }

  const newPlrIndex = plrs.indexOf(socket.id);

  socket.broadcast.emit("playerJoin", false, newPlrIndex, plrUsers[newPlrIndex]);
  socket.emit("playerJoin", true, newPlrIndex, plrUsers[newPlrIndex]);

  for (let val in plrs) {
    if (plrs[val] && plrs[val] !== socket.id){
      socket.emit("playerJoin", false, val, plrUsers[val])
    }
  }
  
  socket.on("disconnecting", function(){
    socket.broadcast.emit("playerLeave", plrs.indexOf(socket.id))

    const plrIndex = plrs.indexOf(socket.id);
    
    plrs[plrIndex] = undefined
    plrUsers[plrIndex] = undefined
  })

  socket.on("move", (ratioX,ratioY)=>{
    socket.broadcast.emit("playerMove", plrs.indexOf(socket.id), ratioX, ratioY)
  })

  socket.on("mouseDown", ()=>{
    socket.broadcast.emit("playerMouseDown", plrs.indexOf(socket.id))
  })

  socket.on("mouseUp", ()=>{
    socket.broadcast.emit("playerMouseUp", plrs.indexOf(socket.id))
  })
})