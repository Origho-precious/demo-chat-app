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
	socket.emit("message", "Welcome!");

	socket.broadcast.emit("message", "A user just connected!");

	socket.on("sendMessage", (msg) => {
		io.emit("message", msg);
	});

  socket.on("sendLocation", (location) => {
		io.emit(
			"message",
			`location: ${location.lat}, ${location.long}`
		);
	});

	socket.on("disconnect", () => {
		io.emit("message", "A user just left!");
	});
});

server.listen(5000, () => {
	console.log(chalk.bold.cyan("Server is running and listening to port 5000"));
});
