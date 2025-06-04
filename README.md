# DIS-Project
## Compiling the web-app
When running this app for the first time, you need to create a virtual environment meeting the requirements of `requirements.txt`, in order to get the correct version of Flask.

This can be done easily by running the powershell script `setup .dis_venv.ps1` in a terminal. 

When running on Windows, you also need to the following command to allow the scripts to run:
```powershell
Set-ExecutionPolicy Unrestricted -Scope Process
```

When you are done creating the virtual environment, you simply use the following command to run the `run app.psi` script:
```powershell
& '.\run app.ps1' 
```
in order to start the app.

## Running the web-app
When the program is started, open a web browser to [`http://127.0.0.1:5000`](http://127.0.0.1:5000).

Here you will be presented with a login screen, where you can either create an account by providing a valid (unused) username and password, 
or you can choose to log in as one of our many example users, for example:
* Username: `User`
* Password: `Password`

Others can be found in `data.py` under the constant `EXAMPLE_USERS`.

## Using the web-app
Now we are at the simulation part of the project. In the bottom left corner, there is a `Start` button. 

The `Speed` slider represents the current delay in the simulation, in miliseconds (low=fast, high=slow).

In the right side of the webpage, there are different Genomes (i.e. different seeds that can be input to the simulation.)
When a genome is selected in the _Genome manager_, it can be placed in the simulation by clicking where you want to place it (might be hard to see).
To deselect, either press Esc, go to another tab in the _Genome manager_ or close the _Genome manager_.

In the simulation window, you can click on a plant to see its attributes. These are the age, energy, color and active gene (of the specific cell that was clicked on).
In the simulation window you can also zoom by scrolling on the mousewheel or by zooming on a trackpad. To move around in the simulation, just (click and) drag it around.

If you click on the House button in the top right corner, you recenter the view of the simulation; usefull if you get lost. 
If you click on the Leaf button, you can open/close the `Genome Manager`. When looking at the `Genome Manager`, you can see three tabs:
* Upload: Here you can upload a JSON-file containing a genome
* Personal: Here you can see your personal genomes, i.e. genomes saved under the current user.
* Public: Here you see `Official Genomes`, which are specific plants that we have created as the developers. You can also see `User Genomes`, which are genomes created by different users.

Above all of the tabs, we have a search bar that allows us to search in the different genomes. This will be more useful if we had a bigger amount of genomes.

If we toggle the `Genome Manager` we see the `Plant Genome` tab. Here we see the genome of the currently selected plant, where we can download or save the specific genome.

## E/R-Diagram for the Database
In our database, we have the preset entity set, which contains the attributes `name` (which is the key), and `genome` which contains the genetic encoding of the plant.

This goes into an ISA relationship, which splits presets into `Global` and `Local` presets.
The `Global` entity-set is where we store all the official genomes, made be us, the developers.
The `Local` entity-set is where all the usergenerated genomes are stored, and is therefore a weak entity-set through the `Owner` relationship-set, with `User` as its parent.
This `User` entity-set has the attribute `username` (which is the key for the entity) and `password`.

![E/R-Diagram](/final-er-diagram.png)
