/**
 * Script para gerenciar o formulário de inscrição e download do e-book
 */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('subscription-form');
  const formContainer = document.getElementById('form-container');
  const successMessage = document.getElementById('success-message');
  const downloadButton = document.getElementById('download-button');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // API endpoint - será substituído pelo script de deploy
  const API_ENDPOINT = '{{API_ENDPOINT}}';
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Mostrar indicador de carregamento
    loadingIndicator.style.display = 'block';
    
    // Coletar dados do formulário
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      company: document.getElementById('company').value,
      position: document.getElementById('position').value,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Enviar dados para a API
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      // Esconder indicador de carregamento
      loadingIndicator.style.display = 'none';
      
      if (response.ok) {
        // Mostrar mensagem de sucesso
        formContainer.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Configurar botão de download com a URL assinada
        downloadButton.href = data.downloadUrl;
        downloadButton.style.display = 'inline-block';
        
        // Iniciar download automático após 1 segundo
        setTimeout(() => {
          window.location.href = data.downloadUrl;
        }, 1000);
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      loadingIndicator.style.display = 'none';
      alert('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
    }
  });
});
