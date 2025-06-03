from flask import Flask, jsonify, render_template, request, redirect, url_for
import sqlite3, re
from data import OFFICIAL, EXAMPLE_USERS, EXAMPLE_USER_CONTENT

# TODO: 
#   - Make the login screen prettier.
#   - Make more example and official content
#   - Add a settings sidebar. 

def connect_db():
    '''
    Returns a connection to the database.
    '''
    db = sqlite3.connect('project/database') # connects to the database
    db.row_factory = sqlite3.Row # makes the attributes/columns be indexed like dictionaries (with names)
    return db

def init_schema(db:sqlite3.Connection):
    db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            PRIMARY KEY (name)
        );
        
        CREATE TABLE IF NOT EXISTS global (
            name TEXT NOT NULL,
            genome TEXT NOT NULL,
            PRIMARY KEY (name)
        );
        
        CREATE TABLE IF NOT EXISTS local (
            user TEXT NOT NULL,
            name TEXT NOT NULL,
            genome TEXT NOT NULL,
            PRIMARY KEY (user,name),
            FOREIGN KEY (user) REFERENCES users(name) ON DELETE CASCADE
        );
    ''')

def init_data(db:sqlite3.Connection):
    cursor = db.cursor()
    # actual data ; data in the global table
    cursor.executemany('''
        INSERT OR IGNORE INTO global (name, genome) VALUES (?,?)
    ''', OFFICIAL)

    # example data ; an example user with their example creation
    cursor.executemany('''
        INSERT OR IGNORE INTO users (name, password) VALUES (?,?)
    ''', EXAMPLE_USERS)
    cursor.executemany('''
        INSERT OR IGNORE INTO local (user, name, genome) VALUES (?,?,?)
    ''', EXAMPLE_USER_CONTENT)

def init_db():
    '''
    Creates necessary tables if not already present in the database.\n
    Inserts actual and example data into the database.
    '''
    with connect_db() as db:
        init_schema(db)
        init_data(db)
        db.commit()

init_db()

app = Flask(__name__)

USER = None
'''Constant for storing the username of the current user.'''

@app.route('/')
def index():
    return redirect(url_for('simulation'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    global USER 

    error = None  # holds error message for display on login.html
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Connect to the database.
        db = connect_db()
        cursor = db.cursor()
        
        # Check if the user already exists.
        cursor.execute('''
            SELECT *
            FROM users
            WHERE name = ?
        ''', (username,))
        user = cursor.fetchone()

        if user: # if a user with provided username exist -> True ; else -> False
            # existing users will be checked
            if user['password'] == password:
                USER = username
                db.close()
                return redirect(url_for('simulation'))
            else:
                error = "Incorrect password. Please try again."
        else:
            if bool(re.search(r'\W', username)):
                error = "Username may only contain letters, digits and underscore."
            else:
                # new users will be added
                cursor.execute('''
                    INSERT
                    INTO users (name, password)
                    VALUES (?, ?)
                ''', (username, password))
                db.commit()
                USER = username
                db.close()
                return redirect(url_for('simulation'))
    
    # On GET (or if there was an error), render the login page with any error message.
    return render_template('login.html', error=error)

@app.route('/simulation')
def simulation():
    global USER
    if USER: # if None -> False, and redirected to login page.
        return render_template('simulation.html')
    else:
        return redirect(url_for('login'))



uploaded_genomes : list[tuple[str,str]] = []
'''Temp database for uploaded genomes, that are not saved in the actual database.'''

@app.route('/genome/upload', methods=['POST'])
def upload_genome():
    '''Uploads the recieved plant to the temp database, for later retrieval.'''
    data = request.json
    name : str = data.get('name') # name (filename) of th uploaded genome
    user_genome : str = data.get('genome') # the uploaded genome (json) is sent as string

    uploaded_genomes.append((name, user_genome)) # add to the temp database (uploaded_genomes)
    return jsonify({'name':name, 'genome':user_genome})

@app.route('/genome/save', methods=['POST'])
def save_genome():
    '''Saves the recieved plant in the perm database.'''
    global USER
    data = request.json
    name : str = data.get('name') # name (filename) of th uploaded genome
    genome : str = data.get('genome') # the uploaded genome (json) is sent as string

    with connect_db() as db:
        cursor = db.cursor()
        cursor.execute('''
            INSERT OR IGNORE 
            INTO local (user, name, genome) 
            VALUES (?,?,?)
        ''', (USER, name, genome))
        db.commit()
    return jsonify({'succes':True})

@app.route('/genome/delete')
def del_genome():
    '''Deletes the recieved genome from the database.'''
    global USER
    name = request.args.get('name') # the name of the genome to be deleted

    with connect_db() as db:
        cursor = db.cursor()
        cursor.execute('''
            DELETE 
            FROM local 
            WHERE user = ? AND name = ?;
        ''', (USER, name))
        db.commit()
    return jsonify({'succes':True})



@app.route('/genome-manager/private', methods=['GET'])
def private_genomes():
    query = request.args.get('query', '')

    # using regex for search
    if query:
        result = [
            {"name": plant[0], "genome":plant[1]}
            for plant in uploaded_genomes
            if bool(re.search(query, plant[0], re.IGNORECASE))
        ]
    else:
        result = [
            {"name": plant[0], "genome":plant[1]}
            for plant in uploaded_genomes
        ]
    return jsonify(result)

@app.route('/genome-manager/personal', methods=['GET'])
def personal_genomes():
    global USER
    db = connect_db()
    cursor = db.cursor()

    cursor.execute('''
        SELECT name, genome
        FROM local
        WHERE user = ?
    ''', (USER,))
    rows = cursor.fetchall()

    query = request.args.get('query', '')

    # using regex for search
    if query:
        result = [
            {"name": row["name"], "genome": row["genome"]}
            for row in rows 
            if bool(re.search(query, row["name"], re.IGNORECASE))
        ]
    else:
        result = [
            {"name": row["name"], "genome": row["genome"]}
            for row in rows
        ]
    db.close()
    return jsonify(result)

@app.route('/genome-manager/public', methods=['GET'])
def public_genomes():
    global USER
    db = connect_db()
    cursor = db.cursor()

    cursor.execute('''
        SELECT name, genome, '@Official' as owner 
        FROM global
    ''')
    global_genomes = cursor.fetchall()
    cursor.execute('''
        SELECT name, genome, user as owner
        FROM local
        WHERE user <> ?
    ''', (USER,))
    local_genomes = cursor.fetchall()

    query = request.args.get('query', '')

    # using regex for search
    if query:
        result = [
            {"name": row["name"], "genome": row["genome"], "owner": row["owner"]}
            for row in global_genomes + local_genomes 
            if bool(re.search(query, row["name"], re.IGNORECASE))
        ]
    else:
        result = [
            {"name": row["name"], "genome": row["genome"], "owner": row["owner"]}
            for row in global_genomes + local_genomes
        ]
    db.close()
    return jsonify(result)
    
if __name__ == '__main__':
    app.run(debug=True)
