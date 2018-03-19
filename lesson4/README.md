# Deel 4

## Welkom terug

Vandaag gaan we met een backend praten. Tot nu toe heb ik je niet verteld hoe je je ```index.html``` moet openen in de browser. Misschien heb je het apache laten uitserveren, misschien heb je zoals ik tot nu toe gewoon een ```file:///``` pad gebruikt.

Wat je ook hebt gekozen, om het nu simpel te maken raad ik je aan om ```je-project``` even uit te laten serveren door ```je-backend``` (zoals in het mapje onder deze ```lesson4``` map). Zo hoef je geen CORS headers te introduceren:

```sh
mkdir je-backend
cd je-backend
wget 'https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/raw/master/lesson4/je-backend/package.json'
wget 'https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/raw/master/lesson4/je-backend/server.js'
npm install
STATIC_DIR=/pad/naar/je-project npm start
```
(vervang natuurlijk ```/pad/naar/je-project``` met het pad naar de root van je project)

Als je nu [http://localhost:3000](http://localhost:3000) opent zie je je project.

Oh ja, LET OP: werkt iets niet zoals verwacht? Dit zijn de versies in de package.json:
```json
"devDependencies": {
  "babel-core": "6.26.0",
  "babel-loader": "7.1.4",
  "babel-plugin-transform-object-rest-spread": "6.26.0",
  "babel-preset-env": "1.6.1",
  "babel-preset-react": "6.24.1",
  "react": "16.2.0",
  "react-dom": "16.2.0",
  "react-redux": "5.0.7",
  "redux": "3.7.2",
  "redux-thunk": "2.2.0",
  "webpack": "4.1.1",
  "webpack-cli": "2.0.12",
  "xhr": "2.4.1"
}
```

## Wat we nu gaan doen

- We gaan zorgen dat de _tasks_ die in de backend zijn _opgeslagen_ actueel getoond worden met nog een ajax call
- We gaan de ```mockAjaxSave``` vervangen met een echte naar je-backend
- We gaan een pattern voor foutafhandeling introduceren
- Dan gaan we kijken naar websockets; immers, als je een taak start wil je weten wat de 'progress' is.

## Ophalen en tonen

Je ```stores``` werken met een ```initialState```. Het werkgeheugen van de browser is natuurlijk voor lang niet alles de plek om die ```initialState``` vandaan te halen. De ```tasks``` leven op de server. Je moet dus zorgen dat je die informatie tijdig ophaalt. Dat doen we met XmlHttpRequest (of xhr). Prachtige naam (net als 'ajax'), maar we halen dus wel weer gewoon JSON op.


En ook daarvoor bestaat een npm module: ```xhr```; dat houdt het wel zo cross-browser:
```sh
cd /pad/naar/je-project
npm install xhr --save-dev
```

De flux architectuur indachtig moeten we dus een Action maken om de taken op te halen (of eigenlijk 2).
action-types.js:
```javascript
export default {
  UPDATE_TASK_UNDER_EDIT: "UPDATE_TASK_UNDER_EDIT",
  SAVING_TASK_UNDER_EDIT: "SAVING_TASK_UNDER_EDIT",
  TASK_UNDER_EDIT_SAVED: "TASK_UNDER_EDIT_SAVED",

  REQUEST_TASKS: "REQUEST_TASKS",
  RECEIVE_TASKS: "RECEIVE_TASKS"
}
```

In actions.js:
```javascript
// (...) imports
import xhr from "xhr";

// (...) bestaande code
const fetchTasks = () => (dispatch) => {
  dispatch({type: ActionTypes.REQUEST_TASKS});

  xhr({ url: "/tasks", method: "GET", headers: { "Accept": "application/json"} },
    (err, resp, body) => {
      dispatch({type: ActionTypes.RECEIVE_TASKS, payload: JSON.parse(body)})
    }
  );
};

// de action creator:
export default function(dispatch) {
  return {
    onTaskUnderEditChange: (newValues) => dispatch(updateTaskUnderEdit(newValues)),
    onSaveTaskUnderEdit: () => dispatch(saveTaskUnderEdit()),
    onFetchTasks: () => dispatch(fetchTasks())
  };
}
```

De task-overview reducer moet dus iets doen met die twee nieuwe instructies.

store/task-overview.js
```javascript
import ActionTypes from "../action-types";

const initialState = {
  tasks: [],
  pending: false
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    case ActionTypes.REQUEST_TASKS:
      return {
        ...state,
        tasks: [],
        pending: true
      };
    case ActionTypes.RECEIVE_TASKS:
      return {
        ...state,
        tasks: action.payload,
        pending: false
      }
    default:
      return state;
  }
}
```
Dus wanneer het request verstuurd is willen aan kunnen geven aan de gebruiker dat de taken worden opgehaald en wanneer ze ontvangen zijn van de server willen we ze tonen. (Ik heb voor het effect 1,5 seconden vertraging ingebouwd in ```je-backend```)

Omdat we zo snel mogelijk deze informatie aan de gebruiker willen tonen, voeren we onze nieuwe actie direct uit vanuit de ```index.js```

index.js
```javascript
// imports en oude code
const {
  onTaskUnderEditChange,
  onSaveTaskUnderEdit,
  onFetchTasks
} = actionCreator(store.dispatch);

onFetchTasks();

// render code
```

Als je nu de [pagina](http://localhost:3000) laad in de browser zie je als het klopt in het ```<pre>```-blokje onder Takenoverzicht eerst dit:
```json
{
  "tasks": [],
  "pending": true
}
```

En na circa 1,5 seconden dit:
```json
{
  "tasks": [
    {
      "contactEmail": "voorgeladen@bk.ln",
      "taskName": "deze zat al in de server",
      "id": "752886625109.792",
      "timeStamp": 1521452250585,
      "status": "wachtrij"
    }
  ],
  "pending": false
}
```

## Opslaan

Nu willen we natuurlijk dat onze Ok-knop ervoor zorgt dat een nieuwe taak wordt opgeslagen op de server. Die 'Actions' hadden we al:
- SAVING_TASK_UNDER_EDIT
- TASK_UNDER_EDIT_SAVED

Maar nu moeten we ze nog ombouwen naar een xhr request / response.

En eigenlijk moet de lijsten met taken dan ook opnieuw worden opgehaald.

actions.js
```javascript
// onder const fetchTasks =
const saveTaskUnderEdit = () => (dispatch, getState) => {
  const taskUnderEdit = getState().taskManagement.taskUnderEdit;
  if (taskUnderEdit.contactEmail.isValid && taskUnderEdit.taskName.isValid) {
    dispatch({type: ActionTypes.SAVING_TASK_UNDER_EDIT});
    xhr({
      url: "/tasks",
      method: "POST",
      headers: { "Accept": "application/json", "Content-type": "application/json" },
      data: JSON.stringify({
        contactEmail: taskUnderEdit.contactEmail.value,
        taskName: taskUnderEdit.taskName.value
      })
    }, (error, response, body) => {
      dispatch({type: ActionTypes.TASK_UNDER_EDIT_SAVED });
      dispatch(fetchTasks());
    });
  }
};
```

Als je nu de pagina herlaadt heb je het al geïmplementeerd. Ook hiervoor heb ik in ```je-backend``` een kunstmatige vertraging geïntroduceerd.

## Foutafhandeling

Wat zou een frontend moeten doen met een foutmelding van de server? Daar zijn natuurlijk weer een heleboel antwoorden op te bedenken, maar ik ben fan van gewoon terugmelden aan de gebruiker.

Fouten en meldingen zijn een React component op zich, dus die voegen we eerst toe aan de app.
Maak maar een nieuwe file en dir ervoor aan ```src/components/messages/Messages.js```.
```javascript
import React from "react";
import { connect } from "react-redux";

const Messages = (props) => (
  <div>
    {props.messages.map((message, idx) => (
      <div key={idx} className={`alert alert-${message.level}`}>
        {message.text}
        <button className="close">
          <span>&times;</span>
        </button>
      </div>
    ))}
  </div>
);

export default connect(state => state.messages)(Messages)
```

LET OP: je ziet hier een nieuwe gereserveerde _prop_ genaamd ```key```. [Deze key](https://reactjs.org/docs/lists-and-keys.html) is nodig wanneer je arrays mapt naar ```jsx```-nodes.

LET OP: de meldingen zijn een nieuw top-level component. Ze worden direct gevoed uit een nieuwe reducer. Daarom heb je ook hier weer een connector.

Met zijn eigen reducer ```src/store/messages.js```.
```javascript
import ActionTypes from "../action-types";

const initialState = {
  messages: []
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    case ActionTypes.ON_ERROR_MESSAGE:
      return {
        messages: [{text: action.payload, level: "danger"}].concat(state.messages)
      }
    default:
      return state;
  }
}
```

Vergeet de ActionType niet toe te voegen in action-types.js:
```javascript
export default {
  UPDATE_TASK_UNDER_EDIT: "UPDATE_TASK_UNDER_EDIT",
  SAVING_TASK_UNDER_EDIT: "SAVING_TASK_UNDER_EDIT",
  TASK_UNDER_EDIT_SAVED: "TASK_UNDER_EDIT_SAVED",

  REQUEST_TASKS: "REQUEST_TASKS",
  RECEIVE_TASKS: "RECEIVE_TASKS",

  ON_ERROR_MESSAGE: "ON_ERROR_MESSAGE"
}
```

En voeg hem in in als kind van de App in index.js
```javascript
// (...) bestaande imports
import messagesReducer from "./store/messages";
import Messages from "./components/messages/Messages";

const store = createStore(combineReducers({
  taskManagement: taskManagementReducer,
  taskOverview: taskOverviewReducer,
  messages: messagesReducer
}), applyMiddleware(thunk));

// (...) bestaande code

window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <Header versie="0.0.3">Takenbeheer</Header>
        <Messages />
        <NewTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <TaskOverview />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
```

Het enige dat we nu nog hoeven te doen is de status en error uitlezen uit de server response en de dispatcher te voeden met ON_ERROR_MESSAGE.
actions.js
```javascript
// (...) bestaande code

const saveTaskUnderEdit = () => (dispatch, getState) => {
  const taskUnderEdit = getState().taskManagement.taskUnderEdit;
  if (taskUnderEdit.contactEmail.isValid && taskUnderEdit.taskName.isValid) {
    dispatch({type: ActionTypes.SAVING_TASK_UNDER_EDIT});
    xhr({
      url: "/tasks",
      method: "POST",
      headers: { "Accept": "application/json", "Content-type": "application/json" },
      data: JSON.stringify({
        contactEmail: taskUnderEdit.contactEmail.value,
        taskName: taskUnderEdit.taskName.value
      })
    }, (error, response, body) => {
      dispatch({type: ActionTypes.TASK_UNDER_EDIT_SAVED }); // we blijven deze versturen, maar de naam klopt dus niet in alle gevallen.
      if (error != null) {
        dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: "Fout bij het opslaan" });
      } else if (response.statusCode < 200 || response.statusCode >= 400) {
        dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: `${response.statusCode} - ${JSON.parse(body).message}` });
      } else {
        dispatch(fetchTasks());
      }
    });
  }
};

// (...) bestaande code
```

Om de nieuwe code te testen kun je een nieuwe taak aanmaken met de taaknaam 'fout' (case insensitive).

De oplettende kijker is misschien opgevallen dat je deze message niet kunt wegklikken met het kruisje. Dat is weer een leuke 'zelf doen' opdracht, me dunkt.

## Zelf doen
Implementeer het kruisje van de message box:
- Maak een nieuwe ActionType aan: "ON_REMOVE_MESSAGE"
- Maak een nieuwe action aan in de action creator: onRemoveMessage(messageIndex)
- Zorg dat de messages reducer "ON_REMOVE_MESSAGE" de message de index uit ```messageIndex``` weghaalt uit de ```messages``` arrays
- Zorg dat onRemoveMessage wordt aangeroepen wanneer de gebruiker op het kruisje klikt

LEESVOER:  [Immutable Update Patterns: Inserting and Removing Items in Arrays](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns#inserting-and-removing-items-in-arrays)

## Websockets

Zoals je misschien wel gemerkt hebt leent React zich heus niet voor elke use-case. Ik zou er geen door Google indexeerbare websites mee bouwen. Waarom ik toch de moeite heb genomen om deze cursus te maken is omdat er ook use cases zijn waarvoor React wel heel bruikbaar is:
- Cross device apps (zo nodig via phonegap-/cordova-achtige constructies; [spelletje](https://play.google.com/store/apps/details?id=nl.rene.fluxagon)/ [source](https://github.com/renevanderark/hexagons))
- Beheerinterfaces met eventueel...
- Real time dashboards ([filmpje](https://youtu.be/A5QepEMuLH0) / [prototype source](https://rel-git-p100.wpakb.kb.nl/RAR020/2017-dare2-IR/tree/prototype))

Die laatste 2, vooral die laatste, varen wel bij real-time data; _gepusht_ door de server. Nu heb je vast wel eens zo'n chatbox tutorial gedaan met webtechnologie x, y of z. Mijn oude favoriet was [Faye](https://faye.jcoglan.com). Dit omdat de belofte van WebSockets steeds uitbleef. Tegenwoordig is zit er in elke moderne desktop browser wel een uitgerijpte WebSocket-client: [RFC 6455](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).

Ook voor Jetty is er een goed uitgerijpte [Websocket server](http://www.eclipse.org/jetty/documentation/9.4.x/jetty-websocket-server-api.html) implementatie.

De kritiek die ik deel met veel collega's op deze hele _frameworks_ voor _single page apps_ werkwijze is dat de browser wordt omgetoverd in een soort operating system. Maar is de browser dan _echt_ zo'n rare keuze voor een operating system. Is niet het hele _Chromebook_ idee daarop gebaseerd? Verreweg de eenvoudigste manier om cross-device, cross-OS graphical user interfaces te bouwen zonder dat iemand een .exe of .jar hoeft te installeren is deze werkwijze.

Zeker wanneer meerdere gebruikers tegelijk moeten werken in hetzelfde dashboard is een websocket implementatie geen overbodige luxe.

Dus om het argument hierboven dus nog even om te draaien (Ik zou er geen door Google indexeerbare websites mee bouwen):
Ik zou geen cross-device apps, noch beheerinterfaces met eventueel real-time dashboards gaan bouwen in PHP met een laagje jQuery, laat staan in Zend Server. (Dat laagje jQuery wordt groter en groter, het PHP deel wordt meer een meer een veredelde proxy naar de achterliggende REST service die we altijd in Java bouwen).

Nu we dat achter de rug hebben wil ik je het volgende laten doen:
- In plaats van de frontend elke keer de takenlijst te laten ophalen via xhr, gaat de frontend luisteren naar een websocket.
- Om alles wat mooier te maken gaan we het ```<pre>```-blok onder takenoverzicht vervangen door een ```jsx```-component
- In dat nieuwe component implementeren we nog een play knop, die de taken laat 'draaien' op de server.

Punt 1 en 2 doe ik voor. Punt 3 wordt weer 'Zelf doen'.

### Luisteren naar de _taken-push_

De initiële xhr request ```GET /tasks``` in ```index.js``` behouden we, maar na het opslaan doen we niet meer een _refetch_. In plaats daarvan gaan we index.js laten luisteren naar de server als volgt:
```javascript
// (...) bestaande imports
import ActionTypes from "./action-types";

// (...) bestaande code.

onFetchTasks(); // haal eerste keer takenlijst op via xhr actionCreator
const tasksClient = new WebSocket('ws://localhost:3000/tasks');

tasksClient.onmessage = (msg) => store.dispatch({
  type: ActionTypes.RECEIVE_TASKS,
  payload: JSON.parse(msg.data)
});

// (...) bestaande code
```

Verwijder nu dit else blok uit de functie ```saveTaskUnderEdit``` in ```actions.js```:
```javascript
} else {
 dispatch(fetchTasks());
}
```

Als alles goed is kun je nu op dezelfde manier de takenlijst aanvullen.... en: vanuit elke open browser tab zou je dezelfde status moeten zien zonder het herladen van de pagina.

Natuurlijk kun je dit ook allemaal doen door ouderwets te _pollen_: ```window.setInterval(onFetchTasks, 1000);``` in index.js... Sterker nog, je zou het ook beide kunnen doen (als je nog niet heel veel vertrouwen hebt in die websockets).

### Takenoverzicht- en taakcomponent

Sommige dingen horen gewoon thuis in een tabel. Dus dat gaan we doen. Laten we eerst de rijen maken met het nieuwe component Task.
Maak aan ```src/components/task-overview/Task.js```:
```javascript
import React from "react";


// https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript#answer-10073788
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const dateFmt = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}T` +
  `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}.` +
  `${pad(date.getMilliseconds(), 3)}Z`;

const Task = ({ taskName, contactEmail, timeStamp, status }) => (
  <tr>
    <td><button className="btn btn-sm">►</button></td>
    <td>{taskName}</td>
    <td>{status}</td>
    <td>{contactEmail}</td>
    <td>{dateFmt(new Date(timeStamp))}</td>
  </tr>
);

export default Task;
```

En dan de rest van de tabel in TaskOverview.js:
```javascript
import React from "react";
import { connect } from "react-redux";

import Task from "./Task";

class TaskOverview extends React.Component {

  render() {
    const { pending, tasks } = this.props;

    const tableBody = pending
      ? (<td colSpan="5">Bezig met laden...</td>)
      : tasks
          .sort((a, b) => b.timeStamp - a.timeStamp)
          .map(task => <Task key={task.id} {...task} />);

    return (
      <div className="card">
        <div className="card-header">Takenoverzicht</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>Taak starten</th>
                <th>Naam taak</th>
                <th>Status</th>
                <th>Contact</th>
                <th>Aangemaakt</th>
              </tr>
            </thead>
            <tbody>
              {tableBody}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
export default connect((state) => state.taskOverview)(TaskOverview);
```

## Zelf doen

Implementeer de play knop.
- Voeg een action toe aan de action creator: ```onPressPlay(taskId)```
- Zorg dat die action een xhr request doet naar ```PUT /tasks/:taskId/start```, zonder data
- Zorg natuurlijk ook dat die action wordt correct wordt aangeroepen wanneer de gebruiker op de knop drukt
- Zorg dat de knop disabled is wanneer de status !== 'wachtrij'
