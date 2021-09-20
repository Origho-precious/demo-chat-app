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

	socket.on("sendMessage", (msg, cb) => {
		io.emit("message", msg);
		cb("message delivered!");
	});

	socket.on("sendLocation", (location, cb) => {
		io.emit(
			"message",
			`https://google.com/maps?q=${location.lat},${location.long}`
		);

		cb("message delivered!");
	});

	socket.on("disconnect", () => {
		io.emit("message", "A user just left!");
	});
});

server.listen(5000, () => {
	console.log(chalk.bold.cyan("Server is running and listening to port 5000"));
});
