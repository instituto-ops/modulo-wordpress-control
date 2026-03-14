@echo off
title AntiGravity CMS - Mission Control
color 0B
echo ===================================================
echo    Iniciando Mission Control - AntiGravity CMS
echo ===================================================
echo.
echo Iniciando o Servidor Unificado (Frontend + API)...
echo Camada de Seguranca: ATIVA
echo.

:: Vai para a pasta frontend
cd "%~dp0frontend"

:: Inicia o servidor Node.js
:: Usamos 'start' para abrir o servidor em uma janela e continuar o script bat
start "Motor AntiGravity" /MIN cmd /c "npm run dev"

echo Aguardando inicializacao do motor (5 segundos)...
timeout /t 5 /nobreak >nul

echo Abrindo o Painel Administrativo no navegador...
start http://localhost:3000

echo.
echo ===================================================
echo Sucesso! O Mission Control esta rodando.
echo.
echo Painel: http://localhost:3000
echo API Proxy: Ativo (Porta 3000)
echo.
echo Nao feche a janela preta do Servidor enquanto
echo estiver trabalhando no sistema.
echo ===================================================
pause
