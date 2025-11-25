// Gestion des notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-slide-up ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
  }
  
  // Confirmation modale moderne
  function confirmAction(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                <h3 class="text-lg font-semibold mb-4">Confirmation</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <div class="flex justify-end space-x-3">
                    <button class="btn-secondary px-4 py-2 rounded">Annuler</button>
                    <button class="btn-danger px-4 py-2 rounded">Confirmer</button>
                </div>
            </div>
        `;
        
        const [cancelBtn, confirmBtn] = modal.querySelectorAll('button');
        
        cancelBtn.onclick = () => {
            modal.remove();
            resolve(false);
        };
        
        confirmBtn.onclick = () => {
            modal.remove();
            resolve(true);
        };
        
        document.body.appendChild(modal);
    });
  }
  
  // Animation des tableaux
  function animateTableRows() {
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.1}s`;
        row.classList.add('animate-slide-up');
    });
  }
  
  // Gestion des formulaires
  function enhanceForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="animate-spin">⏳</i> Traitement...';
            }
        });
    });
  }
  
  // Filtrage et recherche
  function initTableFilters() {
    const searchInputs = document.querySelectorAll('input[type="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const table = e.target.closest('.table-container').querySelector('tbody');
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    });
  }
  
  // Initialisation au chargement
  document.addEventListener('DOMContentLoaded', function() {
    animateTableRows();
    enhanceForms();
    initTableFilters();
    
    // Auto-hide les messages flash après 5 secondes
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    });
  });
  
  // Export pour utilisation globale
  window.app = {
    showNotification,
    confirmAction,
    animateTableRows
  };