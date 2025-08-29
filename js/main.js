// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Cargar componentes header y footer
    loadComponents();
    
    // Configurar página actual después de cargar header
    setTimeout(() => {
        setActivePage();
        setupMobileMenu();
        initializePageSpecificFeatures();
    }, 100);
});

// Función para cargar header y footer
async function loadComponents() {
    try {
        // Cargar header
        const headerResponse = await fetch('components/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header').innerHTML = headerHtml;
        
        // Cargar footer
        const footerResponse = await fetch('components/footer.html');
        const footerHtml = await footerResponse.text();
        const footerElement = document.getElementById('footer');
        if (footerElement) {
            footerElement.innerHTML = footerHtml;
        }
    } catch (error) {
        console.log('Error cargando componentes:', error);
    }
}

// Función para establecer la página activa
function setActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Remover active class de todos los links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Agregar active class al link correspondiente
    document.querySelectorAll(`a[href="${currentPage}"]`).forEach(link => {
        if (link.classList.contains('nav-link') || link.classList.contains('mobile-nav-link')) {
            link.classList.add('active');
        }
    });
}

// Configurar menú móvil
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = !mobileMenu.classList.contains('hidden');
            
            if (isOpen) {
                // Cerrar menú
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            } else {
                // Abrir menú
                mobileMenu.classList.remove('hidden');
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            }
        });
        
        // Cerrar menú al hacer click en un link
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });
    }
}

// Inicializar características específicas de cada página
function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log('Página actual detectada:', currentPage);
    
    switch (currentPage) {
        case 'index.html':
        case 'services.html':
        case '':  // Para cuando se accede con /
            console.log('Inicializando página principal/servicios');
            initializeSimulator();
            initializeTechCarousel();
            initializeExperienceModal();
            break;
        case 'contact.html':
            console.log('Inicializando página de contacto');
            initializeContactForm();
            break;
        default:
            console.log('Página no reconocida, inicializando funciones básicas');
            // En caso de que haya otras páginas, inicializar modal por defecto
            initializeExperienceModal();
            break;
    }
}

// Inicializar simulador (placeholder)
function initializeSimulator() {
    console.log('Inicializando simulador...');
    const simulatorElement = document.getElementById('disaster-simulator');
    if (simulatorElement) {
        // Efecto de typing en el simulador
        setTimeout(() => {
            typeText('simulator-output', 'Sistema iniciando...', 50);
        }, 1000);
        
        setTimeout(() => {
            const outputElement = document.getElementById('simulator-output');
            if (outputElement) {
                outputElement.innerHTML += '<br>> Escaneando infraestructura...';
            }
        }, 3000);
        
        setTimeout(() => {
            const outputElement = document.getElementById('simulator-output');
            if (outputElement) {
                outputElement.innerHTML += '<br>> Listo para simulación de desastres';
                outputElement.innerHTML += '<br><span class="text-yellow-400">> ¿Estás preparado?</span>';
            }
        }, 5000);
    }
}

// Inicializar carrusel de tecnologías
function initializeTechCarousel() {
    console.log('Inicializando carrusel de tecnologías...');
    const slider = document.querySelector('.tech-slider');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    const totalSlides = 4;
    
    if (!slider || !dots.length) {
        console.log('Elementos del carrusel no encontrados');
        return;
    }
    
    // Auto-play carousel
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
    }, 4000);
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });
    
    function updateCarousel() {
        // Update slider position
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update active dot - Improved logic
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'bg-cyan-400');
            dot.classList.add('bg-gray-300');
            
            if (index === currentSlide) {
                dot.classList.add('active', 'bg-cyan-400');
                dot.classList.remove('bg-gray-300');
            }
        });
    }
    
    // Initialize first dot as active
    updateCarousel();
    console.log('Carrusel de tecnologías inicializado correctamente');
}

// Modal de Experiencia
function initializeExperienceModal() {
    console.log('Inicializando modal de experiencia...');
    
    const showModalBtn = document.getElementById('showExperienceModal');
    const closeModalBtn = document.getElementById('closeExperienceModal');
    const modal = document.getElementById('experienceModal');
    
    console.log('Elementos encontrados:', {
        showModalBtn: !!showModalBtn,
        closeModalBtn: !!closeModalBtn,
        modal: !!modal
    });
    
    if (!showModalBtn) {
        console.error('No se encontró el botón showExperienceModal');
        return;
    }
    
    if (!modal) {
        console.error('No se encontró el modal experienceModal');
        return;
    }
    
    // Verificar si ya está inicializado
    if (showModalBtn.hasAttribute('data-initialized')) {
        console.log('Modal ya inicializado previamente');
        return;
    }
    
    // Mostrar modal
    showModalBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Clic en botón Mi Experiencia');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    });
    
    // Cerrar modal
    function closeModal() {
        console.log('Cerrando modal');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restaurar scroll del body
    }
    
    // Solo agregar listener de cerrar si el botón existe
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
    
    // Marcar como inicializado
    showModalBtn.setAttribute('data-initialized', 'true');
    
    console.log('Modal de experiencia inicializado correctamente');
}

// Función para efecto de escritura
function typeText(elementId, text, speed = 100) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = '';
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}

// Inicializar formulario de contacto
function initializeContactForm() {
    console.log('Inicializando formulario de contacto...');
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aquí irá la lógica del formulario
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            
            // Simular envío
            setTimeout(() => {
                alert('Mensaje enviado! Te contactaré pronto.');
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
        console.log('Formulario de contacto inicializado correctamente');
    } else {
        console.log('Formulario de contacto no encontrado');
    }
}

// Utilidades generales
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}
