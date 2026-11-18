@echo off
title CAGE AI .EXE Paketleme
echo ========================================================
echo        CAGE AI WINDOWS .EXE PAKETLEME BASLIYOR...
echo ========================================================
cd /d "%~dp0"
npm run pack
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [BASARILI] Uygulama dist/win-unpacked dizinine basariyla derlendi!
) else (
    echo.
    echo [HATA] Paketleme sirasinda hata olustu.
)
pause
