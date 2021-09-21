const socket = io();

const form = document.querySelector("form");
const input = document.getElementById("msg-input");
const formBtn = form.querySelector("button");
const locationBtn = document.getElementById("send-location");
const messages = document.getElementById("msgs");

const msgTemplate = document.getElementById("msg-temp").innerHTML;
const locationTemplate = document.getElementById("location-temp").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	// New message element
	const newMsg = messages.lastElementChild;

	// Height of the new message
	const newMsgStyles = getComputedStyle(newMsg);
	const newMsgMargin = parseInt(newMsgStyles.marginBottom);
	const newMsgHeight = newMsg.offsetHeight + newMsgMargin;

	// Visible height
	const visibleHeight = messages.offsetHeight;

	// Height of messages container
	const containerHeight = messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = messages.scrollTop + visibleHeight;

	if (containerHeight - newMsgHeight <= scrollOffset) {
		messages.scrollTop = messages.scrollHeight;
	}
};

socket.on("message", (message) => {
	const html = Mustache.render(msgTemplate, {
		username: message.username,
		msg: message.msg,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});

	messages.insertAdjacentHTML("beforeend", html);
	
	autoscroll();
});

socket.on("locationMessage", (location) => {
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		location: location.msg,
		createdAt: moment(location.createdAt).format("h:mm a"),
	});

	messages.insertAdjacentHTML("beforeend", html);
	
	autoscroll();
});

socket.on("roomData", ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector("#sidebar").innerHTML = html;
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

socket.emit("join", { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = "/";
	}
});
