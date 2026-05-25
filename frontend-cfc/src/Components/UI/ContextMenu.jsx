import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ContextMenu.css';

// ═══════════════════════════════════════════════════════════
//  Menu item configuration
// ═══════════════════════════════════════════════════════════

const MENU_ITEMS = [
  // ── Navigation ──────────────────────────────────────────
  {
    group: 'NAVIGATE',
    items: [
      {
        id: 'nav-home',
        label: <><span className="cfc-ctx-cmd">cd</span> <span className="cfc-ctx-arg">~/home</span></>,
        shortcut: 'Alt+H',
        action: 'navigate',
        path: '/',
      },
      {
        id: 'nav-about',
        label: <><span className="cfc-ctx-cmd">git checkout</span> <span className="cfc-ctx-arg">about</span></>,
        shortcut: 'Alt+A',
        action: 'navigate',
        path: '/about',
      },
      {
        id: 'nav-events',
        label: <><span className="cfc-ctx-cmd">ls</span> <span className="cfc-ctx-arg">./events</span></>,
        shortcut: 'Alt+E',
        action: 'navigate',
        path: '/events',
      },
      {
        id: 'nav-contact',
        label: <><span className="cfc-ctx-cmd">./</span><span className="cfc-ctx-str">contact.sh</span></>,
        shortcut: 'Alt+C',
        action: 'navigate',
        path: '/contact-us',
      },
    ],
  },

  // ── Actions ─────────────────────────────────────────────
  {
    group: 'EXECUTE',
    items: [
      {
        id: 'copy-url',
        label: <><span className="cfc-ctx-cmd">navigator</span><span className="cfc-ctx-bracket">.</span><span className="cfc-ctx-cmd">clipboard</span><span className="cfc-ctx-bracket">.</span><span className="cfc-ctx-str">write</span><span className="cfc-ctx-bracket">()</span></>,
        shortcut: 'Ctrl+L',
        action: 'copy-url',
      },
      {
        id: 'toggle-music',
        label: <><span className="cfc-ctx-cmd">system</span><span className="cfc-ctx-bracket">.</span><span className="cfc-ctx-cmd">music</span><span className="cfc-ctx-bracket">.</span><span className="cfc-ctx-str">toggle</span><span className="cfc-ctx-bracket">()</span></>,
        shortcut: 'Alt+M',
        action: 'toggle-music',
      },
    ],
  },

  // ── Easter Eggs ─────────────────────────────────────────
  {
    group: 'DANGER_ZONE',
    items: [
      {
        id: 'matrix',
        label: <><span className="cfc-ctx-cmd">execute</span><span className="cfc-ctx-bracket">(</span><span className="cfc-ctx-str">matrix_rain</span><span className="cfc-ctx-bracket">)</span></>,
        shortcut: 'Alt+X',
        action: 'matrix',
      },
      {
        id: 'sudo-rm',
        label: <><span className="cfc-ctx-cmd">sudo</span> <span className="cfc-ctx-flag">rm</span> <span className="cfc-ctx-flag">-rf</span> <span className="cfc-ctx-arg">/</span></>,
        shortcut: '⚠',
        action: 'sudo-rm',
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
//  Toast helper
// ═══════════════════════════════════════════════════════════

function showToast(message) {
  // Remove existing
  const old = document.querySelector('.cfc-ctx-toast');
  if (old) old.remove();

  const el = document.createElement('div');
  el.className = 'cfc-ctx-toast';
  el.textContent = `> ${message}`;
  document.body.appendChild(el);

  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 300);
  }, 1800);
}

// ═══════════════════════════════════════════════════════════
//  "Permission Denied" easter egg
// ═══════════════════════════════════════════════════════════

function triggerPermissionDenied() {
  // Shake the whole page
  document.body.style.animation = 'cfc-ctx-shake 0.5s ease-in-out';
  setTimeout(() => { document.body.style.animation = ''; }, 600);

  // Flash red overlay
  const overlay = document.createElement('div');
  overlay.className = 'cfc-ctx-denied-overlay';

  const text = document.createElement('div');
  text.className = 'cfc-ctx-denied-text';
  text.textContent = 'ACCESS DENIED';
  overlay.appendChild(text);

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2600);

  // Console warning
  console.log(
    '%cPermission Denied: Operation not permitted.',
    'font-size: 18px; font-weight: bold; color: #ff3333; text-shadow: 0 0 10px rgba(255,0,0,0.5); padding: 8px;'
  );
  console.log(
    '%cNice try. This incident will be reported.',
    'font-size: 13px; color: #ff6b6b; font-style: italic; padding: 4px;'
  );
}

// ═══════════════════════════════════════════════════════════
//  Single menu item (with ripple)
// ═══════════════════════════════════════════════════════════

const MenuItem = ({ item, index, onAction }) => {
  const ref = useRef(null);
  const [ripple, setRipple] = useState(null);

  const handleClick = (e) => {
    // Spawn ripple
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, key: Date.now() });
    setTimeout(() => setRipple(null), 500);

    // Execute action
    onAction(item);
  };

  return (
    <motion.div
      ref={ref}
      className="cfc-ctx-item"
      onClick={handleClick}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.03 + index * 0.04,
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <span className="cfc-ctx-label">
        <span className="cfc-ctx-prompt">&gt;</span>
        {item.label}
      </span>
      {item.shortcut && (
        <span className="cfc-ctx-shortcut">{item.shortcut}</span>
      )}

      {/* Ripple */}
      {ripple && (
        <span
          className="cfc-ctx-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          key={ripple.key}
        />
      )}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════
//  Dynamic context-aware items
// ═══════════════════════════════════════════════════════════

function getContextItems(targetEl) {
  const extras = [];

  // Right-clicked on an image?
  if (targetEl?.tagName === 'IMG' && targetEl.src) {
    extras.push({
      id: 'extract-image',
      label: <><span className="cfc-ctx-cmd">extract_asset</span><span className="cfc-ctx-bracket">(</span><span className="cfc-ctx-str">image</span><span className="cfc-ctx-bracket">)</span></>,
      shortcut: '',
      action: 'open-image',
      url: targetEl.src,
    });
  }

  // Right-clicked on a link?
  const link = targetEl?.closest?.('a[href]');
  if (link && link.href) {
    extras.push({
      id: 'copy-link',
      label: <><span className="cfc-ctx-cmd">copy</span><span className="cfc-ctx-bracket">(</span><span className="cfc-ctx-str">href</span><span className="cfc-ctx-bracket">)</span></>,
      shortcut: '',
      action: 'copy-link',
      url: link.href,
    });
  }

  // Selected text?
  const selection = window.getSelection()?.toString()?.trim();
  if (selection) {
    extras.push({
      id: 'copy-selection',
      label: <><span className="cfc-ctx-cmd">copy</span><span className="cfc-ctx-bracket">(</span><span className="cfc-ctx-str">selected_string</span><span className="cfc-ctx-bracket">)</span></>,
      shortcut: 'Ctrl+C',
      action: 'copy-text',
      text: selection,
    });
  }

  return extras;
}

// ═══════════════════════════════════════════════════════════
//  THE CONTEXT MENU COMPONENT
// ═══════════════════════════════════════════════════════════

const ContextMenu = () => {
  const [menu, setMenu] = useState(null); // { x, y, contextItems }
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Close the menu ─────────────────────────────────────
  const close = useCallback(() => setMenu(null), []);

  // ── Open on right-click ────────────────────────────────
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();

      const contextItems = getContextItems(e.target);

      // Calculate position, clamping to viewport edges
      let x = e.clientX;
      let y = e.clientY;
      const menuW = 340;
      const menuH = 420; // estimate

      if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8;
      if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8;
      if (x < 8) x = 8;
      if (y < 8) y = 8;

      setMenu({ x, y, contextItems });
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // ── Close on click outside or Escape ─────────
  useEffect(() => {
    if (!menu) return;

    const handleClick = (e) => {
      // Don't close if clicking inside the menu
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        close();
      }
    };
    
    const handleEsc = (e) => { 
      if (e.key === 'Escape') close(); 
    };

    // Use 'click' instead of 'mousedown' to prevent overlap with the right-click event
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [menu, close]);

  // ── Close on route change ─────────────────────────────
  useEffect(() => { setMenu(null); }, [location.pathname]);

  // ── Action handler ─────────────────────────────────────
  const handleAction = useCallback((item) => {
    close();

    // Small delay so the exit animation plays before side-effects
    setTimeout(() => {
      switch (item.action) {
        case 'navigate':
          if (window.__cfc_navigate) {
            window.__cfc_navigate(item.path);
          } else {
            navigate(item.path);
          }
          break;

        case 'copy-url':
          navigator.clipboard.writeText(window.location.href)
            .then(() => showToast('URL copied to clipboard ✓'))
            .catch(() => showToast('Failed to copy URL ✗'));
          break;

        case 'copy-text':
          navigator.clipboard.writeText(item.text)
            .then(() => showToast('Text copied to clipboard ✓'))
            .catch(() => showToast('Failed to copy ✗'));
          break;

        case 'copy-link':
          navigator.clipboard.writeText(item.url)
            .then(() => showToast('Link copied to clipboard ✓'))
            .catch(() => showToast('Failed to copy ✗'));
          break;

        case 'open-image':
          window.open(item.url, '_blank');
          break;

        case 'toggle-music':
          try {
            const isPlaying = window._cfcMusicPlaying;
            const key = isPlaying ? 'pause' : 'play';
            const desc = Object.getOwnPropertyDescriptor(window, key);
            if (desc?.get) {
              desc.get.call(window);
              showToast(isPlaying ? '♫ Music paused' : '♫ Music playing');
            }
          } catch {
            showToast('Music player not available');
          }
          break;

        case 'matrix':
          // Trigger the matrix effect from consoleGreeting
          try {
            const desc = Object.getOwnPropertyDescriptor(window, 'matrix');
            if (desc?.get) desc.get.call(window);
            showToast('Entering the Matrix...');
          } catch {
            showToast('Matrix not available');
          }
          break;

        case 'sudo-rm':
          triggerPermissionDenied();
          break;

        default:
          break;
      }
    }, 150);
  }, [close, navigate]);

  // ── Build the flat item list with dynamic items ────────
  const buildItems = () => {
    const sections = [];
    const contextItems = menu?.contextItems || [];

    // Dynamic context items first
    if (contextItems.length > 0) {
      sections.push({
        group: 'CONTEXT',
        items: contextItems,
      });
    }

    // Then the static menu groups
    MENU_ITEMS.forEach((section) => sections.push(section));

    return sections;
  };

  // ── Count total items for the footer ───────────────────
  const currentPath = location.pathname;
  const pathDisplay = currentPath === '/' ? '~' : currentPath;

  return (
    <AnimatePresence>
      {menu && (
        <motion.div
          ref={menuRef}
          className="cfc-ctx-menu"
          style={{
            left: menu.x,
            top: menu.y,
            transformOrigin: '0 0',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            mass: 0.8,
          }}
        >
          {/* ── Header: Terminal title bar ── */}
          <div className="cfc-ctx-header">
            <div className="cfc-ctx-traffic-lights">
              <div className="cfc-ctx-dot cfc-ctx-dot--red" />
              <div className="cfc-ctx-dot cfc-ctx-dot--yellow" />
              <div className="cfc-ctx-dot cfc-ctx-dot--green" />
            </div>
            <span className="cfc-ctx-title">cfc@terminal: {pathDisplay}</span>
          </div>

          {/* ── Menu items by group ── */}
          <div className="cfc-ctx-items">
            {buildItems().map((section, sIdx) => (
              <React.Fragment key={section.group}>
                {sIdx > 0 && <div className="cfc-ctx-separator" />}
                <div className="cfc-ctx-group-label">
                  {section.group === 'CONTEXT' ? '// CONTEXT' :
                   section.group === 'NAVIGATE' ? '// NAVIGATE' :
                   section.group === 'EXECUTE' ? '// EXECUTE' :
                    section.group === 'DANGER_ZONE' ? '// DANGER_ZONE' :
                   `// ${section.group}`}
                </div>
                {section.items.map((item, iIdx) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    index={sIdx * 4 + iIdx}
                    onAction={handleAction}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* ── Footer: status bar ── */}
          <div className="cfc-ctx-footer">
            <span className="cfc-ctx-footer-status">READY</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
