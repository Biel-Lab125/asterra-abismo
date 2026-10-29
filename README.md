# Asterra: Abismo

Asterra: Abismo é um RPG 2D de fantasia sombria em desenvolvimento em JavaScript com Vite e Phaser.

## Modo roguelike: 100 andares

Cada sala é uma arena de plataforma lateral com câmera que acompanha o herói. Derrote todos os inimigos e use **E** perto do portal ou o botão **Descer de andar** para avançar. Os andares **10, 20, 30, 40, 50, 60, 70, 80, 90 e 100** são arenas de chefe; o último guardião é o Monarca Sombrio. A cada dez andares, a ambientação muda para a próxima Coroa. Os três últimos trechos fazem parte do Submundo, não são Coroas novas.

Os protagonistas, criaturas e chefes usam sprites originais desenhados por código, sem imagens externas. Os heróis têm o rosto descoberto e detalhes próprios na roupa, e cada região ganha um céu, lua e ruínas em camadas. A morte encerra a tentativa, registra o melhor andar e permite iniciar uma nova jornada.

## Requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev -- --host 0.0.0.0
```

Acesse a URL exibida no terminal, normalmente `http://localhost:5173`.

Para apresentar em vários aparelhos na mesma rede Wi-Fi, execute `npm run dev -- --host 0.0.0.0` no computador anfitrião e abra o endereço de rede mostrado pelo Vite em cada aparelho. Os controles táteis funcionam com o aparelho na horizontal. Para acesso fora da rede local, publique a pasta `dist` em uma hospedagem estática; cada navegador mantém sua própria partida local.

O deploy no GitHub Pages é feito automaticamente pelo GitHub Actions após cada atualização na branch `main`; cada aparelho joga sua própria partida, sem servidor multiplayer.

## Build

```bash
npm run build
```

## Testes

```bash
npm run test
```

## Controles

- A/D ou setas: mover
- Espaço: saltar
- J ou clique esquerdo: atacar
- K ou clique direito: esquivar (consome energia)
- Shift: corrida
- E: falar com Bokuto, abrir baús ou descer pelo portal
- 1: usar poção de cura
- I: inventário
- Tab: diário
- Esc: fechar painéis

## Estado atual

O jogo já tem seleção de personagem e arma; HUD, inventário, diário, salvamento local e progressão jogável do andar 1 ao 100. As dez lutas de chefe ocorrem nos andares múltiplos de dez, com padrões de ataque sinalizados, duas fases e arenas rúnicas dedicadas. A arte é gerada proceduralmente no jogo; ainda não há animações desenhadas à mão ou áudio final.
