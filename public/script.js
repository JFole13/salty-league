let years = document.querySelectorAll('.year-titles');

years.forEach(function(year) {
    year.addEventListener('click', function() {
        changeYear(year)
    });
});

const changeYear = (year) => {
    const currentYear = extractNumberFromString(year.innerHTML);

    switch (currentYear) {
        case 1:
            changeYearColor('/images/salty-logos/png/logo-no-background.png', 'rgb(33, 33, 33)', 
                            'rgb(52, 52, 52)', 'rgb(235, 235, 235)');
            break;
        case 2:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#551010', '#671E1E', 'rgb(235, 235, 235)')
            break;
        case 3:
            changeYearColor('/images/salty-logos/png/logo-no-background.png', 
                            '#0B1643', '#212D5E', 'rgb(235, 235, 235)')
            break;
        case 4:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#15400C', '#24501B', 'rgb(235, 235, 235)')
            break;
        case 5:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#3E0D43', '#4C1C51', 'rgb(235, 235, 235)')
            break;
        case 6:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#484009', '#5C5418', 'rgb(235, 235, 235)')
            break;
        case 7:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#0A4948', '#155554', 'rgb(235, 235, 235)')
            break;
        case 8:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#441A0A', '#512717', 'rgb(235, 235, 235)')
            break;
        case 9:
            changeYearColor('/images/salty-logos/png/salty-high-resolution-logo-white-transparent (1).png', 
                            '#240B3F', '#351755', 'rgb(235, 235, 235)')
            break;
        case 10:
            changeYearColor('/images/salty-logos/png/logo-no-background.png', 'rgb(33, 33, 33)', 
                            'rgb(52, 52, 52)', 'rgb(235, 235, 235)');
            break;
        default:
            day = "Invalid year";
    }
}

function extractNumberFromString(inputString) {
    const match = inputString.match(/\d+/);

    if (match) {
        return parseInt(match[0], 10);
    } else {
        return null;
    }
}

const changeYearColor = (url, sidePanelColor, mainPanelColor, textColor) => {
    const logo = document.querySelector('.logo');
    const yearsPanel = document.querySelector('.years-panel');
    const activityPanel = document.querySelector('.activity-panel');
    const rankingsPanel = document.querySelector('.rankings-panel');
    const everything = document.querySelectorAll('*');

    logo.src = url;
    yearsPanel.style.backgroundColor = sidePanelColor;
    activityPanel.style.backgroundColor = mainPanelColor;
    rankingsPanel.style.backgroundColor = sidePanelColor;
    everything.forEach(function(thing) {
        thing.style.color = textColor;
    });
};

