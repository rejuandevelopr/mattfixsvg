const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Dark Mode
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.toggle-switch input');

  const isDark = sessionStorage.getItem('darkMode') === 'true';
  toggle.checked = isDark;

  // Remove both blocking classes after toggle is set
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('dark-mode-static', 'preload-dark-toggle');
    });
  });

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    sessionStorage.setItem('darkMode', enabled);
    document.documentElement.classList.toggle('dark-mode', enabled);
  });
});



// Disable browser scroll restoration
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ─── BLUR REVEAL LOGIC ──────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  // Collect all newly intersecting entries
  const intersecting = entries.filter(e => e.isIntersecting);

  intersecting.forEach((entry, i) => {
    // Stagger each element by 120ms per index
    setTimeout(() => {
      entry.target.classList.add('visible');
    }, i * 120);

    // Stop observing once animated in
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.1,       // trigger when 10% is visible
  rootMargin: '0px 0px -40px 0px'  // slightly before bottom of viewport
});

reveals.forEach(el => observer.observe(el));



function updatePSTTime() {
  const now = new Date();
  
  // Get time in America/Los_Angeles timezone
  const options = {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  const timeStr = now.toLocaleTimeString('en-US', options);
  
  // Get timezone abbreviation (PST or PDT)
  const tzOptions = {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short'
  };
  const tzStr = now.toLocaleTimeString('en-US', tzOptions);
  const tzAbbr = tzStr.split(' ').pop(); // Extracts "PST" or "PDT"
  
  // Update the element: e.g., "13:09 PST"
  const el = document.getElementById('pst-time');
  if (el) {
    el.textContent = `${timeStr} ${tzAbbr}`;
  }
}

// Run immediately, then update every second
updatePSTTime();
setInterval(updatePSTTime, 1000);