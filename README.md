# Anatomia Livre — cabeça em 3D

A tela inicial tem três botões: **Órgãos**, **Ossos** e **Músculos**. Todos mostram apenas estruturas da cabeça. O usuário pode girar livremente com o mouse/dedo, aproximar com pinça/rolagem ou botões, e escolher vistas de frente, trás, lado direito e lado esquerdo. A seleção por toque ou pela lista mostra nomes em português; há busca, isolamento, ocultação e desfazer.

## Abrir

```sh
npm install
npm run dev -- --port 5173
```

Computador: `http://localhost:5173`. Celular/tablet no mesmo Wi-Fi: `http://IP-DO-COMPUTADOR:5173`. O computador precisa permanecer ligado. Não é um endereço público na internet.

```sh
npm run build
npm test
```

O build gera um site estático em `dist`. O teste usa Chromium em `/usr/bin/chromium` e o servidor em `http://localhost:5173`. Verifica traduções, troca entre os três modelos, seleção na geometria, vistas, arraste, busca, ocultar/desfazer/isolar e telas de 320 a 1440 pixels. O desempenho no tablet real ainda precisa ser confirmado.

## Modelos

- Ossos: crânio, ossículos da audição e dentes, 56 elementos nomeados.
- Músculos: face, mastigação e olhos, com estruturas associadas; 76 malhas de origem, agrupadas na lista por nome e lado.
- Órgãos: cérebro, cerebelo, tronco encefálico, estruturas dos olhos e ouvidos, língua e glândulas. As partes encefálicas são agrupadas por órgão/lado para simplificar a seleção.

Os subconjuntos comprimidos de ossos e músculos têm menos de 1 MB cada. Órgãos carregam aproximadamente 8 MB no primeiro acesso. Os arquivos e o decodificador Draco são locais; nenhum CDN/API é usado em tempo de execução. Ainda não há instalação/offline por service worker. Coleção parcial, não inclui todos os detalhes anatômicos nem textos de função, origem ou inserção; traduções aguardam revisão terminológica.

## Origem e reprodução

Z-Anatomy / BodyParts3D, com exportações de `Liyucheng1997/242_lab-human-anatomy` e Vanatome. Licença CC BY-SA 4.0. Créditos e modificações em `public/head/ATTRIBUTION.md` e `public/credits.html`.

`scripts/extract-head.py` extrai subconjuntos, preservando geometria e transformações. Espera os GLB `skeleton`, `muscular`, `nervous` e `visceral` do primeiro repositório em `/tmp/anatomia-source-NOME.glb`, e o atlas Vanatome original em `public/models/`. Não utiliza conteúdo do Anatomy Learning.

O catálogo da versão anterior foi preservado em `catalog.html` e seus arquivos de origem, sem interferir na tela principal focada na cabeça.
