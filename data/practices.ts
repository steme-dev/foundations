import type { Cell } from "./grid.ts";
import type { PersonId } from "./people.ts";
import type { SourceId } from "./sources.ts";
import type { Theme } from "./themes.ts";

/** A practice of software engineering, named in the literature's words and backed by its sources. */
export type Practice = {
  readonly name: string;
  /** One sentence, in plain words. */
  readonly definition: string;
  readonly cells: readonly Cell[];
  readonly themes: readonly Theme[];
  readonly sources: readonly SourceId[];
  /** Who named it: each one is among the authors of one of its sources. */
  readonly credited: readonly PersonId[];
};

export const PRACTICES = {
  "acceptance-test": {
    name: "Acceptance test",
    definition:
      "A test of a specified acceptance criterion, written before the code from what the user should see, which the code must then pass.",
    cells: ["SC"],
    themes: ["tests-and-verification", "plans-and-agents"],
    sources: ["freeman-pryce-2009-goos", "agile-alliance-atdd", "agile-alliance-acceptance"],
    credited: [],
  },
  "acid-transactions": {
    name: "ACID transactions",
    definition:
      "A transaction is atomic, consistent, isolated and durable: it happens whole or not at all, and once committed it stays.",
    cells: ["GI"],
    themes: ["data"],
    sources: ["haerder-reuter-1983-transaction-recovery"],
    credited: ["theo-haerder", "andreas-reuter"],
  },
  "approval-testing": {
    name: "Approval testing",
    definition:
      "A person approves an output once, and every later run must reproduce it until a new one is approved.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["approvaltests"],
    credited: ["approvaltests"],
  },
  arc42: {
    name: "arc42",
    definition:
      "A template that gives an architecture's documentation fixed sections, from its goals and constraints to its building blocks, decisions and risks.",
    cells: ["GI"],
    themes: ["architecture", "modelling"],
    sources: ["hruschka-starke-arc42"],
    credited: ["peter-hruschka", "gernot-starke"],
  },
  "architectural-fitness-function": {
    name: "Architectural fitness function",
    definition:
      "An automated check that gives an objective verdict on one characteristic of the architecture, run like a test.",
    cells: ["SC"],
    themes: ["architecture", "tests-and-verification"],
    sources: [
      "ford-parsons-kua-2017-evolutionary-architectures",
      "thoughtworks-2017-fitness-function",
    ],
    credited: ["neal-ford", "rebecca-parsons", "patrick-kua"],
  },
  "architecture-views": {
    name: "Architecture views (Views and Beyond)",
    definition:
      "An architecture is documented as the views that matter to its readers, the relations between them, and what applies across views.",
    cells: ["GI"],
    themes: ["architecture", "modelling"],
    sources: ["bachmann-2001-documenting-architectures", "clements-2010-views-and-beyond"],
    credited: ["paul-clements"],
  },
  bpmn: {
    name: "Business Process Model and Notation (BPMN)",
    definition:
      "A standard notation for business processes that business analysts, developers and the people who run the processes can all read.",
    cells: ["GI"],
    themes: ["modelling"],
    sources: ["omg-2014-bpmn"],
    credited: ["object-management-group"],
  },
  "c4-model": {
    name: "C4 model",
    definition:
      "Software architecture drawn at four levels of zoom: the system in its context, its containers, their components, and the code.",
    cells: ["GI"],
    themes: ["modelling", "architecture"],
    sources: ["brown-c4-model"],
    credited: ["simon-brown"],
  },
  "characterization-test": {
    name: "Characterization test",
    definition:
      "A test records what the code does today, right or not, so that a change to it cannot go unseen.",
    cells: ["SC"],
    themes: ["tests-and-verification", "refactoring-and-migration"],
    sources: ["feathers-2004-legacy-code", "feathers-2016-characterization"],
    credited: ["michael-feathers"],
  },
  "code-generator": {
    name: "Code generator (scaffolding)",
    definition:
      "A command lays down the files of a new part of the code from a template, so they start in the shape the project expects.",
    cells: ["GC"],
    themes: ["tooling"],
    sources: ["rails-generators", "yeoman"],
    credited: [],
  },
  "code-mode": {
    name: "Code mode",
    definition:
      "The agent writes a program that calls its tools, run in one step, rather than calling each tool itself and reading every result.",
    cells: ["GC"],
    themes: ["plans-and-agents", "tooling"],
    sources: ["varda-pai-2025-code-mode", "jones-kelly-2025-code-execution"],
    credited: ["kenton-varda", "sunil-pai"],
  },
  codemod: {
    name: "Codemod",
    definition:
      "A program rewrites the code base mechanically, the same change at every place a pattern matches, instead of a person or an agent making each edit.",
    cells: ["GC"],
    themes: ["refactoring-and-migration", "tooling"],
    sources: ["rosenstein-codemod", "meta-jscodeshift", "openrewrite-recipes"],
    credited: ["justin-rosenstein"],
  },
  "context-map": {
    name: "Context map",
    definition:
      "Each model in play gets its bounded context and a name, and the points where they touch are drawn with how they translate and who depends on whom.",
    cells: ["GI"],
    themes: ["architecture", "modelling"],
    sources: ["evans-2015-ddd-reference", "evans-2003-ddd"],
    credited: ["eric-evans"],
  },
  "contract-test": {
    name: "Contract test",
    definition:
      "One suite of tests runs against both a fake and the real implementation, so the fake the other tests use is known to behave like the real one.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["rainsberger-2021-abstract-test-cases", "fowler-2011-contract-test"],
    credited: ["j-b-rainsberger"],
  },
  cqrs: {
    name: "Command query responsibility segregation (CQRS)",
    definition: "Information is changed through one model and read through another.",
    cells: ["GI"],
    themes: ["architecture", "data"],
    sources: ["young-2010-cqrs-documents", "fowler-2011-cqrs"],
    credited: ["greg-young"],
  },
  "data-flow-diagram": {
    name: "Data flow diagram",
    definition:
      "A system is drawn as a network of processes connected by flows of data and by stores where the data rest.",
    cells: ["GI"],
    themes: ["modelling"],
    sources: ["demarco-2002-structured-analysis", "yourdon-2006-dataflow-diagrams"],
    credited: ["tom-demarco", "ed-yourdon"],
  },
  "database-normalization": {
    name: "Database normalization",
    definition:
      "Tables are split until every non-key field states a fact about the key, the whole key and nothing but the key, so that each fact is stored once.",
    cells: ["GI"],
    themes: ["data"],
    sources: ["codd-1970-relational-model", "kent-1983-five-normal-forms"],
    credited: ["e-f-codd"],
  },
  "database-refactoring": {
    name: "Database refactoring",
    definition:
      "A small change to a database schema that improves its design while keeping both what it does and what it holds.",
    cells: ["GI"],
    themes: ["data", "refactoring-and-migration"],
    sources: ["ambler-sadalage-2006-refactoring-databases", "ambler-database-refactoring"],
    credited: ["scott-ambler", "pramod-sadalage"],
  },
  "decision-table-testing": {
    name: "Decision table testing",
    definition:
      "Every combination of a finite set of conditions is listed with its expected outcome, and each row becomes a test.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["istqb-decision-table-testing"],
    credited: [],
  },
  denormalization: {
    name: "Denormalization",
    definition:
      "Redundancy is added back to a normalized schema on purpose, so that frequent reads need fewer joins.",
    cells: ["GI"],
    themes: ["data"],
    sources: ["sanders-shin-2001-denormalization", "kent-1983-five-normal-forms"],
    credited: [],
  },
  "dimensional-modeling": {
    name: "Dimensional modeling (star schema)",
    definition:
      "Analytical data are arranged as fact tables of measurements linked to dimension tables that describe them.",
    cells: ["GI"],
    themes: ["data", "modelling"],
    sources: ["kimball-ross-2013-data-warehouse-toolkit", "kimball-group-star-schemas"],
    credited: ["ralph-kimball"],
  },
  "domain-driven-design": {
    name: "Domain-driven design",
    definition:
      "The code is shaped on a model of the business, written in the words its experts use, and kept apart from the technical concerns around it.",
    cells: ["GI"],
    themes: ["architecture"],
    sources: ["evans-2003-ddd", "evans-2015-ddd-reference"],
    credited: ["eric-evans"],
  },
  "domain-storytelling": {
    name: "Domain Storytelling",
    definition:
      "People who know the business tell how they work together, and the story is drawn as it is told, in pictograms and arrows.",
    cells: ["GI"],
    themes: ["modelling"],
    sources: [
      "hofer-schwentner-2021-domain-storytelling",
      "hofer-schwentner-domain-storytelling-site",
    ],
    credited: ["stefan-hofer", "henning-schwentner"],
  },
  "entity-relationship-model": {
    name: "Entity-relationship model",
    definition:
      "Data are modelled as entities, things that can be told apart, and relationships, associations among them, drawn in an entity-relationship diagram.",
    cells: ["GI"],
    themes: ["modelling", "data"],
    sources: ["chen-1976-entity-relationship"],
    credited: ["peter-chen"],
  },
  "equivalence-partitioning-and-boundary-values": {
    name: "Equivalence partitioning and boundary value analysis",
    definition:
      "Inputs are split into classes the code should treat alike, and each class is tested once inside it and at each of its limits.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: [
      "istqb-equivalence-partitioning",
      "istqb-boundary-value-analysis",
      "myers-2011-art-of-software-testing",
    ],
    credited: [],
  },
  "event-sourcing": {
    name: "Event sourcing",
    definition:
      "Every change to the application's state is stored as an event, in order, and the state is rebuilt from them.",
    cells: ["GI"],
    themes: ["data", "architecture"],
    sources: ["fowler-2005-event-sourcing", "young-2010-cqrs-documents"],
    credited: ["martin-fowler"],
  },
  "event-storming": {
    name: "Event Storming",
    definition:
      "A workshop where the people who know the business lay out its events on a wall, in order, to explore a complex domain together.",
    cells: ["GI"],
    themes: ["modelling", "architecture"],
    sources: ["brandolini-2013-event-storming"],
    credited: ["alberto-brandolini"],
  },
  "evolutionary-architecture": {
    name: "Evolutionary architecture",
    definition:
      "An architecture built to change in small increments, with automated checks that say what keeps it fit, across technical and domain changes.",
    cells: ["GC"],
    themes: ["architecture"],
    sources: ["ford-parsons-kua-2017-evolutionary-architectures"],
    credited: ["neal-ford", "rebecca-parsons", "patrick-kua"],
  },
  "evolutionary-database-design": {
    name: "Evolutionary database design",
    definition:
      "The schema changes in small, versioned migrations, written and tested with the code, so that the database evolves as the application does.",
    cells: ["GC"],
    themes: ["data", "refactoring-and-migration"],
    sources: ["sadalage-fowler-2016-evolutionary-database"],
    credited: ["pramod-sadalage", "martin-fowler"],
  },
  "formal-verification": {
    name: "Formal verification",
    definition:
      "A proof, checked by a program, that the code meets a formal specification for every input, not only for the inputs a test tries.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: [
      "floyd-1967-meanings",
      "hoare-1969-axiomatic",
      "leroy-2009-compcert",
      "anthropic-2026-formal-verification",
    ],
    credited: ["robert-w-floyd", "tony-hoare"],
  },
  "four-plus-one-view-model": {
    name: "4+1 view model",
    definition:
      "An architecture is described in four views, logical, process, development and physical, tied together by a few scenarios that form the fifth.",
    cells: ["GI"],
    themes: ["modelling", "architecture"],
    sources: ["kruchten-1995-4plus1"],
    credited: ["philippe-kruchten"],
  },
  fuzzing: {
    name: "Fuzzing",
    definition:
      "A program is fed random or malformed input to find the inputs that make it crash or hang.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["miller-1990-fuzz"],
    credited: ["barton-miller", "lars-fredriksen", "bryan-so"],
  },
  "golden-master": {
    name: "Golden master",
    definition:
      "The output of a reference run is kept, and every later run is compared with it to catch any change in behaviour.",
    cells: ["SC"],
    themes: ["tests-and-verification", "refactoring-and-migration"],
    sources: ["rainsberger-2014-golden-master"],
    credited: [],
  },
  "hexagonal-architecture": {
    name: "Hexagonal architecture (ports and adapters)",
    definition:
      "The application talks to the outside only through ports, each served by an adapter, so its core depends on nothing outside it.",
    cells: ["GI"],
    themes: ["architecture"],
    sources: ["cockburn-2005-hexagonal"],
    credited: ["alistair-cockburn"],
  },
  "integrity-constraints": {
    name: "Integrity constraints",
    definition:
      "The database itself refuses data that break a rule of the schema, such as a foreign key that points to no row.",
    cells: ["SC"],
    themes: ["data", "types-and-contracts"],
    sources: ["codd-1970-relational-model", "codd-1979-rm-t"],
    credited: ["e-f-codd"],
  },
  "isolation-levels": {
    name: "Transaction isolation levels",
    definition:
      "How much concurrent transactions may see of each other's work, chosen per transaction to trade throughput for correctness.",
    cells: ["GI"],
    themes: ["data"],
    sources: ["berenson-1995-isolation-levels"],
    credited: [],
  },
  "language-server": {
    name: "Language server",
    definition:
      "One server per language answers an editor or an agent about the code, its definitions, references and errors, through a common protocol.",
    cells: ["GC"],
    themes: ["tooling"],
    sources: ["microsoft-lsp-overview", "microsoft-lsp-3-17"],
    credited: ["microsoft"],
  },
  "make-illegal-states-unrepresentable": {
    name: "Make illegal states unrepresentable",
    definition:
      "Types are shaped so that a state the program must never reach cannot be written, and the compiler refuses it.",
    cells: ["GI", "SC"],
    themes: ["types-and-contracts"],
    sources: ["minsky-2011-effective-ml"],
    credited: ["yaron-minsky"],
  },
  merise: {
    name: "Merise",
    definition:
      "A French method for designing information systems that models the data and the processing separately, from a conceptual level down to a physical one.",
    cells: ["GI"],
    themes: ["modelling", "data"],
    sources: ["tardieu-1983-merise", "espinasse-merise"],
    credited: ["hubert-tardieu", "arnold-rochfeld", "rene-colletti"],
  },
  "metamorphic-testing": {
    name: "Metamorphic testing",
    definition:
      "When the right output is unknown, two runs whose inputs are related are checked for outputs that relate the same way.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["chen-1998-metamorphic", "chen-2018-metamorphic-review"],
    credited: ["tsong-yueh-chen", "s-c-cheung", "s-m-yiu"],
  },
  "mutation-testing": {
    name: "Mutation testing",
    definition:
      "Small faults are planted in the code, and a test suite that still passes on one of them has a gap to fill.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["jia-harman-2011-mutation"],
    credited: [],
  },
  mvvm: {
    name: "Model-View-ViewModel (MVVM)",
    definition:
      "A view binds to a view model that holds its state and commands, so the interface's logic can be tested without the interface.",
    cells: ["GI"],
    themes: ["architecture"],
    sources: ["gossman-2005-mvvm"],
    credited: ["john-gossman"],
  },
  "optimistic-concurrency-control": {
    name: "Optimistic concurrency control",
    definition:
      "Transactions run without locks and are checked for conflicts when they commit, and one that conflicts is rolled back and retried.",
    cells: ["GI"],
    themes: ["data"],
    sources: ["kung-robinson-1981-optimistic"],
    credited: ["h-t-kung", "john-t-robinson"],
  },
  "parallel-change": {
    name: "Parallel change (expand and contract)",
    definition:
      "A backward-incompatible change is made in three steps, expand, migrate and contract, so that old and new run side by side until nothing uses the old.",
    cells: ["GI"],
    themes: ["refactoring-and-migration", "data"],
    sources: ["sato-2014-parallel-change"],
    credited: ["danilo-sato"],
  },
  "parse-dont-validate": {
    name: "Parse, don't validate",
    definition:
      "Input is checked once, at the boundary, into a type that keeps what was checked, so the rest of the program never meets an invalid value.",
    cells: ["SC"],
    themes: ["types-and-contracts"],
    sources: ["king-2019-parse-dont-validate"],
    credited: ["alexis-king"],
  },
  "property-based-testing": {
    name: "Property-based testing",
    definition:
      "Generated inputs are checked against a property that must always hold, and a failing input is shrunk to the smallest one that still fails.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["claessen-hughes-2000-quickcheck"],
    credited: ["koen-claessen", "john-hughes"],
  },
  ratchet: {
    name: "Ratchet",
    definition:
      "The violations a code base already has are accepted and recorded, and the check fails on any new one, so the count can only go down.",
    cells: ["SC"],
    themes: ["tooling", "refactoring-and-migration"],
    sources: [
      "qntm-2021-ratchet",
      "betterer-introduction",
      "eslint-bulk-suppressions",
      "mosher-2025-ratcheting",
      "westby-temporal-ratcheting",
      "sonarsource-clean-as-you-code",
    ],
    credited: [],
  },
  "separation-of-duties": {
    name: "Separation of duties",
    definition:
      "The one who does the work is not the one who checks it, because a measure the doer controls stops measuring.",
    cells: ["SI", "SC"],
    themes: ["tests-and-verification", "plans-and-agents"],
    sources: [
      "saltzer-schroeder-1975-protection",
      "nist-separation-of-duty",
      "slsa-source-requirements",
      "strathern-1997-improving-ratings",
    ],
    credited: ["jerome-saltzer", "michael-schroeder"],
  },
  "smoke-test": {
    name: "Smoke test",
    definition:
      "A quick run of the main paths of the whole system, end to end, to see that it works at all before deeper testing.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["istqb-smoke-testing"],
    credited: [],
  },
  "snapshot-testing": {
    name: "Snapshot testing",
    definition:
      "A test framework stores an output the first time a test runs and fails when a later run produces a different one.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["jest-snapshot-testing"],
    credited: ["meta"],
  },
  statecharts: {
    name: "Statecharts",
    definition:
      "State diagrams extended with hierarchy, concurrency and communication, so that complex behaviour stays readable.",
    cells: ["GI"],
    themes: ["modelling"],
    sources: ["harel-1987-statecharts"],
    credited: ["david-harel"],
  },
  "stateful-testing": {
    name: "Stateful (model-based) testing",
    definition:
      "Generated sequences of commands are run against the system and against a simple model of it, and the two must agree at every step.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["hughes-2016-testing-the-hard-stuff", "hypothesis-stateful"],
    credited: ["john-hughes"],
  },
  "surrogate-key": {
    name: "Surrogate key",
    definition:
      "Each row is identified by a key the system assigns and that means nothing, rather than by a value from the business that may change.",
    cells: ["GI"],
    themes: ["data"],
    sources: ["codd-1979-rm-t", "kimball-group-surrogate-keys"],
    credited: [],
  },
  "test-sizes": {
    name: "Test sizes",
    definition:
      "A test is small, medium or large by what it touches, one process, one machine or beyond, which decides its speed and its flakiness better than unit or integration.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["stewart-2010-test-sizes", "winters-2020-swe-at-google"],
    credited: ["simon-stewart"],
  },
  "transactional-outbox": {
    name: "Transactional outbox",
    definition:
      "A message to send is written to the database in the same transaction as the change it reports, and a separate process sends it on.",
    cells: ["GI"],
    themes: ["data", "architecture"],
    sources: ["richardson-transactional-outbox"],
    credited: ["chris-richardson"],
  },
  uml: {
    name: "Unified Modeling Language (UML)",
    definition:
      "A standard graphical language for specifying, visualising and documenting a system's structure and behaviour in diagrams.",
    cells: ["GI"],
    themes: ["modelling", "architecture"],
    sources: ["uml-partners-1997-uml-summary", "omg-2017-uml"],
    credited: ["rational-software", "object-management-group"],
  },
  "unit-testing": {
    name: "Unit testing",
    definition:
      "A test exercises a small part of the code, such as one function or class, fast enough to run on every change, with its collaborators real or replaced.",
    cells: ["SC"],
    themes: ["tests-and-verification"],
    sources: ["fowler-2014-unit-test"],
    credited: [],
  },
  observability: {
    name: "Observability",
    definition:
      "The system emits enough telemetry that anyone, a person or an agent, can ask it new questions while it runs, without shipping new code to answer them.",
    cells: ["SI", "SC"],
    themes: ["observability"],
    sources: ["majors-observability-manifesto"],
    credited: [],
  },
  "distributed-tracing": {
    name: "Distributed tracing",
    definition:
      "Each request carries an identifier through every service it crosses, and each step records a timed span, so its whole path can be read afterwards.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["sigelman-2010-dapper", "fonseca-2007-xtrace"],
    credited: [],
  },
  "structured-logging": {
    name: "Structured logging",
    definition:
      "Each log line is an event with named fields, not free text, so a program can query, count and join the logs.",
    cells: ["SC"],
    themes: ["observability"],
    sources: [
      "otel-logs-data-model",
      "majors-2019-structured-events",
      "leach-2019-canonical-log-lines",
    ],
    credited: [],
  },
  "service-level-objectives": {
    name: "Service level objectives (SLOs)",
    definition:
      "A target for how well a service must behave, such as the share of requests answered fast enough, measured continuously against what its users need.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["sre-2016-service-level-objectives"],
    credited: [],
  },
  "error-budget": {
    name: "Error budget",
    definition:
      "The failure an objective still allows, spent by changes and outages; once it runs out, the team stops shipping risk and restores reliability first.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["sre-2016-embracing-risk"],
    credited: [],
  },
  "four-golden-signals": {
    name: "The four golden signals",
    definition:
      "Latency, traffic, errors and saturation: the four measures to watch first on a system that serves users.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["sre-2016-monitoring"],
    credited: ["rob-ewaschuk"],
  },
  "use-method": {
    name: "USE method",
    definition:
      "For every resource, check its utilisation, its saturation and its errors, to find a performance bottleneck methodically.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["gregg-use-method"],
    credited: ["brendan-gregg"],
  },
  "red-method": {
    name: "RED method",
    definition:
      "For every service, measure the rate of its requests, their errors and their duration.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["wilkie-2018-red", "dam-2018-red"],
    credited: ["tom-wilkie"],
  },
  opentelemetry: {
    name: "OpenTelemetry",
    definition:
      "A vendor-neutral standard, with its libraries, for producing traces, metrics and logs, so that instrumenting a code base does not tie it to one tool.",
    cells: ["SC"],
    themes: ["observability", "tooling"],
    sources: ["otel-what-is", "otel-spec-overview"],
    credited: ["opentelemetry"],
  },
  "canary-release": {
    name: "Canary release",
    definition:
      "A change first reaches a small share of users while its signals are watched, and goes further only if they hold.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["sato-2014-canary"],
    credited: [],
  },
  "synthetic-monitoring": {
    name: "Synthetic monitoring",
    definition:
      "Scripted probes exercise the running system continuously, as a user would, and raise an alert when an expected behaviour fails.",
    cells: ["SC"],
    themes: ["observability"],
    sources: ["fale-gebhardt-2017-synthetic", "sre-2016-monitoring"],
    credited: [],
  },
} as const satisfies Record<string, Practice>;

export type PracticeId = keyof typeof PRACTICES;
