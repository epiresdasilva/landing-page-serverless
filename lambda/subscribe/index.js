/**
 * Lambda function para processar inscrições de e-book
 * 
 * Este Lambda é acionado pelo API Gateway quando um usuário se inscreve
 * para baixar o e-book. Ele salva os dados no DynamoDB e envia uma
 * notificação por email usando o SES.
 */

exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { name, email, company, position, timestamp } = body;
    
    // Validate required fields
    if (!name || !email || !company || !position) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'Missing required fields' })
      };
    }
    
    // Inicializar AWS SDK
    const AWS = require('aws-sdk');
    const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION });
    const ses = new AWS.SES({ region: process.env.AWS_REGION });
    
    // Save to DynamoDB
    await dynamoDB.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        email,
        name,
        company,
        position,
        timestamp: timestamp || new Date().toISOString()
      }
    }).promise();
    
    // Send notification email
    await ses.sendEmail({
      Source: 'no-reply@' + process.env.DOMAIN_NAME,
      Destination: {
        ToAddresses: [process.env.NOTIFICATION_EMAIL]
      },
      Message: {
        Subject: {
          Data: 'Novo download do e-book'
        },
        Body: {
          Text: {
            Data: `Novo download do e-book "Tendências da Indústria em Santa Catarina"
            
            Nome: ${name}
            Email: ${email}
            Empresa: ${company}
            Cargo: ${position}
            Data/Hora: ${timestamp || new Date().toISOString()}`
          }
        }
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Subscription successful',
        downloadUrl: `https://${process.env.DOMAIN_NAME}/assets/tendencias-industria-sc.pdf`
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
