import fetch from 'node-fetch';
import fs from 'fs';

const rawData = fs.readFileSync('./players.json');
const sleeperPlayerData = JSON.parse(rawData);


// Call stack basically looks like 
// updateScoring()
//      => fetch matchup data
//          => saves json copy of the week (exportData())
//          => calls points category to add (add<Category>())
//               => posts log log for category 
//          => fetch update to players total points

// at some point might need to break up scoring methods in different modules
// hard code roster_id = user_id ([1 : 898409328094803])

// put points to add in pointsStorage, index is relative to roster_id
let pointsStorage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const playerNames = [];
const currentYear = 1;
// gonna have to change this once i set up the time stuff
let currentWeek = 1;

export const updateRanks = async () => {
    try {
        const response = await fetch('https://api.sleeper.app/v1/league/995196431700942848/rosters', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        const sortedByRecordData = data.sort((a, b) => {
            if (b.settings.wins !== a.settings.wins) {
                return b.settings.wins - a.settings.wins;
            }
        
            return b.settings.fpts - a.settings.fpts;
        });
        
        let rankArray = [0,0,0,0,0,0,0,0,0,0];
        for (let i = 0; i < sortedByRecordData.length; i++) {
            rankArray[sortedByRecordData[i].roster_id - 1] = (i + 1);
        }

        fetch(`http://192.168.1.121:3000/update/ranks`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rankArray)
        })
        .then(response => response.json())
        .then(data => {
            //console.log(data)
        })
        .catch(error => {
            console.error('Error getting matchups:', error);
        })
        
    } catch (error) {
        console.log('Error getting players: ', error);
    }
}


export const updateWeek = async (week) => {
    try {
        const response = await fetch('http://192.168.1.121:3000/players', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        const playersData = data.sort((a, b) => a.roster_id - b.roster_id);

        for (let i = 0; i < playersData.length; i++) {
            playerNames.push(playersData[i].team_name);
        }

        updateScoring(playersData, week);
    } catch (error) {
        console.log('Error getting players: ', error);
    }
}

export const updateYear = () => {
    fetch('https://api.sleeper.app/v1/league/995196431700942848/rosters', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        addUndefeatedPoints(data);
    })
    .catch(error => {
        console.error('Error getting year stats:', error);
    })
}

export const updateScoring = (playersData, week) => {
    fetch(`https://api.sleeper.app/v1/league/995196431700942848/matchups/${week}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        exportData(data);
        addHighestScorerPoints(data);
        addHighestPlayerPoints(data);
        addBlowoutPoints(data, week);
        addHighestPointsInLossPoints(data);
        addTopGuyTakedownPoints(data, playersData);
        addRivalPoints(data, playersData);
        addUpsetPoints(data, playersData);
        addMedianPoints(data);
        addWinWeekPoints(data);
        addUndefeatedPoints(playersData);

        currentWeek++;

        //addEffecientManagerPoints(data);
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

const addBlowoutPoints = (data, week) => {
    const plusPoints = 2;

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points});
    }

    let biggestBlowout = 0;
    let biggestBlowoutTeam;

   

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;

        if(Math.abs(team1.points - team2.points) > biggestBlowout) {
            biggestBlowout = Math.abs(team1.points - team2.points);
            if (team1.points > team2.points) {
                biggestBlowoutTeam = team1.roster_id;
            } else {
                biggestBlowoutTeam = team2.roster_id;
            }
        }
    });

    pointsStorage[biggestBlowoutTeam - 1] = plusPoints;
    let log = `${playerNames[biggestBlowoutTeam - 1]} had the biggest blowout win (+2)`;

    updateActivity(log, 'nuclear-explosion.png');
    updateTotalPoints();
}

const addHighestPlayerPoints = (data) => {
    const plusPoints = 3;

    let highestScorer = 0;
    let teamWithHighestScorer = 1;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].starters_points.length; j++) {
            let currentTeam = data[i].starters_points;
            if (currentTeam[j] > highestScorer) {
                highestScorer = currentTeam[j];
                teamWithHighestScorer = data[i].roster_id;
            }
        }
    }

    pointsStorage[teamWithHighestScorer - 1] = plusPoints;
    let log = `${playerNames[teamWithHighestScorer - 1]} had the highest scoring player (+3)`;
    updateActivity(log, 'favorites.png');
    updateTotalPoints();
}

const addHighestPointsInLossPoints = (data) => {
    const plusPoints = 2;

    const matchups = [[],[],[],[],[]];

    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points});
    }

    let highestLosingPoints = 0;
    let highestLosingPointsTeam;

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;

        if(team1.points > team2.points) {
            if(team2.points > highestLosingPoints) {
                highestLosingPoints = team2.points;
                highestLosingPointsTeam = team2.roster_id;
            }
        } else if (team1.points < team2.points) {
            if(team1.points > highestLosingPoints) {
                highestLosingPoints = team1.points;
                highestLosingPointsTeam = team1.roster_id;
            }
        } else {

        }
    });

    pointsStorage[highestLosingPointsTeam - 1] = plusPoints;
    let log = `${playerNames[highestLosingPointsTeam - 1]} had the highest points in a loss (+2)`;

    updateActivity(log, 'broken-heart.png');
    updateTotalPoints();
}

const addHighestScorerPoints = (data) => {
    const plusPoints = 5;
    const noPoints = 0;

    const sortedData = data.sort((a, b) => b.points - a.points);

    for (let i = 0; i < sortedData.length; i++) {
        if (i == 0) {
            pointsStorage[sortedData[i].roster_id - 1] = plusPoints;
            let log = `${playerNames[sortedData[i].roster_id - 1]} was the highest scorer (+5)`;
            updateActivity(log, 'number-one.png');
        } else {
            pointsStorage[sortedData[i].roster_id - 1] = noPoints;
        }
    }

    updateTotalPoints();
}

const addMedianPoints = (data) => {
    const plusPoints = 3;
    const noPoints = 0;

    const sortedData = data.sort((a, b) => b.points - a.points);

    for (let i = 0; i < sortedData.length; i++) {
        if (i < 5) {
            pointsStorage[sortedData[i].roster_id - 1] = plusPoints;
            let log = `${playerNames[sortedData[i].roster_id - 1]} scored above the median (+3)`;
            updateActivity(log, 'average.png');
        } else {
            pointsStorage[sortedData[i].roster_id - 1] = noPoints;
        }
    }

    updateTotalPoints();
}

const addRivalPoints = (data, playersData) => {
    const plusPoints = 5;

    const rosterIdsOrder = data.map(entry => entry.roster_id);
    playersData.sort((a, b) => {
        return rosterIdsOrder.indexOf(a.roster_id) - rosterIdsOrder.indexOf(b.roster_id);
    });

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;

        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points, 'rank': playersData[i].rank, 'rival_id': playersData[i].rival_id});
    }

    let log;

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;
        
        if (team1.rival_id == team2.roster_id || team2.rival_id == team1.roster_id) {
            if (team1.points > team2.points) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                log = `${playerNames[team1.roster_id - 1]} beat their rival (+5)`;
                updateActivity(log, 'rival.png');
            } else if (team1.points < team2.points) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} beat their rival (+5)`;
                updateActivity(log, 'rival.png');
            } else {
              // figure out tie
            }
        }

    });

    updateTotalPoints();
}

const addTopGuyTakedownPoints = (data, playersData) => {
    const plusPoints = 3;
    const noPoints = 0;

    const rosterIdsOrder = data.map(entry => entry.roster_id);
    playersData.sort((a, b) => {
        return rosterIdsOrder.indexOf(a.roster_id) - rosterIdsOrder.indexOf(b.roster_id);
    });

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;

        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points, 'rank': playersData[i].rank});
    }

    let log;

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;
        
        if (team1.rank == 1 || team2.rank == 1) {
            if(team1.rank == 1 && team2.points > team1.points) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} took down the #1 player (+3)`;
                updateActivity(log, 'checkmate.png');
            }

            if(team2.rank == 1 && team1.points > team2.points) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                log = `${playerNames[team1.roster_id - 1]} took down the #1 player (+3)`;
                updateActivity(log, 'checkmate.png');
            }
        }
    });

    updateTotalPoints();

}

const addUndefeatedPoints = (data) => {
    const plusPoints = 25;

    for (let i = 0; i < data.length; i++) {
        if (data[i].settings.losses == 0) {
            pointsStorage[data[i].roster_id - 1] = plusPoints;
            log = `${playerNames[data[i].roster_id - 1]} went UNDEFEATED (+25)`;
            updateActivity(log, 'diamond.png');
        }
    }

    updateTotalPoints();
}

const addUpsetPoints = (data, playersData) => {
    const plusPoints = 2;
    const noPoints = 0;

    const rosterIdsOrder = data.map(entry => entry.roster_id);
    playersData.sort((a, b) => {
        return rosterIdsOrder.indexOf(a.roster_id) - rosterIdsOrder.indexOf(b.roster_id);
    });

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;

        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points, 'rank': playersData[i].rank});
    }

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;
        let log;
        
        if (team1.points > team2.points) {
            if(team1.rank > team2.rank) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                pointsStorage[team2.roster_id - 1] = noPoints;
                log = `${playerNames[team1.roster_id - 1]} upset their opponent (+2)`;
                updateActivity(log, 'danger.png');
            }
        } else if (team1.points < team2.points) {
            if(team1.rank < team2.rank) {
                pointsStorage[team1.roster_id - 1] = noPoints;
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} upset their opponent (+2)`;
                updateActivity(log, 'danger.png');
            }
        } else {
          // figure out tie
        }
    });

    updateTotalPoints();

}

const addWinWeekPoints = (data) => {
    const plusPoints = 5;
    const noPoints = 0;

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points});
    }

    matchups.forEach(matchup => {
        const [team1, team2] = matchup;
        let log;
        
        if (team1.points > team2.points) {
            pointsStorage[team1.roster_id - 1] = plusPoints;
            pointsStorage[team2.roster_id - 1] = noPoints;
            log = `${playerNames[team1.roster_id - 1]} won their week (+5)`;

        } else if (team1.points < team2.points) {
            pointsStorage[team1.roster_id - 1] = noPoints;
            pointsStorage[team2.roster_id - 1] = plusPoints;
            log = `${playerNames[team2.roster_id - 1]} won their week (+5)`;

        } else {
          // figure out tie
        }

        updateActivity(log, 'trophy.png');
    });

    updateTotalPoints();
}

const updateActivity = (log, iconPath) => {
    fetch('http://192.168.1.121:3000/activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ log: log, year: currentYear, icon_path: iconPath, week: currentWeek }),
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data);
    })
    .catch(error => {
        console.error('Error posting log: ', error);
    })
}

const updateTotalPoints = () => {
    fetch('http://192.168.1.121:3000/update/points', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pointsStorage)
        })

    pointsStorage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}