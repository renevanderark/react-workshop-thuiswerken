# Deel 1

In deze workshop leer je stap voor stap hoe je single-page apps kunt ontwikkelen met [React](https://reactjs.org/).

Voordat we in de details van react (en ondersteunende libraries) duiken gaan we wat tijd investeren in onze ontwikkelomgeving.

## Frontends in ES6 ontwikkelen met node + npm + babel en webpack

Wat de frontend hipsters gebruiken verandert de hele tijd en ook deze setup is natuurlijk niet perfect. Zoeken naar best practices in npm-land is allesbehalve triviaal. Het doel van dit onderdeel is je te voorzien van een setup die nu werkt en als het klopt, blijft werken. [Lees hier](https://docs.npmjs.com/files/package-locks) hoe.

## Node en npm

Omdat ook nodejs en npm voortdurend in ontwikkeling zijn en je niet als root gebruiker voordurend je versies wilt moeten ophogen werken frontend ontwikkelaars vaak met nvm of docker.

Ik kan [nvm](https://github.com/creationix/nvm) van harte aanbevelen. De installatie-instructie alhier is alles wat je nodig hebt om van start te gaan.

LET OP: gebruik liever geen windows: npm maakt gebruik van ontzettend veel losse files (alle dependencies zijn lokaal) en windows houdt daar niet van.

LET OP: hoewel er veel veranderingen zijn maakt de exacte versie van node/npm nu niet zo heel veel uit: we zijn immers geen backends aan het bouwen

## Aan de slag

### Stap 1, maak een npm project aan.

```sh
mkdir je-project
cd je-project
npm init
```
Druk nu een paar keer op enter. Er is nu een bestandje aangemaakt genaamd [package.json](https://docs.npmjs.com/files/package.json), wat erg belangrijk is omdat dit bijvoorbeeld je dependencies beheert alsmede je test en deploy scriptjes.

Omdat dit wereldje dus zo veranderlijk is voeg ik nog 1 LET OP toe! Deze is ERG belangrijk.

Als iets niet werkt naar verwachting, check de versies van je dependencies in het bestand ```package.json```. Ze zouden wel eens TE nieuw kunnen zijn voor deze cursus! Mocht er iets niet werken, doe dan dit:

1. Vervang de versies in je ```package.json``` met die hieronder
2. Draai ```rm -rf node_modules```
3. Draai ```npm install```

```json
"devDependencies": {
  "babel-core": "6.26.0",
  "babel-loader": "7.1.4",
  "babel-plugin-transform-object-rest-spread": "6.26.0",
  "babel-preset-env": "1.6.1",
  "babel-preset-react": "6.24.1",
  "webpack": "4.1.1",
  "webpack-cli": "2.0.12"
}
```

### Stap 2, installeer webpack.

Webpack neemt de verantwoordelijkheid op zich om je op node-concepten gebaseerde javascript code te compileren naar een index.js die de browser snapt. Hierdoor wordt onder andere modulair werken met correcte scoping vereenvoudigd, geautomiseerd testen vereenvoudigd, etc.

```sh
npm install webpack webpack-cli --save-dev
```

Dit zijn de eerste 2 npm modules die je gaat gebruiken. De vlag ```--save-dev``` zorgt ervoor dat de modules worden toegevoegd aan je zogenaamde ```devDependencies``` in je ```package.json```.

De modules zelf staan in de gereserveerde subdirectory ```node_modules``` geïnstalleerd. Als je werkt met git, voeg die dir maar vast toe aan je ```.gitignore```, want die gaat nog stevig groeien.

De ```webpack-cli``` module biedt een binary die je direct kunt draaien, maar handiger is het om die toe te voegen aan de ```scripts``` entry van je ```package.json```.

Voor de vorm: dit is de directe aanroep:
```sh
./node_modules/.bin/webpack-cli
```

### Stap 3, start webpack

Webpack kan werken met een aantal defaults, of via zgn. 'configuration by code' in een aparte file ```webpack.config.js```.

Pas eerst de ```scripts``` entry van je ```package.json``` aan als volgt:

```json
"scripts": {
  "start": "NODE_ENV=development webpack --colors --watch",
  "build": "NODE_ENV=production webpack --colors"
},
```

Lees ```start``` als 'compileer voor ontwikkeling' en ```build``` als 'compileer voor production'.

Draai eerst maar eens ```npm start``` om te zien wat er gebeurt:

```sh
npm start
```

Blijkbaar is er een error. Webpack kan je sources niet vinden!

```sh
mkdir src
echo "console.log('hello world')" > src/index.js
npm start
```
Webpack kijkt by default naar de file ```src/index.js``` als entrypoint. Druk ```ctrl-c``` om het proces te onderbreken.

```sh
$ ls
dist  node_modules  package.json  src
$ ls dist
main.js
```

En bouwt je broncode naar ```dist/main.js```. Als je in dit bestandje kijkt zie je al wat minified boilerplate. Wij negeren deze boilerplate voor deze cursus.


### Stap 4, single page app!

Als je nu wilt kijken of en hoe je eerste single page app werkt moet je hem wel in een browser hangen.

Maak bijvoorbeeld in de root van je project een ```index.html``` aan als volgt:

```html
<html>
<head><meta charset="utf-8"></head>
<body>
<script src="dist/main.js"></script>
</body>
</html>
```

En open hem in je browser (als je de console open hebt zou er nu - of na een refresh - wel 'hello world' moeten staan).

Start webpack weer op met ```npm start``` en verander daarna iets in de file ```src/index.js```:
Als je je webpagina nu ververst is de nieuwe code meteen actief. Dat doet het vlaggetje ```--watch``` van webpack.

### Stap 5, ES6 erbij

Om effectief React apps te bouwen (en om heel wat andere redenen) wordt EcmaScript 6 aangeraden. Dit houdt de code compacter en leesbaarder. Alleen snappen de browsers dat taaltje nog niet helemaal. Enter ```babel```.

Deze prachtige npm module compileert ES6 en nieuwer naar cross-browser vanilla javascript. Het is wel erg veranderlijk dus ik raad je aan om de versies te installeren die in deze cursus zijn gebruikt als er iets niet werkt.

Bovendien is dit niet een ES6 + Babel cursus, dus alle details over wat het doet en hoe je het allemaal in kan richten laat ik in het midden (over een maand is het toch weer anders).

Installeer de preferred 'babel stack' van vandaag (2018-14-03) als volgt:
```sh
npm i babel-core babel-loader babel-preset-env babel-preset-react babel-plugin-transform-object-rest-spread --save-dev
```

Toelichting:

- ```babel-core``` de 'transpiler' van nieuwe ES syntaxes naar cross-browser javascript.
- ```babel-loader``` webpack loader voor babel
- ```babel-preset-env``` package om presets mee af te handelen (die hieronder is heel handig voor de vervolglessen)
- ```babel-preset-react``` ondersteuning voor ```jsx```-syntax (later meer hierover)
- ```babel-plugin-transform-object-rest-spread``` : syntactic-sugar voor mergen/clonen van objecten ```{...bronObject, "doel": 1, "doelA": "2"}```

Maak nu in de root van je project het bestandje ```.babelrc``` aan met de volgende inhoud:
```json
{
	"presets": ["env", "react"],
	"plugins": ["transform-object-rest-spread"]
}
```

En maak een bestand ```webpack.config.js``` aan met deze inhoud:
```javascript
const path = require("path");

module.exports = {
  entry: ["./src/index.js"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js"
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
```

Zo vertel je dus aan ```webpack``` om de ```babel-loader``` te gebruiken.
De ```babel-loader``` haalt zijn presets en plugins  dus uit ```.babelrc```.

Verander nu ```src/index.js``` met de volgende inhoud
```javascript
const bronObject = {"bron": 1};
console.log(`Hello world ${JSON.stringify({...bronObject, "doel": 1, "doelA": "2"})}`);
```
En draai ```npm start``` of ```npm run build```. Herlaad de browser en observeer (als alles goed is gegaan), de volgende log message:
```
Hello world {"bron":1,"doel":1,"doelA":"2"}
```
