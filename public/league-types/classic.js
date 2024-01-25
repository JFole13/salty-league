if(document.querySelector('.classic-league')) {
    document.querySelector('.classic-league').addEventListener('click', () => {
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

        yearlyCategoriesContainer.append(createCategoryContainer('Go Undefeated (+25)', 'images/icons/diamond.png'));

    });
}