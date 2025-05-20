# Landing Page para Download de E-book

Este projeto implementa uma landing page estática para download de e-book em PDF, hospedada na AWS usando Serverless Framework.

## Arquitetura

A solução utiliza os seguintes serviços AWS:

- **Amazon S3**: Armazenamento da landing page estática e do arquivo PDF do e-book
- **Amazon CloudFront**: CDN para entrega rápida e segura do conteúdo
- **Amazon API Gateway**: API RESTful para processar inscrições
- **AWS Lambda**: Processamento serverless das inscrições
- **Amazon DynamoDB**: Armazenamento dos dados de inscrição
- **Amazon SES**: Envio de notificações por e-mail
- **Serverless Framework**: Gerenciamento de infraestrutura como código (IaC)

## Estrutura do Projeto

```
.
├── README.md
├── serverless.yml          # Configuração do Serverless Framework
├── package.json            # Dependências do projeto
├── src/                    # Código fonte da landing page
│   ├── index.html          # Página principal
│   ├── css/                # Estilos CSS
│   ├── js/                 # Scripts JavaScript
│   └── assets/             # Imagens e outros recursos
├── lambda/                 # Código fonte das funções Lambda
│   └── subscribe/          # Função Lambda para processar inscrições
│       ├── index.js        # Código principal da função
│       └── package.json    # Dependências da função
└── .github/                # Configurações do GitHub
    └── workflows/          # Workflows do GitHub Actions
        └── deploy.yml      # Workflow de deploy
```

## Pré-requisitos

1. Node.js 16 ou superior
2. Conta AWS com permissões para criar recursos
3. Serverless Framework instalado globalmente (`npm install -g serverless`)
4. AWS CLI configurado com suas credenciais
5. Certificado SSL no AWS Certificate Manager (ACM) para seu domínio
6. Domínio verificado no Amazon SES (se estiver no sandbox)

## Implantação Local

### 1. Preparação

Antes de implantar, você precisa:

1. Criar um certificado SSL no AWS Certificate Manager (ACM) para seu domínio
   ```bash
   aws acm request-certificate \
     --domain-name seu-dominio.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. Verificar seu domínio no Amazon SES (se estiver no sandbox)
   ```bash
   aws ses verify-email-identity --email-address seu-email@exemplo.com
   aws ses verify-email-identity --email-address no-reply@seu-dominio.com
   ```

3. Criar uma pasta para os arquivos do e-book e adicionar:
   - O e-book em PDF em `src/assets/tendencias-industria-sc.pdf`
   - O logo em `src/assets/logo.png`
   - A imagem de capa do e-book em `src/assets/ebook-cover.png`

### 2. Instalação de Dependências

```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências da função Lambda
cd lambda/subscribe
npm install
cd ../..
```

### 3. Implantação

```bash
# Implantar com Serverless Framework
serverless deploy --param="domainName=seu-dominio.com" --param="emailNotification=seu-email@exemplo.com" --param="certificateArn=arn:aws:acm:us-east-1:123456789012:certificate/abcdef12-3456-7890-abcd-ef1234567890"

# Ou usando os scripts do package.json
npm run deploy

# Fazer upload dos arquivos estáticos para o S3
npm run deploy:static

# Invalidar o cache do CloudFront
npm run invalidate-cache
```

## Implantação com GitHub Actions

Para automatizar o deploy usando GitHub Actions:

1. Adicione os seguintes secrets ao seu repositório GitHub:
   - `AWS_ACCESS_KEY_ID`: ID da chave de acesso AWS
   - `AWS_SECRET_ACCESS_KEY`: Chave de acesso secreta AWS
   - `AWS_REGION`: Região AWS (ex: us-east-1)
   - `DOMAIN_NAME`: Nome do domínio para a landing page
   - `EMAIL_NOTIFICATION`: Email para receber notificações
   - `CERTIFICATE_ARN`: ARN do certificado SSL no ACM

2. Faça push do código para o branch main:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. O GitHub Actions irá automaticamente implantar a aplicação conforme configurado no arquivo `.github/workflows/deploy.yml`.

## Fluxo de Funcionamento

1. Usuário acessa a landing page
2. Preenche o formulário de inscrição
3. Os dados são enviados para o API Gateway
4. API Gateway aciona uma função Lambda
5. Lambda salva os dados no DynamoDB
6. Lambda envia uma notificação por e-mail via SES
7. Usuário recebe acesso ao download do e-book

## Personalização

1. Edite os arquivos HTML, CSS e JavaScript na pasta `src/` para personalizar a aparência da landing page
2. Modifique a função Lambda em `lambda/subscribe/index.js` para alterar a lógica de processamento de inscrições
3. Ajuste as configurações do Serverless Framework em `serverless.yml` conforme necessário
