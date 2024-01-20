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
    
        categoriesContainer.appendChild(createCategoryContainer('Win a game (+5)', 'images/icons/trophy.png'));
        categoriesContainer.appendChild(createCategoryContainer('Score above the median (+3)', 'images/icons/average.png'));
        categoriesContainer.appendChild(createCategoryContainer('Highest Scorer (+8)', 'images/icons/number-one.png'));
        categoriesContainer.appendChild(createCategoryContainer('Beat your rival (+5)', 'images/icons/rival.png'));

    
    });
}