function openTab(event, tabName) {
    // Mengambil semua elemen dengan class "tab-content"
    const tabContents = document.querySelectorAll('.tab-content');
    // Mengambil semua elemen dengan class "tab-link"
    const tabLinks = document.querySelectorAll('.tab-link');

    // Menyembunyikan semua tab content
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });

    // Menghapus class "active" dari semua tab links
    tabLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Menampilkan tab content yang sesuai
    document.getElementById(tabName).classList.add('active');

    // Menambahkan class "active" pada tab link yang diklik
    event.currentTarget.classList.add('active');
    function toggleMenu() {
        const menuContent = document.getElementById('menuContent');
        if (menuContent.style.display === 'block') {
            menuContent.style.display = 'none';
        } else {
            menuContent.style.display = 'block';
        }
    }

    // Menutup menu jika klik di luar
    window.onclick = function(event) {
        if (!event.target.matches('.menu-button')) {
            const menuContent = document.getElementById('menuContent');
            if (menuContent.style.display === 'block') {
                menuContent.style.display = 'none';
            }
        }
    }
}