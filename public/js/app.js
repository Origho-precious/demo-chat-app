const socket = io();

const form = document.querySelector("form");
const input = document.getElementById("msg-input");
const formBtn = form.querySelector("button");
const locationBtn = document.getElementById("send-location");
const messages = document.getElementById("msgs");

const msgTemplate = document.getElementById("msg-temp").innerHTML;
const locationTemplate = document.getElementById("location-temp").innerHTML;

socket.on("message", (message) => {
	const html = Mustache.render(msgTemplate, { msg: message });

	messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (location) => {
	const html = Mustache.render(locationTemplate, { location });

	messages.insertAdjacentHTML("beforeend", html);
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
