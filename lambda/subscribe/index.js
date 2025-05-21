/**
 * Lambda function para processar inscrições de e-book
 * 
 * Este Lambda é acionado pelo API Gateway quando um usuário se inscreve
 * para baixar o e-book. Ele salva os dados no DynamoDB, envia uma
 * notificação por email para o administrador, e retorna um link assinado
 * para download imediato do e-book.
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
    const s3 = new AWS.S3({ region: process.env.AWS_REGION });
    
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
    
    // Generate a pre-signed URL for the e-book (expires in 15 minutes)
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.EBOOK_BUCKET,
      Key: process.env.EBOOK_KEY,
      Expires: 900 // 15 minutes in seconds
    });
    
    // Send notification email only to admin
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
    
    // Return success response with the signed URL for immediate download
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Subscription successful!',
        downloadUrl: signedUrl
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
