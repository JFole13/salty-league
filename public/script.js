export const currentYear = 1;

export const fetchActivity = (year) => {
    fetch(`/activity/${year}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then (response => response.json())
    .then (data => {
        populateActivity(data);
    })
    .catch (error => {
        console.error('Error fetching activity: ' + error);
    })
};

const fetchActivityFiltered = async (name, year) => {
    let userID = await getUserID(name);

    fetch(`/activity/player/${userID}/${year}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then (response => response.json())
    .then (data => {
        populateActivity(data);
    })
    .catch (error => {
        console.error('Error fetching filtered activity: ' + error);
    })
};

const getUserID = async (name) => {
    try {
        const response = await fetch(`/players/${name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        return data[0].user_id;
    } catch (error) {
        console.error('Error fetching user id: ' + error);
    }
}

const populateActivity = (data) => {
    data = data.sort((a, b) => b.week - a.week);
    console.log(data)

    const activityContainer = document.querySelector('.activity-container');
    activityContainer.innerHTML = '';

    // gets biggest week from the sorted data (which would be the first result) and then that's used for
    // the week dividers
    let weekCounter = 0;

    for (let i = 0; i < data.length; i++) {
        if(data[i].week != weekCounter) {
            weekCounter = data[i].week;
            const weekTitle = document.createElement('h3');
            weekTitle.classList.add('activity-week-title');
            weekTitle.innerHTML = `Week ${weekCounter}`;
            activityContainer.append(weekTitle);
        }
        
        let activityTagContainer = document.createElement('div');
        activityTagContainer.classList.add('activity-tag-container');

        let activityTag = document.createElement('p');
        activityTag.innerHTML = data[i].log;
        activityTag.classList.add('activity-tag');

        let activityIcon = document.createElement('img');
        activityIcon.src = `/images/icons/${data[i].icon_path}`;
        activityIcon.classList.add('activity-icon');

        activityTagContainer.append(activityIcon);
        activityTagContainer.append(activityTag);
        activityContainer.append(activityTagContainer);
    }
};

const populateActivityFilters = (data) => {
    data = data.sort((a, b) => a.team_name.localeCompare(b.team_name));

    const activityFilter = document.querySelector('.activity-filter-options');
    const activityFilterOptions = activityFilter.querySelectorAll('option');

    for (let i = 1; i < activityFilterOptions.length; i++) {
        activityFilterOptions[i].innerHTML = data[i - 1].team_name;
        activityFilterOptions[i].value = "option" + (i + 1);
    }
}

document.querySelector('.activity-filter-options').addEventListener('change', function () {
    const selectedIndex = this.selectedIndex;
    const selectedOptionText = this.options[selectedIndex].innerHTML;

    if(selectedIndex == 0) {
        fetchActivity(currentYear);
    } else {
        fetchActivityFiltered(selectedOptionText, currentYear);
    }
})

fetchActivity(currentYear);

let years = document.querySelectorAll('.year-titles');

years.forEach(function(year) {
    year.addEventListener('click', function() {
        changeYear(year)
    });
});

const yearSelector = document.querySelector('.year-selector');

yearSelector.addEventListener('change', function() {
        const selectedYear = this.options[this.selectedIndex];
        changeYear(selectedYear);
});

const changeYear = (year) => {
    const changingYear = extractNumberFromString(year.innerHTML);

    switch (changingYear) {
        case 1:
            changeYearColor('/images/salty-logos/png/logo-no-background.png', 'rgb(33, 33, 33)', 
                            'rgb(52, 52, 52)', 'images/salty-logos/png/salty-high-resolution-logo-transparent.png', 
                            'rgb(235, 235, 235)');
            //changeLeagueType('Classic', 'classic-league', '/images/icons/american-football.png');
            break;
        case 2:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#551010', '#671E1E', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png', 
                            'rgb(235, 235, 235)');
            //changeLeagueType('Vampire', 'vampire-league', '/images/icons/vampire.png');
            break;
        case 3:
            changeYearColor('/images/salty-logos/png/logo-no-background.png', 
                            '#0B1643', '#212D5E', 'images/salty-logos/png/salty-high-resolution-logo-transparent.png', 
                            'rgb(235, 235, 235)');
            break;
        case 4:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#15400C', '#24501B', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png', 
                            'rgb(235, 235, 235)');
            break;
        case 5:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#3E0D43', '#4C1C51', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png', 
                            'rgb(235, 235, 235)');
            break;
        case 6:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#484009', '#5C5418', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png', 
                            'rgb(235, 235, 235)');
            break;
        case 7:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#0A4948', '#155554', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png', 
                            'rgb(235, 235, 235)');
            break;
        case 8:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#441A0A', '#512717', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png', 
                            'rgb(235, 235, 235)');
            break;
        case 9:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent-1.png', 
                            '#240B3F', '#351755', 'images/salty-logos/png/salty-high-resolution-logo-white-transparent.png',
                            'rgb(235, 235, 235)');
            break;
        case 10:
            changeYearColor('/images/salty-logos/png/logo-no-background.png', 'rgb(33, 33, 33)', 
                            'rgb(52, 52, 52)', 'images/salty-logos/png/salty-high-resolution-logo-transparent.png',
                            'rgb(235, 235, 235)');
            break;
        default:
            day = "Invalid year";
    }

    fetchActivity(changingYear);
}

function extractNumberFromString(inputString) {
    const match = inputString.match(/\d+/);

    if (match) {
        return parseInt(match[0], 10);
    } else {
        return null;
    }
}

const changeYearColor = (url, sidePanelColor, mainPanelColor, responsiveUrl, textColor) => {
    const logo = document.querySelector('.logo');
    const logoResponsive = document.querySelector('.logo-alternative');
    const yearsPanel = document.querySelector('.years-panel');
    const yearsPanelReponsive = document.querySelector('.years-panel-responsive');
    const activityPanel = document.querySelector('.activity-panel');
    const activityTitles = document.querySelector('.activity-titles-container');
    const rankingsPanel = document.querySelector('.rankings-panel');
    const punishmentTitle = document.querySelector('.punishment-title');
    const leagueTypeTitle = document.querySelector('.league-type-title');
    const categoryContainers = document.querySelectorAll('.color-container');
    const everything = document.querySelectorAll('*');


    logo.src = url;
    logoResponsive.src = responsiveUrl;
    yearsPanel.style.backgroundColor = sidePanelColor;
    yearsPanelReponsive.style.backgroundColor = sidePanelColor;
    activityPanel.style.backgroundColor = mainPanelColor;
    activityTitles.style.backgroundColor = sidePanelColor;
    rankingsPanel.style.backgroundColor = sidePanelColor;
    everything.forEach(function(thing) {
        thing.style.color = textColor;
    });
    categoryContainers.forEach(function(thing) {
        thing.style.backgroundColor = sidePanelColor;
    })
    punishmentTitle.style.color = 'rgb(33, 33, 33)';
    leagueTypeTitle.style.color = 'rgb(33, 33, 33)';
};

const changeLeagueType = (leagueTypeText, leagueTypeClass, url) => {
    const leagueTypeTitle = document.querySelector('.league-type-title');

    leagueTypeTitle.innerHTML = leagueTypeText;
    leagueTypeTitle.classList.add(leagueTypeClass);

    const icon = document.createElement('img');
    icon.src = url;
    icon.classList.add('league-icon');

    leagueTypeTitle.append(icon);
}

const fetchCurrentRankings = () => {
    fetch('/players', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then (response => response.json())
    .then (data => {
        populateCurrentRankings(data);
        populateActivityFilters(data);
    })
    .catch (error => {
        console.error('Error fetching rankings:' + error);
    })
}

fetchCurrentRankings();

const populateCurrentRankings = (data) => {
    data = data.sort((a, b) => b.total_points - a.total_points);

    const avatars = document.querySelectorAll('.avatar-img');

    avatars.forEach((avatar, index) => {
        // checking if it has the link to a picture or if it's just an avatar, just randomly chose upload 
        // because it's in every link
        if(data[index].avatar.includes('uploads')) {
            avatar.src = data[index].avatar;
        } else {
            avatar.src = 'images/salty-logos/png/logo-small.png';
        }
    });

    const names = document.querySelectorAll('.rank-name');

    names.forEach((name, index) => {
        name.innerHTML = data[index].team_name;
    })

    const points = document.querySelectorAll('.rank-points');

    points.forEach((point, index) => {
        point.innerHTML = data[index].total_points;
    })
}

export const createCategoryContainer = (rules, url) => {
    const categoryContainer = document.createElement('div');
    categoryContainer.classList.add('category-container');

    const categoryIcon = document.createElement('img');
    categoryIcon.classList.add('category-rules-icon');
    categoryIcon.src = url;

    const categoryRulesText = document.createElement('p');
    categoryRulesText.classList.add('category-rules-text');
    categoryRulesText.innerHTML = rules;

    const colorContainer = document.createElement('div');
    colorContainer.classList.add('color-container');

    colorContainer.append(categoryIcon);
    colorContainer.append(categoryRulesText);
    categoryContainer.append(colorContainer);

    return categoryContainer;
}

// Uncomment for when a punishment is decided 
document.querySelector('.punishment-title').addEventListener('click', openModal);
document.querySelector('.punishment-close-modal-btn').addEventListener('click', closeModal);

function openModal() {
  document.querySelector('.punishment-modal').style.display = 'block';
}

function closeModal() {
  document.querySelector('.punishment-modal').style.display = 'none';
}


