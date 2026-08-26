# Controle de Atendimentos Diários

## 1. Sobre o projeto

Painel pessoal para controle de atendimentos diários realizados no trabalho.

Ele substitui uma planilha mensal em que o usuário registrava a quantidade de
atendimentos feita em cada dia. O sistema permite:

- Selecionar o mês e o ano.
- Registrar a quantidade de atendimentos de cada dia útil.
- Marcar dias como folga ou feriado.
- Calcular automaticamente o total mensal.
- Mostrar média diária, dias concluídos e progresso do mês.
- Diferenciar visualmente dias passados, dia atual e dias futuros.
- Manter sábados e domingos claramente identificados.
- Acompanhar a meta financeira mensal.
- Preservar um histórico dos meses anteriores.
- Futuramente oferecer uma experiência otimizada para celular (PWA).

O painel é de uso pessoal do usuário **Lucas Duarte**.

## 2. Tecnologias e stack atual

- React + TypeScript
- Next.js (App Router) / Vite
- HTML e CSS responsivo (sem framework de UI, CSS puro em `globals.css`)
- Hooks do React: `useState`, `useEffect`, `useMemo`
- `localStorage` para salvar os lançamentos no navegador
- `Intl.DateTimeFormat` com fuso horário `America/Sao_Paulo`
- `Intl.NumberFormat` para formatação monetária em reais (BRL)
- Hospedagem: ChatGPT Sites / Cloudflare Workers
- Aplicação de página única, sem backend próprio no momento

Arquivos principais:

- `app/page.tsx` — lógica, dados, cálculos e componentes da página
- `app/globals.css` — identidade visual, calendário e responsividade
- `app/layout.tsx` — estrutura e metadados gerais
- `.openai/hosting.json` — identificação da hospedagem atual

Site publicado: https://controle-atendimentos-diarios.lucas-afduarte.chatgpt.site

## 3. Estado atual do projeto

### 3.1 Funcionalidades existentes

- Cabeçalho "Meu Controle — Atendimentos diários"
- Botão para retornar ao mês atual
- Navegação entre meses usando setas
- Resumo mensal: total, média por dia trabalhado, dias concluídos, progresso
- Painel financeiro
- Histórico dos meses importados da planilha (dez/2025 a ago/2026)
- Calendário mensal para lançamentos
- Salvamento automático no `localStorage`
- Marcação de folga ou feriado
- Destaque automático do dia atual
- Diferença visual entre dias passados, atuais e futuros

**Chave do localStorage:** `atendimentos-diarios-v2`
⚠️ **Não altere essa chave sem criar uma migração** — isso pode fazer o
usuário perder os lançamentos já salvos.

### 3.2 Organização do calendário

Modelo semanal, semelhante ao Google Agenda:

- Sete colunas fixas, semana começa na segunda-feira
- Ordem: Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo
- Todos os sábados alinhados verticalmente; todos os domingos também
- O primeiro dia do mês ocupa a coluna correspondente ao seu dia da semana
  (via `gridColumnStart`, calculado em `page.tsx`)
- Em telas menores, mantém as sete colunas e permite rolagem horizontal

### 3.3 Identidade visual aprovada

**O usuário já aprovou o visual atual — evoluções incrementais, sem
reformulação completa.**

- Sábados e domingos usam a mesma identidade visual entre si
- Fundo dos finais de semana: `#c9cecb`
- Borda dos finais de semana: `#aeb6b1`
- Textos dos finais de semana mais escuros para manter contraste
- Dias passados têm fundo diferente dos dias futuros
- Dia atual recebe borda dourada e etiqueta "HOJE"
- Quantidade de atendimentos usa cor de destaque roxa (`--count: #6c4fc4`)
- Paleta geral: verde (`--green: #1d6548`), creme (`--cream: #f5f6f2`),
  branco, cinza, roxo e laranja (`--orange: #ef7b45`)
- Painel financeiro muda visualmente quando a meta é alcançada
  (classe `.goalReached`)

**Preserve essa identidade visual, salvo pedido explícito de mudança.**

### 3.4 Regra financeira

- Meta-base mensal: **250 atendimentos**
- Ao alcançar 250, o usuário recebe **R$ 5.000,00**
- Antes de 250, o valor estimado exibido é R$ 0,00
- Depois de 250, cada atendimento excedente soma **R$ 5,00**

```ts
const paymentGoal = 250;
const basePayment = 5000;
const extraRate = 5;

const extraAttendances = Math.max(0, total - paymentGoal);

const estimatedPayment =
  total >= paymentGoal
    ? basePayment + extraAttendances * extraRate
    : 0;
```

Exemplos: 249 = R$ 0,00 | 250 = R$ 5.000,00 | 251 = R$ 5.005,00 | 260 = R$ 5.050,00

⚠️ **Essa regra não deve ser modificada sem confirmação expressa do usuário.**

### 3.5 Persistência atual

- Dados novos ficam só no `localStorage` do navegador
- Continuam disponíveis no mesmo navegador/aparelho
- **Não sincronizam** entre computador e celular
- Limpar dados do navegador pode apagar lançamentos novos
- Ainda não existe banco de dados, login, conta de usuário ou sincronização
  em nuvem

Explique essas limitações de forma clara se forem relevantes para uma nova
funcionalidade.

## 4. Próximos passos (roteiro)

Prioridade atual: **melhorar a experiência no celular (PWA)**.

1. Avaliar o comportamento atual em diferentes tamanhos de tela
2. Criar uma experiência confortável para celular
3. Decidir entre site responsivo aprimorado / PWA instalável / app separado
4. **Começar por uma PWA**, permitindo:
   - Instalação na tela inicial
   - Ícone próprio
   - Abertura em tela cheia, semelhante a um app
   - Possível funcionamento offline
5. Avaliar persistência em nuvem (sincronizar computador e celular, evitar
   perda de dados, permitir backup)
6. Se implementar persistência remota: banco de dados, autenticação pessoal,
   migração seguro dos dados do `localStorage`
7. Melhorias futuras opcionais: exportação para Excel/PDF, gráficos de
   evolução, comparação entre meses, projeção de atendimentos, backup e
   restauração, configuração editável da meta e valores

**Não implemente funcionalidades extras sem antes alinhar com o usuário.**

## 5. Instruções de trabalho

- Responda em **português do Brasil**
- Linguagem clara, amigável e pouco técnica
- Trate o usuário como **Lucas** quando soar natural
- Examine a estrutura e o código existentes antes de alterar algo
- Não reescreva o projeto do zero sem necessidade
- Preserve o histórico e os lançamentos salvos
- Preserve a chave atual do `localStorage`
- Faça mudanças incrementais
- Mantenha a regra financeira exatamente como descrita
- Preserve a identidade visual já aprovada
- Não remova funcionalidades existentes para simplificar uma implementação
- Informe exatamente quais arquivos foram/precisam ser modificados
- Explique resumidamente o que foi alterado
- Atenção especial à experiência em celular: acessibilidade, contraste,
  teclado e interação por toque
- Teste o calendário em meses que começam em diferentes dias da semana
- Verifique meses com 28, 29, 30 e 31 dias
- Verifique a virada de ano (dezembro → janeiro)
- Verifique se sábado e domingo continuam alinhados nas duas últimas colunas
- Verifique se os lançamentos continuam salvos após atualizar a página
- Evite adicionar bibliotecas desnecessárias
- Ao propor backend, autenticação ou banco de dados: apresente primeiro a
  arquitetura e os impactos antes de implementar
- **Nunca faça alterações que possam apagar dados existentes sem avisar** e
  sem criar uma estratégia de migração ou backup
