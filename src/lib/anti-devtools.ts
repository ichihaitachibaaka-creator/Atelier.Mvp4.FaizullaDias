const isProd = import.meta.env.PROD;

if (isProd) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

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
