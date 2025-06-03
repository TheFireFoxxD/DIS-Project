# DIS-Project
When running this app for the first time, you need to create a virtual environment, in order to get the correct version of Flask.

This can be done easily by running the script 'setup .dis_venv.ps1' in a terminal. 

When running on Windows, you also need to the command:
```powershell
Set-ExecutionPolicy Unrestricted -Scope Process
```

When you are done creating the virtual environment, you simply run the script
```powershell
& '.\run app.ps1'
```
in order to run the app.

![E/R-Diagram](/er-diagram.png)