document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('download-form');
    const modal = document.getElementById('success-modal');
    const closeBtn = document.querySelector('.close');
    const directDownloadBtn = document.getElementById('direct-download');
    
    // Função para enviar dados para API Gateway
    async function submitForm(formData) {
        try {
            // Substitua esta URL pela URL real do seu API Gateway após a implantação
            const apiUrl = 'https://lzdi5zpsi4.execute-api.us-east-1.amazonaws.com/prod/subscribe';
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Erro ao enviar formulário');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
        }
    }
    
    // Manipulador de envio do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            position: document.getElementById('position').value,
            timestamp: new Date().toISOString()
        };
        
        const result = await submitForm(formData);
        
        if (result) {
            // Configurar o link de download direto
            directDownloadBtn.href = 'assets/tendencias-industria-sc.pdf';
            
            // Mostrar modal de sucesso
            modal.style.display = 'block';
        }
    });
    
    // Fechar modal quando clicar no X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fechar modal quando clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
