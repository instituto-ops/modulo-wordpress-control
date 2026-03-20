@echo off
echo ====================================================
echo NEUROENGINE OS - ANTI-GRAVITY CMS
echo Engenheiro-Chefe: AI
echo Inicializando Mission Control...
echo ====================================================

:: Verifica se a pasta node_modules existe, senão instala
if not exist "node_modules\" (
    echo [SYS] Primeira execucao detectada. Instalando dependencias E-E-A-T...
    npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias do Node.
        pause
    )
    echo [SYS] Dependencias instaladas com sucesso.
)

:: Inicia o servidor Node.js
echo [SYS] Acionando nucleos do backend (Proxy & IA)...
node backend/server.js

:: Mantém a janela aberta em caso de erro no servidor
pause
