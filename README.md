# Landing Page para Download de E-book

Este projeto implementa uma landing page estática para download de e-book em PDF, hospedada na AWS usando S3, CloudFront e Route53.

## Arquitetura

A solução utiliza os seguintes serviços AWS:

- **Amazon S3**: Armazenamento da landing page estática e do arquivo PDF do e-book
- **Amazon CloudFront**: CDN para entrega rápida e segura do conteúdo
- **Amazon Route53**: Gerenciamento de DNS
- **Amazon API Gateway**: API RESTful para processar inscrições
- **Amazon DynamoDB**: Armazenamento dos dados de inscrição
- **Amazon SES**: Envio de notificações por e-mail
- **AWS CloudFormation**: Infraestrutura como código (IaC)

## Estrutura do Projeto

```
.
├── README.md
├── src/                    # Código fonte da landing page
│   ├── index.html          # Página principal
│   ├── css/                # Estilos CSS
│   ├── js/                 # Scripts JavaScript
│   └── assets/             # Imagens e outros recursos
└── templates/              # Templates CloudFormation
    └── infrastructure.yaml # Template principal
```

## Implantação

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

### 2. Implantação da Infraestrutura

```bash
aws cloudformation deploy \
  --template-file templates/infrastructure.yaml \
  --stack-name ebook-landing-page \
  --parameter-overrides \
    DomainName=seu-dominio.com \
    EmailNotification=seu-email@exemplo.com \
    CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/abcdef12-3456-7890-abcd-ef1234567890 \
  --capabilities CAPABILITY_IAM
```

### 3. Upload dos Arquivos

```bash
# Criar a pasta de assets se não existir
mkdir -p src/assets

# Fazer upload dos arquivos para o S3
aws s3 sync src/ s3://seu-dominio.com/
```

### 4. Configuração do API Gateway

Após a implantação, obtenha a URL do API Gateway:

```bash
aws cloudformation describe-stacks \
  --stack-name ebook-landing-page \
  --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
  --output text
```

Atualize o arquivo `src/js/script.js` com a URL correta do API Gateway e faça upload novamente:

```bash
aws s3 cp src/js/script.js s3://seu-dominio.com/js/script.js
```

### 5. Configuração do DNS (opcional)

Se você estiver usando o Route53, descomente a seção `DomainRecordSet` no template CloudFormation e reimplante, ou configure manualmente:

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id SUA_ZONA_HOSPEDADA \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "seu-dominio.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "Z2FDTNDATAQYW2",
            "DNSName": "sua-distribuicao-cloudfront.cloudfront.net",
            "EvaluateTargetHealth": false
          }
        }
      }
    ]
  }'
```

## Fluxo de Funcionamento

1. Usuário acessa a landing page
2. Preenche o formulário de inscrição
3. Os dados são enviados para o API Gateway
4. API Gateway aciona uma função Lambda
5. Lambda salva os dados no DynamoDB
6. Lambda envia uma notificação por e-mail via SES
7. Usuário recebe acesso ao download do e-book
