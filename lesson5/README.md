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

## Implementeren van de navigatie

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
