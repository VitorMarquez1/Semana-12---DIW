document.addEventListener('DOMContentLoaded', () => {
    const carouselFeaturedRecipe = document.getElementById('carousel-featured-recipe');
    const gridReceitas = document.getElementById('gridReceitas');
    const detalhesContainer = document.getElementById('detalhes-container');

    const API_URL = 'http://localhost:3000/receitas';

    // --- Helper Functions ---
    function createStarRating(rating) {
        if (!rating || typeof rating.value !== 'number' || typeof rating.count !== 'number') {
            return '<span class="no-rating">Sem avaliação</span>';
        }
        const fullStars = Math.floor(rating.value);
        const halfStar = rating.value % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
        if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="far fa-star"></i>'; // Using far for empty star
        return `<span class="stars">${starsHtml}</span> <span class="rating-text">${rating.value.toFixed(1)} (${rating.count} avaliações)</span>`;
    }


    // --- Render Functions ---
    function renderFeaturedRecipe(receita) {
        const item = document.createElement('div');
        item.classList.add('featured-recipe-item');
        item.innerHTML = `
            <img src="${receita.imagem_principal || 'imagens/placeholder.jpg'}" alt="${receita.nome}">
            <div class="featured-recipe-content">
                <h3>${receita.nome}</h3>
                <p>${receita.descricao_breve || 'Sem descrição breve.'}</p>
                <a href="detalhes.html?id=${receita.id}" class="btn">Ver Receita Completa</a>
            </div>
        `;
        return item;
    }

    function renderRecipeCard(receita) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${receita.imagem_principal || 'imagens/placeholder_card.jpg'}" class="card-img-top" alt="${receita.nome}">
            <div class="card-body">
                <h5 class="card-title">${receita.nome}</h5>
                ${receita.descricao_breve ? `<p class="card-text">${receita.descricao_breve.substring(0, 100)}${receita.descricao_breve.length > 100 ? '...' : ''}</p>` : ''}
                <div class="card-actions">
                    <a href="detalhes.html?id=${receita.id}" class="btn">Detalhes</a>
                    <span class="fav-icon"><i class="far fa-star"></i></span>
                </div>
            </div>
        `;
        // Basic favorite toggle example (not persistent)
        const favIcon = card.querySelector('.fav-icon i');
        favIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent navigation if card itself is clickable
            favIcon.classList.toggle('far');
            favIcon.classList.toggle('fas'); // Switch to solid star
            favIcon.parentElement.classList.toggle('favorited');
        });
        return card;
    }

    function renderRecipeDetails(receita) {
        if (!detalhesContainer) return;
        detalhesContainer.innerHTML = ''; // Clear loading placeholder or previous content

        const detailsWrapper = document.createElement('div');

        let tagsHtml = '';
        if (receita.tags && receita.tags.length > 0) {
            tagsHtml = receita.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }

        let ingredientsHtml = '<ul>';
        if (receita.ingredientes && receita.ingredientes.length > 0) {
            receita.ingredientes.forEach(ing => ingredientsHtml += `<li>${ing}</li>`);
        } else {
            ingredientsHtml += '<li>Ingredientes não listados.</li>';
        }
        ingredientsHtml += '</ul>';

        let instructionsHtml = '<ol>';
        if (receita.preparo) { // Assuming 'preparo' contains steps, potentially separated by newlines
            // Simple split by newline for now. More complex parsing might be needed if format varies.
            const steps = receita.preparo.split('\n').filter(step => step.trim() !== '');
            if (steps.length > 0) {
                steps.forEach(step => instructionsHtml += `<li>${step}</li>`);
            } else {
                 instructionsHtml += `<li>Modo de preparo não detalhado.</li>`;
            }
        } else {
            instructionsHtml += '<li>Modo de preparo não disponível.</li>';
        }
        instructionsHtml += '</ol>';
        
        let fotosHtml = '';
        if (receita.fotos_adicionais && receita.fotos_adicionais.length > 0) {
            receita.fotos_adicionais.forEach(foto => {
                fotosHtml += `
                    <div class="recipe-photo-item">
                        <img src="${foto.src}" alt="${foto.titulo}">
                        ${foto.titulo ? `<p>${foto.titulo}</p>` : ''}
                    </div>
                `;
            });
        }

        detailsWrapper.innerHTML = `
            <img src="${receita.imagem_principal || 'imagens/placeholder_detail.jpg'}" alt="${receita.nome}" class="recipe-main-image">
            
            <div class="recipe-header">
                <h1 class="recipe-title">${receita.nome}</h1>
                ${receita.tempo_preparo ? `<div class="recipe-time"><i class="far fa-clock"></i> ${receita.tempo_preparo}</div>` : ''}
            </div>

            ${tagsHtml ? `<div class="recipe-tags">${tagsHtml}</div>` : ''}

            ${receita.rating ? `<div class="recipe-rating">${createStarRating(receita.rating)}</div>` : ''}

            ${receita.descricao_completa ? `
                <div class="recipe-description-box">
                    <p>${receita.descricao_completa}</p>
                </div>
            ` : (receita.descricao_breve ? `
                <div class="recipe-description-box">
                    <p>${receita.descricao_breve}</p>
                </div>
            ` : '')}


            <h2 class="recipe-section-title">Ingredientes</h2>
            <div class="recipe-ingredients">
                ${ingredientsHtml}
            </div>

            <h2 class="recipe-section-title">Modo de Preparo</h2>
            <div class="recipe-instructions">
                ${instructionsHtml}
            </div>

            ${fotosHtml ? `
                <h2 class="recipe-section-title">Mais Fotos</h2>
                <div class="recipe-photos">
                    <div class="recipe-photos-grid">${fotosHtml}</div>
                </div>
            ` : ''}
            <br>
            <a href="index.html" class="btn" style="background-color: #007bff; color: white;">Voltar para o Início</a>
        `;
        detalhesContainer.appendChild(detailsWrapper);
    }

    // --- Logic for index.html ---
    if (carouselFeaturedRecipe && gridReceitas) {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(receitas => {
                // Featured Recipe (using the first "destaque: true" or just the first recipe)
                const receitaDestaque = receitas.find(r => r.destaque) || (receitas.length > 0 ? receitas[0] : null);
                if (receitaDestaque) {
                    carouselFeaturedRecipe.innerHTML = ''; // Clear any placeholder
                    carouselFeaturedRecipe.appendChild(renderFeaturedRecipe(receitaDestaque));
                } else {
                    carouselFeaturedRecipe.innerHTML = '<p>Nenhuma receita em destaque no momento.</p>';
                }

                // Grid de todas as receitas
                gridReceitas.innerHTML = ''; // Clear any placeholder
                if (receitas.length > 0) {
                    receitas.forEach(receita => {
                        gridReceitas.appendChild(renderRecipeCard(receita));
                    });
                } else {
                    gridReceitas.innerHTML = '<p>Nenhuma receita cadastrada.</p>';
                }
            })
            .catch(error => {
                console.error('Erro ao buscar receitas para a página inicial:', error);
                if (carouselFeaturedRecipe) carouselFeaturedRecipe.innerHTML = '<p class="error-message">Erro ao carregar receita em destaque.</p>';
                if (gridReceitas) gridReceitas.innerHTML = '<p class="error-message">Erro ao carregar receitas.</p>';
            });
    }

    // --- Logic for detalhes.html ---
    if (detalhesContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const receitaId = urlParams.get('id');

        if (receitaId) {
            fetch(`${API_URL}/${receitaId}`)
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 404) throw new Error('Receita não encontrada (404).');
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(receita => {
                    if (Object.keys(receita).length === 0) { // JSONServer can return {} for non-existent ID
                        throw new Error('Receita não encontrada ou dados inválidos.');
                    }
                    renderRecipeDetails(receita);
                })
                .catch(error => {
                    console.error('Erro ao buscar detalhes da receita:', error);
                    detalhesContainer.innerHTML = `<p class="error-message">${error.message} <br><a href="index.html">Voltar para o Início</a></p>`;
                });
        } else {
            detalhesContainer.innerHTML = `
                <p class="error-message">ID da receita não fornecido. <br><a href="index.html">Voltar para o Início</a></p>
            `;
        }
    }
});