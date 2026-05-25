export const initConsoleGreeting = () => {
  const welcomeStyle = "font-size: 24px; font-weight: bold; color: #4CAF50;";
  const textStyle = "font-size: 14px; color: #333;";
  const threatStyle = "font-size: 16px; font-weight: bold; color: #ff0000; text-shadow: 1px 1px 2px black;";

  const showWelcome = () => {
    console.log("%cWelcome to Code for Change (CFC) Developer Console!", welcomeStyle);
    console.log("%cWe empower IT students across Nepal through community, events, and resources.", textStyle);
    console.log("%c\u26a0\ufe0f WARNING: This is a restricted area. Do not mess with anything, or face the consequences! \u26a0\ufe0f", threatStyle);
    console.log("%cType 'help' and press Enter to see available commands.", "color: #2196F3; font-weight: bold; font-size: 14px;");
  };

  showWelcome();

  const routes = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Events", path: "/events" },
    { name: "Our Impact", path: "/our-impact" },
    { name: "Blog", path: "/creative" },
    { name: "Verify Certificate", path: "/certificate-verification" },
    { name: "Provinces", path: "/provinces" },
    { name: "Internships", path: "/internships" },
    { name: "Internship Application", path: "/internship-application" },
    { name: "Donate", path: "/donate-us" },
    { name: "Gallery", path: "/gallery" },
    { name: "Resources", path: "/resources" },
    { name: "Contact", path: "/contact-us" },
    { name: "FAQ", path: "/faq" },
    { name: "Register", path: "/register" },
    { name: "Join Us", path: "/join-us" },
    { name: "Walkthroughs", path: "/creative/walkthrough" },
    { name: "Periodicals", path: "/creative/periodicals" },
    { name: "Profile", path: "/profile" },
    { name: "Resume Builder", path: "/resume-builder" },
    { name: "Login", path: "/login" },
    { name: "Forget Password", path: "/forget-password" },
    { name: "Admin Dashboard", path: "/admin" }
  ];

  const routeAliases = {};
  routes.forEach(r => { routeAliases[r.name.toLowerCase()] = r.path; });
  routeAliases['home'] = '/';
  routeAliases['certificate'] = '/certificate-verification';
  routeAliases['contact'] = '/contact-us';
  routeAliases['donate'] = '/donate-us';
  routeAliases['blog'] = '/creative';
  routeAliases['walkthrough'] = '/creative/walkthrough';
  routeAliases['periodical'] = '/creative/periodicals';
  routeAliases['resume'] = '/resume-builder';
  routeAliases['admin'] = '/admin';
  routeAliases['internship'] = '/internships';
  routeAliases['internship-apply'] = '/internship-application';

  const provinceNames = ['kathmandu', 'pokhara', 'rupandehi', 'dang', 'birgunj', 'farwest', 'koshi', 'chitwan', 'lb-karnali', 'lbkarnali'];
  provinceNames.forEach(p => { routeAliases[p] = '/provinces/' + p; });

  const pathAliases = {
    '/home': '/', '/blogs': '/creative', '/blog': '/creative',
    '/walkthrough': '/creative/walkthrough', '/periodicals': '/creative/periodicals',
    '/certificate': '/certificate-verification', '/internship': '/internships',
    '/donation': '/donate-us', '/donations': '/donate-us', '/resume': '/resume-builder',
    '/aboutus': '/about', '/contact': '/contact-us', '/impact': '/our-impact',
    '/provinces': '/provinces', '/register': '/register', '/faq': '/faq',
    '/gallery': '/gallery', '/login': '/login', '/resources': '/resources'
  };
  Object.assign(routeAliases, pathAliases);

  Object.defineProperty(window, 'help', {
    get: function() {
      showWelcome();
      console.log("%cAvailable Commands:", "font-weight: bold; font-size: 16px; color: #4CAF50;");
      console.table([
        { command: "ls", description: "List all available routes" },
        { command: "cd('path')", description: "Navigate - cd('home'), cd('/events'), cd('about')" },
        { command: "sudo", description: "Access the secure admin mainframe" },
        { command: "whoami", description: "Display current user identity" },
        { command: "motivate", description: "Get a random programmer quote" },
        { command: "matrix", description: "Enter the Matrix" },
        { command: "clear / cls", description: "Clear the console" },
        { command: "reload", description: "Reload the entire page" },
        { command: "joke", description: "Get a random programming joke" },
        { command: "email", description: "Send an email to the developer" },
        { command: "contact", description: "Call the developer" },
        { command: "fb / facebook", description: "Visit Facebook profile" },
        { command: "github", description: "Visit GitHub profile" },
        { command: "youtube", description: "Visit YouTube channel" },
        { command: "insta / instagram", description: "Visit Instagram profile" },
        { command: "linkedin", description: "Visit LinkedIn profile" },
        { command: "portfolio", description: "Visit portfolio website" },
        { command: "developer", description: "Show developer info" },
        { command: "play", description: "Play music" },
        { command: "pause", description: "Pause music" },
        { command: "next", description: "Next track" },
        { command: "prev / previous", description: "Previous track" }
      ]);
      return "Ready for input.";
    }
  });

  Object.defineProperty(window, 'ls', {
    get: function() {
      console.table(routes);
      return "Use cd('name') to navigate.";
    }
  });

  window.cd = function(input) {
    const key = input.toLowerCase().replace(/\/+$/, '');
    let path = routeAliases[key];
    if (!path) {
      const match = routes.find(r =>
        r.name.toLowerCase().includes(key) || r.path.includes(key)
      );
      if (match) path = match.path;
    }
    if (!path) path = key.startsWith('/') ? key : null;
    if (!path) {
      console.log(`%cNo route found for "${input}". Type 'ls' to see all routes.`, "color: #ff0000;");
      return "Route not found.";
    }
    return navigateTo(path, input);
  };

  Object.defineProperty(window, 'sudo', {
    get: function() {
      console.log("%cInitiating secure connection...", "color: #00ff00; background: black; padding: 5px;");
      setTimeout(() => navigateTo('/admin', 'Admin Dashboard'), 1000);
      return "Authenticating...";
    }
  });

  Object.defineProperty(window, 'whoami', {
    get: function() {
      return "A brilliant developer exploring Code for Change!";
    }
  });

  const quotes = [
    '"First, solve the problem. Then, write the code." \u2013 John Johnson',
    '"Experience is the name everyone gives to their mistakes." \u2013 Oscar Wilde',
    '"Code is like humor. When you have to explain it, it\u2019s bad." \u2013 Cory House',
    '"Fix the cause, not the symptom." \u2013 Steve Maguire',
    '"Simplicity is the soul of efficiency." \u2013 Austin Freeman',
    '"Make it work, make it right, make it fast." \u2013 Kent Beck',
    '"Talk is cheap. Show me the code." \u2013 Linus Torvalds'
  ];

  Object.defineProperty(window, 'motivate', {
    get: function() {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      console.log(`%c${q}`, "font-style: italic; font-size: 14px; color: #9C27B0;");
      return "Keep building!";
    }
  });

  ['clear', 'cls'].forEach(name => {
    Object.defineProperty(window, name, {
      get: function() {
        setTimeout(() => console.clear(), 30);
        return "Clearing console...";
      }
    });
  });

  Object.defineProperty(window, 'reload', {
    get: function() {
      console.log("%cReloading page...", "color: #ff0000; font-weight: bold; font-size: 16px;");
      setTimeout(() => window.location.reload(), 300);
      return "Initiating reload...";
    }
  });

  const jokes = [
    ["Why do programmers prefer dark mode?", "Because light attracts bugs."],
    ["What's a programmer's favorite hangout place?", "The Foo Bar."],
    ["How many programmers does it take to change a light bulb?", "None. That's a hardware problem."],
    ["Why did the JavaScript developer leave?", "Because he didn't get callback."],
    ["What do you call a programmer from Finland?", "Nerdic."],
    ["Why do Java developers wear glasses?", "Because they can't C#."],
    ["What's a computer's favorite snack?", "Microchips."],
    ["Why was the developer unhappy at his job?", "Because he had array of problems."],
    ["What's the object-oriented way to become wealthy?", "Inheritance."],
    ["Why did the programmer quit his job?", "Because he didn't get arrays."],
    ["A SQL query walks into a bar, walks up to two tables and asks:", '"Can I join you?"'],
    ["What did the router say to the doctor?", '"I need a bandwidth upgrade."'],
    ["Why did the developer go broke?", "Because he used up all his cache."],
    ["What is a developer's favorite song?", '"Hello World" by Adele.'],
    ["Why was the JavaScript function so sad?", "Because it had no scope."],
    ["What do you call a fake noodle?", "An impasta — sorry, wrong kind of programming."],
    ["How do you comfort a JavaScript bug?", "You console it."],
    ["Why did the CSS developer go to therapy?", "Because he had commitment issues with floats."],
    ["What's a React developer's favorite phrase?", '"It\'s just a state of mind."'],
    ["Why was the array so emotional?", "Because it had too many issues."],
    ["A programmer's wife tells him: 'Go to the store and get a gallon of milk.'", "If they have eggs, get a dozen. He returns with 12 gallons of milk."],
    ["Why do Python developers prefer snakes?", "Because they love indentation."],
    ["What did the HTML say to the CSS?", '"You make me look beautiful."'],
    ["Why did the developer always carry a pencil?", "In case he needed to draw a flowchart."],
    ["How do you spot a blind programmer at a party?", "He doesn't see the problem."]
  ];

  Object.defineProperty(window, 'joke', {
    get: function() {
      const j = jokes[Math.floor(Math.random() * jokes.length)];
      console.log("%c\ud83e\udd14 " + j[0],
        "font-size: 16px; font-weight: bold; color: #FF6F00; padding: 6px 10px; border-left: 4px solid #FF6F00; background: rgba(255,111,0,0.06);");
      console.log("%c  " + j[1],
        "font-size: 14px; font-style: italic; color: #E65100; padding: 2px 10px 8px 10px;");
      return "Hope that made you smile!";
    }
  });

  const socials = [
    { keys: ['email'], url: 'mailto:arunneupane0000@gmail.com', label: 'Email' },
    { keys: ['contact'], url: 'tel:+9779811420975', label: 'Contact' },
    { keys: ['fb', 'facebook'], url: 'https://facebook.com/arundada9000', label: 'Facebook' },
    { keys: ['github'], url: 'https://github.com/arundada9000', label: 'GitHub' },
    { keys: ['youtube'], url: 'https://youtube.com/@arundada9000', label: 'YouTube' },
    { keys: ['insta', 'instagram'], url: 'https://instagram.com/arundada9000', label: 'Instagram' },
    { keys: ['linkedin'], url: 'https://linkedin.com/in/arundada9000', label: 'LinkedIn' },
    { keys: ['portfolio'], url: 'https://arunneupane.netlify.app', label: 'Portfolio' }
  ];

  socials.forEach(({ keys, url, label }) => {
    keys.forEach(key => {
      Object.defineProperty(window, key, {
        get: function() {
          window.open(url);
          console.log(`%cOpening ${label}...`, "color: #2196F3;");
          return `Redirecting to ${label}...`;
        }
      });
    });
  });

  const allowedPaths = [
    '/', '/about', '/events', '/our-impact', '/creative', '/certificate-verification',
    '/provinces', '/internships', '/internship-application', '/donate-us',
    '/gallery', '/resources', '/contact-us', '/faq', '/register', '/join-us',
    '/profile', '/resume-builder', '/login', '/forget-password',
    '/admin', '/donation-success', '/donation-failure',
    '/verify-certificate', '/certificate-verification',
    ...provinceNames.map(p => '/provinces/' + p),
    '/creative/walkthrough', '/creative/periodicals'
  ];

  const isAllowedPath = (path) => allowedPaths.some(a => path === a || path.startsWith(a + '/'));

  const navigateTo = (path, label) => {
    if (!isAllowedPath(path)) {
      console.log(`%cBlocked navigation to ${path} - not in whitelist`, "color: #ff0000;");
      return "Navigation blocked.";
    }
    if (window.__cfc_navigate) {
      console.log(`%cNavigating to ${label || path}...`, "color: #2196F3;");
      window.__cfc_navigate(path);
      return `Going to ${label || path}...`;
    }
    return "Router not initialized yet.";
  };

  Object.defineProperty(window, 'home', {
    get: function() { return navigateTo('/', 'Home'); }
  });

  const provinceKeys = ['kathmandu', 'pokhara', 'rupandehi', 'dang', 'birgunj', 'farwest', 'koshi', 'chitwan', 'lbkarnali'];
  provinceKeys.forEach(p => {
    Object.defineProperty(window, p, {
      get: function() { return navigateTo('/provinces/' + p, p.charAt(0).toUpperCase() + p.slice(1)); }
    });
  });

  const developerCard = () => {
    const existing = document.getElementById('cfc-dev-card');
    if (existing) existing.remove();

    const imgUrl = window.location.origin + '/developer/my%20photo.jpeg';

    const s = document.createElement('style');
    s.id = 'cfc-dev-style';
    s.textContent = `
      @keyframes cfcOverlayIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes cfcCardIn { from { opacity: 0; transform: scale(0.7) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes cfcSpinRing { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes cfcFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes cfcShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes cfcTagIn { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
      @keyframes cfcFadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes cfcGlow { 0%, 100% { filter: drop-shadow(0 0 8px rgba(76,175,80,0.3)); } 50% { filter: drop-shadow(0 0 20px rgba(76,175,80,0.6)); } }
      .cfc-dev-overlay {
        position: fixed; inset: 0; z-index: 999999;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        animation: cfcOverlayIn 0.4s ease;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        cursor: none;
      }
      .cfc-dev-cursor-ring, .cfc-dev-cursor-dot {
        position: fixed; pointer-events: none; z-index: 1000000;
        border-radius: 50%; transform: translate(-50%, -50%);
        transition: width 0.15s, height 0.15s, background 0.15s, border-color 0.15s;
      }
      .cfc-dev-cursor-ring {
        width: 36px; height: 36px;
        border: 2px solid rgba(76,175,80,0.6);
        background: transparent;
        transition-duration: 0.2s;
      }
      .cfc-dev-cursor-dot {
        width: 8px; height: 8px;
        background: #4CAF50;
        box-shadow: 0 0 12px rgba(76,175,80,0.5);
      }

      .cfc-dev-overlay.closing { opacity: 0; transition: opacity 0.4s ease; }
      .cfc-dev-card {
        background: linear-gradient(145deg, #ffffff, #f8faff);
        border-radius: 24px; padding: 0;
        width: 520px; max-width: 92vw; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1);
        animation: cfcCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
      }
      .cfc-dev-card::-webkit-scrollbar { width: 6px; }
      .cfc-dev-card::-webkit-scrollbar-track { background: transparent; }
      .cfc-dev-card::-webkit-scrollbar-thumb { background: #c0c0c0; border-radius: 3px; }
      .cfc-dev-close {
        position: absolute; top: 14px; right: 14px; z-index: 2;
        width: 36px; height: 36px; border-radius: 50%; border: none;
        background: rgba(0,0,0,0.06); cursor: pointer;
        font-size: 20px; color: #666; display: flex; align-items: center; justify-content: center;
        transition: all 0.2s ease;
      }
      .cfc-dev-close:hover { background: rgba(0,0,0,0.12); color: #000; transform: rotate(90deg); }
      .cfc-dev-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 24px 24px 0 0; padding: 40px 36px 28px;
        text-align: center; position: relative; overflow: hidden;
      }
      .cfc-dev-header::before {
        content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at 30% 40%, rgba(76,175,80,0.12) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(33,150,243,0.08) 0%, transparent 50%);
      }
      .cfc-dev-avatar-wrap {
        position: relative; display: inline-block; margin-bottom: 16px; animation: cfcFloat 3s ease-in-out infinite;
      }
      .cfc-dev-avatar-ring {
        position: absolute; inset: -4px; border-radius: 50%;
        background: conic-gradient(#4CAF50, #2196F3, #9C27B0, #FF9800, #4CAF50);
        animation: cfcSpinRing 4s linear infinite;
        -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
        mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
      }
      .cfc-dev-avatar {
        width: 120px; height: 120px; border-radius: 50%; object-fit: cover;
        position: relative; z-index: 1; display: block;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      .cfc-dev-name {
        font-size: 28px; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.5px;
        animation: cfcGlow 3s ease-in-out infinite;
      }
      .cfc-dev-tagline {
        font-size: 14px; color: rgba(255,255,255,0.7); margin: 6px 0 0; font-style: italic;
      }
      .cfc-dev-tagline span {
        display: inline-block; opacity: 0; animation: cfcFadeInUp 0.5s ease forwards;
      }
      .cfc-dev-body { padding: 24px 36px 32px; }
      .cfc-dev-section { margin-bottom: 20px; }
      .cfc-dev-section:last-child { margin-bottom: 0; }
      .cfc-dev-section-title {
        font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
        color: #4CAF50; margin: 0 0 10px;
      }
      .cfc-dev-about {
        font-size: 14px; line-height: 1.7; color: #444; margin: 0;
      }
      .cfc-dev-info-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      }
      .cfc-dev-info-item {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; color: #555; padding: 6px 10px;
        background: rgba(76,175,80,0.06); border-radius: 10px;
      }
      .cfc-dev-info-item .ico { font-size: 16px; flex-shrink: 0; }
      .cfc-dev-info-item .lbl { font-size: 11px; color: #999; display: block; }
      .cfc-dev-info-item .val { font-size: 13px; color: #333; font-weight: 500; }
      .cfc-dev-socials { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
      .cfc-dev-social-link {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 14px; border-radius: 12px; text-decoration: none;
        font-size: 12px; font-weight: 600; transition: all 0.25s ease;
        border: 1px solid transparent;
      }
      .cfc-dev-social-link:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
      .cfc-dev-skills {
        display: flex; flex-wrap: wrap; gap: 6px;
      }
      .cfc-dev-skill {
        padding: 4px 12px; border-radius: 20px; font-size: 12px;
        font-weight: 500; background: #f0f0f0; color: #444;
        animation: cfcTagIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .cfc-dev-testimonial {
        font-size: 13px; line-height: 1.6; color: #555; font-style: italic;
        padding: 12px 16px; background: #f8f8f8; border-radius: 12px;
        border-left: 3px solid #4CAF50; margin: 0 0 8px;
      }
      .cfc-dev-testimonial cite {
        display: block; margin-top: 4px; font-size: 11px; font-style: normal;
        color: #999; font-weight: 500;
      }
    `;
    document.head.appendChild(s);

    const overlay = document.createElement('div');
    overlay.className = 'cfc-dev-overlay';
    overlay.id = 'cfc-dev-card';

    overlay.innerHTML = `
      <div class="cfc-dev-card" onclick="event.stopPropagation()">
        <button class="cfc-dev-close" id="cfcDevClose">&times;</button>
        <div class="cfc-dev-header">
          <div class="cfc-dev-avatar-wrap">
            <div class="cfc-dev-avatar-ring"></div>
            <img class="cfc-dev-avatar" src="${imgUrl}" alt="Arun Neupane" onerror="this.alt='AN'">
          </div>
          <h2 class="cfc-dev-name">Arun Neupane</h2>
          <p class="cfc-dev-tagline">
            <span style="animation-delay:0.1s">Programmer</span>
            <span style="animation-delay:0.2s">&nbsp;&amp;</span>
            <span style="animation-delay:0.3s">&nbsp;Frontend</span>
            <span style="animation-delay:0.4s">&nbsp;Developer</span>
          </p>
        </div>
        <div class="cfc-dev-body" id="cfcDevBody">
          <div class="cfc-dev-section">
            <p class="cfc-dev-about" id="cfcDevAbout">Loading...</p>
          </div>
          <div class="cfc-dev-section">
            <div class="cfc-dev-section-title">\ud83d\udccd Info</div>
            <div class="cfc-dev-info-grid" id="cfcDevInfo"></div>
          </div>
          <div class="cfc-dev-section">
            <div class="cfc-dev-section-title">\ud83d\udd17 Links</div>
            <div class="cfc-dev-socials" id="cfcDevSocials"></div>
          </div>
          <div class="cfc-dev-section">
            <div class="cfc-dev-section-title">\ud83d\udcaa Skills</div>
            <div class="cfc-dev-skills" id="cfcDevSkills"></div>
          </div>
          <div class="cfc-dev-section">
            <div class="cfc-dev-section-title">\ud83d\udcac Words</div>
            <div id="cfcDevTestimonials"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    s.parentNode.insertBefore(s, s.parentNode.firstChild);

    const cursorRing = document.createElement('div');
    cursorRing.className = 'cfc-dev-cursor-ring';
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cfc-dev-cursor-dot';
    overlay.appendChild(cursorRing);
    overlay.appendChild(cursorDot);

    let cursorHover = false;
    overlay.addEventListener('mousemove', e => {
      cursorRing.style.left = e.clientX + 'px';
      cursorRing.style.top = e.clientY + 'px';
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    });
    overlay.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, .cfc-dev-social-link');
      if (t && !cursorHover) {
        cursorHover = true;
        cursorRing.style.width = '48px';
        cursorRing.style.height = '48px';
        cursorRing.style.borderColor = '#4CAF50';
        cursorRing.style.background = 'rgba(76,175,80,0.08)';
      }
    });
    overlay.addEventListener('mouseout', e => {
      const t = e.target.closest('a, button, .cfc-dev-social-link');
      if (!t && cursorHover) {
        cursorHover = false;
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
        cursorRing.style.borderColor = 'rgba(76,175,80,0.6)';
        cursorRing.style.background = 'transparent';
      }
    });
    overlay.addEventListener('mouseleave', () => {
      cursorHover = false;
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'rgba(76,175,80,0.6)';
      cursorRing.style.background = 'transparent';
    });

    document.getElementById('cfcDevClose').onclick = () => closeCard();
    overlay.onclick = e => { if (e.target === overlay) closeCard(); };

    let closed = false;
    function closeCard() {
      if (closed) return; closed = true;
      overlay.classList.add('closing');
      setTimeout(() => { overlay.remove(); s.remove(); }, 400);
    }

    const socialConfig = [
      { ico: '\ud83d\udcf1', label: 'Website', url: 'https://arunneupane.netlify.app', bg: '#4CAF50', color: '#fff' },
      { ico: '\ud83d\udce7', label: 'Email', url: 'mailto:arunneupane0000@gmail.com', bg: '#EA4335', color: '#fff' },
      { ico: '\ud83d\udcf7', label: 'Instagram', url: 'https://instagram.com/arundada9000', bg: '#E4405F', color: '#fff' },
      { ico: '\ud83d\udc65', label: 'Facebook', url: 'https://facebook.com/arundada9000', bg: '#1877F2', color: '#fff' },
      { ico: '\ud83d\udcbb', label: 'GitHub', url: 'https://github.com/arundada9000', bg: '#333', color: '#fff' },
      { ico: '\u25b6\ufe0f', label: 'YouTube', url: 'https://youtube.com/@arundada9000', bg: '#FF0000', color: '#fff' },
      { ico: '\ud83d\udcbc', label: 'LinkedIn', url: 'https://linkedin.com/in/arundada9000', bg: '#0A66C2', color: '#fff' },
    ];

    const socialsEl = document.getElementById('cfcDevSocials');
    socialConfig.forEach((s, i) => {
      const a = document.createElement('a');
      a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
      a.className = 'cfc-dev-social-link';
      a.style.cssText = `background:${s.bg};color:${s.color};animation:cfcTagIn 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i*0.05}s both;`;
      a.innerHTML = `${s.ico} ${s.label}`;
      socialsEl.appendChild(a);
    });

    console.log("%c ", `background:url('${imgUrl}') no-repeat center;background-size:140px 140px;padding:70px 70px;border-radius:50%;border:4px solid #4CAF50;`);

    fetch('/developer/AUTHOR.md')
      .then(r => r.text())
      .then(md => {
        const name = md.match(/\*\*Full Name\*\*\s*\|\s*([^|]+)/)?.[1]?.trim() || 'Arun Neupane';
        const alias = md.match(/\*\*Also known as\*\*\s*\|\s*([^|]+)/)?.[1]?.trim() || 'arundada9000';
        const phone = md.match(/\*\*Phone\*\*\s*\|\s*([^|]+)/)?.[1]?.trim() || '+977 9811420975';
        const email = md.match(/\*\*Email\*\*\s*\|\s*([^|]+)/)?.[1]?.trim() || 'arunneupane0000@gmail.com';
        const location = md.match(/\*\*Location\*\*\s*\|\s*([^|]+)/)?.[1]?.trim() || 'Parbat, Nepal';
        const tagline = md.match(/>\s*([^<\n]+)/)?.[1]?.trim() || 'Programmer and coder. Frontend developer.';
        const skillSection = md.match(/### Frontend[^#]*/)?.[0] || '';
        const skills = skillSection.match(/[-•]\s*([^,\n]+)/g)?.map(s => s.replace(/^[-•]\s*/, '').trim()).filter(Boolean) || [];
        const testimonialBlocks = [...md.matchAll(/>\s*"([^"]+)"\s*\n>\s*\*\*([^*]+)\*\*/g)];
        const testimonials = testimonialBlocks.map(t => ({ text: t[1], author: t[2] }));

        document.getElementById('cfcDevBody').querySelector('.cfc-dev-about').textContent = tagline;
        document.querySelector('.cfc-dev-name').textContent = name;
        document.querySelector('.cfc-dev-header img').alt = name;

        const infoEl = document.getElementById('cfcDevInfo');
        const infoItems = [
          { ico: '\ud83d\udc64', label: 'Alias', val: alias },
          { ico: '\ud83d\udccd', label: 'Location', val: location },
          { ico: '\ud83d\udce7', label: 'Email', val: email },
          { ico: '\ud83d\udcde', label: 'Phone', val: phone },
        ];
        infoItems.forEach((item, i) => {
          const div = document.createElement('div');
          div.className = 'cfc-dev-info-item';
          div.style.animation = `cfcTagIn 0.4s ease ${0.1 + i*0.05}s both`;
          const icoSpan = document.createElement('span');
          icoSpan.className = 'ico';
          icoSpan.textContent = item.ico;
          const innerDiv = document.createElement('div');
          const lblSpan = document.createElement('span');
          lblSpan.className = 'lbl';
          lblSpan.textContent = item.label;
          const valSpan = document.createElement('span');
          valSpan.className = 'val';
          valSpan.textContent = item.val;
          innerDiv.appendChild(lblSpan);
          innerDiv.appendChild(valSpan);
          div.appendChild(icoSpan);
          div.appendChild(innerDiv);
          infoEl.appendChild(div);
        });

        if (skills.length) {
          const skillsEl = document.getElementById('cfcDevSkills');
          skillsEl.innerHTML = '';
          skills.forEach((skill, i) => {
            const tag = document.createElement('span');
            tag.className = 'cfc-dev-skill';
            tag.style.animationDelay = `${0.1 + i*0.04}s`;
            tag.textContent = skill.replace(/^[-•]\s*/, '').trim();
            skillsEl.appendChild(tag);
          });
        }

        if (testimonials.length) {
          const tEl = document.getElementById('cfcDevTestimonials');
          tEl.innerHTML = '';
          testimonials.forEach((t, i) => {
            const block = document.createElement('div');
            block.className = 'cfc-dev-testimonial';
            block.style.animation = `cfcFadeInUp 0.5s ease ${0.2 + i*0.1}s both`;
            const quote = document.createTextNode(`\u201c${t.text}\u201d `);
            const cite = document.createElement('cite');
            cite.textContent = `\u2014 ${t.author}`;
            block.appendChild(quote);
            block.appendChild(cite);
            tEl.appendChild(block);
          });
        }

        console.log(`%c${name}`, "font-size:22px;font-weight:bold;color:#4CAF50;");
        console.log(`%c${tagline}`, "font-size:14px;font-style:italic;color:#666;");
        console.log(`%c\ud83d\udccd ${location}`, "font-size:14px;color:#333;");
      })
      .catch(() => {
        console.log("%cArun Neupane", "font-size:20px;font-weight:bold;color:#4CAF50;");
        console.log("%cProgrammer and coder. Frontend developer. Self-taught, passionate, building for the web.", "font-size:14px;font-style:italic;color:#666;");
      });
  };

  Object.defineProperty(window, 'developer', {
    get: function() {
      developerCard();
      return "Loading developer info...";
    }
  });

  const romanticLines = [
    "Every heartbeat whispers your name... \ud83d\udc97",
    "You are the poetry my soul writes... \u2728",
    "In your eyes, I found my forever home... \ud83c\udf3f",
    "Your love is the melody that never fades... \ud83c\udfb5",
    "With you, every moment feels like eternity... \u23f3",
    "You are the sun that lights up my darkest days... \u2600\ufe0f",
    "My love for you grows deeper with every passing breath... \ud83d\udc9b",
    "You are the most beautiful chapter in my life's story... \ud83d\udcd6",
    "I fall in love with you all over again, every single day... \ud83d\udc95",
    "You are my dream, my reality, my everything... \ud83c\udf1f",
    "In a world full of temporary, you are my forever... \ud83d\udc8d",
    "Your love is the anchor that keeps me grounded... \u2693",
    "You are the reason my heart smiles... \ud83d\ude0a",
    "Every love song reminds me of you... \ud83c\udfb6",
    "You are the greatest gift life has ever given me... \ud83c\udf81",
    "My soul recognized you from the very first glance... \ud83d\udc41\ufe0f",
    "You are the missing piece my heart always searched for... \ud83e\udde9",
    "Loving you is the easiest thing I have ever done... \ud83d\udc98",
    "You make my world beautiful just by being in it... \ud83c\udf0d",
    "Every moment without you feels like a year... \ud83d\udc46",
    "You are the sweetest thought that never leaves my mind... \ud83d\udcda",
    "Your love wraps around me like the warmest embrace... \ud83e\udd17",
    "I never knew what love was until you walked into my life... \ud83d\ude4f",
    "You are the light that guides me through the darkest nights... \ud83c\udf1f",
    "My heart beats only for you, now and always... \ud83d\udc93"
  ];

  const triggerRomanticEffect = () => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999999;overflow:hidden;';
    document.body.appendChild(container);

    const items = ['\u2764\ufe0f', '\ud83d\udc96', '\ud83c\udf38', '\u2728', '\ud83d\udc95', '\ud83c\udf39'];

    let totalDrops = 0;
    const maxDrops = 200;
    const dropInterval = setInterval(() => {
      if (totalDrops >= maxDrops) { clearInterval(dropInterval); return; }
      const count = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < count && totalDrops < maxDrops; j++) {
        const el = document.createElement('div');
        el.innerText = items[Math.floor(Math.random() * items.length)];
        el.style.cssText = `position:absolute;left:${Math.random() * 100}vw;top:-50px;font-size:${Math.random() * 24 + 18}px;opacity:${Math.random() * 0.5 + 0.5};`;
        const duration = Math.random() * 8 + 10;
        el.style.transition = `top ${duration}s linear, opacity ${duration}s ease-in-out`;
        container.appendChild(el);
        void el.offsetWidth;
        setTimeout(() => { el.style.top = '100vh'; el.style.opacity = '0'; }, 50);
        totalDrops++;
      }
    }, 400);

    setTimeout(() => {
      clearInterval(dropInterval);
      container.remove();
    }, 28000);

    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < romanticLines.length) {
        console.log(`%c${romanticLines[lineIndex]}`, "font-size: 16px; font-weight: bold; color: #ff1493; text-shadow: 1px 1px 3px rgba(0,0,0,0.1); padding: 4px 0;");
        lineIndex++;
      } else {
        clearInterval(lineInterval);
      }
    }, 1000);
  };

  ['cG9vamE=', 'cG9vanU='].forEach(b64 => {
    Object.defineProperty(window, atob(b64), {
      get: function() {
        triggerRomanticEffect();
        const audio = new Audio('/developer/your-morning-eyes.mp3');
        audio.play().catch(() => {});
        console.log("%c\ud83d\udc96 For the one who makes my world complete... \ud83d\udc96",
          "font-size: 20px; font-weight: bold; color: #ff1493; text-shadow: 2px 2px 6px rgba(255,20,147,0.3); padding: 12px; border-left: 4px solid #ff1493; background: rgba(255,20,147,0.05);");
        console.log("%cEvery moment with you is a beautiful melody. You are my sunshine, my inspiration, and my everything. \ud83c\udf39",
          "font-size: 14px; font-style: italic; color: #e91e63; padding: 5px;");
        return "Love is in the air! \u2764\ufe0f";
      }
    });
  });

  const triggerMatrixEffect = () => {
    if (document.getElementById('cfc-matrix-overlay')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'cfc-matrix-overlay';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999998;pointer-events:none;opacity:0.85;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 33);

    setTimeout(() => {
      clearInterval(interval);
      canvas.style.transition = 'opacity 1.5s ease';
      canvas.style.opacity = '0';
      setTimeout(() => canvas.remove(), 1500);
    }, 6000);
  };

  Object.defineProperty(window, 'matrix', {
    get: function() {
      triggerMatrixEffect();
      return "Entering the Matrix...";
    }
  });

  const showRand = () => {
    console.log("%c                 ",
      "font-size: 28px; background: linear-gradient(135deg, #FF6B35, #FFD700); padding: 16px 32px; border-radius: 8px; font-weight: 900; color: transparent;");
    console.log("%csunil paudyal", "font-size: 24px; font-weight: 900; color: #FF6B35; text-shadow: 2px 2px 4px rgba(255,107,53,0.3); letter-spacing: 2px; text-transform: uppercase;");
  };

  for (let i = 1; i <= 12; i++) {
    const name = 'r' + 'a'.repeat(i) + 'nd';
    Object.defineProperty(window, name, {
      get: function() { showRand(); return "sunil paudyal"; }
    });
  }

  const showChaku = () => {
    console.log("%c                 ",
      "font-size: 28px; background: linear-gradient(135deg, #7B1FA2, #E040FB); padding: 16px 32px; border-radius: 8px; font-weight: 900; color: transparent;");
    console.log("%cbijay kumar chaudhary", "font-size: 24px; font-weight: 900; color: #7B1FA2; text-shadow: 2px 2px 4px rgba(123,31,162,0.3); letter-spacing: 2px; text-transform: uppercase;");
  };

  for (let i = 1; i <= 12; i++) {
    const name = 'ch' + 'a'.repeat(i) + 'ku';
    Object.defineProperty(window, name, {
      get: function() { showChaku(); return "bijay kumar chaudhary"; }
    });
  }

  const playlist = [
    { src: '/music/blue.mp3', name: 'Blue' },
    { src: '/music/Shayad.mp3', name: 'Shayad' },
    { src: '/music/VE-KAMLEYA.mp3', name: 'VE KAMLEYA' },
    { src: '/music/Kalank.mp3', name: 'Kalank' },
    { src: '/music/systemfailure.mp3', name: 'System Failure' }
  ];

  const musicState = { audio: null, currentIndex: 0, playing: false };

  function initAudio() {
    if (musicState.audio) return;
    const a = new Audio(playlist[musicState.currentIndex].src);
    a.preload = 'auto';
    a.addEventListener('ended', () => {
      nextTrack();
    });
    musicState.audio = a;
  }

  function playTrack() {
    initAudio();
    if (musicState.playing) return;
    const track = playlist[musicState.currentIndex];
    musicState.audio.src = track.src;
    musicState.audio.play().then(() => {
      musicState.playing = true;
      console.log(`%c\u266b Now Playing: ${track.name}`, "font-size: 16px; font-weight: bold; color: #4CAF50; padding: 6px 10px; border-left: 4px solid #4CAF50; background: rgba(76,175,80,0.06);");
    }).catch(() => {
      console.log("%cCould not play audio. Interact with the page first (click anywhere).", "color: #ff0000; font-size: 13px;");
    });
  }

  function pauseTrack() {
    if (!musicState.playing || !musicState.audio) return;
    musicState.audio.pause();
    musicState.playing = false;
    console.log(`%c\u23f8 Paused: ${playlist[musicState.currentIndex].name}`, "font-size: 14px; color: #FF9800; padding: 4px 8px;");
  }

  function nextTrack() {
    initAudio();
    musicState.currentIndex = (musicState.currentIndex + 1) % playlist.length;
    if (musicState.playing) {
      musicState.audio.src = playlist[musicState.currentIndex].src;
      musicState.audio.play();
    }
    const track = playlist[musicState.currentIndex];
    console.log(`%c\u23ed ${track.name}`, "font-size: 14px; color: #2196F3; padding: 4px 8px;");
    if (musicState.playing) {
      console.log(`%c\u266b Now Playing: ${track.name}`, "font-size: 16px; font-weight: bold; color: #4CAF50; padding: 6px 10px; border-left: 4px solid #4CAF50; background: rgba(76,175,80,0.06);");
    }
  }

  function prevTrack() {
    initAudio();
    musicState.currentIndex = (musicState.currentIndex - 1 + playlist.length) % playlist.length;
    if (musicState.playing) {
      musicState.audio.src = playlist[musicState.currentIndex].src;
      musicState.audio.play();
    }
    const track = playlist[musicState.currentIndex];
    console.log(`%c\u23ee ${track.name}`, "font-size: 14px; color: #9C27B0; padding: 4px 8px;");
    if (musicState.playing) {
      console.log(`%c\u266b Now Playing: ${track.name}`, "font-size: 16px; font-weight: bold; color: #4CAF50; padding: 6px 10px; border-left: 4px solid #4CAF50; background: rgba(76,175,80,0.06);");
    }
  }

  Object.defineProperty(window, '_cfcMusicPlaying', {
    get: function() { return musicState.playing; }
  });

  Object.defineProperty(window, 'play', {
    get: function() { playTrack(); return musicState.playing ? `\u266b Playing: ${playlist[musicState.currentIndex].name}` : 'Starting...'; }
  });

  Object.defineProperty(window, 'pause', {
    get: function() { pauseTrack(); return `\u23f8 Paused: ${playlist[musicState.currentIndex].name}`; }
  });

  Object.defineProperty(window, 'next', {
    get: function() { nextTrack(); return `\u23ed ${playlist[musicState.currentIndex].name}`; }
  });

  ['prev', 'previous'].forEach(name => {
    Object.defineProperty(window, name, {
      get: function() { prevTrack(); return `\u23ee ${playlist[musicState.currentIndex].name}`; }
    });
  });
};
