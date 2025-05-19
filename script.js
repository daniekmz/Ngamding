// DOM Elements
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelectorAll('.sidebar-nav a');
const themeToggle = document.getElementById('theme-toggle');
const openChatBtn = document.getElementById('open-chat');

// Initialize the app
function init() {
    setupEventListeners();
    setupScrollAnimation();
    setupNavigation();
    setInitialTheme();
}

// Set up event listeners
function setupEventListeners() {
    // Toggle sidebar
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Open chat
    if (openChatBtn) {
        openChatBtn.addEventListener('click', toggleChatSection);
    }
}

// Set initial theme based on preference
function setInitialTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

// Setup navigation
function setupNavigation() {
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToSection(link);
            });
        });
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
    animateNavItems();
}

function animateNavItems() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

function navigateToSection(link) {
    // Remove active class from all links and sections
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked link and corresponding section
    link.classList.add('active');
    const targetSection = document.querySelector(link.getAttribute('href'));
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        sidebar.classList.remove('active');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDarkMode 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
}

function toggleChatSection() {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
        chatSection.classList.toggle('active');
        // Scroll to chat section if it's being opened
        if (chatSection.classList.contains('active')) {
            chatSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

function setupScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);