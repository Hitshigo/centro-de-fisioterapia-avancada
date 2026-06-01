// Form Submission & Nodemailer Integration
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        // Close menu when link is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Convert FormData to object
    const data = {
        service: formData.get('service') || 'contact_form',
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        consent: formData.get('consent') === 'on'
    };

    // Validation
    if (!data.name || !data.email || !data.phone || !data.subject) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!data.consent) {
        alert('Por favor, confirme que autoriza contacto.');
        return;
    }

    // Disable submit button during submission
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'A enviar...';

    try {
        // Send to Vercel Function (or email service)
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Pedido de consulta enviado com sucesso! Responderemos em breve.');
            form.reset();
        } else {
            const error = await response.json();
            alert('Erro ao enviar mensagem: ' + (error.message || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Erro de conexão. Por favor, tente novamente ou ligue directamente.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Smooth Scroll & Active Navigation
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            updateActiveNav();
        }
    });
});

function updateActiveNav() {
    const navLinks = document.querySelectorAll('.nav a');
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// Intersection Observer for Animations (screenshot-safe version)
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe service cards and other elements
    document.querySelectorAll('.service-card, .info-card, .about-text').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Add CSS animation classes dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(16px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }

    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .nav a.active {
        color: var(--primary);
        border-bottom: 2px solid var(--primary);
        padding-bottom: 0.25rem;
    }
`;
document.head.appendChild(styleSheet);

// Analytics tracking (optional - replace with your tracking code)
function trackEvent(eventName, eventData) {
    console.log('Event:', eventName, eventData);
}

// Track form submissions
document.addEventListener('submit', function(e) {
    if (e.target.id === 'contactForm') {
        trackEvent('form_submit', {
            form: 'contact_form'
        });
    }
});
