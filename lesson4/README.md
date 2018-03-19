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
"TO": "DO"
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
ActionTypes.js:
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
// imports en oude code

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

## Websockets
