import fetch from 'node-fetch';
import fs from 'fs';
import { match } from 'assert';

// call this every tuesday at noon
// matchup id, roster id and the points
// compare them somehow

// add salty points to winner 
// i think i want to do a global array or something to store all points that are tallied up. so all scoring 
// categories will be tallied up and then the first fetch promise will be finished, and then call another one
// to update the players totalPoints in SQL

// add to recent activity
// save json at som point


// [[{roster_id: 1, points: 30}, {roster_id: 2, points: 40}],[]]

// hard code roster_id = user_id ([1 : 898409328094803])


export const updateScoring = () => {

    fetch(`https://api.sleeper.app/v1/league/995196431700942848/matchups/1`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    })
    .then(response => response.json())
    .then(data => {
        addWinWeekPoints(data);
    })
    .catch(error => {
        console.error('Error getting users:', error);
    })
}

const addWinWeekPoints = (data) => {
    const matchups = [[],[],[],[],[]];

    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points});
    }

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;
        console.log(`Team ${team1.roster_id} points: ${team1.points}`);
        console.log(`Team ${team2.roster_id} points: ${team2.points}`);
    
        if (team1.points > team2.points) {
          console.log(`Team ${team1.roster_id} has more points than Team ${team2.roster_id}`);
        } else if (team1.points < team2.points) {
          console.log(`Team ${team2.roster_id} has more points than Team ${team1.roster_id}`);
        } else {
          console.log(`Both teams have the same points`);
        }
      });
}