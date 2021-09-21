const path = require("path");
const http = require("http");
const express = require("express");
const chalk = require("chalk");
const { Server } = require("socket.io");
const Filter = require("bad-words");

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
	const generateMsg = (msg) => {
		return {
			msg,
			createdAt: new Date().getTime(),
		};
	};

	socket.on("sendMessage", (msg, cb) => {
		const filter = new Filter();

		if (filter.isProfane(msg)) {
			return cb("Profane words not allowed");
		}

		io.emit("message", generateMsg(msg));
		cb();
	});

	socket.on("join", ({ username, room }) => {
		socket.join(room);

		socket.emit("message", generateMsg("Welcome!"));
		socket.broadcast
			.to(room)
			.emit("message", generateMsg(`${username} as joined!`));
	});

	socket.on("sendLocation", (location, cb) => {
		io.emit(
			"locationMessage",
			generateMsg(`https://google.com/maps?q=${location.lat},${location.long}`)
		);

		cb("message delivered!");
	});

	socket.on("disconnect", () => {
		io.emit("message", generateMsg("A user just left!"));
	});
});

server.listen(5000, () => {
	console.log(chalk.bold.cyan("Server is running and listening to port 5000"));
});
