# Asterra — Relatório de testes

## Testes executados

- `npm run build` — sucesso; Phaser e a nova cena foram empacotados
- `npm run test` — sucesso; 5 testes em 2 arquivos
- Navegador — a tela de seleção e o andar 1 carregaram; canvas, HUD, cenário, sprites e combate foram observados
- Navegador — chefe do andar 10 surgiu com barra de vida; ao derrotá-lo, o portal avançou corretamente para o andar 11 / Coroa da Magia
- Navegador (versão atual) — salto verificado em -760, sem ator/HUD de companheiro, fundo parallax presente e portal 10 → 11 funcional

## Observações

- A configuração dos 100 andares e dos dez chefes foi coberta por testes.
- O jogo abre no navegador local e o combate do primeiro andar funciona.
- O build emite aviso de chunk grande por causa do Phaser; não é erro de compilação.
- A campanha completa até o andar 100 ainda requer teste manual prolongado de balanceamento.
- A cena principal agora oculta e remove os companheiros; o fundo tem camadas em parallax e o salto foi ampliado.
