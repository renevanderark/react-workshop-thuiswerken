# Deel 3

## Welkom terug!

Nu gaan we het hebben over 'Unidirectional flow of data', 'Flux architecture', maar we gaan het vooral ook _doen_. Of liever, we gaan het zo veel mogelijk door ```redux``` (weer een npm module) laten doen.

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
  "webpack-cli": "2.0.12"
}
```

## Wat is dat redux en wat gaan we ermee doen?
We gaan werken met dit plaatje, uit het [artikel](https://medium.com/@cabot_solutions/flux-the-react-js-application-architecture-a-comprehensive-study-fd2585d06483) van Les 2:

![flux architecture](https://cdn-images-1.medium.com/max/800/0*N-lKmfPpHkOW4Ppi.png "flux architecture")

Belangrijk zijn die dikke grijze pijlen. Die wijzen maar één richting uit, het klokje rond. Wat hebben we tot nu toe getackeld uit dit plaatje?

1. Action (0%)
2. Dispatcher (0%)
3. Store (0%)
4. View (50%)

Wat hebben we dan al gedaan?
- De views luisteren al naar change events, dat doet een React component namelijk by design.
- Maar we hebben nog geen 'store' om data uit te halen
- En we voeden wél de kindernodes (via props)
- Maar nog niet met data uit een store.

[Redux](https://redux.js.org/) is een implementatie van een belangrijk deel van de aanbevolen flux architecture. Redux gaat dit allemaal voor ons doen:

1. Action (0%) -> dit doen we helemaal zelf, maar wel conform het aanbevolen _pattern_ van redux
2. Dispatcher (100%) -> dit is de functie genaamd ```dispatch``` die we kado krijgen
3. Store (66%) -> Het 'receiven' van 'actions' van de dispatcher en 'change events' emitten, de rest doen we zelf
4. View (0%)

Een extra integratie-module voor redux met React heet [react-redux](https://github.com/reactjs/react-redux) en die gaat dit voor ons doen:

1. Action (0%)
2. Dispatcher (0%)
3. Store (0%)
4. View (50%) -> Ontvangen van data uit de centrale store en voeden aan de Component boom (trigger voor vrijwel alle rerenders)

Aan het eind van deze les introduceer ik nog de laatste npm module: [redux-thunk](https://github.com/gaearon/redux-thunk). In de README van deze module staan de zinnen: "Why Do I Need This? If you’re not sure whether you need it, you probably don’t." Die vraag beantwoord ik beneden.

Dus. Om er maar vanaf te zijn, installeer deze modules maar vast:
```sh
npm i redux redux-thunk react-redux --save-dev
```

## Wat krijgen we nou allemaal kado?

Samenvattend. Doordat je deze npm modules hebt geïnstalleerd _krijg_ je nu dit - als je er gebruik van gaat maken in de code natuurlijk.

1. Action (0%)
2. Dispatcher (100%)
3. Store (66%)
4. View (100%)

En _kun_ je nu dit op een tamelijk uitgekristalliseerde/nette manier conform een bepaald _pattern_:

1. Action (100%)
2. Dispatcher (100%)
3. Store (100%)
4. View (100%)

## Dat is een hoop introductie. We zouden toch dingen gaan doen?

Mijn hoop is dat de procentjes hierboven je gaan helpen feeling te krijgen met wat voor soort code we allemaal nog moeten gaan schrijven. Ik ga dat nu voor je uitsplitsen per subonderdeel

### Actions

- we moeten alle acties die onze app wil uitvoeren zelf bouwen, gebruik makend van de ```dispatch``` (en ```getState```) functie(s) van redux
- we moeten alle acties aanbieden als props aan de App via een functie die we een 'action creator' noemen
- we moeten ActionTypes definiëren

### Dispatcher

- We moeten de functie ```dispatch``` aan onze actions geven via de 'action creator'

### Store

- We moeten zogenaamde 'reducers' bouwen die elk hun eigen (immutable) datablokje beheren...
- ...door per ActionType berichten van de dispatcher te ontvangen...
- en op een zinvolle wijze op te slaan in dat datablokje (de app state, je single source of truth!)

### View

- We moeten zorgen dat gebruikershandelingen zo veel mogelijk via de actions uit de action creator verlopen
- ...via de props
- We moeten een Provider om onze app heen hangen, die ervoor zorgt dat de state uit de store wordt doorgesluisd naar de component tree
- We _mogen_ connectors bouwen die als trechter fungeren om top-level componenten heen (zodat niet alles de hele tijd gererendered hoeft te worden)

Volgens mij is dat alles, we gaan aan de slag.

## Je Reducers (Store) - data driven design

Grofweg kun je de reducers in de store de top-level componenten die je hebt laten representeren.

We hebben twee top-level componenten die we dynamisch van data gaan voorzien:
- task-management/NewTask
- task-overview/TaskOverview

Het datamodel dat ze moeten kennen we ook al een beetje. Vaak dicteren de props van componenten in je ontwerp ook je properties in je store objecten.

Maak nu de files ```src/store/task-management.js``` en ```src/store/task-overview.js``` aan. Dit worden je reducers.

Maak ook alvast de file ```src/action-types.js``` aan. Dit wordt een eenvoudig object om alle actions te voorzien van een type voor de dispatcher.

task-management.js
```javascript
import ActionTypes from "../action-types";

const initialState = {
  taskUnderEdit: {
    taskName: "",
    contactEmail: "",
    isValid: false,
    id: null
  }
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    default:
      return state;
  }
}
```
Zoals je ziet bevat initialState al herkenbare dingen. We gaan nu redux de baas maken van de _state_ van de taak die onder bewerking is in het TaskForm component. We bereiden ons alvast voor op het moment dat dit formulier kan worden hergebruikt door een EditTask component door een ```id```-property toe te kennen aan ```taskUnderEdit```.

De functie die wordt teruggegeven heeft het signatuur van alle ```redux``` reducers:
- de _state_ parameter bevat de state vóórdat de action _payload_ is verwerkt door de reducer
- de _action_ parameter bevat _altijd_ een ```type``` property (beschreven in ActionTypes) en soms ook een _payload_  property (waarvan jij zelf de naam kiest)
- de state die wordt teruggegeven is de state zoals jij wilt dat die is op basis van de ActionType en de _payload_ van de action. Soms wil je ook niets veranderen, de ```default```-case in de switch.

task-overview.js
```javascript
import ActionTypes from "../action-types";

const initialState = {
  tasks: []
};

export default function(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
    default:
      return state;
  }
}
```

Dit datamodel wordt een lijst. We beginnen maar gewoon met een lege array.

action-types.js
```javascript
export default {
  /* TODO */
}
```

Deze gaan we vullen wanneer we Actions gaan maken.

Nu we de datamodellen hebben klaargezet gaan we aan ```redux``` vertellen waar ze staan. Als het klopt weet redux daarmee genoeg over je reducers.
Bovendien gaan we nu de Provider uit ```react-redux``` inzetten om de inhoud van de store door te sluizen naar de Views via hun _props_.

Voor nu doen we dat allemaal in de ```src/index.js```

index.js
```javascript
import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers } from 'redux';
import { Provider } from "react-redux";

import taskManagementReducer from "./store/task-management";
import taskOverviewReducer from "./store/task-overview";

import App from "./components/App";
import Header from "./components/layout/Header";
import NewTask from "./components/task-management/NewTask";
import TaskOverview from "./components/task-overview/TaskOverview";

const store = createStore(combineReducers({
  taskManagement: taskManagementReducer,
  taskOverview: taskOverviewReducer
}));

window.addEventListener("DOMContentLoaded", () =>
  ReactDOM.render((
    <Provider store={store}>
      <App>
        <Header versie="0.0.2">Takenbeheer</Header>
        <NewTask />
        <TaskOverview />
      </App>
    </Provider>
  ),  document.getElementById("app"))
);
```
De ```store``` wordt gebakken door de ```redux```-functies ```createStore``` en ```combineReducers```. hierboven staat al wat de store doet.

De ```Provider``` van ```react-redux``` snapt deze store en kan hier met een _connector_ props van maken voor React componenten. Dat staat uitgelegd onder het volgende kopje.

Als je nu de app opent in de browser is er niets veranderd! :)

Niets zichtbaars in ieder geval. Daar komt snel verandering in.

TIP: als je stiekem toch met de [React devtools](https://fb.me/react-devtools) hebt gewerkt, zie je in die console wel degelijk verschillen.

## Je Views - de statische presentatie van de single source of truth (per data update)

We moeten de Provider nog vertellen welk component welke props moet ontvangen van de store. Hiertoe shipt ```react-redux``` de functie ```connect```. Dit gaan we nu doen in NewTask en TaskOverview.

NewTask.js
```javascript
import React from "react";
import {connect} from "react-redux";
import TaskForm from "./TaskForm";

const NewTask = (props) => (
  <div className="card">
    <div className="card-header">Nieuwe taak aanmaken</div>
    <div className="card-body">
      <pre>{JSON.stringify(props, null, 2)}</pre>
      <TaskForm />
    </div>
  </div>
);

export default connect((state) => state.taskManagement)(NewTask);
```
Hier is de functie ```connect``` dus nieuw. De change staat in de laatste regel. Het ziet er nu wel heel compact uit, maar voor één keer herschrijf ik het wel naar ES5 zodat je snapt wat er gebeurt:
```javascript
connect(function(state) {
  return state.taskManagement;
})(NewTask);
```
De functie ```connect``` is een higher order function. Hij geeft een functie terug, die we direct aanroepen op ons component ```NewTask```. Zowel de Provider als de connect-functie doen wat onzichtbare magie, maar gelukkig kun je gewoon op github gluren naar wat er precies gebeurt. Voor deze cursus zijn we alleen nieuwsgierig naar het _effect_. Daarom heb ik een ```<pre>```-blokje toegevoegd die de props laat zien. Haal je de connector weg, dan is props weer een leeg object.

TaskOverview.js
```javascript

```


## Je Actions - de data manipulaties


## En nu asynchroon - (redux-thunk)
