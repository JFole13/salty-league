import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 8000;
// }
const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})