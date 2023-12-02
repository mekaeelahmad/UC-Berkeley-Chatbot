const express = require('express');
const bodyParser = require('body-parser');
const openai = require('openai');

const app = express();
app.use(bodyParser.json());

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./database', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the berkeley database.');
});

//Create the users table
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, password TEXT NOT NULL, apiKey TEXT NOT NULL, convo TEXT)' , (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Created users table.');
});

//Create session tokens table
db.run('CREATE TABLE IF NOT EXISTS sessionTokens (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT NOT NULL UNIQUE, userId INTEGER NOT NULL)', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Created sessionTokens table.');
});

//Log in return token and convo
app.post('/login', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        if (row) {
            const token = Math.random().toString(36).substr(2);
            db.run('INSERT INTO sessionTokens (token, userId) VALUES (?, ?)', [token, row.id], (err) => {
                if (err) {
                    console.error(err.message);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                res.json({ convo: row.convo, token: token });
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

//Sign up
app.post('/signup', (req, res) => {
    const name = req.query.name;
    const email = req.query.email;
    const password = req.query.password;
    const apiKey = req.query.apiKey;
    db.run('INSERT INTO users (name, email, password, apiKey) VALUES (?, ?, ?, ?)', [name, email, password, apiKey], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json({ success: "User created." });
    });
});

//Change API Key, feed in api key to  change
app.post('/changeAPIKey', (req, res) => {
    const token = req.query.token;
    const apiKey = req.query.apiKey;
    db.run('UPDATE users SET apiKey = ? WHERE id = (SELECT userId FROM sessionTokens WHERE token = ?)', [apiKey, token], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json({ success: "API Key updated." });
    });
});

//Log out
app.post('/logout', (req, res) => {
    const token = req.query.token;
    db.run('DELETE FROM sessionTokens WHERE token = ?', [token], (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ success: 'Logged out' });
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

async function getAPIKeyFromToken(db, token) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT users.apiKey FROM users INNER JOIN sessionTokens ON users.id = sessionTokens.userId WHERE sessionTokens.token = '${token}'`,(err, row) => {
            if (err) reject(err.message); // I assume this is how an error is thrown with your db callback
            resolve(row.apiKey);
        });
    });
}



//reset convo
app.post('/reset', (req, res) => {
    const token = req.query.token;
    db.run(`UPDATE users SET convo = '' WHERE id = (SELECT userId FROM sessionTokens WHERE token = '${token}')`, (err) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ success: 'Conversation reset' });
    });
});

//return answer to user query
app.post('/ask', async (req, res) => {
    const token = req.query.token;
    const userQuery = req.query.query;
    // Set your OpenAI API Key
    let answer = "";
    let key = await getAPIKeyFromToken(db, token);
    const openAI = new openai({
        //get the apiKey from database using the token
        apiKey: key,
    });// Add the API Key here 'SELECT users.apiKey FROM users WHERE user.token = ?''SELECT users.apiKey FROM users INNER JOIN sessionTokens ON sessionTokens.user_id == users.id WHERE sessionTokens.token = ?'
    try {
        const response = await openAI.completions.create({
                model: "text-davinci-002",
                prompt: `This user has a question related to UC Berkeley's classes. Their query is: ${userQuery}. [Additional context and URLs]`,
                max_tokens: 60,
            });
        answer = response.choices[0].text.trim()
    } catch (error) {
        console.error('Error making OpenAI API request:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    db.get(`SELECT users.convo, users.id FROM users INNER JOIN sessionTokens ON sessionTokens.userId = users.id WHERE sessionTokens.token = '${token}'`,(err, row) => {
        if (err) {
            return res.status(500).json({ error: "cannot update conversation!" });
        }
        if (row) {
        console.log({ row })
        let convo = row.convo || "";
        convo = convo + " Question: " + userQuery + "Answer: " + answer;
        if (convo.length > 30000) {
            convo = convo.substring(convo.length - 10000);
        }
        db.run(`UPDATE users SET convo = ? WHERE id = ?`, [convo, row.id], (err) => {
            if (err) {
                console.error(err.message);
                console.log("cannot update conversation!");
            }
            console.log("conversation updated");
            console.log("user: " + row.id)
            res.json({ answer: "Answer: " + answer });
        });
        } else {
            console.log("no convo found");
        }
    }); 
});

app.listen(3004, () => {
    console.log(`Server is running on port 3004`);
});

