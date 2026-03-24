console.log("Portfolio loaded successfully!");

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const profilePic = document.getElementById('profilePic');
const menuButtons = document.querySelectorAll('.menu-btn');

// fragment cache by URL
const fragmentCache = {};

function toggleMenu() {
  sidebar.classList.toggle('menu-collapsed');
}
function closeMenu() {
  if (window.innerWidth < 992) sidebar.classList.add('menu-collapsed');
}

if (menuToggle) menuToggle.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleMenu(); });
if (profilePic) profilePic.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (window.innerWidth < 992) toggleMenu(); });

// Generic loader: fetch fragment (html file) and inject into targetId element
async function loadFragment(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '<div class="py-5 text-center text-muted">Loading...</div>';
  try {
    if (fragmentCache[url]) {
      target.innerHTML = fragmentCache[url];
      initAfterLoad(targetId);
      return;
    }
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('Failed to load ' + url);
    const html = await resp.text();
    fragmentCache[url] = html;
    target.innerHTML = html;
    initAfterLoad(targetId);
  } catch (err) {
    console.error(err);
    target.innerHTML = '<div class="py-5 text-center text-danger">Unable to load content.</div>';
  }
}

function initAfterLoad(targetId) {
  // Attach handlers that depend on dynamically loaded content
  if (targetId === 'resume') initResumeHandlers();
  if (targetId === 'contact') initContactHandlers();
  // add other inits if blog/projects/about need JS
}

function initResumeHandlers() {
  const downloadBtn = document.querySelector('.resume-container .btn-dark');
  const resumeElement = document.querySelector('.resume-wrapper');

  if (downloadBtn && resumeElement && typeof html2pdf === 'function') {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();

      // Clone to avoid changing original DOM
      const clonedElement = resumeElement.cloneNode(true);
      clonedElement.style.padding = '10px';
      clonedElement.style.margin = '0';

      const opt = {
        margin: [8, 8, 8, 8],
        filename: 'Gene_Ryan_Fulminar_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true },
        pagebreak: { avoid: ['tr', '.job-item', '.resume-section'] }
      };

      html2pdf().set(opt).from(clonedElement).save();
    });
  }
}

function initContactHandlers() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value || '';
    const email = document.getElementById('email').value || '';
    const subject = document.getElementById('subject').value || '';
    const message = document.getElementById('message').value || '';

    const mailtoLink = `mailto:g.fulminar1199@aol.com?subject=${encodeURIComponent(subject)}&body=From: ${encodeURIComponent(name)} (${encodeURIComponent(email)})%0A%0A${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
    contactForm.reset();
  });
}

// Menu click handler
menuButtons.forEach(btn => {
  btn.addEventListener('click', async function(e) {
    e.preventDefault();
    const section = this.getAttribute('data-section');

    // hide all sections
    document.querySelectorAll('.section-content').forEach(el => el.classList.add('d-none'));

    if (section === 'about') {
      await loadFragment('about.html', 'about');
      document.getElementById('about').classList.remove('d-none');
    } else if (section === 'blog') {
      await loadFragment('blog.html', 'blog');
      document.getElementById('blog').classList.remove('d-none');
    } else if (section === 'projects') {
      await loadFragment('projects.html', 'projects');
      document.getElementById('projects').classList.remove('d-none');
    } else if (section === 'services') {
      await loadFragment('services.html', 'services');
      document.getElementById('services').classList.remove('d-none');
    } else if (section === 'resume') {
      await loadFragment('resume.html', 'resume');
      document.getElementById('resume').classList.remove('d-none');
    } else if (section === 'contact') {
      await loadFragment('contact.html', 'contact');
      document.getElementById('contact').classList.remove('d-none');
    } else {
      const el = document.getElementById(section);
      if (el) el.classList.remove('d-none');
    }

    closeMenu();
  });
});

// close menu when clicking outside on mobile
document.addEventListener('click', function(event) {
  if (window.innerWidth < 992) {
    const isInside = sidebar && sidebar.contains(event.target);
    if (!isInside && !sidebar.classList.contains('menu-collapsed')) closeMenu();
  }
});
