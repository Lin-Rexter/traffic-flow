set "params=%*" && cd /d "%CD%" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/C cd ""%CD%"" && %~s0 %params%", "", "runas", 1 >>"%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
@ECHO OFF

TITLE �w��Llama�ҫ�(Administrator)

:: = = = = = ���w�n�w�˪� Llama �ҫ� = = = = =
SET "Llama_Name=llama3.2:3b"
:: = = = = = = = = = = = = = = = = = = = = =

:: �w��Llama�ҫ�
GOTO Install_Llama

:Check_Ollama
Where.exe Ollama >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	ECHO ���w��Ollama�A����w�ˤ�...
	powershell -Command "& {winget install -i --id 'Ollama.Ollama' -e}"
	start "" "%~f0"
	EXIT
)ELSE (
	ECHO �w�w��Ollama!
)
EXIT /b

:Check_Llama
ECHO ���b�ˬdOllama�O�_�w�w��...
ECHO.
Call :Check_Ollama
ECHO.
ECHO ���b�ˬdLlama�ҫ��O�_�w�w��...
ECHO.
powershell -Command "& {ollama list %Llama_Name% | findstr '%Llama_Name%'}" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	ECHO �|���w�� %Llama_Name% �ҫ�!
)ELSE (
	ECHO �w�w�� %Llama_Name% �ҫ�!
	GOTO Exit
)
EXIT /b

:Install_Llama
CLS
Call :Check_Llama
ECHO.
ECHO �w�� %Llama_Name% �ҫ���...
powershell -Command "& {ollama pull %Llama_Name%}" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
	ECHO.
	ECHO �w�˥���!
)ELSE (
	ECHO.
	ECHO �w�˦��\!
	powershell -Command "& {ollama list %Llama_Name%}"
)
GOTO Exit

:Exit
ECHO.
ECHO.
pause>nul|set/p =���U���N�����} ...
EXIT