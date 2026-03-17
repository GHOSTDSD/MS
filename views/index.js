<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Auto Viewer</title>
    <link rel="stylesheet" href="/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <h1>Instagram Auto Viewer</h1>
            <p>Visualize perfis do Instagram</p>
        </header>

        <main>
            <section class="vm-section">
                <h2>Criar Instancia VM</h2>
                <form id="vmForm">
                    <div class="form-group">
                        <label for="vmName">Nome da VM</label>
                        <input type="text" id="vmName" placeholder="instagram-viewer-01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="vmType">Tipo de Instancia</label>
                        <select id="vmType" required>
                            <option value="t2.micro">t2.micro 1 vCPU 1 GB RAM</option>
                            <option value="t2.small">t2.small 1 vCPU 2 GB RAM</option>
                            <option value="t2.medium">t2.medium 2 vCPU 4 GB RAM</option>
                        </select>
                    </div>

                    <button type="submit" class="btn primary">Criar VM</button>
                </form>
                
                <div id="vmResult" class="result-card hidden"></div>
            </section>

            <section class="instagram-section">
                <h2>Visualizador Instagram</h2>
                
                <div class="control-group" style="margin-bottom: 20px;">
                    <button class="btn primary" id="initBrowserBtn">Iniciar Navegador</button>
                </div>

                <form id="instagramForm">
                    <div class="form-group">
                        <label for="username">Usuario do Instagram</label>
                        <input type="text" id="username" placeholder="instagram" required>
                    </div>
                    
                    <button type="submit" class="btn secondary">Navegar para Perfil</button>
                </form>

                <div class="browser-controls hidden" id="browserControls">
                    <h3>Controles</h3>
                    
                    <div class="status-bar" id="statusIndicator">
                        Navegador inativo
                    </div>
                    
                    <div class="control-group">
                        <button class="btn small" id="scrollDownBtn">Scroll Down</button>
                        <button class="btn small" id="scrollUpBtn">Scroll Up</button>
                        <button class="btn small" id="clickPostBtn">Abrir Post</button>
                        <button class="btn small" id="refreshBtn">Atualizar</button>
                        <button class="btn small" id="closeBrowserBtn" style="background: #f44336;">Fechar</button>
                    </div>
                </div>

                <div id="loading" class="loading hidden">
                    <div class="spinner"></div>
                    <p>Capturando tela...</p>
                </div>

                <div id="result" class="result-card hidden">
                    <h3>Captura</h3>
                    <img id="screenshot" src="" alt="Screenshot">
                    <p id="message"></p>
                </div>
            </section>
        </main>
    </div>

    <script src="/script.js"></script>
</body>
</html>
