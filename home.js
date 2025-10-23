document.addEventListener('DOMContentLoaded', function() {
  const footer = document.querySelector("footer")
  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML += `<p>© ${year} Your Name</p>`;
  }

    const welcome = document.getElementById('welcome');
    if (welcome) {
        const hour = new Date().getHours();
        let greeting = hour < 12 ? 'Good Morning!' :
                      hour < 18 ? 'Good Afternoon!' : 'Good Evening!';
        welcome.innerHTML = `<h2>${greeting} Welcome to Cinemetrics</h2>`;
    }
});


const menuIcon = document.getElementById('menu-icon');
const navLinks = document.getElementById('nav-links');

menuIcon.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
