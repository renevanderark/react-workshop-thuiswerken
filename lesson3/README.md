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
- We moeten een <Provider> om onze app heen hangen, die ervoor zorgt dat de state uit de store wordt doorgesluisd naar de component tree
- We _mogen_ connectors bouwen die als trechter fungeren om top-level componenten heen (zodat niet alles de hele tijd gererendered hoeft te worden)

Volgens mij is dat alles, we gaan aan de slag.

## Je Reducers (Store) - data driven design

## Je Actions - de data manipulaties

## Je Views - de statische presentatie van de single source of truth (per data update)

## En nu asynchroon - (redux-thunk)
