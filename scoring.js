import fetch from 'node-fetch';
import fs from 'fs';

const rawData = fs.readFileSync('./players.json');
const sleeperPlayerData = JSON.parse(rawData);

const unData = fs.readFileSync('./undefeated-test.json');
const undefeatedData = JSON.parse(unData);


// Call stack for scoring basically looks like 
// updateWeekScoring()
//      => fetch matchup data
//          => saves json copy of the week (exportData())
//          => calls points category to add (add<Category>())
//               => posts log log for category 
//          => fetch update to players total points

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


// export const updateWeek = async (week) => {
//     try {
//         const response = await fetch('http://192.168.1.121:3000/players', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//         });

//         const data = await response.json();

//         const playersData = data.sort((a, b) => a.roster_id - b.roster_id);

//         for (let i = 0; i < playersData.length; i++) {
//             playerNames.push(playersData[i].team_name);
//         }

//         updateWeekScoring(playersData, week);

//     } catch (error) {
//         console.log('Error getting players: ', error);
//     }
// }

// export const updateWeek = (week) => {

//      fetch(`http://192.168.1.121:3000/players`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//     })
//     .then(response => response.json())
//     .then(data => {
//         const playersData = data.sort((a, b) => a.roster_id - b.roster_id);

//         for (let i = 0; i < playersData.length; i++) {
//             playerNames.push(playersData[i].team_name);
//         }

//         updateWeekScoring(playersData, week);
//     })
//     .catch(error => {
//         console.error('Error getting year stats:', error);
//     })
// }

export const updateYear = async () => {
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

        updateYearScoring(playersData);
    } catch (error) {
        console.log('Error getting players: ', error);
    }
}

export const updateWinnerBracketPlacements = async (data) => {

    // quick fix
    let playersData = await getPlayerData();

    const sleeperUrl = 'https://api.sleeper.app/v1/league/995196431700942848/winners_bracket';
    fetch(sleeperUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        addWinnerBracketPlacementsPoints(data, playersData);
    })
    .catch(error => {
        console.error('Error getting year stats:', error);
    })
    //addWinnerBracketPlacementsPointsTest(data);
}

export const updateLoserBracketPlacements = async (data) => {
    let playersData = await getPlayerData();

    const sleeperUrl = 'https://api.sleeper.app/v1/league/995196431700942848/losers_bracket';
    fetch(sleeperUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        addLoserBracketPlacementsPoints(data, playersData);
    })
    .catch(error => {
        console.error('Error getting year stats:', error);
    })
    //addLoserBracketPlacementsPointsTest(data);
}

export const updateWeekScoring = async (week) => {
    const playersData = await getPlayerData();
    const matchupsData = await getMatchupsData(week);
        
    exportData(matchupsData);
    addHighestScorerPoints(matchupsData, playersData, week);
    currentWeek++;
};

const updateYearScoring = (playersData) => {
    fetch('https://api.sleeper.app/v1/league/995196431700942848/rosters', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(data => {
        addUndefeatedPoints(data, playersData);
        addLongestStreakPoints(data, playersData);
        addMostPointsForPoints(data, playersData);
        addMostPointsAgainstPoints(data, playersData);
    })
    .catch(error => {
        console.error('Error updating year stats:', error);
    })
}

const exportData = (data) => {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFile('week1.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                //console.log('Week Saved');
            }
        });
    } catch (error) {
        console.error('Error converting data to JSON:', error);
    }
}

const addBlowoutPoints = async (data, playersData) => {
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
    let userID = playersData[biggestBlowoutTeam - 1].user_id;
    await updateActivity(log, 'nuclear-explosion.png', userID);
    await updateTotalPoints();
}

const addHighestPlayerPoints = async (data, playersData) => {
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
    let userID = playersData[teamWithHighestScorer - 1].user_id;
    await updateActivity(log, 'favorites.png', userID);
    await updateTotalPoints();
}

const addHighestPointsInLossPoints = async (data, playersData) => {
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
    let userID = playersData[highestLosingPointsTeam - 1].user_id;
    await updateActivity(log, 'broken-heart.png', userID);
    await updateTotalPoints();
}

const addHighestScorerPoints = async (matchupsData, playersData) => {
    const plusPoints = 5;

    const sortedData = matchupsData.sort((a, b) => b.points - a.points);

    pointsStorage[sortedData[0].roster_id - 1] = plusPoints;
    let log = `${playerNames[sortedData[0].roster_id - 1]} was the highest scorer (+5)`;
    let userID = playersData[sortedData[0].roster_id - 1].user_id;
    await updateActivity(log, 'number-one.png', userID);
    await updateTotalPoints();
}

const addLongestStreakPoints = async (data, playersData) => {
    const plusPoints = 15;
    
    let longestStreak = 0;
    let currentStreak = 0;
    let longestStreakTeams = [];

    for (let i = 0; i < data.length; i++) {
        currentStreak = 0; // Reset currentStreak for each team

        for (let j = 0; j < data[i].metadata.record.length; j++) {
            if (data[i].metadata.record[j] === 'W') {
                currentStreak++;
            } else {
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    longestStreakTeams = [data[i].roster_id];
                } else if (currentStreak === longestStreak) {
                    longestStreakTeams.push(data[i].roster_id);
                }
                currentStreak = 0; // Reset streak as it's broken
            }
        }

        // Check at the end of the record in case the record ends with a winning streak
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStreakTeams = [data[i].roster_id];
        } else if (currentStreak === longestStreak) {
            longestStreakTeams.push(data[i].roster_id);
        }
    }

    for (let i = 0; i < longestStreakTeams.length; i++) {
        let log = `${playerNames[longestStreakTeams[i] - 1]} had the longest winning streak (+15)`;
        let userID = playersData[longestStreakTeams[i] - 1].user_id;
        await updateActivity(log, 'fire-flame.png', userID);
        pointsStorage[longestStreakTeams[i] - 1] = plusPoints;
    }

    await updateTotalPoints();
}

const addLoserBracketPlacementsPoints = async (data, playersData) => {
    const seventhPlacePoints = 21;
    const eighthPlacePoints = 18;
    const ninthPlacePoints = 15;
    const tenthPlacePoints = 13;

    const seventhPlaceTeam = data[3].l;
    const eighthPlaceTeam = data[3].w;
    const ninthPlaceTeam = data[2].l;
    const tenthPlaceTeam = data[2].w;

    let log = `${playerNames[seventhPlaceTeam - 1]} finished in seventh place (+21)`;
    let userID = playersData[seventhPlaceTeam - 1].user_id;
    await updateActivity(log, 'loser.png', userID);
    log = `${playerNames[eighthPlaceTeam - 1]} finished in eighth place (+18)`;
    userID = playersData[eighthPlaceTeam - 1].user_id;
    await updateActivity(log, 'dead-fish.png', userID);
    log = `${playerNames[ninthPlaceTeam - 1]} finished in ninth place (+15)`;
    userID = playersData[ninthPlaceTeam - 1].user_id;
    await updateActivity(log, 'trash-can.png', userID);
    log = `${playerNames[tenthPlaceTeam - 1]} finished in tenth place (+13)`;
    userID = playersData[tenthPlaceTeam - 1].user_id;
    await updateActivity(log, 'poop.png', userID);

    pointsStorage[seventhPlaceTeam - 1] = seventhPlacePoints;
    pointsStorage[eighthPlaceTeam - 1] = eighthPlacePoints;
    pointsStorage[ninthPlaceTeam - 1] = ninthPlacePoints;
    pointsStorage[tenthPlaceTeam - 1] = tenthPlacePoints;

    await updateTotalPoints();
}

const addLoserBracketPlacementsPointsTest = (data, playersData) => {
    const seventhPlacePoints = 21;
    const eighthPlacePoints = 18;
    const ninthPlacePoints = 15;
    const tenthPlacePoints = 13;

    const seventhPlaceTeam = data[3].seventhPlace;
    const eighthPlaceTeam = data[3].eighthPlace;
    const ninthPlaceTeam = data[2].ninthPlace;
    const tenthPlaceTeam = data[2].tenthPlace;

    let log = `${playerNames[seventhPlaceTeam - 1]} finished in seventh place (+21)`;
    let userID = playersData[seventhPlaceTeam - 1].user_id;
    updateActivity(log, 'loser.png', userID);
    log = `${playerNames[eighthPlaceTeam - 1]} finished in eighth place (+18)`;
    userID = playersData[eighthPlaceTeam - 1].user_id;
    updateActivity(log, 'dead-fish.png', userID);
    log = `${playerNames[ninthPlaceTeam - 1]} finished in ninth place (+15)`;
    userID = playersData[ninthPlaceTeam - 1].user_id;
    updateActivity(log, 'trash-can.png', userID);
    log = `${playerNames[tenthPlaceTeam - 1]} finished in tenth place (+13)`;
    userID = playersData[tenthPlaceTeam - 1].user_id;
    updateActivity(log, 'poop.png', userID);

    pointsStorage[seventhPlaceTeam - 1] = seventhPlacePoints;
    pointsStorage[eighthPlaceTeam - 1] = eighthPlacePoints;
    pointsStorage[ninthPlaceTeam - 1] = ninthPlacePoints;
    pointsStorage[tenthPlaceTeam - 1] = tenthPlacePoints;

    updateTotalPoints();
}

const addMedianPoints = async (data, playersData) => {
    const plusPoints = 3;
    const noPoints = 0;

    const sortedData = data.sort((a, b) => b.points - a.points);

    for (let i = 0; i < sortedData.length; i++) {
        if (i < 5) {
            pointsStorage[sortedData[i].roster_id - 1] = plusPoints;
            let log = `${playerNames[sortedData[i].roster_id - 1]} scored above the median (+3)`;
            let userID = playersData[sortedData[i].roster_id - 1].user_id;
            await updateActivity(log, 'average.png', userID);
        } else {
            pointsStorage[sortedData[i].roster_id - 1] = noPoints;
        }
    }

    await updateTotalPoints();
}

const addMostPointsAgainstPoints = async (data, playersData) => {
    const plusPoints = 10;

    let leastPoints = 0;
    let leastPointsTeam;

    for (let i = 0; i < data.length; i++) {
        if (data[i].settings.fpts_against > leastPoints) {
            leastPoints = data[i].settings.fpts_against;
            leastPointsTeam = data[i].roster_id;
        }
    }

    let log = `${playerNames[leastPointsTeam - 1]} had the most points against this season (+10)`;
    let userID = playersData[leastPointsTeam - 1].user_id;
    await updateActivity(log, 'black-cat.png');

    pointsStorage[leastPointsTeam - 1] = plusPoints;
    await updateTotalPoints();
}

const addMostPointsForPoints = async (data, playersData) => {
    const plusPoints = 25;

    let mostPoints = 0;
    let mostPointsTeam;

    for (let i = 0; i < data.length; i++) {
        if (data[i].settings.fpts > mostPoints) {
            mostPoints = data[i].settings.fpts;
            mostPointsTeam = data[i].roster_id;
        }
    }

    let log = `${playerNames[mostPointsTeam - 1]} scored the most points this season (+25)`;
    let userID = playersData[mostPointsTeam - 1].user_id;
    await updateActivity(log, 'money-bag.png', userID);
    
    pointsStorage[mostPointsTeam - 1] = plusPoints;
    await updateTotalPoints();
}



const addRivalPoints = async (data, playersData) => {
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
    let userID;

    for (const matchup of matchups) {
        const [team1, team2] = matchup;
        
        if (team1.rival_id == team2.roster_id || team2.rival_id == team1.roster_id) {
            if (team1.points > team2.points) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                log = `${playerNames[team1.roster_id - 1]} beat their rival (+5)`;
                userID = playersData[team1.roster_id - 1].user_id;
                await updateActivity(log, 'rival.png', userID);
            } else if (team1.points < team2.points) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} beat their rival (+5)`;
                userID = playersData[team2.roster_id - 1].user_id;
                await updateActivity(log, 'rival.png', userID);
            } else {
              // Handle tie scenario
            }
        }
    }

    await updateTotalPoints();
}

const addTopGuyTakedownPoints = async (data, playersData) => {
    const plusPoints = 3;

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
    let userID;

    for (const matchup of matchups) {
        const [team1, team2] = matchup;
        
        if (team1.rank == 1 || team2.rank == 1) {
            if(team1.rank == 1 && team2.points > team1.points) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} took down the #1 player (+3)`;
                userID = playersData[team2.roster_id - 1].user_id;
                await updateActivity(log, 'checkmate.png', userID);
            }
    
            if(team2.rank == 1 && team1.points > team2.points) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                log = `${playerNames[team1.roster_id - 1]} took down the #1 player (+3)`;
                userID = playersData[team1.roster_id - 1].user_id;
                await updateActivity(log, 'checkmate.png', userID);
            }
        }
    }

    await updateTotalPoints();
}

const addUndefeatedPoints = async (data, playersData) => {
    const plusPoints = 30;

    for (let i = 0; i < data.length; i++) {
        if (data[i].settings.losses == 0) {
            pointsStorage[data[i].roster_id - 1] = plusPoints;
            let log = `${playerNames[data[i].roster_id - 1]} went UNDEFEATED (+30)`;
            let userID = playersData[data[i].roster_id - 1].user_id;
            await updateActivity(log, 'diamond.png', userID);
        }
    }

    await updateTotalPoints();
}

const addUpsetPoints = async (data, playersData) => {
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

    let log;
    let userID;

    for (const matchup of matchups) {
        const [team1, team2] = matchup;

        if (team1.points > team2.points) {
            if(team1.rank > team2.rank) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                log = `${playerNames[team1.roster_id - 1]} upset their opponent (+2)`;
                userID = playersData[team1.roster_id - 1].user_id;
                await updateActivity(log, 'danger.png', userID);
            }
        } else if (team1.points < team2.points) {
            if(team2.rank > team1.rank) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} upset their opponent (+2)`;
                userID = playersData[team2.roster_id - 1].user_id;
                await updateActivity(log, 'danger.png', userID);
            }
        } else {
          // figure out tie
        }
    }

    await updateTotalPoints();

}

const addWinnerBracketPlacementsPoints = async (data, playersData) => {
    const firstPlacePoints = 100;
    const secondPlacePoints = 70;
    const thirdPlacePoints = 50;
    const fourthPlacePoints = 30;
    const fifthPlacePoints = 27;
    const sixthPlacePoints = 24;

    const firstPlaceTeam = data[5].w;
    const secondPlaceTeam = data[5].l;
    const thirdPlaceTeam = data[6].w;
    const fourthPlaceTeam = data[6].l;
    const fifthPlaceTeam = data[4].w;
    const sixthPlaceTeam = data[4].l;

    let log = `${playerNames[firstPlaceTeam - 1]} finished in first place (+100)`;
    let userID = playersData[firstPlaceTeam - 1].user_id;
    await updateActivity(log, 'crown.png', userID);
    log = `${playerNames[secondPlaceTeam - 1]} finished in second place (+70)`;
    userID = playersData[secondPlaceTeam - 1].user_id;
    await updateActivity(log, 'second-prize.png', userID);
    log = `${playerNames[thirdPlaceTeam - 1]} finished in third place (+50)`;
    userID = playersData[thirdPlaceTeam - 1].user_id;
    await updateActivity(log, 'third-prize.png', userID);
    log = `${playerNames[fourthPlaceTeam - 1]} finished in fourth place (+30)`;
    userID = playersData[fourthPlaceTeam - 1].user_id;
    await updateActivity(log, 'thumb-up.png', userID);
    log = `${playerNames[fifthPlaceTeam - 1]} finished in fifth place (+27)`;
    userID = playersData[fifthPlaceTeam - 1].user_id;
    await updateActivity(log, 'mid.png', userID);
    log = `${playerNames[sixthPlaceTeam - 1]} finished in sixth place (+24)`;
    userID = playersData[sixthPlaceTeam - 1].user_id;
    await updateActivity(log, 'open-mouth.png', userID);

    pointsStorage[firstPlaceTeam - 1] = firstPlacePoints;
    pointsStorage[secondPlaceTeam - 1] = secondPlacePoints;
    pointsStorage[thirdPlaceTeam - 1] = thirdPlacePoints;
    pointsStorage[fourthPlaceTeam - 1] = fourthPlacePoints;
    pointsStorage[fifthPlaceTeam - 1] = fifthPlacePoints;
    pointsStorage[sixthPlaceTeam - 1] = sixthPlacePoints;

    await updateTotalPoints();
}

const addWinnerBracketPlacementsPointsTest = (data) => {
    const firstPlacePoints = 100;
    const secondPlacePoints = 70;
    const thirdPlacePoints = 50;
    const fourthPlacePoints = 30;
    const fifthPlacePoints = 27;
    const sixthPlacePoints = 24;

    const firstPlaceTeam = data[5].firstPlace;
    const secondPlaceTeam = data[5].secondPlace;
    const thirdPlaceTeam = data[6].thirdPlace;
    const fourthPlaceTeam = data[6].fourthPlace;
    const fifthPlaceTeam = data[4].fifthPlace;
    const sixthPlaceTeam = data[4].sixthPlace;

    let log = `${playerNames[firstPlaceTeam - 1]} finished in first place (+100)`;
    updateActivity(log, 'crown.png');
    log = `${playerNames[secondPlaceTeam - 1]} finished in second place (+70)`;
    updateActivity(log, 'second-prize.png');
    log = `${playerNames[thirdPlaceTeam - 1]} finished in third place (+50)`;
    updateActivity(log, 'third-prize.png');
    log = `${playerNames[fourthPlaceTeam - 1]} finished in fourth place (+30)`;
    updateActivity(log, 'thumb-up.png');
    log = `${playerNames[fifthPlaceTeam - 1]} finished in fifth place (+27)`;
    updateActivity(log, 'mid.png');
    log = `${playerNames[sixthPlaceTeam - 1]} finished in sixth place (+24)`;
    updateActivity(log, 'open-mouth.png');

    pointsStorage[firstPlaceTeam - 1] = firstPlacePoints;
    pointsStorage[secondPlaceTeam - 1] = secondPlacePoints;
    pointsStorage[thirdPlaceTeam - 1] = thirdPlacePoints;
    pointsStorage[fourthPlaceTeam - 1] = fourthPlacePoints;
    pointsStorage[fifthPlaceTeam - 1] = fifthPlacePoints;
    pointsStorage[sixthPlaceTeam - 1] = sixthPlacePoints;

    updateTotalPoints();
}

const addWinWeekPoints = async (data, playersData) => {
    const plusPoints = 5;

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < data.length; i++) {
        let matchupIndex = data[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': data[i].roster_id, 'points': data[i].points});
    }

    for (const matchup of matchups) {
        const [team1, team2] = matchup;
        let log;
        let userID;
        
        if (team1.points > team2.points) {
            pointsStorage[team1.roster_id - 1] = plusPoints;
            log = `${playerNames[team1.roster_id - 1]} won their week (+5)`;
            userID = playersData[team1.roster_id - 1].user_id;
        } else if (team1.points < team2.points) {
            pointsStorage[team2.roster_id - 1] = plusPoints;
            log = `${playerNames[team2.roster_id - 1]} won their week (+5)`;
            userID = playersData[team2.roster_id - 1].user_id;
        } else {
            // Handle tie scenario
        }

        await updateActivity(log, 'trophy.png', userID);
    }

    await updateTotalPoints();
}

const updateActivity = async (log, iconPath, userID) => {
    try {
        const response = await fetch('http://192.168.1.121:3000/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ log: log, year: currentYear, icon_path: iconPath, week: currentWeek, user_id: userID }),
        });
        const data = await response.json();
        //console.log(data);
    } catch (error) {
        console.error('Error posting log: ', error);
    }
}

const updateTotalPoints = async () => {
    try {
        await fetch('http://192.168.1.121:3000/update/points', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pointsStorage)
        });
        // Reset pointsStorage after ensuring the fetch operation has completed
        pointsStorage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    } catch (error) {
        console.error('Error updating points: ', error);
    }
}

const getPlayerData = async () => {
    try {
        const response = await fetch('http://192.168.1.121:3000/players', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return await response.json();
    } catch (error) {
        console.log('Error getting players: ', error);
    }
};

const getMatchupsData = async (week) => {
    try {
        const response = await fetch(`https://api.sleeper.app/v1/league/995196431700942848/matchups/${week}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return await response.json();
    } catch (error) {
        console.error('Error getting week scoring:', error);
    }
}

