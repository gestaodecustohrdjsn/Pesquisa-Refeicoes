# Pesquisa de satisfação das refeições · HRPP

O formulário tem uma tela e três avaliações anônimas. Ao confirmar, o tablet registra o voto imediatamente, agradece e libera a tela para a próxima pessoa. A hora registrada é a do voto no tablet. A planilha exibe essa hora no fuso de Ponta Porã.

## 1. Preparar o Google Sheets

1. Crie uma planilha nova chamada **Pesquisa de Satisfação — HRPP — Refeições**.
2. Abra **Extensões → Apps Script**, cole o conteúdo de `apps-script/Code.gs` e salve.
3. No seletor de funções, escolha `configurarPesquisa`. Clique em **Executar** e autorize com a conta dona da planilha. Execute uma vez. Serão criadas as abas **Respostas** e **Dashboard**.
4. Em **Implantar → Nova implantação**, escolha **Aplicativo da Web**, execute como **Eu** e conceda acesso a **Qualquer pessoa**, conforme permitido pela conta Google. A permissão é do aplicativo de coleta. A planilha pode continuar restrita aos responsáveis.
5. Copie o endereço do aplicativo web terminado em `/exec` para `config.js`. Guarde o código Apps Script na planilha. As respostas ficam na aba **Respostas**, incluindo uma coluna técnica oculta de ID para impedir duplicatas de sincronização.

## 2. Publicar no GitHub Pages

1. Crie um repositório separado chamado **Pesquisa-Satisfacao-HRPP-Refeicoes**. Envie os arquivos do formulário para a raiz, incluindo a pasta `assets`.
2. Em **Settings → Pages**, selecione **Deploy from a branch**, branch `main` e pasta `/ (root)`.
3. Abra o endereço publicado no tablet conectado à internet e aguarde o rodapé informar **Pronto para uso offline**. Se preferir, instale pelo menu do navegador. Mantenha a data e hora automáticas no tablet.

## 3. Validar antes da coleta

Use votos de teste. Confirme um voto online e confira a aba **Respostas**. Coloque o tablet em modo avião, recarregue a página e confirme outros dois votos. O rodapé deve indicar dois pendentes. Religue a internet com a pesquisa aberta e aguarde a fila zerar. Confira os votos, os horários originais e os totais do painel. Apague apenas as linhas de teste da aba Respostas antes do uso oficial.

A fila fica no navegador do tablet e tenta enviar automaticamente ao recuperar a conexão, ao voltar à tela e periodicamente enquanto estiver aberta. Caso feche a pesquisa, reabra no mesmo navegador para retomar a sincronização. Evite navegação anônima e limpeza de dados do navegador durante a coleta. O status **Planilha ainda não vinculada** indica que o endereço `/exec` ainda precisa ser configurado.

O dashboard mostra o total, a quantidade e o percentual de Ruim, Regular e Bom, além de um gráfico. Preencha as datas inicial e final para filtrar, ou deixe as duas em branco para consultar todo o período.
