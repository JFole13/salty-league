if(document.querySelector('.classic-league')) {
    document.querySelector('.classic-league').addEventListener('click', () => {
        const categoriesContainer = document.createElement('div');
        categoriesContainer.classList.add('categories-container');
    
    
        const activityContainer = document.querySelector('.activity-container');
        activityContainer.innerHTML = '';
    
        let description = document.createElement('p');
        description.classList.add('description-text');
    
        description.innerHTML = 'Classic scoring rules. The six teams with the best record make the playoffs.';
    
        activityContainer.appendChild(description);
        activityContainer.appendChild(categoriesContainer);
    
        categoriesContainer.appendChild(createCategoryContainer('Win a Game (+5)', 'images/icons/trophy.png'));
        categoriesContainer.appendChild(createCategoryContainer('Score Above the Median (+3)', 'images/icons/average.png'));
        categoriesContainer.appendChild(createCategoryContainer('Highest Scorer (+3)', 'images/icons/number-one.png'));
        categoriesContainer.appendChild(createCategoryContainer('Upset Your Opponent (+2)', 'images/icons/danger.png'));
        categoriesContainer.appendChild(createCategoryContainer('Highest Scoring Player (+2)', 'images/icons/favorites.png'));
        categoriesContainer.appendChild(createCategoryContainer('Biggest Blowout (+2)', 'images/icons/nuclear-explosion.png'));
        categoriesContainer.appendChild(createCategoryContainer('Highest Points in Loss (+2)', 'images/icons/broken-heart.png'));
        categoriesContainer.appendChild(createCategoryContainer('Beat the #1 Player (+3)', 'images/icons/checkmate.png'));
        categoriesContainer.appendChild(createCategoryContainer('Beat your rival (+5)', 'images/icons/rival.png'));
    });
}