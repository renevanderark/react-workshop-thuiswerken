const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

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
	if (req.body.taskName.match(/fout/i)) {
		setTimeout(() => res.status(400).send({message: "Deze taak kunnen we zo niet aanmaken"}), 500);
	} else {
		const newTask = {
			contactEmail: req.body.contactEmail,
	    taskName: req.body.taskName,
	    id: `${Math.random() * new Date().getTime()}`,
	    timeStamp: new Date().getTime(),
	    status: "wachtrij"
		};

		tasks.push(newTask);

		setTimeout(() => {
			res.send(JSON.stringify(newTask));
			expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(tasks)));
		}, 1000);
	}
});
app.put('/tasks/:id/start', (req, res) => {
	const upIdx = tasks.map(t => t.id).indexOf(req.params.id);

	if (upIdx < 0) {
		res.status(404).send({message: `Taak met id ${req.params.id} niet gevonden`});
	} else {
		tasks[upIdx].status = "0%";
		res.send({});
	}
});

app.put('/tasks/:id', (req, res) => {
	const upIdx = tasks.map(t => t.id).indexOf(req.params.id);
	if (upIdx < 0) {
		res.status(404).send({message: `Taak met id ${req.params.id} niet gevonden`});
	} else {
		const updatedTask = Object.assign(tasks[upIdx], {
			contactEmail: req.body.contactEmail,
			taskName: req.body.taskName,
		});
		tasks[upIdx] = updatedTask;
		setTimeout(() => {
			res.send(JSON.stringify(updatedTask));
			expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(tasks)));
		}, 1000);
	}
});

app.get('/tasks', (req, res) => {
	setTimeout(() =>	res.send(JSON.stringify(tasks)), 1500);
});



app.ws('/tasks', (ws, req) => { });

app.get('/tasks/:id', (req, res) => {
	const taskIdx = tasks.map(t => t.id).indexOf(req.params.id);
	if (taskIdx < 0) {
		res.status(404).send({message: `Taak met id ${req.params.id} niet gevonden`});
	} else {
		res.send(JSON.stringify(tasks[taskIdx]));
	}
});


setInterval(() => {
	if (tasks.filter(t => t.status !== 'wachtrij').length > 0) {
		tasks = tasks.map(task => (task.status === 'wachtrij'
			? task
			: Object.assign(task, {
				status: `${parseInt(task.status.replace(/%/, '')) + 5}%`
			})
		)).filter(task => task.status === 'wachtrij' || parseInt(task.status.replace(/%/, '')) < 100);
		expressWs.getWss().clients.forEach(client => client.send(JSON.stringify(tasks)));
	}
}, 250);

app.use('/', express.static(process.env.STATIC_DIR));

app.get('*', function(request, response, next) {
  response.sendFile(process.env.STATIC_DIR + 'index.html');
});

app.listen(3000, () => console.log("app on port 3000"));
