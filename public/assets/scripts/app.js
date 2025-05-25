document.addEventListener('DOMContentLoaded', () => {
    const carouselInner = document.getElementById('carouselInner');
    const gridReceitas = document.getElementById('gridReceitas');
    const detalhesContainer = document.getElementById('detalhes-container');

    const API_URL = 'http://localhost:3000/receitas';

    // Funções de Renderização (para evitar repetição de código)
    function renderCarouselItem(receita) {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        // Adiciona 'active' ao primeiro item do carrossel (se necessário, gerenciar fora)
        carouselItem.innerHTML = `
            <img src="${receita.imagem_principal}" alt="${receita.nome}">
            <h3>${receita.nome}</h3>
            <p>${receita.descricao_breve}</p>
            <a href="detalhes.html?id=${receita.id}" class="btn">Ver Detalhes</a>
        `;
        return carouselItem;
    }

    function renderRecipeCard(receita) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${receita.imagem_principal}" class="card-img-top" alt="${receita.nome}">
            <div class="card-body">
                <h5 class="card-title">${receita.nome}</h5>
                <p class="card-text">${receita.descricao_breve}</p>
                <a href="detalhes.html?id=${receita.id}" class="btn btn-primary">Detalhes</a>
                <span>&#9734;</span> </div>
        `;
        return card;
    }

    function renderRecipeDetails(receita) {
        const infoGeralDiv = document.getElementById('info-geral');
        const fotosDiv = document.getElementById('fotos');

        if (infoGeralDiv) {
            infoGeralDiv.innerHTML = `
                <h3>${receita.nome}</h3>
                <p>${receita.descricao_breve}</p>
                <ul>
                    <li><strong>Ingredientes:</strong> ${receita.ingredientes.join(', ')}</li>
                    <li><strong>Preparo:</strong> ${receita.preparo}</li>
                    <li><strong>Tempo de Preparo:</strong> ${receita.tempo_preparo}</li>
                    <li><strong>Rendimento:</strong> ${receita.rendimento}</li>
                    <li><strong>Categoria:</strong> ${receita.categoria}</li>
                </ul>
            `;
        }

        if (fotosDiv) {
            let fotosHtml = '';
            if (receita.fotos_adicionais && receita.fotos_adicionais.length > 0) {
                receita.fotos_adicionais.forEach(foto => {
                    fotosHtml += `
                        <div>
                            <img src="${foto.src}" alt="${foto.titulo}">
                            <p>${foto.titulo}</p>
                        </div>
                    `;
                });
            } else {
                fotosHtml = '<p>Não há fotos adicionais para esta receita.</p>';
            }
            fotosDiv.innerHTML = fotosHtml;
        }
    }

    // Código para a página index.html
    if (carouselInner && gridReceitas) {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(receitas => {
                const receitasDestaque = receitas.filter(receita => receita.destaque);

                // Carrossel de destaques
                if (receitasDestaque.length > 0) {
                    receitasDestaque.forEach((receita, index) => {
                        const carouselItem = renderCarouselItem(receita);
                        if (index === 0) {
                            carouselItem.classList.add('active'); // Ativa o primeiro item
                        }
                        carouselInner.appendChild(carouselItem);
                    });
                } else {
                    carouselInner.innerHTML = '<p>Nenhuma receita em destaque no momento.</p>';
                }

                // Grade de receitas
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
                if (carouselInner) carouselInner.innerHTML = '<p>Erro ao carregar receitas em destaque. Tente novamente mais tarde.</p>';
                if (gridReceitas) gridReceitas.innerHTML = '<p>Erro ao carregar receitas. Tente novamente mais tarde.</p>';
            });
    }

    // Código para a página detalhes.html
    if (detalhesContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const receitaId = urlParams.get('id');

        if (receitaId) {
            fetch(`${API_URL}/${receitaId}`)
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 404) {
                            throw new Error('Receita não encontrada.');
                        }
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(receita => {
                    if (Object.keys(receita).length === 0) { // JSONServer retorna {} para ID não encontrado
                        throw new Error('Receita não encontrada.');
                    }
                    renderRecipeDetails(receita);
                })
                .catch(error => {
                    console.error('Erro ao buscar detalhes da receita:', error);
                    detalhesContainer.innerHTML = `<p>${error.message}</p> <a href="index.html">Voltar para o Início</a>`;
                });
        } else {
            detalhesContainer.innerHTML = `
                <p>ID da receita não fornecido.</p>
                <a href="index.html">Voltar para o Início</a>
            `;
        }
    }
});