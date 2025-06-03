# DIS-Project
## Compiling the web-app
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

## Running the web-app
When the program is started, open a web browser at [127.0.0.1:5000](127.0.0.1:5000).

At this point, there is no creating a new user. But there is an example user:
* Username: User
* Password: Password

Now we are at the simulation part of the project. In the bottom left corner, there is a 'Start' button. 

The 'Speed' slider represents the current delay in the simulation.

In the right side of the webpage, there are different Genomes (i.e. different seeds that can be input to the simulation.)

In the simulation window, you can click on a plant to see it's attributes. These are the age, energy, color and active gene.

If you click on the House button in the top right corner, you recenter the view of the simulation. If you click on the Leaft button

## E/R-Diagram for the Database
![E/R-Diagram](/er-diagram.png)