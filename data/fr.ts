/**
 * The library in French. What the literature names stays in English everywhere (a practice's name, a
 * cell's name, the titles of sources); its definitions, the themes, what a cell's examples say and the
 * hints are written here. Each record is complete by its type: a practice without its French
 * definition does not compile.
 */
import type { Cell } from "./grid.ts";
import type { PracticeId } from "./practices.ts";
import type { Theme } from "./themes.ts";

export const DEFINITIONS_FR = {
  "acceptance-test":
    "Un test qui vérifie un critère d'acceptation, écrit avant le code à partir de ce que l'utilisateur doit voir ; le code doit ensuite le faire passer.",
  "approval-testing":
    "Une personne valide une sortie une fois pour toutes, et chaque exécution suivante doit la reproduire tant qu'aucune autre n'a été validée.",
  "architectural-fitness-function":
    "Une vérification automatique qui juge objectivement une caractéristique de l'architecture et s'exécute comme un test.",
  "characterization-test":
    "Un test fige ce que fait le code aujourd'hui, à tort ou à raison, pour qu'aucun changement ne passe inaperçu.",
  "code-generator":
    "Une commande crée les fichiers d'une nouvelle partie du code à partir d'un modèle, pour qu'ils aient d'emblée la forme que le projet attend.",
  "code-mode":
    "L'agent écrit un programme qui appelle ses outils et l'exécute d'un coup, au lieu d'appeler chaque outil lui-même et d'en lire chaque résultat.",
  codemod:
    "Un programme réécrit le code de façon mécanique, en appliquant la même modification partout où un motif apparaît, au lieu de laisser une personne ou un agent faire chaque retouche.",
  "contract-test":
    "Une même suite de tests tourne sur un faux et sur l'implémentation réelle, ce qui garantit que le faux utilisé par les autres tests se comporte comme le vrai.",
  "decision-table-testing":
    "Chaque combinaison d'un ensemble fini de conditions est listée avec le résultat attendu, et chaque ligne du tableau devient un test.",
  "domain-driven-design":
    "Le code épouse un modèle du métier, exprimé dans le vocabulaire de ses experts et isolé des questions techniques qui l'entourent.",
  "equivalence-partitioning-and-boundary-values":
    "Les entrées sont réparties en classes que le code doit traiter de la même manière, et chaque classe est testée une fois en son milieu et une fois à chacune de ses bornes.",
  fuzzing:
    "On bombarde un programme d'entrées aléatoires ou malformées pour débusquer celles qui le font planter ou se figer.",
  "golden-master":
    "On conserve la sortie d'une exécution de référence et on y compare chaque exécution suivante, pour repérer le moindre changement de comportement.",
  "hexagonal-architecture":
    "L'application ne communique avec l'extérieur que par des ports, chacun branché sur un adaptateur, de sorte que son cœur ne dépend de rien d'extérieur.",
  "language-server":
    "Un serveur par langage renseigne l'éditeur ou l'agent sur le code (définitions, références, erreurs) au moyen d'un protocole commun.",
  "make-illegal-states-unrepresentable":
    "On conçoit les types de sorte qu'un état interdit ne puisse tout simplement pas s'écrire : le compilateur le refuse.",
  "metamorphic-testing":
    "Faute de connaître la bonne sortie, on vérifie que deux exécutions aux entrées liées produisent des sorties liées de la même façon.",
  "mutation-testing":
    "On introduit de petites erreurs dans le code : si la suite de tests passe malgré l'une d'elles, c'est qu'il lui manque un test.",
  mvvm: "La vue se lie à un view model qui porte son état et ses commandes, si bien que la logique de l'interface se teste sans l'interface.",
  "parse-dont-validate":
    "On vérifie l'entrée une seule fois, à la frontière, en la convertissant dans un type qui garde la trace de cette vérification : le reste du programme ne voit jamais de valeur invalide.",
  "property-based-testing":
    "On confronte des entrées générées à une propriété qui doit toujours tenir, et toute entrée qui la met en défaut est réduite au plus petit contre-exemple.",
  ratchet:
    "On accepte et on consigne les violations déjà présentes dans le code, et la vérification échoue à la moindre nouvelle : leur nombre ne peut que baisser.",
  "separation-of-duties":
    "Celui qui fait le travail n'est pas celui qui le vérifie, car une mesure que l'on contrôle soi-même cesse de mesurer quoi que ce soit.",
  "smoke-test":
    "Un passage rapide sur les parcours principaux du système, de bout en bout, pour s'assurer qu'il fonctionne avant de tester plus en profondeur.",
  "snapshot-testing":
    "Le framework de test enregistre une sortie à la première exécution, puis échoue dès qu'une exécution suivante en produit une différente.",
  "stateful-testing":
    "On rejoue des séquences de commandes générées à la fois sur le système et sur un modèle simplifié de celui-ci, et les deux doivent concorder à chaque étape.",
  "test-sizes":
    "On classe un test comme petit, moyen ou grand selon ce qu'il sollicite (un processus, une machine ou davantage), ce qui renseigne mieux sur sa vitesse et sa fiabilité que « unitaire » ou « d'intégration ».",
  "unit-testing":
    "Un test porte sur une petite partie du code, une fonction ou une classe, assez rapide pour tourner à chaque modification, avec des collaborateurs réels ou remplacés.",
} as const satisfies Record<PracticeId, string>;

export const THEMES_FR = {
  architecture: "Architecture",
  "types-and-contracts": "Types et contrats",
  "tests-and-verification": "Tests et vérification",
  "refactoring-and-migration": "Refactoring et migration",
  "plans-and-agents": "Plans et agents",
  tooling: "Outillage",
} as const satisfies Record<Theme, string>;

export const HINTS_FR = {
  GI: "ce que l'agent lit avant d'agir",
  GC: "un programme qui oriente l'agent, ou agit à sa place, avant qu'il n'écrive",
  SI: "un modèle ou une personne qui juge le travail fait",
  SC: "un programme qui tranche : le travail tient ou non",
} as const satisfies Record<Cell, string>;

/** Each cell's examples, in the order of `CELLS[cell].examples`, which the tests hold. */
export const EXAMPLES_FR = {
  GI: [
    "Principes",
    "Exigences transverses",
    "Règles",
    "Documentation de référence",
    "Fiches pratiques",
    "Conventions de code dans AGENTS.md ou un skill",
    "Une spec et un plan validés par une personne avant que le travail ne commence",
    "L'architecture décrite avec les mots de la littérature (DDD, hexagonale, MVVM) dans les prompts et les skills",
  ],
  GC: [
    "Language servers",
    "CLIs et scripts",
    "Codemods, par exemple un outil qui exploite les recettes OpenRewrite",
    "Un générateur, qui produit du code juste par construction",
    "Une commande qui agit à la place de l'agent",
    "Le code mode : l'agent écrit un programme plutôt que d'enchaîner les appels d'outils",
    "Un brief calculé à partir du code, qui liste les garanties que le prochain changement doit préserver",
  ],
  SI: [
    "Agents de revue",
    "Consignes de revue, dans un skill",
    "Une revue du changement au regard du plan qu'il devait suivre",
  ],
  SC: [
    "Tests, linters, type checkers, analyse structurelle",
    "Logs",
    "Navigateur",
    "Tests structurels, par exemple un hook qui lance des tests ArchUnit sur les frontières entre modules",
    "Fitness functions",
    "Détection du code mort",
    "Un gate qui renvoie à l'agent toute vérification en échec, dans la limite d'un nombre de tentatives",
    "Une table de transitions dont le type checker garantit l'exhaustivité",
    "Des tests d'acceptation écrits avant le code, figés jusqu'à ce qu'une étape ultérieure les fasse passer",
    "Les fichiers modifiés par une étape, rapprochés de ceux qu'elle prévoyait de modifier",
    "Un snapshot du comportement du code, pris avant un refactoring",
    "Un ratchet : la dette acceptée ne peut que diminuer",
  ],
} as const satisfies Record<Cell, readonly string[]>;
