@echo off
start /min cmd.exe
TIMEOUT 3
D:
cd \Textile\Textile_BE
npm run start

cmd /k