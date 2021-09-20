const path = require("path");
const http = require("http");
const express = require("express");
const chalk = require("chalk");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("A user just connected!");
  socket.emit('message', 'Welcome!')

  socket.on('sendMessage', (msg) => {
    io.emit('message', msg)
  })
});

server.listen(5000, () => {
	console.log(chalk.bold.cyan("Server is running and listening to port 5000"));
});
