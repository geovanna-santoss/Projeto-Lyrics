// main.js - Interacoes da interface principal (versao sem React)

// Referencias dos elementos principais da interface.
const searchInput = document.getElementById('searchInput');
const menuItems = document.querySelectorAll('.menu-item');
const cardsCarouselTrack = document.getElementById('cardsCarouselTrack');
const cardsPrevBtn = document.getElementById('cardsPrevBtn');
const cardsNextBtn = document.getElementById('cardsNextBtn');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const floatingMenuOverlay = document.getElementById('floatingMenuOverlay');
const floatingMenuDrawer = document.getElementById('floatingMenuDrawer');
const floatingMenuClose = document.getElementById('floatingMenuClose');

const openProfileBtn = document.getElementById('openProfileBtn');
const profileQuickMenu = document.getElementById('profileQuickMenu');
const openProfileMenuItem = document.getElementById('openProfileMenuItem');
const openSettingsItem = document.getElementById('openSettingsItem');
const logoutItem = document.getElementById('logoutItem');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const closeProfileOverlay = document.getElementById('closeProfileOverlay');
const profileModal = document.getElementById('profileModal');
const loginModal = document.getElementById('loginModal');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const closeLoginOverlay = document.getElementById('closeLoginOverlay');
const loginForm = document.getElementById('loginForm');
const signupModal = document.getElementById('signupModal');
const closeSignupBtn = document.getElementById('closeSignupBtn');
const closeSignupOverlay = document.getElementById('closeSignupOverlay');
const signupForm = document.getElementById('signupForm');
const signupFeedback = document.getElementById('signupFeedback');
const goToSignupBtn = document.getElementById('goToSignupBtn');
const goToLoginBtn = document.getElementById('goToLoginBtn');
const loginModalTitle = document.getElementById('loginModalTitle');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginFeedback = document.getElementById('loginFeedback');

const profileDisplayName = document.getElementById('profileDisplayName');
const profileDisplayEmail = document.getElementById('profileDisplayEmail');
const profileFullNameValue = document.getElementById('profileFullNameValue');
const profileEmailValue = document.getElementById('profileEmailValue');
const profilePlanValue = document.getElementById('profilePlanValue');
const profileFavoriteGenreValue = document.getElementById('profileFavoriteGenreValue');

const floatingRecommendationsBtn = document.getElementById('floatingRecommendationsBtn');
const floatingRecommendationsTab = document.getElementById('floatingRecommendationsTab');
const floatingTabClose = document.getElementById('floatingTabClose');
const floatingTabDragHandle = document.getElementById('floatingTabDragHandle');

let isDragging = false;
let dragPointerId = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let carouselIsDragging = false;
let carouselPointerId = null;
let carouselStartX = 0;
let carouselStartScrollLeft = 0;
let carouselAutoplayId = null;

const CAROUSEL_AUTOPLAY_DELAY = 4500;
const API_BASE_URL = (window.localStorage.getItem('lyricsApiBaseUrl') || 'http://localhost:3333').replace(/\/$/, '');
const STORAGE_ACCESS_TOKEN_KEY = 'lyrics.accessToken';
const STORAGE_REFRESH_TOKEN_KEY = 'lyrics.refreshToken';

let authToken = window.localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY) || '';
let isUserLoggedIn = Boolean(authToken);

// Bloqueia a rolagem da pagina quando algum modal estiver aberto.
function updateBodyScrollLock() {
  const hasOpenModal = profileModal?.classList.contains('active') || loginModal?.classList.contains('active');
  document.body.style.overflow = hasOpenModal ? 'hidden' : 'auto';
}

// Exibe mensagens de erro ou sucesso no formulario de login.
function setLoginFeedback(message, isSuccess = false) {
  if (!loginFeedback) {
    return;
  }

  loginFeedback.textContent = message || '';
  loginFeedback.classList.toggle('success', Boolean(isSuccess));
}

// Salva ou limpa os tokens recebidos da API.
function setAuthSession(session) {
  authToken = session?.accessToken || '';
  isUserLoggedIn = Boolean(authToken);

  if (authToken) {
    window.localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, authToken);
  } else {
    window.localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
  }

  if (session?.refreshToken) {
    window.localStorage.setItem(STORAGE_REFRESH_TOKEN_KEY, session.refreshToken);
  } else {
    window.localStorage.removeItem(STORAGE_REFRESH_TOKEN_KEY);
  }
}

// Remove a sessao atual do navegador.
function resetAuthSession() {
  setAuthSession(null);
}

// Preenche os campos visuais do perfil com os dados recebidos da API.
function applyProfileData(profile) {
  const fullName = profile?.full_name?.trim() || 'Usuario';
  const email = profile?.email?.trim() || 'email@exemplo.com';
  const plan = profile?.plan?.trim() || 'Free';
  const favoriteGenre = profile?.favorite_genre?.trim() || 'Nao informado';

  if (profileDisplayName) {
    profileDisplayName.textContent = fullName;
  }

  if (profileDisplayEmail) {
    profileDisplayEmail.textContent = email;
  }

  if (profileFullNameValue) {
    profileFullNameValue.textContent = fullName;
  }

  if (profileEmailValue) {
    profileEmailValue.textContent = email;
  }

  if (profilePlanValue) {
    profilePlanValue.textContent = plan;
  }

  if (profileFavoriteGenreValue) {
    profileFavoriteGenreValue.textContent = favoriteGenre;
  }
}

// Centraliza as chamadas HTTP do front para o backend.
async function apiRequest(path, options = {}) {
  const { method = 'GET', body, requiresAuth = false } = options;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    if (!authToken) {
      throw new Error('Sessao expirada. Faca login novamente.');
    }

    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await window.fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || 'Falha ao comunicar com o servidor.');
  }

  return payload;
}

// Busca o perfil autenticado e atualiza o modal de perfil.
async function loadProfileData() {
  const payload = await apiRequest('/profile/me', { requiresAuth: true });
  applyProfileData(payload?.profile || null);
}

// Mantem o item ativo sincronizado nos menus da interface.
function syncMenuSelection(activeText) {
  document.querySelectorAll('.menu-item').forEach((item) => {
    const isActive = item.textContent.trim() === activeText;
    item.classList.toggle('active', isActive);
  });
}

// Atualiza os atributos ARIA do menu lateral flutuante.
function setFloatingMenuExpanded(expanded) {
  menuToggleBtn?.setAttribute('aria-expanded', String(expanded));
  floatingMenuDrawer?.setAttribute('aria-hidden', String(!expanded));
  floatingMenuOverlay?.setAttribute('aria-hidden', String(!expanded));
}

// Abre o menu lateral acionado pelo botao da navbar.
function openFloatingMenu() {
  floatingMenuDrawer?.classList.add('active');
  floatingMenuOverlay?.classList.add('active');
  setFloatingMenuExpanded(true);
}

// Fecha o menu lateral flutuante.
function closeFloatingMenu() {
  floatingMenuDrawer?.classList.remove('active');
  floatingMenuOverlay?.classList.remove('active');
  setFloatingMenuExpanded(false);
}

// Alterna entre abrir e fechar o menu lateral.
function toggleFloatingMenu() {
  const isOpen = floatingMenuDrawer?.classList.contains('active');
  if (isOpen) {
    closeFloatingMenu();
  } else {
    openFloatingMenu();
  }
}

// Atualiza os atributos ARIA da aba de recomendacoes.
function setFloatingExpanded(expanded) {
  floatingRecommendationsBtn.setAttribute('aria-expanded', String(expanded));
  floatingRecommendationsTab.setAttribute('aria-hidden', String(!expanded));
}

// Exibe a aba flutuante de recomendacoes.
function openFloatingTab() {
  floatingRecommendationsTab.classList.add('active');
  setFloatingExpanded(true);
}

// Fecha a aba flutuante de recomendacoes.
function closeFloatingTab() {
  floatingRecommendationsTab.classList.remove('active');
  setFloatingExpanded(false);
}

// Alterna a visibilidade da aba de recomendacoes.
function toggleFloatingTab() {
  const isOpen = floatingRecommendationsTab.classList.contains('active');
  if (isOpen) {
    closeFloatingTab();
  } else {
    openFloatingTab();
  }
}

// Abre o modal principal de perfil.
function openProfileModal() {
  closeProfileQuickMenu();
  profileModal.classList.add('active');
  updateBodyScrollLock();
}

// Fecha o modal principal de perfil.
function closeProfileModal() {
  profileModal.classList.remove('active');
  updateBodyScrollLock();
}

// Alterna o modal para a tela de login (usado ao vir do cadastro).
function showLoginView() {
  closeSignupModal();
  setLoginFeedback('');
  loginModal?.classList.add('active');
  loginModal?.setAttribute('aria-hidden', 'false');
  updateBodyScrollLock();
  loginEmail?.focus();
}

// Abre o pop-up de cadastro.
function openSignupModal() {
  closeLoginModal();
  if (!signupModal) return;
  signupModal.setAttribute('aria-hidden', 'false');
  signupModal.classList.add('active');
  setSignupFeedback('');
  document.getElementById('signupName')?.focus();
  updateBodyScrollLock();
}

// Fecha o pop-up de cadastro.
function closeSignupModal() {
  if (!signupModal) return;
  signupModal.setAttribute('aria-hidden', 'true');
  signupModal.classList.remove('active');
  updateBodyScrollLock();
}

// Alterna o modal para a tela de cadastro.
function showSignupView() {
  openSignupModal();
}

// Define mensagem de feedback no formulário de cadastro.
function setSignupFeedback(message, isSuccess = false) {
  if (!signupFeedback) return;
  signupFeedback.textContent = message || '';
  signupFeedback.classList.toggle('success', Boolean(isSuccess));
}

// Abre o modal de login e foca no campo de e-mail.
function openLoginModal() {
  closeProfileQuickMenu();
  closeSignupModal();
  setLoginFeedback('');
  loginModal?.classList.add('active');
  loginModal?.setAttribute('aria-hidden', 'false');
  updateBodyScrollLock();
  loginEmail?.focus();
}

// Fecha o modal de login e limpa a mensagem exibida.
function closeLoginModal() {
  loginModal?.classList.remove('active');
  loginModal?.setAttribute('aria-hidden', 'true');
  setLoginFeedback('');
  setSignupFeedback('');
  updateBodyScrollLock();
}

// Decide se abre o login ou o perfil, conforme o estado da sessao.
async function handleOpenProfileRequest() {
  if (!isUserLoggedIn) {
    openLoginModal();
    return;
  }

  // Abre o perfil imediatamente com dados placeholder.
  openProfileModal();

  // Tenta carregar dados reais da API em segundo plano.
  try {
    await loadProfileData();
  } catch (_error) {
    // Backend offline ou sessao expirada: mantém o modal aberto com dados padrão.
  }
}

// Atualiza os atributos ARIA do menu rapido do usuario.
function setProfileQuickMenuExpanded(expanded) {
  openProfileBtn?.setAttribute('aria-expanded', String(expanded));
  profileQuickMenu?.setAttribute('aria-hidden', String(!expanded));
}

// Exibe o menu rapido do usuario.
function openProfileQuickMenu() {
  profileQuickMenu?.classList.add('active');
  setProfileQuickMenuExpanded(true);
}

// Fecha o menu rapido do usuario.
function closeProfileQuickMenu() {
  profileQuickMenu?.classList.remove('active');
  setProfileQuickMenuExpanded(false);
}

// Alterna a exibicao do menu rapido do usuario.
function toggleProfileQuickMenu() {
  const isOpen = profileQuickMenu?.classList.contains('active');

  if (isOpen) {
    closeProfileQuickMenu();
    return;
  }

  openProfileQuickMenu();
}

// Calcula quanto o carrossel deve avancar a cada clique ou autoplay.
function getCarouselStep() {
  const firstCard = cardsCarouselTrack?.querySelector('.card');

  if (!firstCard) {
    return 0;
  }

  const cardWidth = firstCard.getBoundingClientRect().width;
  const trackStyles = window.getComputedStyle(cardsCarouselTrack);
  const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0');

  return cardWidth + gap;
}

// Habilita ou desabilita os botoes conforme a posicao do carrossel.
function updateCarouselButtons() {
  if (!cardsCarouselTrack || !cardsPrevBtn || !cardsNextBtn) {
    return;
  }

  const maxScrollLeft = cardsCarouselTrack.scrollWidth - cardsCarouselTrack.clientWidth;
  const current = Math.ceil(cardsCarouselTrack.scrollLeft);

  cardsPrevBtn.disabled = current <= 0;
  cardsNextBtn.disabled = current >= Math.floor(maxScrollLeft);
}

// Move o carrossel uma etapa para frente ou para tras.
function scrollCards(direction) {
  if (!cardsCarouselTrack) {
    return;
  }

  const step = getCarouselStep();

  if (!step) {
    return;
  }

  cardsCarouselTrack.scrollBy({
    left: direction * step,
    behavior: 'smooth',
  });
}

// Rola o carrossel ate uma posicao especifica.
function scrollCardsTo(targetLeft, behavior = 'smooth') {
  if (!cardsCarouselTrack) {
    return;
  }

  cardsCarouselTrack.scrollTo({
    left: targetLeft,
    behavior,
  });
}

// Retorna o limite maximo de rolagem horizontal do carrossel.
function getCarouselMaxScroll() {
  if (!cardsCarouselTrack) {
    return 0;
  }

  return Math.max(0, cardsCarouselTrack.scrollWidth - cardsCarouselTrack.clientWidth);
}

// Interrompe o autoplay do carrossel.
function stopCarouselAutoplay() {
  if (!carouselAutoplayId) {
    return;
  }

  window.clearInterval(carouselAutoplayId);
  carouselAutoplayId = null;
}

// Avanca automaticamente o carrossel e reinicia ao chegar no fim.
function autoplayCarousel() {
  if (!cardsCarouselTrack || carouselIsDragging || document.hidden) {
    return;
  }

  const step = getCarouselStep();

  if (!step) {
    return;
  }

  const maxScrollLeft = getCarouselMaxScroll();
  const current = Math.ceil(cardsCarouselTrack.scrollLeft);
  const isAtEnd = current >= Math.floor(maxScrollLeft) - 2;
  const nextLeft = isAtEnd ? 0 : Math.min(maxScrollLeft, current + step);

  scrollCardsTo(nextLeft);
}

// Inicia o autoplay do carrossel.
function startCarouselAutoplay() {
  if (!cardsCarouselTrack || carouselAutoplayId) {
    return;
  }

  carouselAutoplayId = window.setInterval(autoplayCarousel, CAROUSEL_AUTOPLAY_DELAY);
}

// Reinicia o autoplay depois de uma interacao do usuario.
function restartCarouselAutoplay() {
  stopCarouselAutoplay();
  startCarouselAutoplay();
}

// Mantem um valor entre um minimo e um maximo.
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Finaliza o arraste manual do carrossel.
function finishCarouselDrag(event) {
  if (!cardsCarouselTrack || !carouselIsDragging || carouselPointerId !== event.pointerId) {
    return;
  }

  carouselIsDragging = false;
  carouselPointerId = null;
  cardsCarouselTrack.classList.remove('is-dragging');

  if (cardsCarouselTrack.hasPointerCapture(event.pointerId)) {
    cardsCarouselTrack.releasePointerCapture(event.pointerId);
  }

  restartCarouselAutoplay();
}

// Garante que a aba flutuante continue visivel dentro da tela.
function keepFloatingTabInViewport() {
  const left = parseFloat(floatingRecommendationsTab.style.left);
  const top = parseFloat(floatingRecommendationsTab.style.top);

  if (Number.isNaN(left) || Number.isNaN(top)) {
    return;
  }

  const margin = 8;
  const maxLeft = Math.max(margin, window.innerWidth - floatingRecommendationsTab.offsetWidth - margin);
  const maxTop = Math.max(margin, window.innerHeight - floatingRecommendationsTab.offsetHeight - margin);

  floatingRecommendationsTab.style.left = `${clamp(left, margin, maxLeft)}px`;
  floatingRecommendationsTab.style.top = `${clamp(top, margin, maxTop)}px`;
}

// Eventos da aba flutuante de recomendacoes.
floatingRecommendationsBtn?.addEventListener('click', toggleFloatingTab);
floatingTabClose?.addEventListener('click', closeFloatingTab);

// Eventos de navegacao do carrossel.
cardsPrevBtn?.addEventListener('click', () => {
  scrollCards(-1);
});

cardsNextBtn?.addEventListener('click', () => {
  scrollCards(1);
});

cardsCarouselTrack?.addEventListener('scroll', updateCarouselButtons);
cardsCarouselTrack?.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) {
    return;
  }

  carouselIsDragging = true;
  carouselPointerId = event.pointerId;
  carouselStartX = event.clientX;
  carouselStartScrollLeft = cardsCarouselTrack.scrollLeft;

  cardsCarouselTrack.classList.add('is-dragging');
  cardsCarouselTrack.setPointerCapture(event.pointerId);
  stopCarouselAutoplay();
});

cardsCarouselTrack?.addEventListener('pointermove', (event) => {
  if (!carouselIsDragging || carouselPointerId !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - carouselStartX;
  const maxScrollLeft = getCarouselMaxScroll();
  const nextLeft = clamp(carouselStartScrollLeft - deltaX, 0, maxScrollLeft);

  cardsCarouselTrack.scrollLeft = nextLeft;
});

cardsCarouselTrack?.addEventListener('pointerup', finishCarouselDrag);
cardsCarouselTrack?.addEventListener('pointercancel', finishCarouselDrag);
cardsCarouselTrack?.addEventListener('mouseenter', stopCarouselAutoplay);
cardsCarouselTrack?.addEventListener('mouseleave', restartCarouselAutoplay);
cardsCarouselTrack?.addEventListener('focusin', stopCarouselAutoplay);
cardsCarouselTrack?.addEventListener('focusout', restartCarouselAutoplay);

openProfileBtn?.addEventListener('click', toggleProfileQuickMenu);
openProfileMenuItem?.addEventListener('click', handleOpenProfileRequest);
openSettingsItem?.addEventListener('click', () => {
  closeProfileQuickMenu();
  window.alert('Configuracoes em desenvolvimento.');
});
logoutItem?.addEventListener('click', async () => {
  try {
    if (authToken) {
      await apiRequest('/auth/logout', { method: 'POST', requiresAuth: true });
    }
  } catch (_error) {
    // Mantem logout local mesmo se a API falhar.
  }

  resetAuthSession();
  closeProfileQuickMenu();
  window.alert('Voce saiu da sua conta.');
});
closeProfileBtn?.addEventListener('click', closeProfileModal);
closeProfileOverlay?.addEventListener('click', closeProfileModal);
closeLoginBtn?.addEventListener('click', closeLoginModal);
closeLoginOverlay?.addEventListener('click', closeLoginModal);

// Fecha o pop-up de cadastro pelos controles do modal.
closeSignupBtn?.addEventListener('click', closeSignupModal);
closeSignupOverlay?.addEventListener('click', closeSignupModal);

// Alterna para a tela de cadastro ao clicar no link.
goToSignupBtn?.addEventListener('click', showSignupView);

// Alterna para a tela de login ao clicar no link.
goToLoginBtn?.addEventListener('click', showLoginView);

// Envia os dados de cadastro para a API e faz login automatico em seguida.
signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('signupName')?.value.trim() || '';
  const email = document.getElementById('signupEmail')?.value.trim() || '';
  const password = document.getElementById('signupPassword')?.value || '';
  const confirm = document.getElementById('signupConfirm')?.value || '';

  if (!name || !email || !password) {
    setSignupFeedback('Preencha todos os campos.');
    return;
  }

  if (password !== confirm) {
    setSignupFeedback('As senhas nao coincidem.');
    return;
  }

  try {
    setSignupFeedback('Criando conta...', true);

    await apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });

    setSignupFeedback('Conta criada! Entrando...', true);

    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    setAuthSession(payload?.session || null);
    await loadProfileData();
    closeSignupModal();
    signupForm.reset();
    openProfileModal();
  } catch (error) {
    setSignupFeedback(error.message || 'Nao foi possivel criar a conta.');
  }
});

// Envia as credenciais para a API e abre o perfil quando o login for valido.
loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = loginEmail?.value.trim() || '';
  const password = loginPassword?.value.trim() || '';

  if (!email || !password) {
    setLoginFeedback('Preencha e-mail e senha para continuar.');
    return;
  }

  try {
    setLoginFeedback('Entrando...', true);

    const payload = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    setAuthSession(payload?.session || null);
    await loadProfileData();
    setLoginFeedback('Login realizado com sucesso.', true);
    closeLoginModal();
    loginForm.reset();
    openProfileModal();
  } catch (error) {
    setLoginFeedback(error.message || 'Nao foi possivel realizar login.');
  }
});

// Fecha o menu rapido quando o usuario clica fora dele.
document.addEventListener('click', (event) => {
  if (!profileQuickMenu?.classList.contains('active')) {
    return;
  }

  if (event.target.closest('#openProfileBtn') || event.target.closest('#profileQuickMenu')) {
    return;
  }

  closeProfileQuickMenu();
});

// Dispara a pesquisa quando o usuario pressiona Enter.
searchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && searchInput.value.trim()) {
    window.alert(`Pesquisando por: ${searchInput.value}\n(Funcionalidade em desenvolvimento)`);
  }
});

// Mantem o item ativo do menu e fecha o drawer no mobile.
menuItems.forEach((item) => {
  item.addEventListener('click', () => {
    syncMenuSelection(item.textContent.trim());
    closeFloatingMenu();
  });
});

menuToggleBtn?.addEventListener('click', toggleFloatingMenu);
floatingMenuClose?.addEventListener('click', closeFloatingMenu);
floatingMenuOverlay?.addEventListener('click', closeFloatingMenu);

// Centraliza os atalhos de teclado para fechar elementos abertos.
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }

  if (profileModal?.classList.contains('active')) {
    closeProfileModal();
  }

  if (loginModal?.classList.contains('active')) {
    closeLoginModal();
  }

  if (signupModal?.classList.contains('active')) {
    closeSignupModal();
  }

  if (profileQuickMenu?.classList.contains('active')) {
    closeProfileQuickMenu();
  }

  if (floatingRecommendationsTab?.classList.contains('active')) {
    closeFloatingTab();
  }

  if (floatingMenuDrawer?.classList.contains('active')) {
    closeFloatingMenu();
  }
});

// Inicia o arraste da aba flutuante a partir do cabecalho.
floatingTabDragHandle?.addEventListener('pointerdown', (event) => {
  if (!floatingRecommendationsTab.classList.contains('active')) {
    return;
  }

  if (event.target.closest('.floating-tab-close')) {
    return;
  }

  const rect = floatingRecommendationsTab.getBoundingClientRect();
  isDragging = true;
  dragPointerId = event.pointerId;
  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;

  floatingRecommendationsTab.style.left = `${rect.left}px`;
  floatingRecommendationsTab.style.top = `${rect.top}px`;
  floatingRecommendationsTab.style.right = 'auto';
  floatingRecommendationsTab.style.bottom = 'auto';
  floatingRecommendationsTab.classList.add('is-dragging');

  floatingTabDragHandle.setPointerCapture(event.pointerId);
});

// Atualiza a posicao da aba enquanto ela esta sendo arrastada.
floatingTabDragHandle?.addEventListener('pointermove', (event) => {
  if (!isDragging || dragPointerId !== event.pointerId) {
    return;
  }

  const margin = 8;
  const nextLeft = event.clientX - dragOffsetX;
  const nextTop = event.clientY - dragOffsetY;
  const maxLeft = Math.max(margin, window.innerWidth - floatingRecommendationsTab.offsetWidth - margin);
  const maxTop = Math.max(margin, window.innerHeight - floatingRecommendationsTab.offsetHeight - margin);

  floatingRecommendationsTab.style.left = `${clamp(nextLeft, margin, maxLeft)}px`;
  floatingRecommendationsTab.style.top = `${clamp(nextTop, margin, maxTop)}px`;
});

// Finaliza o arraste da aba flutuante.
function finishDrag(event) {
  if (!isDragging || dragPointerId !== event.pointerId) {
    return;
  }

  isDragging = false;
  dragPointerId = null;
  floatingRecommendationsTab.classList.remove('is-dragging');

  if (floatingTabDragHandle.hasPointerCapture(event.pointerId)) {
    floatingTabDragHandle.releasePointerCapture(event.pointerId);
  }
}

floatingTabDragHandle?.addEventListener('pointerup', finishDrag);
floatingTabDragHandle?.addEventListener('pointercancel', finishDrag);

// Mantem layout e autoplay sincronizados com eventos globais da pagina.
window.addEventListener('resize', keepFloatingTabInViewport);
window.addEventListener('resize', updateCarouselButtons);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopCarouselAutoplay();
    return;
  }

  restartCarouselAutoplay();
});

updateCarouselButtons();
startCarouselAutoplay();

// Tenta restaurar a sessao ja salva ao carregar a pagina.
if (isUserLoggedIn) {
  loadProfileData().catch(() => {
    resetAuthSession();
  });
}
