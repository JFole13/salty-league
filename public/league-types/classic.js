import { createCategoryContainer, currentYear, fetchActivity } from '../script.js';

document.querySelector('.classic-league').addEventListener('click', () => {
    if(document.querySelector('.classic-league') && !document.querySelector('.color-container')) {
        const weeklyCategoriesContainer = document.createElement('div');
        weeklyCategoriesContainer.classList.add('categories-container');

        const activityContainer = document.querySelector('.activity-container');
        activityContainer.innerHTML = '';

        const description = document.createElement('p');
        description.classList.add('description-text');
        description.innerHTML = 'Classic scoring rules. The six teams with the best record make the playoffs.';

        const weeklyCategoriesTitle = document.createElement('h3');
        weeklyCategoriesTitle.classList.add('weekly-categories-title');
        weeklyCategoriesTitle.innerHTML = 'Weekly Categories';

        activityContainer.append(description, weeklyCategoriesTitle, weeklyCategoriesContainer);

        weeklyCategoriesContainer.append(createCategoryContainer('Win a Game (+5)', 'images/icons/trophy.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Score Above the Median (+3)', 'images/icons/average.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Highest Scorer (+3)', 'images/icons/number-one.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Upset Your Opponent (+2)', 'images/icons/danger.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Highest Scoring Player (+2)', 'images/icons/favorites.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Biggest Blowout (+2)', 'images/icons/nuclear-explosion.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Highest Points in Loss (+2)', 'images/icons/broken-heart.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Beat the #1 Player (+3)', 'images/icons/checkmate.png'));
        weeklyCategoriesContainer.append(createCategoryContainer('Beat your rival (+5)', 'images/icons/rival.png'));

        const yearlyCategoriesTitle = document.createElement('h3');
        yearlyCategoriesTitle.classList.add('yearly-categories-title');
        yearlyCategoriesTitle.innerHTML = 'Yearly Categories';

        const yearlyCategoriesContainer = document.createElement('div');
        yearlyCategoriesContainer.classList.add('categories-container');

        activityContainer.append(yearlyCategoriesTitle, yearlyCategoriesContainer);

        yearlyCategoriesContainer.append(createCategoryContainer('Go Undefeated (+30)', 'images/icons/diamond.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Most Points For (+25)', 'images/icons/money-bag.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Most Points Against (+10)', 'images/icons/black-cat.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Longest Winning Streak (+15)', 'images/icons/fire-flame.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Best Trade (+20)', 'images/icons/handshake.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Best Draft (+20)', 'images/icons/businessman.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('First Place (+100)', 'images/icons/crown.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Second Place (+70)', 'images/icons/second-prize.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Third Place (+50)', 'images/icons/third-prize.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Fourth Place (+30)', 'images/icons/thumb-up.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Fifth Place (+27)', 'images/icons/mid.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Sixth Place (+24)', 'images/icons/open-mouth.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Seventh Place (+21)', 'images/icons/loser.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Eighth Place (+18)', 'images/icons/dead-fish.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Ninth Place (+15)', 'images/icons/trash-can.png'));
        yearlyCategoriesContainer.append(createCategoryContainer('Last Place (+13)', 'images/icons/poop.png'));
    } else {
        const activityContainer = document.querySelector('.activity-container');
        activityContainer.innerHTML = '';
        fetchActivity(currentYear);
    }
});
