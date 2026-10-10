const isProd = import.meta.env.PROD;

if (isProd) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    const key = e.key || '';
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    if (key === 'F12') {
      e.preventDefault();
      return;
    }
    if (ctrl && shift && (key === 'I' || key === 'i' || key === 'J' || key === 'j' || key === 'C' || key === 'c')) {
      e.preventDefault();
      return;
    }
    if (ctrl && key === 'U' || key === 'u') {
      e.preventDefault();
      return;
    }
    if (ctrl && alt && (key === 'I' || key === 'i')) {
      e.preventDefault();
      return;
    }
    if (ctrl && shift && (key === 'U' || key === 'u')) {
      e.preventDefault();
      return;
    }
  });

  const debuggerTrap = () => {
    setInterval(() => {
      const before = performance.now();
      debugger;
      const after = performance.now();
      if (after - before > 100) {
        document.body.style.filter = 'blur(8px)';
        setTimeout(() => { document.body.style.filter = ''; }, 2000);
      }
    }, 4000);
  };

  try {
    debuggerTrap();
  } catch {
    // no-op
  }

  const detectDevTools = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      document.body.style.filter = 'blur(5px)';
    } else {
      document.body.style.filter = '';
    }
  };

  setInterval(detectDevTools, 1000);
}
