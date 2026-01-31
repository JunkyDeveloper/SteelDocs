---
title: Code Konvention
description: Die Konvention für den Aufbau des Projektes für den Source Code
---

# Code-Standard

## Allgemein

- Vanilla ist normalerweise gut darin, Dinge zu benennen, daher erleichtert das Beibehalten derselben Namen das Lesen für die nächste Person. Manchmal möchten wir jedoch davon abweichen, wenn Namen schlecht oder nicht beschreibend sind, oder wir eine völlig andere Lösung für das betreffende System wollen. In diesem Fall sollten wir einen Dokumentationskommentar über der Struct, Methode oder dem Modul hinzufügen, der die Unterschiede klar beschreibt, damit jemand Neues beim nächsten Mal leicht dein System verstehen kann.
- Wir sollten versuchen, Code-Duplizierung zu minimieren, aber ein paar Zeilen sind normalerweise in Ordnung.
- Bei der Arbeit an Grundlagen müssen wir besonders sicher sein, dass wir keine Abkürzungen nehmen oder Dinge auslassen. Dies kann später Probleme verursachen, wenn ein grundlegendes System komplett neu gestaltet werden muss. Grundlegender Code ist Code wie ein System oder eine Schnittstelle, von dem anderer Code abhängt – zum Beispiel der Block-Behavior-Trait. Wenn dieser von Anfang an schlecht gestaltet ist und wir 100 Block-Implementierungen darauf aufbauen, viel Glück beim Ändern. Aber das schließt zukünftige grundlegende Änderungen nicht aus, wenn das erste System mit Langlebigkeit im Sinn entworfen wurde. Ein Beispiel für diese Art von Grundlage ist unser Chunk-Scheduler, bei dem die Chunk-Stufen und Regeln für ihre Ausführung bereits entworfen sind. Das bedeutet, dass das Austauschen des Schedulers den Generierungscode nicht bricht.
- Keine Workarounds. Sei nicht faul und überspringe nicht das Erstellen einer Hilfsfunktion, nur weil du sie nur einmal für deinen Anwendungsfall gebraucht hast.
- Versuche, nicht tief in Einrückungen zu gehen. Guard Clauses sind dafür nützlich, und Rust hat einige wirklich nette `if let` und `let Some() = x else {return}`
- Verwende keine Panics, es sei denn, der Fall tritt nie ein oder ist fatal für das Programm. Versuche andernfalls, Results zu verwenden.
- Verwende kein Multithreading, es sei denn, du kannst erklären, warum es Multithreading braucht, und kannst mit Benchmarks beweisen, dass es besser ist.
- Verwende kein Async, es sei denn, du brauchst Festplatten- oder Netzwerk-I/O oder massiven Einsatz von rechenarmen Aufgaben, die Awaiting benötigen (Chunk-Abhängigkeiten, aber die Generierung läuft auf Rayon). Stelle immer sicher, dass du niemals rechenintensiven Code in einer Async-Runtime ausführst. Überbrücke die Lücke mit spawn_blocking oder dem Spawnen einer Rayon-Aufgabe.
- Verwende [samply](https://github.com/mstange/samply) oder [jaeger](https://www.jaegertracing.io/docs/latest/getting-started/) für Profiling. Jaeger ist am besten für Timing mit Tracing-Spans und das Erfassen von Kontext und Durchschnittswerten. Samply ist am besten, wenn du ein einfaches Flame-Graph willst, um zu sehen, welche interne Funktion zum Beispiel bei der Weltgenerierung die meisten Ressourcen verbraucht.
- Füge keine unnötigen Dependencies hinzu. Wir sind nicht JavaScript, wir brauchen kein is-even und left-pad.
- Wenn du ein Feature nicht vollständig implementiert hast, stelle sicher, dass du einen // TODO: Kommentar hinzufügst.

## Registries

- Wir sollten nur generieren, was benötigt wird. Verwendet Minecraft eine hartcodierte Kollisions-Transformation für Entities in verschiedenen Zuständen? Dann sollten wir das auch tun, anstatt sie zu extrahieren.
- Wir sollten Registries mit komplexer Logik von Hand schreiben, es sei denn, sie haben viele Einträge (30+). Etwas wie Data Components und Entity-Serializer erfordert viel manuelle Arbeit, um die Serializer richtig zu bekommen, und sie haben nur wenige Einträge, also kein Grund, es zusätzlich mit Generierung zu verkomplizieren.
- Wir sollten die Extraktionsdaten aus dem Minecraft-Datenpaket verwenden, anstatt ein benutzerdefiniertes Format zu generieren, wenn es dort existiert. Das gilt normalerweise für das, was Mojang reloadable Registries nennt, einschließlich Tags, Worldgen-Daten und ähnlichem. Vanilla-BuiltIn-Registries müssen extrahiert werden.
- Wir sollten alles mit Blick auf Modding und ABI-Kompatibilität für die Zukunft entwerfen. Keine Anforderung, einen Other-Enum-Attributtyp hinzuzufügen, aber wir müssen sicherstellen, dass es so gestaltet ist, dass es das in Zukunft handhaben kann. Wir sollten die gleichen Standards wie NeoForge beim Modding einhalten, also sollten sogar Block-Registries (Vanilla-Built-In-Registries) dies im Sinn haben.

## Testing

- Füge Tests für fortgeschrittene Systeme hinzu, Code der Unsafe verwendet (immer // SAFETY Kommentare verwenden) oder Code, der mit Vanillas Determinismus übereinstimmen muss (ItemComponent-Hashing oder Worldgen).
- Erlaube Clippy-Lints nur mit einem Begründungskommentar per #[allow], es sei denn, es ist offensichtlich. Falsch-Positive und absichtliche Abweichungen (z.B. Funktionslänge für Lesbarkeit) sind akzeptabel, wenn erklärt.