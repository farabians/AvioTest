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
    initializePaceCarousel();
    initializeBannerParticles();
}

// Set active class on nav links based on current page
function setActiveNavLink() {
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    const isPegasusSection = currentPage.startsWith('pegasus') || path.includes('/modules/pegasus/');
    const isPaceSection = currentPage.startsWith('pace') || path.includes('/modules/pace/');
    const isMollymawkSection = currentPage.startsWith('mollymawk') || path.includes('/modules/mollymawk/');

    // Helper to check if a link matches the current section
    const isMatch = (href) => {
        if (!href || href === "#" || href === "") return false;
        const linkPage = href.split('/').pop();
        if (linkPage === 'pegasus.html' && isPegasusSection) return true;
        if (linkPage === 'pace.html' && isPaceSection) return true;
        if (linkPage === 'mollymawk.html' && isMollymawkSection) return true;
        if (linkPage === currentPage && currentPage !== 'index.html') return true;
        return false;
    };

    // Update nav links and dropdown items
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
        link.classList.remove('active');
        if (isMatch(link.getAttribute('href'))) {
            link.classList.add('active');
            
            // If it's a dropdown item, also highlight the parent toggle
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) toggle.classList.add('active');
            }
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

    let currentIndex = 0;
    let autoSwitchTimer = null;
    const intervalTime = 3000;

    // Tab switching
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            currentIndex = index;
            const target = tab.getAttribute('data-target');
            updateAppExam(target, tab.textContent);
            resetTimer();
        });
    });

    // Dropdown switching
    dropdownItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = index;
            const target = item.getAttribute('data-exam');
            updateAppExam(target, item.textContent);
            examDropdown.classList.remove('active');
            resetTimer();
        });
    });

    function updateAppExam(targetId, text) {
        const targetGrid = document.getElementById(targetId);
        
        // Update tabs
        tabs.forEach(t => {
            t.classList.remove('active');
            if (t.textContent === text) t.classList.add('active');
        });
        
        if (targetGrid) {
            // If the grid is already active, don't re-animate
            if (targetGrid.classList.contains('active')) return;

            // Switch active grid
            grids.forEach(grid => grid.classList.remove('active'));
            targetGrid.classList.add('active');
        }

        // Update header label
        if (label) label.textContent = text;

        // Update theme
        if (mockup) {
            mockup.classList.remove('theme-pace', 'theme-pegasus', 'theme-mollymawk');
            mockup.classList.add(`theme-${text.toLowerCase()}`);
        }
    }

    function startTimer() {
        if (!autoSwitchTimer) {
            autoSwitchTimer = setInterval(() => {
                currentIndex = (currentIndex + 1) % tabs.length;
                const nextTab = tabs[currentIndex];
                const target = nextTab.getAttribute('data-target');
                updateAppExam(target, nextTab.textContent);
            }, intervalTime);
        }
    }

    function stopTimer() {
        if (autoSwitchTimer) {
            clearInterval(autoSwitchTimer);
            autoSwitchTimer = null;
        }
    }

    function resetTimer() {
        stopTimer();
        startTimer();
    }

    // Auto-switch based on mouse interaction
    if (mockup) {
        mockup.addEventListener('mouseenter', stopTimer);
        mockup.addEventListener('mouseleave', startTimer);
        
        // Add event listeners for module cards to prevent switching while hovering them
        const moduleCards = mockup.querySelectorAll('.app-module-card');
        moduleCards.forEach(card => {
            card.addEventListener('mouseenter', stopTimer);
            card.addEventListener('mouseleave', startTimer);
        });
        
        // Touch events for mobile
        mockup.addEventListener('touchstart', stopTimer, {passive: true});
        mockup.addEventListener('touchend', () => {
            // Restart after a small delay on touch
            setTimeout(startTimer, 1000);
        }, {passive: true});
    }

    // Start initial timer
    startTimer();

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

// Initialize Discovery Toggle (Accordion)
function initializeDiscoveryToggle() {
    const discoveryCards = document.querySelectorAll('.discovery-toggle-card');
    discoveryCards.forEach(card => {
        const header = card.querySelector('.discovery-header');
        if (header) {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle active class on the card
                card.classList.toggle('active');
            });
        }
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

// Typewriter animation for hero title
function initializeTypewriter() {
    const element = document.getElementById('typewriter');
    if (!element) return;

    const phrases = [
        "Preparation software for\nTurkish Cadet Candidate Exams"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            charIndex--;
            speed = 50;
        } else {
            charIndex++;
            speed = 100;
        }

        element.innerHTML = currentPhrase.substring(0, charIndex).replace(/\n/g, '<br>');

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            speed = 2000; // Wait at the end of phrase
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            speed = 500; // Wait before starting next phrase
        }

        setTimeout(type, speed);
    }

    type();
}

// Initialize Features "More" button
function initializeFeaturesMore() {
    const moreBtn = document.getElementById('featuresMoreBtn');
    const moreContent = document.getElementById('featuresMoreContent');
    
    if (moreBtn && moreContent) {
        moreBtn.addEventListener('click', () => {
            const isShowing = moreContent.classList.contains('show');
            if (isShowing) {
                moreContent.classList.remove('show');
                moreBtn.textContent = 'More';
            } else {
                moreContent.classList.add('show');
                moreBtn.textContent = 'Less';
            }
        });
    }
}

// Handle Pegasus Notification Form
document.addEventListener('DOMContentLoaded', async () => {
    initializeTypewriter();
    await loadComponents();
    initializeAnimations();
    initializeAppTabs();
    initializeBackLinks();
    initializeDiscoveryToggle();
    initializeFeaturesMore();
    
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
        // Close all dropdowns
        document.querySelectorAll('.nav-item.dropdown').forEach(d => d.classList.remove('open'));
    };

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Dropdown toggle for mobile
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    const parent = toggle.closest('.nav-item.dropdown');
                    
                    // Close other dropdowns
                    document.querySelectorAll('.nav-item.dropdown').forEach(d => {
                        if (d !== parent) d.classList.remove('open');
                    });
                    
                    parent.classList.toggle('open');
                }
            });
        });

        // Close menu when clicking a link (not a dropdown toggle)
        document.querySelectorAll('.nav-link:not(.dropdown-toggle), .dropdown-item, .mobile-cta').forEach(link => {
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

// İlan Takvimi Logic
function initializeTimeline() {
    const timelines = {
        'thy': document.getElementById("timeline-thy"),
        'pegasus': document.getElementById("timeline-pegasus"),
        'sun': document.getElementById("timeline-sun")
    };
    const yearButtons = document.querySelectorAll(".year-btn");
    
    if (!timelines.thy) return;

    const timelineData = {
        "2024": [
            { airline: "THY", class: "thy", start: "2024-06-13", end: "2024-09-09", label: "13 Jun - 9 Sep", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Standard mid-year intake (airlinehaber.com)" },
            { airline: "THY", class: "thy", start: "2024-10-07", end: "2024-10-25", label: "7 Oct - 25 Oct", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Fall intake (airlinehaber.com)" },
            { airline: "Pegasus", class: "pegasus", start: "2024-05-10", end: "2024-06-24", label: "10 May - 24 Jun", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "Pilot Training Program / Cadet-style", notes: "Official listing for 2024. (ATPL TV Careers)" },
            { airline: "SunExpress", class: "sun", start: "2024-01-01", end: "2024-12-31", label: "All Year", link: "mollymawk.html", conditionsLink: "mollymawk-conditions.html", program: "MPL Pilot Training / Cadet-style", notes: "No official open/close dates available - must monitor live postings. (LinkedIn)" }
        ],
        "2025": [
            { airline: "THY", class: "thy", start: "2025-01-02", end: "2025-04-04", label: "2 Jan - 4 Apr", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Winter/Spring intake (ATPL TV Careers)" },
            { airline: "THY", class: "thy", start: "2025-05-27", end: "2025-07-11", label: "27 May - 11 Jul", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Early Summer intake (ATPL TV Careers)" },
            { airline: "THY", class: "thy", start: "2025-09-01", end: "2025-10-17", label: "~Sep - 17 Oct", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Reported fall intake close date (orkam.yildiz.edu.tr)" },
            { airline: "Pegasus", class: "pegasus", start: "2025-03-17", end: "2025-04-01", label: "17 Mar - 1 Apr", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "Pilot Training Program / Cadet-style", notes: "Official listing for early 2025 (ATPL TV Careers)" },
            { airline: "Pegasus", class: "pegasus", start: "2025-08-01", end: "2025-09-01", label: "Aug - 1 Sep", link: "pegasus.html", conditionsLink: "pegasus-conditions.html", program: "PC-2026 Pilot Program", notes: "Another intake for PC-2026 program (Facebook)" },
            { airline: "SunExpress", class: "sun", start: "2025-01-01", end: "2025-12-31", label: "All Year", link: "mollymawk.html", conditionsLink: "mollymawk-conditions.html", program: "MPL Pilot Training", notes: "Continuous recruitment" }
        ],
        "2026": [
            { airline: "THY", class: "thy", start: "2026-02-03", end: "2026-03-27", label: "3 Feb - 27 Mar", link: "pace.html", conditionsLink: "pace-conditions.html", program: "Cadet Pilot Program", notes: "Winter/Spring intake", isActive: true },
            { airline: "SunExpress", class: "sun", start: "2026-01-01", end: "2026-12-31", label: "All Year", link: "mollymawk.html", conditionsLink: "mollymawk-conditions.html", program: "MPL Pilot Training", notes: "Continuous recruitment", isActive: true, isActive: true }
        ]
    };

    function calculatePosition(dateString, isEnd = false) {
        const date = new Date(dateString);
        const month = date.getMonth();
        let day = date.getDate();
        if (isEnd) day += 1; // Include the full day for the end position
        return (month * 100) + ((day - 1) / 31 * 100);
    }

    function renderYear(year) {
        const data = timelineData[year] || [];
        Object.values(timelines).forEach(tl => tl.innerHTML = "");

        data.forEach((item, index) => {
            const container = timelines[item.class];
            if (!container) return;

            const startPos = calculatePosition(item.start);
            const endPos = calculatePosition(item.end, true);
            const durationHeight = Math.max(endPos - startPos, 2); // Minimum 2px height

            // 1. Create Duration Line
            const durationLine = document.createElement("div");
            durationLine.className = "timeline-duration-line";
            durationLine.style.top = `${startPos}px`;
            durationLine.style.height = `${durationHeight}px`;
            durationLine.style.animationDelay = `${index * 0.1}s`; // Staggered delay
            container.appendChild(durationLine);

            // 2. Create Dots (Start & End)
            const startDot = document.createElement("div");
            startDot.className = "timeline-dot";
            startDot.style.top = `${startPos}px`;
            startDot.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(startDot);

            const endDot = document.createElement("div");
            endDot.className = "timeline-dot";
            endDot.style.top = `${startPos + durationHeight}px`;
            // Appear after the line has grown (0.6s)
            endDot.style.animationDelay = `${(index * 0.1) + 0.5}s`; 
            container.appendChild(endDot);

            // 3. Create Date Box
            const dateBox = document.createElement("div");
            dateBox.className = `date-label-box ${item.isActive ? 'active-date' : ''}`;
            dateBox.style.top = `${startPos}px`;
            dateBox.style.animationDelay = `${index * 0.1}s`; // Staggered delay
            dateBox.textContent = item.label;
            container.appendChild(dateBox);

            // 4. Create Card
            const card = document.createElement("div");
            card.className = `timeline-event-card ${item.isActive ? 'active-recruitment' : ''}`;
            card.style.top = `${startPos + 25}px`; /* Slightly adjusted offset */
            card.style.animationDelay = `${index * 0.1}s`; // Staggered delay

            if (item.isActive) {
                const badge = document.createElement("div");
                badge.className = "status-badge-premium";
                badge.style.marginBottom = "10px";
                badge.style.alignSelf = "center"; // Center the badge specifically
                
                const dot = document.createElement("span");
                dot.className = "pulse-dot";
                
                badge.appendChild(dot);
                badge.appendChild(document.createTextNode(" Applications Open"));
                card.appendChild(badge);
            }

            const airlineName = document.createElement("div");
            airlineName.className = "event-airline-name";
            airlineName.textContent = item.airline;
            
            const program = document.createElement("div");
            program.className = "event-program";
            program.textContent = item.program;

            const notes = document.createElement("div");
            notes.className = "event-notes";
            notes.textContent = item.notes;

            const actions = document.createElement("div");
            actions.className = "event-actions";

            const prepLink = document.createElement("a");
            prepLink.href = item.link;
            prepLink.className = "event-link prep-btn";
            prepLink.textContent = "Preparation Page";

            const condLink = document.createElement("a");
            condLink.href = item.conditionsLink;
            condLink.className = "event-link cond-btn";
            condLink.textContent = "Application Conditions";

            actions.appendChild(prepLink);
            actions.appendChild(condLink);

            card.appendChild(airlineName);
            card.appendChild(program);
            card.appendChild(notes);
            card.appendChild(actions);

            container.appendChild(card);
        });

        initializeInteractiveElements();
    }

    yearButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            yearButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderYear(btn.dataset.year);
        });
    });

    renderYear("2026");
}

function initializePaceCarousel() {
    const carousel = document.getElementById('paceCarousel');
    if (!carousel) return;

    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!items.length) return;

    let currentIndex = 0;
    const totalItems = items.length;
    let autoRotateInterval;

    // Clear and Create dots
    dotsContainer.innerHTML = '';
    items.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.dot');

    function updateCarousel() {
        items.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');
            
            // Calculate distance for cyclic array
            let diff = index - currentIndex;
            
            // Handle wrap around for distance calculation
            if (diff > totalItems / 2) diff -= totalItems;
            if (diff < -totalItems / 2) diff += totalItems;

            if (diff === 0) {
                item.classList.add('active');
            } else if (diff === -1) {
                item.classList.add('prev');
            } else if (diff === 1) {
                item.classList.add('next');
            } else if (diff < -1) {
                item.classList.add('far-prev');
            } else if (diff > 1) {
                item.classList.add('far-next');
            }
        });

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = (index + totalItems) % totalItems;
        updateCarousel();
        resetAutoRotate();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoRotate() {
        if (autoRotateInterval) clearInterval(autoRotateInterval);
        autoRotateInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoRotate() {
        startAutoRotate();
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
    });
    
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
    });

    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index !== currentIndex) {
                goToSlide(index);
            }
        });
    });

    // Touch support for mobile
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Initial setup
    updateCarousel();
    startAutoRotate();
}

// Mobile/Desktop Banner Particles Animation
function initializeBannerParticles() {
    const banners = [
        document.getElementById('desktop-banner-particles'),
        document.getElementById('mobile-banner-particles')
    ];

    banners.forEach(canvas => {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrame;
        let time = 0;

        function resize() {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 1. Static-like subtle grain/noise or scanlines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.height; i += 4) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            // 2. Extremely subtle ambient glow that shifts very slowly
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const gradient = ctx.createRadialGradient(
                centerX + Math.cos(time * 0.5) * 50, 
                centerY + Math.sin(time * 0.5) * 20, 
                0,
                centerX, 
                centerY, 
                canvas.width * 0.8
            );
            
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.04)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            time += 0.005;
            animationFrame = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        resize();
        draw();
    });
}
