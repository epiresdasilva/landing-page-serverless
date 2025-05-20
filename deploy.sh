#!/bin/bash

# Script para empacotar e implantar a função Lambda e a infraestrutura

# Configurações
STACK_NAME="ebook-landing-page"
DEPLOYMENT_BUCKET="deployment-artifacts"  # Substitua pelo nome do seu bucket
REGION="us-east-1"  # Substitua pela sua região
DOMAIN_NAME="ebook.exemplo.com"  # Substitua pelo seu domínio
EMAIL_NOTIFICATION="seu-email@exemplo.com"  # Substitua pelo seu email
CERTIFICATE_ARN=""  # Substitua pelo ARN do seu certificado

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando implantação...${NC}"

# Verificar se o bucket de implantação existe
echo -e "${YELLOW}Verificando bucket de implantação...${NC}"
if ! aws s3 ls "s3://${DEPLOYMENT_BUCKET}" --region ${REGION} > /dev/null 2>&1; then
  echo -e "${YELLOW}Criando bucket de implantação...${NC}"
  aws s3 mb "s3://${DEPLOYMENT_BUCKET}" --region ${REGION}
  aws s3api put-bucket-versioning --bucket ${DEPLOYMENT_BUCKET} --versioning-configuration Status=Enabled --region ${REGION}
fi

# Empacotar a função Lambda
echo -e "${YELLOW}Empacotando função Lambda...${NC}"
cd lambda/subscribe
npm install --production
zip -r ../../subscribe.zip .
cd ../..

# Fazer upload do pacote Lambda para o S3
echo -e "${YELLOW}Fazendo upload do pacote Lambda para o S3...${NC}"
aws s3 cp subscribe.zip "s3://${DEPLOYMENT_BUCKET}/${STACK_NAME}/lambda/subscribe.zip" --region ${REGION}
rm subscribe.zip

# Implantar o CloudFormation stack
echo -e "${YELLOW}Implantando stack CloudFormation...${NC}"
aws cloudformation deploy \
  --template-file templates/infrastructure.yaml \
  --stack-name ${STACK_NAME} \
  --parameter-overrides \
    DomainName=${DOMAIN_NAME} \
    EmailNotification=${EMAIL_NOTIFICATION} \
    CertificateArn=${CERTIFICATE_ARN} \
    DeploymentBucket=${DEPLOYMENT_BUCKET} \
  --capabilities CAPABILITY_IAM \
  --region ${REGION}

# Verificar se a implantação foi bem-sucedida
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Implantação concluída com sucesso!${NC}"
  
  # Obter outputs do CloudFormation
  echo -e "${YELLOW}Obtendo informações da implantação...${NC}"
  API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text --region ${REGION})
  CLOUDFRONT_URL=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text --region ${REGION})
  
  echo -e "${GREEN}API Endpoint: ${API_ENDPOINT}${NC}"
  echo -e "${GREEN}CloudFront URL: ${CLOUDFRONT_URL}${NC}"
  echo -e "${GREEN}Domínio personalizado: https://${DOMAIN_NAME}${NC}"
  
  echo -e "${YELLOW}Lembre-se de atualizar o arquivo src/js/script.js com a URL correta do API Gateway e fazer upload dos arquivos estáticos para o bucket S3.${NC}"
else
  echo -e "${RED}Falha na implantação. Verifique os logs do CloudFormation para mais detalhes.${NC}"
fi
