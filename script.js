// Function to load HTML components
async function loadComponents() {
    const path = window.location.pathname;
    const isSubPage = path.includes('/modules/') || path.includes('/blog/');
    
    // Calculate prefix based on nesting level
    let prefix = '';
    if (isSubPage) {
        const subPathStart = path.includes('/modules/') ? '/modules/' : '/blog/';
        const modulesIndex = path.indexOf(subPathStart);
        const subPath = path.substring(modulesIndex + subPathStart.length);
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
    initializeTimeline();
}

// Set active class on nav links based on current page
function setActiveNavLink() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const isPegasusSection = currentPage.startsWith('pegasus') || path.includes('/modules/pegasus/');
    const isPaceSection = currentPage.startsWith('pace') || path.includes('/modules/pace/');
    const isMollymawkSection = currentPage.startsWith('mollymawk') || path.includes('/modules/mollymawk/');
    const isBlogSection = currentPage.startsWith('blog') || path.includes('/blog/');

    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = href ? href.split('/').pop() : '';
        
        // Reset active class
        link.classList.remove('active');

        if (linkPage === 'pegasus.html' && isPegasusSection) {
            link.classList.add('active');
        } else if (linkPage === 'pace.html' && isPaceSection) {
            link.classList.add('active');
        } else if (linkPage === 'mollymawk.html' && isMollymawkSection) {
            link.classList.add('active');
        } else if (linkPage === 'blog.html' && isBlogSection) {
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

// Initialize App Preview Tabs and Menus
function initializeAppTabs() {
    const tabs = document.querySelectorAll('.app-tab');
    const grids = document.querySelectorAll('.app-grid');
    const label = document.getElementById('current-exam-label');
    const mockup = document.querySelector('.app-mockup');
    const examSelector = document.getElementById('app-exam-selector');
    const examDropdown = document.getElementById('app-exam-dropdown');
    const dropdownItems = document.querySelectorAll('.app-dropdown-item');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            updateAppExam(target, tab.textContent);
        });
    });

    // Dropdown switching
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = item.getAttribute('data-exam');
            updateAppExam(target, item.textContent);
            examDropdown.classList.remove('active');
        });
    });

    function updateAppExam(targetId, text) {
        // Update tabs
        tabs.forEach(t => {
            t.classList.remove('active');
            if (t.textContent === text) t.classList.add('active');
        });
        
        // Update grids
        grids.forEach(grid => grid.classList.remove('active'));
        const targetGrid = document.getElementById(targetId);
        if (targetGrid) targetGrid.classList.add('active');

        // Update header label
        if (label) label.textContent = text;

        // Update theme
        if (mockup) {
            mockup.classList.remove('theme-pace', 'theme-pegasus', 'theme-mollymawk');
            mockup.classList.add(`theme-${text.toLowerCase()}`);
        }
    }

    // Set initial theme
    if (label && mockup) {
        mockup.classList.add(`theme-${label.textContent.toLowerCase()}`);
    }

    // Toggle Dropdown
    if (examSelector && examDropdown) {
        examSelector.addEventListener('click', (e) => {
            e.stopPropagation();
            examDropdown.classList.toggle('active');
        });
    }

    // Close menus on outside click
    document.addEventListener('click', () => {
        if (examDropdown) examDropdown.classList.remove('active');
    });
}

// Initialize Back Links based on source
function initializeBackLinks() {
    const backLink = document.querySelector('.back-link');
    if (backLink) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'home') {
            const path = window.location.pathname;
            const isSubPage = path.includes('/modules/');
            
            let prefix = '';
            if (isSubPage) {
                const modulesIndex = path.indexOf('/modules/');
                const subPath = path.substring(modulesIndex + '/modules/'.length);
                const slashCount = (subPath.match(/\//g) || []).length;
                prefix = '../'.repeat(slashCount + 1);
            }
            
            backLink.href = `${prefix}index.html`;
            
            // Update text if it contains "PACE", "Pegasus", or "mollymawk"
            if (backLink.textContent.includes('PACE') || 
                backLink.textContent.includes('Pegasus') || 
                backLink.textContent.includes('mollymawk')) {
                
                const svg = backLink.querySelector('svg');
                backLink.innerHTML = '';
                if (svg) backLink.appendChild(svg);
                backLink.appendChild(document.createTextNode(' Back to Home'));
            }
        }
    }
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

// Blog Background Animation
function initBlogAnimation() {
    const container = document.getElementById('news-bg-animation');
    if (!container) return;

    const newsWords = ['NEWS', 'BREAKING', 'AVIATION', 'PILOT', 'RECRUITMENT', 'THY', 'PEGASUS', 'AIRLINES', 'SUCCESS', 'EXAM', 'CAPTAIN', 'COCKPIT'];
    const icons = ['✈', '📡', '📑', '🗞', '💡', '✅'];
    
    for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.className = 'news-icon-float';
        
        const content = Math.random() > 0.5 
            ? newsWords[Math.floor(Math.random() * newsWords.length)]
            : icons[Math.floor(Math.random() * icons.length)];
            
        el.innerText = content;
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = (Math.random() * 20 + 20) + 's';
        el.style.animationDelay = (Math.random() * -40) + 's';
        el.style.fontSize = (Math.random() * 2 + 1) + 'rem';
        el.style.opacity = (Math.random() * 0.2 + 0.05).toString();
        
        container.appendChild(el);
    }
}

// Handle Pegasus Notification Form
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponents();
    initializeAnimations();
    initializeAppTabs();
    initializeBackLinks();
    initBlogAnimation();
    
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
let cursor = document.querySelector('.custom-cursor');
let trail = document.querySelector('.cursor-trail');

// If they don't exist in HTML, create them
if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
}
if (!trail) {
    trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);
}

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let trailX = 0;
let trailY = 0;
let hasMoved = false;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!hasMoved) {
        hasMoved = true;
        cursor.style.opacity = '1';
        trail.style.opacity = '1';
    }
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

// �lan Takvimi Logic
function initializeTimeline() {
    const timelineContent = document.getElementById("timeline-content");
    const yearButtons = document.querySelectorAll(".year-btn");
    
    if (!timelineContent) return;

    const timelineData = {
        "2024": [
            { airline: "THY", class: "thy", start: "2024-06-13", end: "2024-09-09", label: "13 Jun - 9 Sep", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Standard mid-year intake (airlinehaber.com)" },
            { airline: "THY", class: "thy", start: "2024-10-07", end: "2024-10-25", label: "7 Oct - 25 Oct", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Fall intake (ATPL TV Careers)" },
            { airline: "Pegasus", class: "pegasus", start: "2024-05-10", end: "2024-06-24", label: "10 May - 24 Jun", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "Pilot Training Program / Cadet-style", notes: "Official listing for 2024. (ATPL TV Careers)" },
            { airline: "SunExpress", class: "sun", start: "2024-01-01", end: "2024-12-31", label: "All Year", link: "mollymawk.html", conditionsLink: "mollymawk-conditions.html", program: "MPL Pilot Training / Cadet-style", notes: "No official open/close dates available � must monitor live postings. (LinkedIn)" }
        ],
        "2025": [
            { airline: "THY", class: "thy", start: "2025-01-02", end: "2025-04-04", label: "2 Jan - 4 Apr", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Winter/Spring intake (ATPL TV Careers)" },
            { airline: "THY", class: "thy", start: "2025-05-27", end: "2025-07-11", label: "27 May - 11 Jul", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Early Summer intake (ATPL TV Careers)" },
            { airline: "THY", class: "thy", start: "2025-09-01", end: "2025-10-17", label: "Sep - 17 Oct", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Reported fall intake close date (orkam.yildiz.edu.tr)" },
            { airline: "Pegasus", class: "pegasus", start: "2025-03-17", end: "2025-04-01", label: "17 Mar - 1 Apr", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "Pilot Training Program / Cadet-style", notes: "Official listing for early 2025. (ATPL TV Careers)" },
            { airline: "Pegasus", class: "pegasus", start: "2025-07-15", end: "2025-09-01", label: "Jul - 1 Sep", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "PC-2026 Pilot Program", notes: "Another intake for PC-2026 program. (Facebook)" },
            { airline: "SunExpress", class: "sun", start: "2025-01-01", end: "2025-12-31", label: "All Year", link: "mollymawk.html", conditionsLink: "mollymawk-conditions.html", program: "MPL Pilot Training / Cadet-style", notes: "No official open/close dates available � must monitor live postings. (LinkedIn)" }
        ],
        "2026": [
            { airline: "Pegasus", class: "pegasus", start: "2026-01-02", end: "2026-03-15", label: "2 Jan - 15 Mar", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "Pilot Training Program / Cadet-style", notes: "Active recruitment for 2026 winter intake.", isActive: true },
            { airline: "SunExpress", class: "sun", start: "2026-01-01", end: "2026-12-31", label: "All Year", link: "mollymawk.html", conditionsLink: "mollymawk-conditions.html", program: "MPL Pilot Training / Cadet-style", notes: "No official open/close dates available � must monitor live postings. (LinkedIn)" }
        ]
    };

    function renderYear(year) {
        const data = timelineData[year] || [];
        
        // Sort data by start date, then by end date
        const sortedData = [...data].sort((a, b) => {
            const startA = new Date(a.start).getTime();
            const startB = new Date(b.start).getTime();
            if (startA !== startB) {
                return startA - startB;
            }
            return new Date(a.end).getTime() - new Date(b.end).getTime();
        });
        
        timelineContent.innerHTML = "";

        if (sortedData.length === 0) {
            timelineContent.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-gray);">No recruitment information available for this year yet.</div>`;
            return;
        }

        sortedData.forEach(item => {
            const timelineItem = document.createElement("div");
            timelineItem.className = `timeline-item ${item.class} ${item.isActive ? 'active-recruitment' : ''}`;
            
            const dot = document.createElement("div");
            dot.className = "timeline-dot";

            const dateBox = document.createElement("div");
            dateBox.className = "timeline-date-box";
            
            if (item.isActive) {
                const pulse = document.createElement("span");
                pulse.className = "pulse-dot";
                dateBox.appendChild(pulse);
                dateBox.appendChild(document.createTextNode(" LIVE: " + item.label));
            } else {
                dateBox.textContent = item.label;
            }
            
            const card = document.createElement("div");
            card.className = "timeline-content-card";
            
            const airline = document.createElement("span");
            airline.className = "timeline-airline";
            airline.textContent = item.airline;

            const program = document.createElement("span");
            program.className = "timeline-program";
            program.textContent = item.program;
            
            const notes = document.createElement("span");
            notes.className = "timeline-notes";
            notes.textContent = item.notes;

            const actions = document.createElement("div");
            actions.className = "timeline-actions";

            const prepBtn = document.createElement("a");
            prepBtn.href = item.link;
            prepBtn.className = "timeline-btn prep-btn";
            prepBtn.textContent = "Preparation Page";

            const condBtn = document.createElement("a");
            condBtn.href = item.conditionsLink;
            condBtn.className = "timeline-btn cond-btn";
            condBtn.textContent = "Application Conditions";

            actions.appendChild(prepBtn);
            actions.appendChild(condBtn);

            card.appendChild(airline);
            card.appendChild(program);
            card.appendChild(notes);
            card.appendChild(actions);
            
            timelineItem.appendChild(dot);
            timelineItem.appendChild(dateBox);
            timelineItem.appendChild(card);
            
            timelineContent.appendChild(timelineItem);
        });

        // Re-initialize interactive elements for the new cards
        initializeInteractiveElements();
    }

    yearButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            yearButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderYear(btn.dataset.year);
        });
    });

    // Initial render
    renderYear("2024");
}
