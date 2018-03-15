# Workshop: single-page apps bouwen met React

## Welkom!

Welkom bij de cursus. Hij is opgezet om zelfstandig te doen, maar voor vragen kun je altijd bij me langslopen. Misschien maken we er zelfs wel een workshop van.

## Wat je gaat leren

Dit is een stap voor stap cursus waarbij je aan het eind dit kunt:
- Je ontwikkelomgeving opzetten
- React componenten bouwen
- De React kernconcepten kennen (state / props / virtual-DOM / life cycle)
- Unidirectional flow of data integreren in je app (gebruikmakend van redux en redux-thunk)
- Ajax (xhr) integreren in je app
- Routing met de history package (wrapper voor browser history API)
- Mogelijk een beetje CSS styling tussendoor

Er gaan een heleboel details voorbij komen waar ik NIET dieper op inga. Dit heeft een paar heel belangrijke redenen:
- Ik weet ook niet alles
- Alles wat ik niet noem is online na te lezen in tutorials en documentaties
- Je wilt snel resultaat zien van je werk
- Ik wil je _een_ werkwijze opdringen; _best practices_ zijn er niet, want ze veranderen de hele tijd. Op deze manier hebben wij in ieder geval samen dezelfde werkwijze.
- Deze cursus verstopt maanden aan uitzoekwerk en voortschrijdend inzicht van mijzelf en mijn oude frontend team bij Huygens en biedt een workflow waarmee je supersnel dashboards kunt bouwen voor RESTful services.

## Curriculum

### [Les 1](https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/tree/master/lesson1): inrichten ontwikkelomgeving

Hierna vraag je je af waar al deze boilerplate in vredesnaam voor nodig is. We zijn toch potjand*** geen java-achtige depency hell aan het introduceren?
Het antwoord is nee: een package.json is geen pom.xml. En ja: het is een depency hell, maar gelukkig kun je package-locks zetten. Ik moedig je aan dit zelf allemaal na te lezen


### [Les 2](https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/tree/master/lesson2): mijn eerste React component

Dit is als het klopt wel cool, maar nog niet genoeg om een framework te noemen. Verrassing: React is _geen_ framework, maar een library met:
- een 'virtual-DOM'
- een fancy XML-syntax genaamd JSX
- een component life cycle op basis van veranderingen in state en props


### [Les 3](https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/tree/master/lesson3): stores, reducers, dispatchers, actions, thunks, REDUX

Dit is de langste en moeilijkste aflevering, maar al die hipsters doen het ook! Hoewel het de vraag is of zij allemaal nog wel snappen wat er precies onder de motorkap gebeurt. Jij _natuurlijk_ wel, want je hebt alle documentaties waar ik naar verwijs helemaal uit!

Maar als het klopt heb je die 'Unidirectional _flow_ of data' nu wel een beetje onder de knie. Wederom, het _lijkt_ veel boilerplate, maar door trouw dit paradigma toe te blijven passen zul je merken dat je framework (nu heb je wél een framework te pakken) ervoor zorgt dat je razendsnel je app kan wijzigen én uitbreiden met nieuwe features.


### [Les 4](https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/tree/master/lesson4): Ajax / xhr / REST

En eindelijk is het _framework_ compleet, nu je kunt praten met een backend en de state van je App _altijd_ correct de waarheid op de server laten representeren -- toch?


### [Les 5](https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/tree/master/lesson5): Redux first Routing

Ja. Google maar rond. Er is géén mooie out-of-the-box plugin hiervoor. Daarom doen we dit nog maar even zelf. Als je jezelf koppijn wilt opleveren probeer gerust ```react-router```, maar het routen _hoeft_ echt niet ingewikkeld te zijn -> als je maar zorgt dat redux de baas is over de state van je applicatie.

### [Les 6](https://rel-git-p100.wpakb.kb.nl/RAR020/react-workshop/tree/master/lesson6): Oh ja, testen

Ik houd het hier kort, maar testen kan een stevig onderdeel zijn van je ontwikkelwerk, afhankelijk van de use case.
