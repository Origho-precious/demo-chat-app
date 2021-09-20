const path = require("path");
const express = require("express");
const chalk = require('chalk');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "../public")));

app.listen(5000, () => {
	console.log(chalk.bold.cyan("Server is running and listening to port 5000"));
});
