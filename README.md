# DIS-Project
## Compiling the web-app
When running this app for the first time, you need to create a virtual environment, in order to get the correct version of Flask.

This can be done easily by running the script `setup .dis_venv.ps1` in a terminal. 

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
When the program is started, open a web browser to [`http://127.0.0.1:5000`](http://127.0.0.1:5000).

At this point, there is no creating a new user. But there is an example user:
* Username: User
* Password: Password

Now we are at the simulation part of the project. In the bottom left corner, there is a `Start` button. 

The `Speed` slider represents the current delay in the simulation.

In the right side of the webpage, there are different Genomes (i.e. different seeds that can be input to the simulation.)

In the simulation window, you can click on a plant to see it's attributes. These are the age, energy, color and active gene.

If you click on the House button in the top right corner, you recenter the view of the simulation. If you click on the Leaf button to toggle the `Genome Manager`. When looking at the `Genome Manager`, you can see three tabs:
* Upload: Here you can upload a JSON-file containing a genome
* Personal: Here you can see your personal genomes, these are either saved or uploaded genomes.
* Public: Here you see `Official Genomes`, which are specific plants that we have created. You can also see `User Genomes`, which are genomes created by different users.

Under all of the tabs, we have a search bar that allows us to search in the different genomes. This will be more useful if we had a bigger amount of genomes.

If we toggle the `Genome Manager` we see the `Plant Genome` tab. Here we see the genome of the currently selected plant, where we can download or save the specific genome.

## E/R-Diagram for the Database
In our database, we have the preset entity set, which contains the attributes `name` (which is the key), and `genome` which contains the genetic encoding of the plant.

This goes into an ISA relationship, which splits presets into `Global` and `Local` presets.

The difference between these, is that local presets has a relationship with a `User` via the relationship-set `Owner`. This `User` entity has the attribute `username` (which is the key for the entity)

![E/R-Diagram](/er-diagram.png)