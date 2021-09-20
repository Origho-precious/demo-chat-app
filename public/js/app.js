const socket = io();

const input = document.getElementById("msg-input");
const form = document.querySelector("form");
const locationBtn = document.getElementById("send-location");

socket.on("message", (message) => {
	console.log(message);
});

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const msg = input.value;
	if (msg) {
		socket.emit("sendMessage", msg, (error) => {
			if (error) {
				return console.log(error);
			}
			console.log("message delivered");
		});

		input.value = "";
	}
});

locationBtn.addEventListener("click", (e) => {
	if (!navigator.geolocation) {
		return alert("Geolocation not supported in your browser!");
	}

	navigator.geolocation.getCurrentPosition((position) => {
		const location = {
			lat: position?.coords?.latitude,
			long: position?.coords?.longitude,
		};

		socket.emit("sendLocation", location, (deliveryMsg) => {
			console.log(deliveryMsg);
		});
	});
});
