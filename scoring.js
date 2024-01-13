import fetch from 'node-fetch';
import fs from 'fs';

// Call stack basically looks like 
// updateScoring()
//      => fetch matchup data
//          => saves json copy of the week
//          => calls points category to add
//               => posts activity message for category
//          => fetch update to players total points



// hard code roster_id = user_id ([1 : 898409328094803])

const pointsStorage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export const updateScoring = () => {

    fetch(`https://api.sleeper.app/v1/league/995196431700942848/matchups/1`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        exportData(data);
        addWinWeekPoints(data);
        return fetch('http://192.168.1.121:3000/update/points', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pointsStorage)
    })
    .then (response => response.json())
    })
    .catch(error => {
        console.error('Error getting matchups:', error);
    })
}

const exportData = (data) => {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFile('week1.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Week Saved');
            }
        });
    } catch (error) {
        console.error('Error converting data to JSON:', error);
    }
}

const addWinWeekPoints = (data) => {
    const matchups = [[],[],[],[],[]];
    const points = 5;

    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points});
    }

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;
        let message;
        
        if (team1.points > team2.points) {
            pointsStorage[team1.roster_id - 1] = 5;
            pointsStorage[team2.roster_id - 1] = 0;
            message = `Team ${team1.roster_id} won their week (+5)`;

        } else if (team1.points < team2.points) {
            pointsStorage[team1.roster_id - 1] = 0;
            pointsStorage[team2.roster_id - 1] = 5;
            message = `Team ${team2.roster_id} won their week (+5)`;

        } else {
          // figure out tie
        }

        fetch('http://192.168.1.121:3000/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch(error => {
            console.error('Error posting activity2: ', error);
        })
    });
}