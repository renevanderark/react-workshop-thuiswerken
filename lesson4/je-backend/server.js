const bodyParser = require('body-parser');
const express = require('express');
const app = express();

let tasks = [
	{
		contactEmail: "voorgeladen@bk.ln",
    taskName: "deze zat al in de server",
    id: `${Math.random() * new Date().getTime()}`,
    timeStamp: new Date().getTime(),
    status: "wachtrij"
	}
];
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

	setTimeout(() =>res.send(JSON.stringify(newTask)), 1000);
});

app.get('/tasks', (req, res) => {
	setTimeout(() =>	res.send(JSON.stringify(tasks)), 1500);
});

app.use('/', express.static(process.env.STATIC_DIR));

app.listen(3000, () => console.log("app on port 3000"));
