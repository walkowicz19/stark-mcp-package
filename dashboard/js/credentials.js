// Credential Management for Sytra MCP Dashboard

// Initialize credential management when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupCredentialControls();
});

function setupCredentialControls() {
  // Add credential button
  const addBtn = document.getElementById('addCredentialBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      showAddCredentialModal();
    });
  }
}

async function loadCredentials() {
  try {
    const credentials = await api.getCredentials();
    displayCredentials(credentials);
  } catch (error) {
    console.error('Error loading credentials:', error);
  }
}

function displayCredentials(credentialsData) {
  const list = document.getElementById('credentialsList');
  if (!list) return;

  const credentials = credentialsData.credentials || [];

  if (credentials.length === 0) {
    list.innerHTML = '<div class="no-data">No credentials stored</div>';
    return;
  }

  list.innerHTML = credentials.map(cred => `
    <div class="credential-item">
      <div class="credential-header">
        <div class="credential-info">
          <h4>${escapeHtml(cred.name)}</h4>
          ${cred.service ? `<span class="credential-service">${escapeHtml(cred.service)}</span>` : ''}
        </div>
        <div class="credential-actions">
          <button class="btn btn-sm btn-secondary" onclick="testCredential('${escapeHtml(cred.name)}')">
            <i class="bi bi-check-circle"></i> Test
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteCredential('${escapeHtml(cred.name)}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
      <div class="credential-meta">
        <span><i class="bi bi-calendar"></i> Created: ${formatDate(cred.created_at)}</span>
        ${cred.last_used ? `<span><i class="bi bi-clock"></i> Last used: ${formatDate(cred.last_used)}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function showAddCredentialModal() {
  const modalContent = `
    <div class="modal-header">
      <h3>Add Credential</h3>
      <button class="btn-close" onclick="closeModal()">
        <i class="bi bi-x"></i>
      </button>
    </div>
    <div class="modal-body">
      <form id="addCredentialForm">
        <div class="form-group">
          <label for="credName">Credential Name *</label>
          <input type="text" id="credName" class="text-input" placeholder="e.g., github-token" required>
          <small>Unique identifier for this credential</small>
        </div>
        
        <div class="form-group">
          <label for="credValue">Value *</label>
          <div class="password-input-wrapper">
            <input type="password" id="credValue" class="text-input" placeholder="Enter credential value" required>
            <button type="button" class="btn-icon" onclick="togglePasswordVisibility('credValue')">
              <i class="bi bi-eye"></i>
            </button>
          </div>
          <small>The actual credential (API key, token, password, etc.)</small>
        </div>
        
        <div class="form-group">
          <label for="credService">Service (Optional)</label>
          <input type="text" id="credService" class="text-input" placeholder="e.g., GitHub, AWS, OpenAI">
          <small>The service this credential is for</small>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> Add Credential
          </button>
        </div>
      </form>
    </div>
  `;

  showModal(modalContent);

  // Set up form submission
  const form = document.getElementById('addCredentialForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleAddCredential();
    });
  }
}

async function handleAddCredential() {
  const name = document.getElementById('credName').value.trim();
  const value = document.getElementById('credValue').value;
  const service = document.getElementById('credService').value.trim();

  if (!name || !value) {
    alert('Name and value are required');
    return;
  }

  try {
    await api.addCredential({
      name,
      value,
      service: service || null
    });

    closeModal();
    await loadCredentials();
    showSuccess('Credential added successfully');
  } catch (error) {
    console.error('Error adding credential:', error);
    alert('Failed to add credential: ' + error.message);
  }
}

async function testCredential(name) {
  try {
    const result = await api.testCredential(name);
    if (result.valid) {
      showSuccess(`Credential "${name}" is valid`);
    } else {
      showError(`Credential "${name}" test failed: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error testing credential:', error);
    showError('Failed to test credential: ' + error.message);
  }
}

async function deleteCredential(name) {
  if (!confirm(`Are you sure you want to delete credential "${name}"?`)) {
    return;
  }

  try {
    await api.deleteCredential(name);
    await loadCredentials();
    showSuccess('Credential deleted successfully');
  } catch (error) {
    console.error('Error deleting credential:', error);
    alert('Failed to delete credential: ' + error.message);
  }
}

function showModal(content) {
  const overlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  
  if (overlay && modalContent) {
    modalContent.innerHTML = content;
    overlay.style.display = 'flex';
  }
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const button = input?.parentElement?.querySelector('.btn-icon');
  
  if (input && button) {
    const icon = button.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'bi bi-eye-slash';
    } else {
      input.type = 'password';
      icon.className = 'bi bi-eye';
    }
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showSuccess(message) {
  console.log('Success:', message);
  // Could add a toast notification here
}

function showError(message) {
  console.error('Error:', message);
  // Could add a toast notification here
}

// Export for use in other modules
window.displayCredentials = displayCredentials;
window.testCredential = testCredential;
window.deleteCredential = deleteCredential;
window.closeModal = closeModal;
window.togglePasswordVisibility = togglePasswordVisibility;

// Made with Bob