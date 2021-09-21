const path = require("path");
const http = require("http");
const express = require("express");
const chalk = require("chalk");
const { Server } = require("socket.io");
const Filter = require("bad-words");
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require("./utils/users");

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

	socket.on("join", ({ username, room }, cb) => {
		const { user, error } = addUser({ id: socket.id, username, room });

		if (error) {
			return cb(error);
		}

		socket.join(user.room);

		socket.emit("message", generateMsg("Welcome!"));
		socket.broadcast
			.to(room)
			.emit("message", generateMsg(`${user.username} as joined!`));

		cb();
	});

	socket.on("sendMessage", (msg, cb) => {
		const filter = new Filter();
		const user = getUser(socket.id);

		if (filter.isProfane(msg)) {
			return cb("Profane words not allowed");
		}

		io.to(user.room).emit("message", generateMsg(msg));
		cb();
	});

	socket.on("sendLocation", (location, cb) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			"locationMessage",
			generateMsg(`https://google.com/maps?q=${location.lat},${location.long}`)
		);

		cb("message delivered!");
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				generateMsg(`A ${user.username} has left!`)
			);
		}
	});
});

server.listen(5000, () => {
	console.log(chalk.bold.cyan("Server is running and listening to port 5000"));
});
