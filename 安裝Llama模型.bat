set "params=%*" && cd /d "%CD%" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/C cd ""%CD%"" && %~s0 %params%", "", "runas", 1 >>"%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
@ECHO OFF

TITLE 安裝Llama模型(Administrator)

:: = = = = = 指定要安裝的 Llama 模型 = = = = =
SET "Llama_Name=llama3.2:3b"
:: = = = = = = = = = = = = = = = = = = = = =

:: 安裝Llama模型
GOTO Install_Llama

:Check_Ollama
Where.exe Ollama >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	ECHO 未安裝Ollama，執行安裝中...
	powershell -Command "& {winget install -i --id 'Ollama.Ollama' -e}"
	start "" "%~f0"
	EXIT
)ELSE (
	ECHO 已安裝Ollama!
)
EXIT /b

:Check_Llama
ECHO 正在檢查Ollama是否已安裝...
ECHO.
Call :Check_Ollama
ECHO.
ECHO 正在檢查Llama模型是否已安裝...
ECHO.
powershell -Command "& {ollama list %Llama_Name% | findstr '%Llama_Name%'}" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	ECHO 尚未安裝 %Llama_Name% 模型!
)ELSE (
	ECHO 已安裝 %Llama_Name% 模型!
	GOTO Exit
)
EXIT /b

:Install_Llama
CLS
Call :Check_Llama
ECHO.
ECHO 安裝 %Llama_Name% 模型中...
powershell -Command "& {ollama pull %Llama_Name%}" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	ECHO.
	ECHO 安裝失敗!
)ELSE (
	ECHO.
	ECHO 安裝成功!
	powershell -Command "& {ollama list %Llama_Name%}"
)
GOTO Exit

:Exit
ECHO.
ECHO.
pause>nul|set/p =按下任意鍵離開 ...
EXIT