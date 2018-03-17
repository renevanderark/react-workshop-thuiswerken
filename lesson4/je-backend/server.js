const bodyParser = require('body-parser');
const express = require('express');
const app = express();

let tasks = [];
app.use(bodyParser.json());
	
app.post('/tasks', (req, res) => {
	console.log(req.body);

	res.send('hello\n');
});

app.listen(3000, () => console.log("app on port 3000"));
