document.addEventListener('DOMContentLoaded', () => {
    console.log('Lyrics carregado com sucesso! 🎵');

    // 1. Alternar estado ativo do Menu Lateral
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active de todos
            menuItems.forEach(i => i.classList.remove('active'));
            // Adiciona ao clicado
            item.classList.add('active');
            
            console.log(`Navegando para: ${item.textContent}`);

            // Abre o modal se for o item "Perfil"
            if (item.textContent.trim() === 'Perfil') {
                openProfileModal();
            }
        });
    });

    // 2. Feedback visual na Pesquisa
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query.trim() !== "") {
                    alert(`Pesquisando por: ${query}\n(Funcionalidade em desenvolvimento)`);
                }
            }
        });
    }

    // 3. Efeito nos Cartões de Música
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const songName = card.querySelector('.card-title').textContent;
            console.log(`Tocando ou visualizando: ${songName}`);
            // Aqui poderia abrir um modal ou Player
        });
    });

    // 4. Logica para carregar artistas de forma dinâmica (Exemplo)
    const artistas = document.querySelectorAll('.artista');
    artistas.forEach(artista => {
        artista.addEventListener('mouseenter', () => {
            artista.style.cursor = 'pointer';
        });
    });

    // Janela do User
    const profileModal = document.getElementById('profileModal');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    const userElement = document.querySelector('.user');

    // Função para abrir o modal
    window.openProfileModal = function() {
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Desabilita scroll da página
        console.log('Modal do perfil aberto');
    };

    // Função para fechar o modal
    function closeProfileModal() {
        profileModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Habilita scroll da página
        console.log('Modal do perfil fechado');
    }

    // Abrir modal ao clicar no nome/imagem do usuário no header
    if (userElement) {
        userElement.addEventListener('click', openProfileModal);
        userElement.style.cursor = 'pointer';
    }

    // Fechar modal ao clicar no botão X
    if (modalClose) {
        modalClose.addEventListener('click', closeProfileModal);
    }

    // Fechar modal ao clicar no overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeProfileModal);
    }

    // Fechar modal ao pressionar a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal.classList.contains('active')) {
            closeProfileModal();
        }
    });
});
