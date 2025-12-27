// Function to load HTML components
async function loadComponents() {
    const path = window.location.pathname;
    const isSubPage = path.includes('/modules/');
    
    // Calculate prefix based on nesting level
    let prefix = '';
    if (isSubPage) {
        const modulesIndex = path.indexOf('/modules/');
        const subPath = path.substring(modulesIndex + '/modules/'.length);
        const slashCount = (subPath.match(/\//g) || []).length;
        prefix = '../'.repeat(slashCount + 1);
    }
    
    const components = [
        { id: 'header-placeholder', url: `${prefix}components/header.html` },
        { id: 'footer-placeholder', url: `${prefix}components/footer.html` }
    ];

    for (const component of components) {
        const placeholder = document.getElementById(component.id);
        if (placeholder) {
            try {
                const response = await fetch(component.url);
                const content = await response.text();
                
                // Adjust paths in the loaded content if we are in a subpage
                let adjustedContent = content;
                if (isSubPage) {
                    // Replace all .html links that don't already have a path prefix or protocol
                    adjustedContent = adjustedContent.replace(/href="(?!http|#|\.\.\/)([^"]+\.html(?:#[^"]*)?)"/g, `href="${prefix}$1"`);
                    // Replace all image sources that point to the images folder
                    adjustedContent = adjustedContent.replace(/src="images\//g, `src="${prefix}images/`);
                }
                
                placeholder.innerHTML = adjustedContent;
            } catch (error) {
                console.error(`Error loading component ${component.url}:`, error);
            }
        }
    }
    
    // Initialize components after they are loaded
    initializeMenu();
    initializeNavLinks();
    initializeInteractiveElements();
    setActiveNavLink();
}

// Set active class on nav links based on current page
function setActiveNavLink() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const isPegasusSection = currentPage.startsWith('pegasus') || path.includes('/modules/pegasus/');
    const isPaceSection = currentPage.startsWith('pace') || path.includes('/modules/pace/');

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = href ? href.split('/').pop() : '';
        
        // Reset active class
        link.classList.remove('active');

        if (linkPage === 'pegasus.html' && isPegasusSection) {
            link.classList.add('active');
        } else if (linkPage === 'pace.html' && isPaceSection) {
            link.classList.add('active');
        } else if (linkPage === currentPage && currentPage !== 'index.html') {
            link.classList.add('active');
        }
    });
}

// Handle newsletter subscription
function handleSubscribe(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    if (email) {
        // Show success message
        const form = event.target;
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for subscribing!';
        successMessage.style.cssText = `
            padding: 12px 16px;
            background-color: #4CAF50;
            color: white;
            border-radius: 8px;
            margin-top: 12px;
            text-align: center;
            font-weight: 500;
        `;
        
        form.appendChild(successMessage);
        form.reset();
        
        // Remove message after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
    }
}

// Add smooth scroll to sections when nav links are clicked
function initializeNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply animation to feature and exam cards
function initializeAnimations() {
    document.querySelectorAll('.feature-card, .exam-card, .platform-item').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Handle Pegasus Notification Form
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponents();
    initializeAnimations();
    
    // Header scroll effect
    const handleScroll = () => {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    const notifyBtn = document.getElementById('notify-btn');
    const notificationForm = document.getElementById('notification-form');
    
    if (notifyBtn && notificationForm) {
        notifyBtn.addEventListener('click', () => {
            const wrapper = notifyBtn.closest('.notify-btn-wrapper');
            if (wrapper) {
                wrapper.classList.add('hidden');
            } else {
                notifyBtn.classList.add('hidden');
            }
            notificationForm.classList.remove('hidden');
        });
    }

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all other items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

function handleNotify(event) {
    event.preventDefault();
    const emailInput = document.getElementById('notify-email');
    const errorText = document.getElementById('notify-error');
    const successText = document.getElementById('notify-success');
    const email = emailInput.value;
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(email)) {
        errorText.classList.add('hidden');
        successText.classList.remove('hidden');
        event.target.classList.add('hidden'); // Hide the form
    } else {
        errorText.classList.remove('hidden');
        successText.classList.add('hidden');
    }
}

// Custom Cursor and Trail Logic
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const trail = document.createElement('div');
trail.className = 'cursor-trail';
document.body.appendChild(trail);

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let trailX = 0;
let trailY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animate() {
    // Smooth cursor movement
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Smooth trail movement with more delay
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    trail.style.left = `${trailX}px`;
    trail.style.top = `${trailY}px`;

    requestAnimationFrame(animate);
}
animate();

// Hamburger Menu Logic
function initializeMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const logoLink = document.querySelector('.logo a');

    const closeMenu = () => {
        if (menuToggle) menuToggle.classList.remove('active');
        if (nav) nav.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking the logo
        if (logoLink) {
            logoLink.addEventListener('click', closeMenu);
        }

        // Close menu on back button
        window.addEventListener('popstate', closeMenu);
    }
}

// Add hover effect for interactive elements
function initializeInteractiveElements() {
    const interactiveElements = document.querySelectorAll('a, button, .store-btn, .exam-card, input, textarea');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const trail = document.querySelector('.cursor-trail');
            const cursor = document.querySelector('.custom-cursor');
            if (trail) trail.classList.add('active');
            
            // Check if the element or its parent has a red background or is a primary button
            const isRedBackground = el.classList.contains('cta-button') || 
                                   el.classList.contains('hero-cta-button') || 
                                   el.classList.contains('subscribe-btn') ||
                                   el.closest('.footer') ||
                                   window.getComputedStyle(el).backgroundColor === 'rgb(255, 0, 0)';
            
            if (isRedBackground && cursor) {
                cursor.classList.add('white');
            }
        });
        el.addEventListener('mouseleave', () => {
            const trail = document.querySelector('.cursor-trail');
            const cursor = document.querySelector('.custom-cursor');
            if (trail) trail.classList.remove('active');
            if (cursor) cursor.classList.remove('white');
        });
    });
}