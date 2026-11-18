# Corpos masculino e feminino — CC BY 4.0

Modelos de referência adaptados de open-anatomy-3d, de MervinR07:
https://github.com/MervinR07/open-anatomy-3d/tree/c050aa7b1bc56ceed668199b01ea017341928d7b

Fontes: BodyParts3D © The Database Center for Life Science (DBCLS), CC BY 4.0; órgãos femininos do Human Reference Atlas / HuBMAP, CC BY 4.0; superfície corporal feminina MakeHuman, CC0. Adaptações originais por open-anatomy-3d, CC BY 4.0.

Licença dos modelos e catálogo: https://creativecommons.org/licenses/by/4.0/

Os arquivos male.glb, female.glb e catalog.json foram preservados. Modificações de visualização pelo Anatomia Livre: tradução de rótulos para português; seleção de sistemas; cores; agrupamento da superfície em regiões para seleção, isolamento e filtro, sem deformar a geometria. As divisões da superfície são aproximações para navegação. Os modelos e o catálogo desta pasta permanecem CC BY 4.0; os rótulos e adaptações derivados são disponibilizados sob a mesma licença.

O modelo feminino é uma referência adaptada, com estruturas comuns ajustadas ao corpo MakeHuman e órgãos específicos de origem HuBMAP, conforme descrito em UPSTREAM-ATTRIBUTION.md. Não representa todas as variações individuais. A coleção possui cobertura parcial e agrupamentos; não contém todos os detalhes anatômicos.

Preserve também UPSTREAM-ATTRIBUTION.md e LICENSE-MODELS.md ao redistribuir.

A apresentação externa foi adaptada com camiseta e shorts opacos derivados das proporções da superfície, material fosco com variação suave de cor, íris e pupilas e iluminação mais suave. As roupas em clothes-male.glb e clothes-female.glb são adaptações CC BY 4.0, reproduzíveis por scripts/bake-clothes.mjs. A cobertura acompanha as regiões para permanecer presente ao isolar e ocultar partes do corpo.

A vista externa também oferece variação ilustrativa de porte (esguio e regular), por escala transversal da superfície e da roupa juntas, sem usar fotografias de pessoas reais. Os modelos internos de referência são preservados.

Na vista de órgãos, as superfícies lobares pulmonares e outros órgãos comuns reutilizam os modelos de public/body/ (Z-Anatomy, CC BY-SA 4.0), preservando os créditos dessa pasta. A adaptação da posição no corpo feminino usa marcos da caixa torácica e da pelve medidos dos esqueletos de referência. O arquivo src/organ-view.js contém os marcos e a interpolação. Os arquivos-fonte desta pasta permanecem inalterados; a combinação visual não remove as licenças de suas partes.
