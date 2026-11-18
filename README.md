# Anatomia Livre — corpo inteiro em 3D

A tela inicial abre o **corpo inteiro**, com três sistemas: **Órgãos**, **Ossos** e **Músculos**. É possível girar, aproximar, escolher vistas de frente/trás/lados, buscar nomes, selecionar estruturas, isolar, ocultar e desfazer. O botão **Aproximar** enquadra a estrutura selecionada. O filtro de região ajuda a explorar cabeça/pescoço, tronco/pelve, membros superiores e inferiores.

A opção **Cabeça e dentes** preserva a área anterior, incluindo rosto adulto, órgãos da cabeça, crânio, músculos e o quadro de dentição permanente com numeração FDI.

## Abrir

```sh
npm install
npm run dev -- --port 5173
```

Computador: `http://localhost:5173`. Celular/tablet no mesmo Wi-Fi: `http://IP-DO-COMPUTADOR:5173`. O computador precisa permanecer ligado. Não é um endereço público na internet.

```sh
npm run build
npm test
npm run test:body
```

O build gera um site estático em `dist`. O teste usa Chromium em `/usr/bin/chromium` e o servidor em `http://localhost:5173`. Verifica traduções, troca entre os três modelos, seleção na geometria, vistas, arraste, busca, ocultar/desfazer/isolar e telas de 320 a 1440 pixels. O desempenho no tablet real ainda precisa ser confirmado.

## Corpo inteiro

Os modelos completos de esqueleto, músculos e vísceras são provenientes da mesma coleção Z-Anatomy / BodyParts3D, exportada por 242_lab-human-anatomy. Incluem músculos do tronco, braços, antebraços, mãos, coxas, pernas e pés, além da cabeça. O coração é um subconjunto das câmaras e valvas, agrupado como um órgão; encéfalo e sentidos reutilizam os arquivos da cabeça. O carregamento é por sistema: aproximadamente 3 MB para ossos, 9 MB para músculos e 10 MB para órgãos. Os arquivos são locais ao site, sem dependência de serviços externos durante o uso.

A coleção continua parcial: não representa todos os detalhes do corpo e contém órgãos genitais masculinos, sem modelos genitais femininos. Traduções aguardam revisão terminológica. Os filtros agrupam estruturas por sua posição no modelo. Modelos e rótulos derivados sob CC BY-SA 4.0; veja `public/body/ATTRIBUTION.md`. `scripts/prepare-body.py` preserva os nomes originais como metadados e `scripts/extract-heart.py` reproduz o subconjunto cardíaco.

`npm run test:body` usa a mesma prévia local do teste original; verifica os sistemas, nomes de membros e órgãos, filtros de região, foco, ocultar/desfazer, retorno à cabeça e telas de 320 a 1440 px. É possível definir `ANATOMIA_URL` para testar o build em outra porta.

## Modelos da cabeça

- Ossos: crânio, ossículos da audição e dentes, 56 elementos nomeados.
- Músculos: face, mastigação e olhos, com estruturas associadas; 76 malhas de origem, agrupadas na lista por nome e lado.
- Órgãos: cérebro, cerebelo, tronco encefálico, estruturas dos olhos e ouvidos, língua e glândulas. As partes encefálicas são agrupadas por órgão/lado para simplificar a seleção.

Os subconjuntos comprimidos de ossos e músculos têm menos de 1 MB cada. Órgãos carregam aproximadamente 8 MB no primeiro acesso. Os arquivos e o decodificador Draco são locais; nenhum CDN/API é usado em tempo de execução. Ainda não há instalação/offline por service worker. Coleção parcial, não inclui todos os detalhes anatômicos nem textos de função, origem ou inserção; traduções aguardam revisão terminológica.

## Origem e reprodução

Z-Anatomy / BodyParts3D, com exportações de `Liyucheng1997/242_lab-human-anatomy` e Vanatome. Licença CC BY-SA 4.0. Créditos e modificações em `public/head/ATTRIBUTION.md` e `public/credits.html`.

`scripts/extract-head.py` extrai subconjuntos, preservando geometria e transformações. Espera os GLB `skeleton`, `muscular`, `nervous` e `visceral` do primeiro repositório em `/tmp/anatomia-source-NOME.glb`, e o atlas Vanatome original em `public/models/`. Não utiliza conteúdo do Anatomy Learning.

O catálogo da versão anterior foi preservado em `catalog.html` e seus arquivos de origem, sem interferir na tela principal do atlas.
