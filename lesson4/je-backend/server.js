const bodyParser = require('body-parser');
const express = require('express');
const app = express();

let tasks = [];
app.use(bodyParser.json());

app.post('/tasks', (req, res) => {
	const newTask = {
		contactEmail: req.body.contactEmail,
    taskName: req.body.taskName,
    id: `${Math.random() * new Date().getTime()}`,
    timeStamp: new Date().getTime(),
    status: "wachtrij"
	};

	tasks.push(newTask);

	res.send(JSON.stringify(newTask));
});

app.get('/tasks', (req, res) => {

	res.send(JSON.stringify(tasks));
});

app.use('/', express.static(process.env.STATIC_DIR));

app.listen(3000, () => console.log("app on port 3000"));
