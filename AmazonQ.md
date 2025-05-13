# Projeto de Landing Page para E-book com AWS

Este projeto foi criado com a ajuda do Amazon Q e implementa uma landing page estática para download de e-book em PDF, hospedada na AWS usando S3, CloudFront e Route53.

## Componentes Implementados

1. **Frontend**:
   - Landing page responsiva em HTML/CSS/JavaScript
   - Formulário de captura de leads
   - Modal de confirmação de download
   - Design moderno e atraente

2. **Backend**:
   - API Gateway para processar inscrições
   - Lambda Function para lógica de negócios
   - DynamoDB para armazenamento de dados
   - SES para notificações por email

3. **Infraestrutura**:
   - CloudFormation template completo (IaC)
   - S3 para hospedagem estática
   - CloudFront para CDN
   - Route53 para gerenciamento de DNS (configuração opcional)

## Como Usar

1. Personalize os arquivos HTML, CSS e JavaScript na pasta `src/`
2. Adicione seu e-book em PDF em `src/assets/tendencias-industria-sc.pdf`
3. Adicione seu logo em `src/assets/logo.png`
4. Adicione uma imagem de capa do e-book em `src/assets/ebook-cover.png`
5. Implante a infraestrutura usando o template CloudFormation em `templates/infrastructure.yaml`
6. Faça upload dos arquivos da pasta `src/` para o bucket S3 criado

## Próximos Passos

1. Configurar um certificado SSL personalizado no ACM
2. Implementar análise de dados com Google Analytics ou AWS Analytics
3. Adicionar integração com ferramentas de marketing por email
4. Implementar testes A/B para otimizar a taxa de conversão
