// CFA — Centro de Fisioterapia Avançada
// script.js — Interactions & Form Submission

document.addEventListener('DOMContentLoaded', function () {

    // ─── Sticky Header ────────────────────────────────
    const header = document.getElementById('header');
    function updateHeader() {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // ─── Hamburger / Mobile Menu ───────────────────────
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function (e) {
            if (!header.contains(e.target) && mobileMenu.classList.contains('open')) {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ─── Scroll Reveal (IntersectionObserver) ─────────
    const revealElements = document.querySelectorAll('.reveal-card');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Staggered delay for sibling cards
                    const siblings = entry.target.parentElement
                        ? [...entry.target.parentElement.children].filter(el => el.classList.contains('reveal-card'))
                        : [];
                    const index = siblings.indexOf(entry.target);
                    const delay = Math.min(index * 80, 400);
                    setTimeout(() => {
                        entry.target.classList.add('in-view');
                    }, delay);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: show all immediately
        revealElements.forEach(el => el.classList.add('in-view'));
    }

    // ─── Active Nav Highlight ──────────────────────────
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
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
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // ─── Form Submission ───────────────────────────────
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const data = {
        service: formData.get('service') || 'contact_form',
        name:    formData.get('name'),
        email:   formData.get('email'),
        phone:   formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        consent: formData.get('consent') === 'on'
    };

    if (!data.name || !data.email || !data.phone || !data.subject) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    if (!data.consent) {
        alert('Por favor, confirme que autoriza contacto.');
        return;
    }

    const btn = form.querySelector('.submit-button');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'A enviar...';

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            alert('Pedido enviado com sucesso! Respondemos em menos de 24 horas.');
            form.reset();
        } else {
            const err = await response.json().catch(() => ({}));
            alert('Erro ao enviar: ' + (err.message || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Erro de ligação. Ligue diretamente para 928 037 873.');
    } finally {
        btn.disabled = false;
        btn.textContent = original;
    }
}
