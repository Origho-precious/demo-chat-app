const socket = io();

const form = document.querySelector("form");
const input = document.getElementById("msg-input");
const formBtn = form.querySelector("button");
const locationBtn = document.getElementById("send-location");

socket.on("message", (message) => {
	console.log(message);
});

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const msg = input.value;

	if (msg) {
		formBtn.setAttribute("disabled", true);

		socket.emit("sendMessage", msg, (error) => {
			formBtn.removeAttribute("disabled");
			input.value = "";
			input.focus();

			if (error) {
				return console.log(error);
			}

			console.log("message delivered");
		});
	}
});

locationBtn.addEventListener("click", (e) => {
	if (!navigator.geolocation) {
		return alert("Geolocation not supported in your browser!");
	}

	locationBtn.setAttribute("disabled", true);

	navigator.geolocation.getCurrentPosition((position) => {
		const location = {
			lat: position?.coords?.latitude,
			long: position?.coords?.longitude,
		};

		socket.emit("sendLocation", location, (deliveryMsg) => {
			locationBtn.removeAttribute("disabled");
			console.log(deliveryMsg);
		});
	});
});
