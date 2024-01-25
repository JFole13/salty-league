import express from 'express';
import bodyParser from 'body-parser';
import pkg from 'pg'
import schedule from 'node-schedule';
import { updateRanks, updateWeek, updateYear } from './scoring.js';
const { Client } = pkg;

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'saltydb',
    password: 'b55',
    port: 5432,
  });

client.connect()
.then(() => console.log('Connected to PostgreSQL'))
.catch(err => console.error('Error connecting to PostgreSQL', err));

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/activity', async (req, res) => {
    try {
        const query = 'SELECT * FROM activity';

        const result = await client.query(query);

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting activity: ', error)
    }
});

app.get('/activity/:year', async (req, res) => {
    try {
        const year = req.params.year;
        const query = `SELECT * FROM activity WHERE year = ${year}`;

        const result = await client.query(query);

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting activity: ', error)
    }
});

app.post('/activity', async (req, res) => {
    try {
        const { log, year, icon_path, week } = req.body;

        const query = `INSERT INTO activity (log, year, icon_path, week) VALUES ($1, $2, $3, $4)`;
        const values = [log, year, icon_path, week];
        await client.query(query, values);
        res.json({ log: 'New Activity Posted' });
    } catch (error) {
        console.error ('Error posting activity: ', error);
    }
});

app.put('/update/points', async (req, res) => {
    try {
        const totalPoints = req.body;

        for (let i = 0; i < totalPoints.length; i++) {
            const query = 'UPDATE players SET total_points = total_points + $1 WHERE roster_id = $2';
            const values = [parseInt(totalPoints[i]), i + 1];
            await client.query(query, values);
        }

        res.json({ message: 'Total points updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/update/ranks', async (req, res) => {
    try {
        const ranks = req.body;

        for (let i = 0; i < ranks.length; i++) {
            const query = `UPDATE players SET rank = $1 WHERE roster_id = $2`;
            const values = [parseInt(ranks[i]), i + 1];
            await client.query(query, values);
        }

        res.json({ message: 'Ranks updated successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/players', async (req, res) => {
    try {
        const query = 'SELECT * FROM players';

        const result = await client.query(query);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }
const port = 3000;

app.listen(3000, '192.168.1.121', () => {
  console.log(`Server is running at http://192.168.1.121:3000`);
});

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

const rule = new schedule.RecurrenceRule();
rule.dayOfWeek = 3;
rule.hour = 20;
rule.minute = 13;

updateRanks();
// for (let i = 1; i < 15; i++) {
//     updatePlayers(i);
// }
//updateWeek(1);
updateYear();

//const job = schedule.scheduleJob(rule, updateScoring);