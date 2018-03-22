# Deel 5

## Maar je zei net?
Je moet geen websites bouwen met React, tenzij je misschien Facebook wilt bouwen. Dat is _mijn_ mening.

Maar ook een 'single-page app' kan veel baat hebben bij routing via de URL-balk. Als je als gebruiker terug wilt kunnen bladeren naar een bepaalde zoekfilter met de back-knop, of als je te veel informatie hebt om kwijt te kunnen in je 'screen real-estate' dan zijn routes nog altijd de juiste weg.

Maar als je de ```redux``` reducers / store ziet als single-source-of-truth voor je 'application state', terwijl de URL zijn eigen 'source-of-truth' is, ontstaan er dan geen onvoorspelbare situaties?

Het antwoord is vaak ja en de 'off-the-shelf' oplossingen (waaronder ```react-router```) bieden in mijn beleving geen bevredigende oplossing voor dit probleem.

Wat mij betreft moet je de URL gewoon zien als een gebruikers invoer. Een 'user Action'. Dus kijken we nog eens naar dit flux plaatje:

![flux architecture](https://cdn-images-1.medium.com/max/800/0*N-lKmfPpHkOW4Ppi.png "flux architecture")

Een 'change'-event op de taakbalk (op de URL dus) is wat mij betreft gewoon een Action in dat blauwe vlakje.

Wat moeten we dus kunnen?
1. Luisteren naar veranderingen in de URL (via de history API)
2. De dispatcher aanroepen met de juiste Action
3. Navigatie mogelijk maken via de URL zonder dat de pagina steeds opnieuw wordt herladen - ook via de juiste Action

LET OP: wil dit werken heb je wel een rewrite rule nodig. Dit kun je doen in een apache ```.htaccess``` file constructie, maar hij zit al correct in ```je-backend```.

Pas ook je ```index.html``` aan zodat de javascripts vanuit de 'root' worden geïmporteerd, in plaats van relatief:

```html
<html>
	<head>
		<meta charset="utf-8">
		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
	</head>
	<body>
		<div id="app"></div>
		<script src="/dist/main.js"></script> <!-- hier! -->
	</body>
</html>
```

## History API

De history API is onderdeel van HTML5. Desalniettemin - uit zorg over cross-browser issues - gebruiken we deze wrapper als npm module:

```sh
npm i history --save
```

Dit keer dus niet een ```devDependency``` maar een ```depency```. Dit omdat code uit deze wrapper uitgevoerd wordt na packaging door webpack.

Er is ook een handige package genaamd ```qs``` die query strings ```?foo=bar&bar=foo``` mapt naar native javascript objecten:

```sh
npm i qs --save-dev
```

## De router

Allereerst maken we de router aan. Wat mij betreft is een kleine code review op dit ding welkom, maar wat het moet doen is:
1. Een router initialiseren met een 'root'-pad (optioneel)
2. De functie 'navigateTo' aanbieden die het mogelijk maakt om te navigeren naar een andere URL ('hyperlinks') zonder herladen van de pagina
3. De functie 'mapRoutes' aanbieden die routes in de URL mapt naar door jou bepaalde callback functies.
4. De correcte callback aanroept bij het laden van de pagina
5. De correcte callback aanroept wanneer de URL verandert

src/router.js
```javascript
import createHistory from 'history/createBrowserHistory';
import qs from "qs";
const history = createHistory();

export default (rootPath = '') => {

  let routeActionMap = {};
  let root = rootPath.replace(/^\//, "");

  const mapPathToRouterAction = (location, action) => {
    const queryParams = qs.parse(location.search.replace(/^\?/, ''));

    const path = location.pathname.replace(root, '');
    for (let rt in routeActionMap) {
      const pathParts = path.split("/");
      const rtParts = rt.split("/");
      if (pathParts.length !== rtParts.length) {
        continue;
      }
      let rtMatch = true;
      let paramMap = {
        ...queryParams
      };
      for (let i = 0; i < pathParts.length; i++) {
        if (!(pathParts[i] === rtParts[i] || rtParts[i].match(/^:/))) {
          rtMatch = false;
          break;
        } else if (rtParts[i].match(/^:/)) {
          paramMap[rtParts[i].replace(/^:/, '')] = pathParts[i];
        }
      }
      if (rtMatch) {
        return routeActionMap[rt](paramMap);
      }
    }
    console.warn(`Unmapped route ${path}`);
  }


  return {
    navigateTo: (path) => history.push(`${root}${path}`),
    mapRoutes: (map) => {
      routeActionMap = map;
      history.listen(mapPathToRouterAction);
      document.addEventListener('DOMContentLoaded', (ev) => mapPathToRouterAction(history.location));
    }
  };
};
```

index.js
```javascript
/// (...) bestaande imports
import makeRouter from "./router";

const { navigateTo, mapRoutes } = makeRouter(/* root pad */);

const store = createStore(combineReducers({
  taskManagement: taskManagementReducer,
  taskOverview: taskOverviewReducer,
  messages: messagesReducer
}), applyMiddleware(thunk));

const {
  onTaskUnderEditChange,
  onSaveTaskUnderEdit,
  onFetchTasks,
  onRemoveMessage,
  onPressPlay
} = actionCreator(store.dispatch, navigateTo);

mapRoutes({
  '/': (params) => console.log(params),
  '/:taskId/edit': (params) => console.log(params)
});

// (...) bestaande code
```

Zoals je ziet worden de fucties ```navigateTo``` en ```mapRoutes``` uit ```makeRouter()``` gehaald. Je voegt alvast ```navigateTo``` als extra argument toe aan de ```actionCreator```. En je mapt alvast 2 routes. Dit gaan we eerst even uitproberen in de browser (via de console). Herlaad de pagina en probeer eens de volgende URLS uit:
- http://localhost:3000 => ```{}```
- http://localhost:3000?foo=bar&bar=foo => ```{foo: 'bar', bar: 'foo'}```
- http://localhost:3000/ladiada/edit => ```{taskId: 'ladiada'}```
- http://localhost:3000/ladiada/edit?foo=bar&bar=foo => ```{taskId: 'ladiada', foo: 'bar', bar: 'foo'}```
- http://localhost:3000/bestaatniet/dus => ```! Unmapped route /bestaatniet/dus```
- http://localhost:3000/tasks => ```vertraagde JSON response van je-backend```

## Voorbereiden op de navigatie

Het wordt natuurlijk de bedoeling dat de callbacks in ```mapRoutes``` een action aanroepen uit de ```actionCreator``` of direct een action versturen via ```store.dispatch```. Ik zat aan de volgende twee nieuwe ActionTypes hiervoor te denken.

action-types.js
```javascript
export default {
  UPDATE_TASK_UNDER_EDIT: "UPDATE_TASK_UNDER_EDIT",
  SAVING_TASK_UNDER_EDIT: "SAVING_TASK_UNDER_EDIT",
  TASK_UNDER_EDIT_SAVED: "TASK_UNDER_EDIT_SAVED",

  REQUEST_TASKS: "REQUEST_TASKS",
  RECEIVE_TASKS: "RECEIVE_TASKS",

  ON_ERROR_MESSAGE: "ON_ERROR_MESSAGE",
  ON_REMOVE_MESSAGE: "ON_REMOVE_MESSAGE",

  SHOW_MAIN: "SHOW_MAIN",
  SHOW_EDIT: "SHOW_EDIT"
}
```

SHOW_MAIN zorgt ervoor dat alles wat we nu al hebben in ```je-project``` getoond wordt, maar een nieuw te bouwen EditTask component juist niet.

SHOW_EDIT zorgt ervoor dat alléén een nieuw te bouwen EditTask component wordt getoond (waarvan de waardes via ```xhr``` worden opgehaald -> weet je nog het model van ```taskUnderEdit``` in de reducer ```task-management.js```?).


Laten we dan nu eerst onze datamodelletjes uitbreiden in onze reducers:
store/task-management.js
```javascript
import ActionTypes from "../action-types";

const initialState = {
  taskUnderEdit: {
    taskName: {value: "", isValid: false},
    contactEmail: {value: "", isValid: false},
    id: null
  },
  saving: false,
  showEdit: false // dit is nieuw
};
// (...) bestaande code
```

store/task-overview.js
```javascript
import ActionTypes from "../action-types";

const initialState = {
  tasks: [],
  pending: false,
  isVisible: true // dit is nieuw
};

// (...) bestaande code
```

En laten we onze top-level componenten deze 'data-verzoeken' laten respecteren.

components/TaskOverview.js
```javascript
```

components/NewTask.js
```javascript
// (...) bestaande code
const NewTask = (props) => props.showEdit ? null : ( // dit is nieuw
  <div className="card">
    <div className="card-header">Nieuwe taak aanmaken</div>
    <div className="card-body">
      <TaskForm onTaskUnderEditChange={props.onTaskUnderEditChange}
                onSaveTaskUnderEdit={props.onSaveTaskUnderEdit}
                taskUnderEdit={props.taskUnderEdit}
                saving={props.saving} />
    </div>
  </div>
);
// (...) bestaande code
```

components/TaskOverview.js
```javascript
// (...) bestaande code
class TaskOverview extends React.Component {

  render() {
    if (!this.props.isVisible) { return null; }
    // (...) bestaande code
  }
}
// (...) bestaande code
```

Had ik al verteld dat een react ```render()``` ook ```null``` mag teruggeven voor render niks?

Laten we dan nu ook eerst ons nieuwe component EditTask bouwen en in de app hangen:
src/components/task-management/EditTask.js
```javascript
import React from "react";
import {connect} from "react-redux";
import TaskForm from "./TaskForm";

const EditTask = (props) => props.showEdit ? (
  <div className="card">
    <div className="card-header">Taak bewerken</div>
    <div className="card-body">
      <TaskForm onTaskUnderEditChange={props.onTaskUnderEditChange}
                onSaveTaskUnderEdit={props.onSaveTaskUnderEdit}
                taskUnderEdit={props.taskUnderEdit}
                saving={props.saving} />
    </div>
  </div>
) : null;

export default connect((state) => state.taskManagement)(EditTask);
```
Oh. Deze lijkt verdacht veel op NewTask! Zoek de 3 verschillen. Dit soort redundantie _kun_ natuurlijk ook wegwerken, maar de kosten- / batenanalyse is dan natuurlijk: hoe zelfdocumenterend is de code dan nog?

Eigenlijk bepaalt het al dan niet bestaan van een ```id``` voor ```taskUnderEdit``` of het een nieuwe is of dat hij bewerkt wordt... Dat betekent dat je de 3 componenten EditTask, NewTask en TaskForm prima terug kunt brengen naar 1. Zoals je zometeen gaat ziet bepaalt de ```saveTaskUnderEdit()``` wel of er een create (POST) of een update (PUT) plaatsvindt. Het al dan niet bestaan van een ```id``` voor ```taskUnderEdit``` kan net zo goed bepalen of er 'Taak bewerken' staat of 'Nieuwe taak aanmaken'... Mocht je deze refactor zelf willen doen, zou ik dat aan het eind van dit lesje doen; we zijn nu eigenlijk bezig met routing en hoe een route de _state_ van je app bepaalt via ```redux```.

Voor nu voeg je dus gewoon EditTask als extra component toe.
src/index.js
```javascript
// (...) bestaande code
window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <Header versie="0.0.3">Takenbeheer</Header>
        <Messages onRemoveMessage={onRemoveMessage} />
        <NewTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <EditTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <TaskOverview onPressPlay={onPressPlay} />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
```

## Implementatie van de navigatie

Nu gaan we de SHOW_EDIT en SHOW_MAIN action types implementeren. Omdat we echter ook nog de te bewerken taak van de server moeten ophalen hebben we waarschijnlijk meer action types nodig.

action-types.js
```javascript
// (...) bestaande code
	RECEIVE_TASK_UNDER_EDIT: "RECEIVE_TASK_UNDER_EDIT"
}
```

actions.js
```javascript
// (...) bestaande code
const fetchTaskUnderEdit = (taskId, navigateTo) => (dispatch) => {
  dispatch({type: ActionTypes.SHOW_EDIT});
  xhr({
    url: `/tasks/${taskId}`,
    method: "GET",
    headers: { "Accept": "application/json" }
  }, (error, response, body) => {
    if (error != null) {
      dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: "Fout met ophalen taak" });
      navigateTo("/");
    } else if (response.statusCode < 200 || response.statusCode >= 400) {
      dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: `${response.statusCode} - ${JSON.parse(body).message}` });
      navigateTo("/");
    } else {
      dispatch({type: ActionTypes.RECEIVE_TASK_UNDER_EDIT, payload: JSON.parse(body)})
    }
  });
}

// de action creator:
export default function(dispatch, navigateTo) {
  return {
    onTaskUnderEditChange: (newValues) => dispatch(updateTaskUnderEdit(newValues)),
    onSaveTaskUnderEdit: () => dispatch(saveTaskUnderEdit()),
    onFetchTasks: () => dispatch(fetchTasks()),
    onRemoveMessage: (messageIndex) => dispatch({type: ActionTypes.ON_REMOVE_MESSAGE, messageIndex: messageIndex}),
    onPressPlay: (taskId) => dispatch(pressPlay(taskId)),
    onShowEdit: (taskId) => dispatch(fetchTaskUnderEdit(taskId, navigateTo))
  };
}
```

Je ziet nu de ```navigateTo``` als extra parameter. Die wordt gebruikt om naar ```/``` te navigeren wanneer de taak niet is gevonden op de server (_virtuele_ redirect).

Pas maar alvast de index.js aan:
```javascript
// (...) bestaande code
const {
  onTaskUnderEditChange,
  onSaveTaskUnderEdit,
  onFetchTasks,
  onRemoveMessage,
  onPressPlay,
  onShowEdit
} = actionCreator(store.dispatch, navigateTo);

mapRoutes({
  '/': (params) => store.dispatch({type: ActionTypes.SHOW_MAIN}),
  '/:taskId/edit': (params) => onShowEdit(params.taskId)
});
// (...) bestaande code
```

Wat nu nog nodig is dat de reducers hun data gaan verwerken.

store/task-overview.js
```javascript
// (...) bestaande code
  switch (action.type) {
    case ActionTypes.SHOW_EDIT:
      return {
        ...state,
        isVisible: false
      };
    case ActionTypes.SHOW_MAIN:
      return {
        ...state,
        isVisible: true
      };
// (...) bestaande code
```


store/task-management.js
```javascript
// (...) bestaande code
switch (action.type) {
	case ActionTypes.SHOW_EDIT:
		return {
			...state,
			showEdit: true
		};
	case ActionTypes.SHOW_MAIN:
    return {
      ...state,
      taskUnderEdit: initialState.taskUnderEdit,
      showEdit: false
    };
	case ActionTypes.RECEIVE_TASK_UNDER_EDIT:
		return {
			...state,
			taskUnderEdit: {
				id: action.payload.id,
				// eigen zou een validator in de action _isValid_ nog moeten bepalen,
				// of validatie zou hier in de reducer moeten plaatsvinden.
				contactEmail: {value: action.payload.contactEmail, isValid: true},
				taskName: {value: action.payload.taskName, isValid: true}
			}
		};
// (...) bestaande code
```
Als je nu de url ```/[bestaand-task-id]/edit``` bezoekt wordt het formulier correct gevuld en getoond.

De url zorgt er voor dat SHOW_EDIT wordt aangeroepen door de ```onShowEdit()``` action, alsmede het xhr request en RECEIVE_TASK_UNDER_EDIT.

Maar als je opslaat met Ok, dan gebeurt er dit:
1. Er wordt nog steeds een nieuwe taak aangemaakt
2. Je navigeert niet terug naar "/"

Dat moet nog aangepast worden in ```saveTaskUnderEdit```.

actions.js
```javascript
// (...) bestaande code
const saveTaskUnderEdit = (navigateTo) => (dispatch, getState) => { // dit is nieuw
  const taskUnderEdit = getState().taskManagement.taskUnderEdit;
  if (taskUnderEdit.contactEmail.isValid && taskUnderEdit.taskName.isValid) {
    dispatch({type: ActionTypes.SAVING_TASK_UNDER_EDIT});
    xhr({
      url: taskUnderEdit.id === null ? "/tasks" : `/tasks/${taskUnderEdit.id}`, // dit is nieuw
      method: taskUnderEdit.id === null ? "POST" : "PUT", // dit is nieuw
      headers: { "Accept": "application/json", "Content-type": "application/json" },
      data: JSON.stringify({
        contactEmail: taskUnderEdit.contactEmail.value,
        taskName: taskUnderEdit.taskName.value
      })
    }, (error, response, body) => {
      dispatch({type: ActionTypes.TASK_UNDER_EDIT_SAVED });
      navigateTo("/"); // dit is nieuw
      if (error != null) {
        dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: "Fout bij het opslaan" });
      } else if (response.statusCode < 200 || response.statusCode >= 400) {
        dispatch({type: ActionTypes.ON_ERROR_MESSAGE, payload: `${response.statusCode} - ${JSON.parse(body).message}` });
      }
    });
  }
};
// (...) bestaande code
// de action creator:
export default function(dispatch, navigateTo) {
  return {
    onTaskUnderEditChange: (newValues) => dispatch(updateTaskUnderEdit(newValues)),
    onSaveTaskUnderEdit: () => dispatch(saveTaskUnderEdit(navigateTo)), // dit is nieuw
    onFetchTasks: () => dispatch(fetchTasks()),
    onRemoveMessage: (messageIndex) => dispatch({type: ActionTypes.ON_REMOVE_MESSAGE, messageIndex: messageIndex}),
    onPressPlay: (taskId) => dispatch(pressPlay(taskId)),
    onShowEdit: (taskId) => dispatch(fetchTaskUnderEdit(taskId, navigateTo))
  };
}
```

Als je nu opslaat wordt er niet een ```POST``` gedaan naar ```/tasks```, maar een ```PUT``` naar ```/tasks/:taskId```, waar ```je-backend``` de update uitvoert.

Wat er nu nog ontbreekt is een 'hyperlink' naar het edit formulier. Dit bootsen we na met gebruikmaking van de ```navigateTo``` functie die we doorgeven via de props van het TaskOverview component.

index.js
```javascript
// (...) bestaande code
window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <Header versie="0.0.3">Takenbeheer</Header>
        <Messages onRemoveMessage={onRemoveMessage} />
        <NewTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <EditTask onSaveTaskUnderEdit={onSaveTaskUnderEdit}
                onTaskUnderEditChange={onTaskUnderEditChange} />
        <TaskOverview navigateTo={navigateTo} onPressPlay={onPressPlay} />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
```

components/task-overview/TaskOverview.js
```javascript
// (...) bestaande code


    const { pending, tasks, onPressPlay, navigateTo } = this.props;

    const tableBody = pending
      ? (<tr><td colSpan="5">Bezig met laden...</td></tr>)
      : tasks
          .sort((a, b) => b.timeStamp - a.timeStamp)
          .map(task => <Task key={task.id} {...task} navigateTo={navigateTo} nPressPlay={() => onPressPlay(task.id)} />);

// (...) bestaande code
```

components/task-overview/Task.js
```javascript
// (...) bestaande code
const Task = ({ id, taskName, contactEmail, timeStamp, status, onPressPlay, navigateTo }) => (
  <tr>
    <td><button disabled={status !== 'wachtrij'} className="btn btn-sm" onClick={onPressPlay}>►</button></td>
    <td>
      <a style={{color: "blue", cursor: "pointer"}} onClick={() => navigateTo(`/${id}/edit`)}>{taskName}</a>
    </td>
    <td>{status}</td>
    <td>{contactEmail}</td>
    <td>{dateFmt(new Date(timeStamp))}</td>
  </tr>
);
// (...) bestaande code
```

Nu is het plaatje compleet. Je kunt via een 'virtuele hyperlink' navigeren naar het bewerken van een taak. En, als je de back- en foward-knop van de browser gebruikt worden de juiste Actions getriggert. De URL is de baas van ```redux``` en ```redux``` is de baas van je application state.

## Zelf doen: refactor

We hebben de nodige gaten laten liggen waar wel wat aan zou kunnen doen, zowel functioneel als wat betreft code organisatie:
- De EditTask en NewTask componenten zijn redundant, je zou ook kunnen werken met TaskForm direct
- Een taak die niet de status wachtrij heeft (maar aan het draaien is) kan gewoon nog bewerkt worden, maar dit is niet zo netjes.
- De file ```actions.js``` staat propvol met private functies; zo kunnen we ze niet geïsoleerd testen (zonder eerst de actionCreator aan te roepen). Ze zouden per aard van 'action' in een subdir ```actions``` kunnen.
