document.addEventListener('DOMContentLoaded', () => {
    let browserActive = false;
    let currentUsername = '';

    const vmForm = document.getElementById('vmForm');
    const instagramForm = document.getElementById('instagramForm');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const screenshot = document.getElementById('screenshot');
    const message = document.getElementById('message');
    const browserControls = document.getElementById('browserControls');
    const initBrowserBtn = document.getElementById('initBrowserBtn');
    const closeBrowserBtn = document.getElementById('closeBrowserBtn');
    const scrollDownBtn = document.getElementById('scrollDownBtn');
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    const clickPostBtn = document.getElementById('clickPostBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const statusIndicator = document.getElementById('statusIndicator');

    vmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const vmData = {
            name: document.getElementById('vmName').value,
            type: document.getElementById('vmType').value
        };

        try {
            const response = await fetch('/api/create-vm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(vmData)
            });

            const data = await response.json();
            
            if (data.success) {
                displayVMResult(data.vm);
            }
        } catch (error) {
            alert('Erro ao criar VM ' + error.message);
        }
    });

    initBrowserBtn.addEventListener('click', async () => {
        try {
            updateStatus('Inicializando navegador aguarde');
            initBrowserBtn.disabled = true;
            initBrowserBtn.textContent = 'Inicializando';
            
            const response = await fetch('/api/init-browser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                browserActive = true;
                updateStatus('Navegador pronto', true);
                browserControls.classList.remove('hidden');
                initBrowserBtn.textContent = 'Navegador Ativo';
            } else {
                updateStatus('Erro ' + data.error, false);
                initBrowserBtn.disabled = false;
                initBrowserBtn.textContent = 'Iniciar Navegador';
            }
        } catch (error) {
            updateStatus('Erro ' + error.message, false);
            initBrowserBtn.disabled = false;
            initBrowserBtn.textContent = 'Iniciar Navegador';
        }
    });

    closeBrowserBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/close-browser', {
                method: 'POST'
            });

            const data = await response.json();
            
            if (data.success) {
                browserActive = false;
                updateStatus('Navegador fechado', false);
                browserControls.classList.add('hidden');
                initBrowserBtn.disabled = false;
                initBrowserBtn.textContent = 'Iniciar Navegador';
                result.classList.add('hidden');
            }
        } catch (error) {
            alert('Erro ao fechar ' + error.message);
        }
    });

    instagramForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!browserActive) {
            alert('Inicie o navegador primeiro');
            return;
        }

        const username = document.getElementById('username').value;
        currentUsername = username;
        
        loading.classList.remove('hidden');
        result.classList.add('hidden');
        
        try {
            const navResponse = await fetch('/api/navigate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const navData = await navResponse.json();
            
            if (navData.success) {
                await captureScreenshot();
                updateStatus('Visualizando ' + username, true);
            } else {
                showError(navData.error);
            }
        } catch (error) {
            showError('Erro ' + error.message);
        } finally {
            loading.classList.add('hidden');
        }
    });

    scrollDownBtn.addEventListener('click', async () => {
        await scroll('down');
    });

    scrollUpBtn.addEventListener('click', async () => {
        await scroll('up');
    });

    clickPostBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/click-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ index: 0 })
            });

            const data = await response.json();
            
            if (data.success) {
                screenshot.src = 'data:image/jpeg;base64,' + data.image;
                updateStatus('Post aberto', true);
            }
        } catch (error) {
            alert('Erro ao clicar ' + error.message);
        }
    });

    refreshBtn.addEventListener('click', async () => {
        await captureScreenshot();
    });

    async function scroll(direction) {
        try {
            const response = await fetch('/api/scroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ direction })
            });

            const data = await response.json();
            
            if (data.success) {
                screenshot.src = 'data:image/jpeg;base64,' + data.image;
                updateStatus('Scroll ' + direction, true);
            }
        } catch (error) {
            alert('Erro no scroll ' + error.message);
        }
    }

    async function captureScreenshot() {
        try {
            const response = await fetch('/api/screenshot', {
                method: 'POST'
            });

            const data = await response.json();
            
            if (data.success) {
                screenshot.src = 'data:image/jpeg;base64,' + data.image;
                result.classList.remove('hidden');
                screenshot.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao capturar', error);
        }
    }

    function updateStatus(text, isActive = false) {
        statusIndicator.textContent = text;
        statusIndicator.className = isActive ? 'status-active' : 'status-inactive';
    }

    function displayVMResult(vm) {
        const vmResult = document.getElementById('vmResult');
        vmResult.innerHTML = `
            <h3>VM Criada</h3>
            <p>ID ${vm.id}</p>
            <p>Nome ${vm.name}</p>
            <p>Tipo ${vm.type}</p>
            <p>Status ${vm.status}</p>
            <p>IP ${vm.ip}</p>
        `;
        vmResult.classList.remove('hidden');
    }

    function showError(errorMsg) {
        message.textContent = errorMsg;
        result.classList.remove('hidden');
        screenshot.style.display = 'none';
    }
});
