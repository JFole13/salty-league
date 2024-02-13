import bodyParser from 'body-parser';
import express from 'express';
import fs from 'fs';
import pkg from 'pg'

import { updateLoserBracketPlacements, updateRanks, updateWeekScoring, updateWinnerBracketPlacements, updateYearScoring } from './scoring.js';
const { Client } = pkg;

const year1Data = fs.readFileSync('./year1Test.json');

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
        const query = `SELECT * FROM activity WHERE year = $1`;

        const values = [year];
        const result = await client.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting activity: ', error)
    }
});

app.get('/activity/player/:id/:year', async (req, res) => {
    try {
        const id = req.params.id;
        const year = req.params.year;
        const query = `SELECT * FROM activity WHERE user_id = $1 AND year = $2`;

        const values = [id, year];
        const result = await client.query(query, values);

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting activity: ', error);
        res.status(500).send('Server error');
    }
});

app.get('/players/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const query = 'SELECT user_id FROM players WHERE team_name = $1';
        
        const values = [name];
        const result = await client.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/activity', async (req, res) => {
    try {
        const { log, year, icon_path, week, user_id } = req.body;

        const query = `INSERT INTO activity (log, year, icon_path, week, user_id) VALUES ($1, $2, $3, $4, $5)`;

        const values = [log, year, icon_path, week, user_id];

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

app.listen(3000, '192.168.1.121', () => {
  console.log(`Server is running at http://192.168.1.121:3000`);
});

// const port = 3000;
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

let currentWeek = 1;

const updateSalty = async () => {
    await updateRanks();

    for (let i = 1; i < 15; i++) {
        await updateWeekScoring(i);
    }

    await updateWinnerBracketPlacements();
    await updateLoserBracketPlacements();
    await updateYearScoring();
}

const tenYearSimulation = async () => {
    for(let i = 0; i < 1; i++) {
        updateRanks();

        (async () => {
            for (let i = 1; i < 15; i++) {
                await updateWeekScoring(i);
            }
            await updateWinnerBracketPlacements();
            await updateLoserBracketPlacements();
            await updateYearScoring();
        })();
    }
}

updateSalty();
//tenYearSimulation();

// CRON string reads 'on Tuesdays (2) at 12:00 (0, 12) on any day of the month (first *) and any month (second *)'
// const job = schedule.scheduleJob('0 12 * * 2', updateSalty);