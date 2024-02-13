import fetch from 'node-fetch';
import fs from 'fs';

const rawData = fs.readFileSync('./players.json');
const sleeperPlayerData = JSON.parse(rawData);

const unData = fs.readFileSync('./undefeated-test.json');
const undefeatedData = JSON.parse(unData);

// put points to add in pointsStorage, index - 1 is relative to roster_id
let pointsStorage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const playerNames = [];
const currentYear = 1;
// gonna have to change this once i set up the time stuff
let currentWeek = 1;
const finalWeek = 15;

export const updateWeekScoring = async (week) => {
    let playersData = await getPlayersData();
    const matchupsData = await getMatchupsData(week);
        
    exportData(matchupsData);

    // order of these correspond to how they show on the site
    await addHighestScorerPoints(matchupsData, playersData);
    await addHighestPlayerPoints(matchupsData, playersData);
    await addBlowoutPoints(matchupsData, playersData);
    await addHighestPointsInLossPoints(matchupsData, playersData);
    await addRivalPoints(matchupsData, playersData);
    await addTopGuyTakedownPoints(matchupsData, playersData);
    await addUpsetPoints(matchupsData, playersData);
    await addMedianPoints(matchupsData, playersData);
    await addWinWeekPoints(matchupsData, playersData);
    currentWeek++;
};

export const updateYearScoring = async () => {
    const playersData = await getPlayersData();
    const rostersData = await getRostersData();

    await addUndefeatedPoints(rostersData, playersData);
    await addLongestStreakPoints(rostersData, playersData);
    await addMostPointsForPoints(rostersData, playersData);
    await addMostPointsAgainstPoints(rostersData, playersData);
};

export const updateWinnerBracketPlacements = async () => {
    let playersData = await getPlayersData();

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
}

export const updateLoserBracketPlacements = async () => {
    let playersData = await getPlayersData();

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
};

const addBlowoutPoints = async (matchupsData, playersData) => {
    const plusPoints = 2;

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < matchupsData.length; i++) {
        let matchupIndex = matchupsData[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': matchupsData[i].roster_id, 'points': matchupsData[i].points});
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
    await updateActivity(log, 'nuclear-explosion.png', currentWeek, userID);
    await updateTotalPoints();
};

const addHighestPlayerPoints = async (matchupsData, playersData) => {
    const plusPoints = 3;

    let highestScorer = 0;
    let teamWithHighestScorer = 1;
    for (let i = 0; i < matchupsData.length; i++) {
        for (let j = 0; j < matchupsData[i].starters_points.length; j++) {
            let currentTeam = matchupsData[i].starters_points;
            if (currentTeam[j] > highestScorer) {
                highestScorer = currentTeam[j];
                teamWithHighestScorer = matchupsData[i].roster_id;
            }
        }
    }

    pointsStorage[teamWithHighestScorer - 1] = plusPoints;
    let log = `${playerNames[teamWithHighestScorer - 1]} had the highest scoring player (+3)`;
    let userID = playersData[teamWithHighestScorer - 1].user_id;
    await updateActivity(log, 'favorites.png', currentWeek, userID);
    await updateTotalPoints();
};

const addHighestPointsInLossPoints = async (matchupsData, playersData) => {
    const plusPoints = 2;

    const matchups = [[],[],[],[],[]];

    for (let i = 0; i < matchupsData.length; i++) {
        let matchupIndex = matchupsData[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': matchupsData[i].roster_id, 'points': matchupsData[i].points});
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
            // tie logic here
        }
    });

    pointsStorage[highestLosingPointsTeam - 1] = plusPoints;
    let log = `${playerNames[highestLosingPointsTeam - 1]} had the highest points in a loss (+2)`;
    let userID = playersData[highestLosingPointsTeam - 1].user_id;
    await updateActivity(log, 'broken-heart.png', currentWeek, userID);
    await updateTotalPoints();
};

const addHighestScorerPoints = async (matchupsData, playersData) => {
    const plusPoints = 5;

    const sortedData = matchupsData.sort((a, b) => b.points - a.points);

    pointsStorage[sortedData[0].roster_id - 1] = plusPoints;
    let log = `${playerNames[sortedData[0].roster_id - 1]} was the highest scorer (+5)`;
    let userID = playersData[sortedData[0].roster_id - 1].user_id;
    await updateActivity(log, 'number-one.png', currentWeek, userID);
    await updateTotalPoints();
};

const addLongestStreakPoints = async (rostersData, playersData) => {
    const plusPoints = 15;
    
    let longestStreak = 0;
    let currentStreak = 0;
    let longestStreakTeams = [];

    for (let i = 0; i < rostersData.length; i++) {
        currentStreak = 0;

        for (let j = 0; j < rostersData[i].metadata.record.length; j++) {
            if (rostersData[i].metadata.record[j] === 'W') {
                currentStreak++;
            } else {
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    longestStreakTeams = [rostersData[i].roster_id];
                } else if (currentStreak === longestStreak) {
                    longestStreakTeams.push(rostersData[i].roster_id);
                }
                currentStreak = 0;
            }
        }

        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStreakTeams = [rostersData[i].roster_id];
        } else if (currentStreak === longestStreak) {
            longestStreakTeams.push(rostersData[i].roster_id);
        }
    }

    for (let i = 0; i < longestStreakTeams.length; i++) {
        let log = `${playerNames[longestStreakTeams[i] - 1]} had the longest winning streak (+15)`;
        let userID = playersData[longestStreakTeams[i] - 1].user_id;
        await updateActivity(log, 'fire-flame.png', finalWeek, userID);
        pointsStorage[longestStreakTeams[i] - 1] = plusPoints;
    }

    await updateTotalPoints();
};

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
    await updateActivity(log, 'loser.png', finalWeek, userID);
    log = `${playerNames[eighthPlaceTeam - 1]} finished in eighth place (+18)`;
    userID = playersData[eighthPlaceTeam - 1].user_id;
    await updateActivity(log, 'dead-fish.png', finalWeek, userID);
    log = `${playerNames[ninthPlaceTeam - 1]} finished in ninth place (+15)`;
    userID = playersData[ninthPlaceTeam - 1].user_id;
    await updateActivity(log, 'trash-can.png', finalWeek, userID);
    log = `${playerNames[tenthPlaceTeam - 1]} finished in tenth place (+13)`;
    userID = playersData[tenthPlaceTeam - 1].user_id;
    await updateActivity(log, 'poop.png', finalWeek, userID);

    pointsStorage[seventhPlaceTeam - 1] = seventhPlacePoints;
    pointsStorage[eighthPlaceTeam - 1] = eighthPlacePoints;
    pointsStorage[ninthPlaceTeam - 1] = ninthPlacePoints;
    pointsStorage[tenthPlaceTeam - 1] = tenthPlacePoints;

    await updateTotalPoints();
};

const addMedianPoints = async (matchupsData, playersData) => {
    const plusPoints = 3;

    const sortedData = matchupsData.sort((a, b) => b.points - a.points);

    for (let i = 0; i < sortedData.length; i++) {
        if (i < 5) {
            pointsStorage[sortedData[i].roster_id - 1] = plusPoints;

            // console.log(playerNames[sortedData[i].roster_id - 1]);
            // let jsole = sortedData[i].roster_id - 1
            // console.log(playersData[i].user_id);

            let log = `${playerNames[sortedData[i].roster_id - 1]} scored above the median (+3)`;
            let userID = playersData[i].user_id;
            await updateActivity(log, 'average.png', currentWeek, userID);
        }
    }

    await updateTotalPoints();
};

const addMostPointsAgainstPoints = async (rostersData, playersData) => {
    const plusPoints = 10;

    let leastPoints = 0;
    let leastPointsTeam;

    for (let i = 0; i < rostersData.length; i++) {
        if (rostersData[i].settings.fpts_against > leastPoints) {
            leastPoints = rostersData[i].settings.fpts_against;
            leastPointsTeam = rostersData[i].roster_id;
        }
    }

    let log = `${playerNames[leastPointsTeam - 1]} had the most points against this season (+10)`;
    let userID = playersData[leastPointsTeam - 1].user_id;
    await updateActivity(log, 'black-cat.png', finalWeek, userID);

    pointsStorage[leastPointsTeam - 1] = plusPoints;
    await updateTotalPoints();
};

const addMostPointsForPoints = async (rostersData, playersData) => {
    const plusPoints = 25;

    let mostPoints = 0;
    let mostPointsTeam;

    for (let i = 0; i < rostersData.length; i++) {
        if (rostersData[i].settings.fpts > mostPoints) {
            mostPoints = rostersData[i].settings.fpts;
            mostPointsTeam = rostersData[i].roster_id;
        }
    }

    let log = `${playerNames[mostPointsTeam - 1]} scored the most points this season (+25)`;
    let userID = playersData[mostPointsTeam - 1].user_id;
    await updateActivity(log, 'money-bag.png', finalWeek, userID);
    
    pointsStorage[mostPointsTeam - 1] = plusPoints;
    await updateTotalPoints();
};

const addRivalPoints = async (matchupsData, playersData) => {
    const plusPoints = 5;

    const rosterIdsOrder = matchupsData.map(entry => entry.roster_id);
    playersData.sort((a, b) => {
        return rosterIdsOrder.indexOf(a.roster_id) - rosterIdsOrder.indexOf(b.roster_id);
    });

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < matchupsData.length; i++) {
        let matchupIndex = matchupsData[i].matchup_id - 1;

        matchups[matchupIndex].push({'roster_id': matchupsData[i].roster_id, 'points': matchupsData[i].points, 
                                        'rank': playersData[i].rank, 'rival_id': playersData[i].rival_id});
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
                await updateActivity(log, 'rival.png', currentWeek, userID);
            } else if (team1.points < team2.points) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} beat their rival (+5)`;
                userID = playersData[team2.roster_id - 1].user_id;
                await updateActivity(log, 'rival.png', currentWeek, userID);
            } else {
              // Handle tie scenario
            }
        }
    }

    await updateTotalPoints();
};

const addTopGuyTakedownPoints = async (matchupsData, playersData) => {
    const plusPoints = 3;

    const rosterIdsOrder = matchupsData.map(entry => entry.roster_id);
    playersData.sort((a, b) => {
        return rosterIdsOrder.indexOf(a.roster_id) - rosterIdsOrder.indexOf(b.roster_id);
    });

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < matchupsData.length; i++) {
        let matchupIndex = matchupsData[i].matchup_id - 1;

        matchups[matchupIndex].push({'roster_id': matchupsData[i].roster_id, 'points': matchupsData[i].points, 
        'rank': playersData[i].rank});
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
                await updateActivity(log, 'checkmate.png', currentWeek, userID);
            }
    
            if(team2.rank == 1 && team1.points > team2.points) {
                pointsStorage[team1.roster_id - 1] = plusPoints;
                log = `${playerNames[team1.roster_id - 1]} took down the #1 player (+3)`;
                userID = playersData[team1.roster_id - 1].user_id;
                await updateActivity(log, 'checkmate.png', currentWeek, userID);
            }
        }
    }

    await updateTotalPoints();
};

const addUndefeatedPoints = async (rostersData, playersData) => {
    const plusPoints = 30;

    for (let i = 0; i < rostersData.length; i++) {
        if (rostersData[i].settings.losses == 0) {
            pointsStorage[rostersData[i].roster_id - 1] = plusPoints;
            let log = `${playerNames[rostersData[i].roster_id - 1]} went UNDEFEATED (+30)`;
            let userID = playersData[rostersData[i].roster_id - 1].user_id;
            await updateActivity(log, 'diamond.png', finalWeek, userID);
        }
    }

    await updateTotalPoints();
};

const addUpsetPoints = async (matchupsData, playersData) => {
    const plusPoints = 2;
    const noPoints = 0;

    const rosterIdsOrder = matchupsData.map(entry => entry.roster_id);
    playersData.sort((a, b) => {
        return rosterIdsOrder.indexOf(a.roster_id) - rosterIdsOrder.indexOf(b.roster_id);
    });

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < matchupsData.length; i++) {
        let matchupIndex = matchupsData[i].matchup_id - 1;

        matchups[matchupIndex].push({'roster_id': matchupsData[i].roster_id, 'points': matchupsData[i].points, 
                                        'rank': playersData[i].rank});
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
                await updateActivity(log, 'danger.png', currentWeek, userID);
            }
        } else if (team1.points < team2.points) {
            if(team2.rank > team1.rank) {
                pointsStorage[team2.roster_id - 1] = plusPoints;
                log = `${playerNames[team2.roster_id - 1]} upset their opponent (+2)`;
                userID = playersData[team2.roster_id - 1].user_id;
                await updateActivity(log, 'danger.png', currentWeek, userID);
            }
        } else {
          // figure out tie
        }
    }

    await updateTotalPoints();

};

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
    await updateActivity(log, 'crown.png', finalWeek, userID);
    log = `${playerNames[secondPlaceTeam - 1]} finished in second place (+70)`;
    userID = playersData[secondPlaceTeam - 1].user_id;
    await updateActivity(log, 'second-prize.png', finalWeek, userID);
    log = `${playerNames[thirdPlaceTeam - 1]} finished in third place (+50)`;
    userID = playersData[thirdPlaceTeam - 1].user_id;
    await updateActivity(log, 'third-prize.png', finalWeek, userID);
    log = `${playerNames[fourthPlaceTeam - 1]} finished in fourth place (+30)`;
    userID = playersData[fourthPlaceTeam - 1].user_id;
    await updateActivity(log, 'thumb-up.png', finalWeek, userID);
    log = `${playerNames[fifthPlaceTeam - 1]} finished in fifth place (+27)`;
    userID = playersData[fifthPlaceTeam - 1].user_id;
    await updateActivity(log, 'mid.png', finalWeek, userID);
    log = `${playerNames[sixthPlaceTeam - 1]} finished in sixth place (+24)`;
    userID = playersData[sixthPlaceTeam - 1].user_id;
    await updateActivity(log, 'open-mouth.png', finalWeek, userID);

    pointsStorage[firstPlaceTeam - 1] = firstPlacePoints;
    pointsStorage[secondPlaceTeam - 1] = secondPlacePoints;
    pointsStorage[thirdPlaceTeam - 1] = thirdPlacePoints;
    pointsStorage[fourthPlaceTeam - 1] = fourthPlacePoints;
    pointsStorage[fifthPlaceTeam - 1] = fifthPlacePoints;
    pointsStorage[sixthPlaceTeam - 1] = sixthPlacePoints;

    await updateTotalPoints();
};

const addWinWeekPoints = async (matchupsData, playersData) => {
    const plusPoints = 5;

    const matchups = [[],[],[],[],[]];
    
    for (let i = 0; i < matchupsData.length; i++) {
        let matchupIndex = matchupsData[i].matchup_id - 1;
        matchups[matchupIndex].push({'roster_id': matchupsData[i].roster_id, 'points': matchupsData[i].points});
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

        await updateActivity(log, 'trophy.png', currentWeek, userID);
    }

    await updateTotalPoints();
};

const updateActivity = async (log, iconPath, week, userID) => {
    try {
        const response = await fetch('http://192.168.1.121:3000/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ log: log, year: currentYear, icon_path: iconPath, week: week, user_id: userID }),
        });
        const data = await response.json();
        //console.log(data);
    } catch (error) {
        console.error('Error posting log: ', error);
    }
};

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
};

const getMatchupsData = async (week) => {
    try {
        const response = await fetch(`https://api.sleeper.app/v1/league/995196431700942848/matchups/${week}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        const playersData = data.sort((a, b) => a.roster_id - b.roster_id);

        // this is to fill the player name array where each index - 1 correlates to the roster id
        for (let i = 0; i < playersData.length; i++) {
            playerNames.push(playersData[i].team_name);
        }

        return playersData;

    } catch (error) {
        console.error('Error getting week scoring: ', error);
    }
};

const getPlayersData = async () => {
    try {
        const response = await fetch('http://192.168.1.121:3000/players', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        const playersData = data.sort((a, b) => a.roster_id - b.roster_id);

        // this is to fill the player name array where each index - 1 correlates to the roster id
        for (let i = 0; i < playersData.length; i++) {
            playerNames.push(playersData[i].team_name);
        }

        return playersData;

    } catch (error) {
        console.log('Error getting players: ', error);
    }
};

const getRanksData = async () => {
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

        return rankArray;

    } catch (error) {
        console.error('Error getting ranks: ', error);
    }
};

const getRostersData = async () => {
    try {
        const response = await fetch('https://api.sleeper.app/v1/league/995196431700942848/rosters', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        return await response.json();

    } catch (error) {
        console.error('Error getting rosters: ', error);
    }
};

export const updateRanks = async () => {
    let ranksData = await getRanksData();

    fetch(`http://192.168.1.121:3000/update/ranks`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(ranksData)
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data)
    })
    .catch(error => {
        console.error('Error getting matchups:', error);
    })
}

