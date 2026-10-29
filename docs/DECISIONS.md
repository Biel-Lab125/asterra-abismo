# Asterra — Decisões Técnicas e Criativas

## Tecnologia

O projeto adotou JavaScript com Vite e Phaser para manter a execução leve e acessível, com foco em não depender de assets externos do zero.

## Estrutura

- src/gameData.js: dados de personagens e armas (com dados de companheiros preservados para compatibilidade com saves antigos).
- src/saveSystem.js: salvamento local em localStorage.
- src/main.js: menu, seleção, HUD e loop principal do jogo.
- tests/saveSystem.test.js: validação de estado e persistência.

## Design

A direção criativa prioriza um mundo de fantasia sombria com atmosfera de esperança, seletividade e comparação de classes de combate.

O modo principal é uma aventura solo de plataforma lateral, sem companheiros visuais ou combate automático.
