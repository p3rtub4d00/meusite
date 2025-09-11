# 🍺 CONTEINER BEER - Sistema de Gestão Comercial

Este é um sistema de gestão comercial completo, desenvolvido para pequenos estabelecimentos como bares e restaurantes. O projeto foi construído utilizando tecnologias web front-end (HTML, CSS e JavaScript) e armazena todos os dados localmente no navegador do usuário através do `localStorage`, permitindo que funcione de forma offline.

![image_7cd672.png](URL_DA_SUA_IMAGEM_AQUI)
*(Dica: Tire um screenshot da tela principal do sistema e substitua o link acima para exibir uma imagem aqui.)*

---

## ✨ Funcionalidades Principais

O sistema é dividido em dois módulos principais: o Painel Administrativo e o Sistema de Comandas.

### Painel Administrativo (`index.html`)
- **Dashboard:** Visão geral com métricas diárias, como faturamento, número de vendas, valor do estoque e alertas de estoque baixo. Inclui gráficos de vendas e dos produtos mais vendidos.
- **Gestão de Produtos:** Funcionalidade completa de CRUD (Criar, Ler, Atualizar, Deletar) para os produtos, com controle de estoque atual, estoque mínimo, preço de custo e preço de venda.
- **Registro de Vendas:** Histórico de todas as vendas realizadas, com filtros por data e método de pagamento.
- **Controle de Gastos:** Seção para registrar despesas, permitindo um controle financeiro mais preciso.
- **Contas a Receber:** Módulo para gerenciar pagamentos pendentes de clientes.
- **Fechamento de Caixa:** Ferramenta para calcular o balanço diário, considerando o valor inicial, vendas em dinheiro e despesas.
- **Gerenciamento de Mesas:** Na área de configurações, é possível adicionar e remover mesas dinamicamente para o sistema de comandas.
- **Backup e Restauração:** Funcionalidades para fazer backup dos dados em um arquivo JSON, restaurar a partir de um backup e download dos dados.

### Sistema de Comandas (`comanda.html`)
- **Interface Visual de Mesas:** Exibe todas as mesas cadastradas e seu status (Livre/Ocupada).
- **Lançamento de Pedidos:** Interface otimizada (para tablets ou celulares) para adicionar produtos do estoque diretamente na comanda de uma mesa.
- **Fechamento de Conta:** Modal de pagamento prático com opções de Dinheiro, Cartão e PIX para finalizar a venda.
- **Integração em Tempo Real:** Todas as ações no sistema de comandas (abertura de conta, adição de itens, fechamento) são refletidas imediatamente no estoque e nos registros financeiros do sistema principal.

---

## 🚀 Como Usar
1.  Abra o arquivo `index.html` para acessar o painel administrativo.
2.  Use as credenciais `admin` / `admin` para o primeiro acesso.
3.  Navegue pelas seções na barra lateral para gerenciar o sistema.
4.  Acesse o sistema de comandas através do botão no cabeçalho ou abrindo o arquivo `comanda.html`.

## 🛠️ Tecnologias Utilizadas
- HTML5
- CSS3 (com Variáveis CSS para temas)
- JavaScript (Vanilla JS, sem frameworks)
- [Chart.js](https://www.chartjs.org/) para a visualização de gráficos.
- [jsPDF](https://github.com/parallax/jsPDF) para a geração de relatórios em PDF.
- [Font Awesome](https://fontawesome.com/) para os ícones.
