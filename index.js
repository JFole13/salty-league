import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import pkg from 'pg'

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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let userData;

// fetch(`https://api.sleeper.app/v1/league/995196431700942848/users`, {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json'
//     },
// })
// .then(response => response.json())
// .then(data => {
//     userData = data;
// })
// .catch(error => {
//     console.error('Error getting users:', error);
// })

// app.put('/update/players', async (req, res) => {
//     try {
  
//       const { id, title, image_url_1, image_url_2, collection_id } = req.body;
  
//       const query = `UPDATE carousel_links
//                      SET title = $2, image_url_1 = $3, image_url_2 = $4, collection_id = $5 WHERE
//                      id = $1`;
  
//       const values = [ id, title, image_url_1, image_url_2, collection_id];
//       const result = await client.query(query, values);
  
//       res.json(result.rows);
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

app.get('/rankings', async (req, res) => {
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