// Toggle Sidebar
document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('active');

    // Animate menu items
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
});

// Highlight Active Menu and Show Section
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.sidebar-nav a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all links and sections
        navLinks.forEach(link => link.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        // Add active class to clicked link and corresponding section
        link.classList.add('active');
        const targetSection = document.querySelector(link.getAttribute('href'));
        targetSection.classList.add('active');
    });
});

// Toggle Dark/Light Mode
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
});

// Scroll Animation
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

// Toggle Chat Section
document.getElementById('open-chat').addEventListener('click', () => {
    const chatSection = document.getElementById('chat-section');
    chatSection.classList.toggle('active');
});

// Submit Chat Form
document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('chat-name').value;
    const message = document.getElementById('chat-message').value;
    sendMessage(name, message);
    document.getElementById('chat-message').value = ''; // Clear input
});

// Function to send a message
function sendMessage(name, message) {
    db.collection("messages").add({
        name: name,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .catch((error) => {
        console.error("Error sending message: ", error);
    });
}

// Function to display messages
function displayMessages() {
    db.collection("messages").orderBy("timestamp", "asc").onSnapshot((snapshot) => {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = "";
        snapshot.forEach((doc) => {
            const message = doc.data();
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <strong>${message.name}</strong>
                <p>${message.message}</p>
                <small>${new Date(message.timestamp?.toDate()).toLocaleString()}</small>
            `;
            chatMessages.appendChild(messageElement);
        });
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Display messages on page load
displayMessages();