# Michel AI CV - Project TODO

## Core Features
- [x] Estrutura de dados do currículo (Profile, Experience, Education, Skills, Metrics, Values)
- [x] Página Home com navegação SPA (Home, Currículo, Valores)
- [x] Página Currículo com layout de duas colunas (esquerda: conteúdo, direita: sidebar)
- [x] Página Valores Humanos com apresentação visual diferenciada
- [x] Header com foto de perfil e chips de contato clicáveis
- [x] Filtro dinâmico de perfil (Tech, Turismo, Administração, Completo)
- [x] Seção de métricas com cards de destaque e gráfico de barras
- [ ] Seção de pesquisas acadêmicas com DOI links
- [x] Seção de DOGMAs de engenharia

## AI & Chat Features
- [x] Integração com LLM (via Manus Built-in API)
- [x] Chat box embarcado com histórico de mensagens
- [x] Respostas contextualizadas baseadas no perfil de Michel
- [x] Sistema de notificação ao Michel quando recrutador inicia conversa
- [x] Armazenar histórico de conversas no banco de dados

## Design & UX
- [x] Design system com gradiente violeta-teal
- [x] Tipografia bold, oversized, sans-serif branca
- [x] Layout assimétrico com espaço negativo
- [x] Micro-animações de hover e transições fluidas
- [x] Toggle dark/light mode
- [x] Responsividade mobile e desktop
- [x] Animações suaves entre estados

## Database & Backend
- [x] Schema: Profile, Experience, Education, Skills, Metrics, Research, Values
- [x] Schema: ChatMessages para histórico de conversas
- [x] Schema: Notifications para alertas ao Michel
- [x] Procedures tRPC para CRUD de dados
- [x] Procedure para invocar LLM com contexto de perfil
- [x] Procedure para notificar Michel sobre novas conversas

## Testing & Deployment
- [x] Testes unitários com Vitest
- [ ] Verificação de responsividade
- [ ] Teste do chat com diferentes perfis de filtro
- [ ] Teste de notificações em tempo real
- [x] Checkpoint e publicação final

