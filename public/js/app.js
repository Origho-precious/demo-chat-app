const socket = io();

const input = document.getElementById("msg-input");
const form = document.querySelector("form");

socket.on("message", (message) => {
	console.log(message);
});

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const msg = input.value;
	if (msg) {
		socket.emit("sendMessage", msg);
		input.value = "";
	}
});
