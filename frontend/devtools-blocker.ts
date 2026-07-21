// Devtools Blocker - Secures the XO Mainframe portal from console inspection and source analysis

const triggerNiceTry = () => {
  // Replace the entire document content with a premium block screen
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>XO Club Kathmandu // Access Restricted</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=JetBrains+Mono:wght@500;700&family=Syne:wght@800&display=swap');
        
        body, html {
          background-color: #050505;
          color: #ffffff;
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .container {
          text-align: center;
          padding: 40px;
          border: 1px border-solid #1f1f23;
          background-color: #000000;
          max-width: 500px;
          border-radius: 6px;
          box-shadow: 0 0 50px rgba(239, 68, 68, 0.05);
          position: relative;
        }

        .red-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, #000000, #EF4444, #000000);
        }

        .alert-header {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #EF4444;
          letter-spacing: 0.35em;
          font-weight: 700;
          margin-bottom: 24px;
          text-transform: uppercase;
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 42px;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .description {
          font-size: 13px;
          color: #8E9196;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .reload-btn {
          background-color: #ffffff;
          color: #000000;
          border: none;
          padding: 14px 32px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          letter-spacing: 0.15em;
          border-radius: 2px;
          transition: all 0.25s ease;
        }

        .reload-btn:hover {
          background-color: #EF4444;
          color: #ffffff;
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="red-line"></div>
        <div class="alert-header">// ACCESS RESTRICTED //</div>
        <h1 class="title">NICE TRY.</h1>
        <p class="description">
          XO Club portal is highly secure. Developer tools, console inspection, and page source analysis are strictly prohibited inside the sensory mainframe.
        </p>
        <button class="reload-btn" onclick="window.location.reload()">
          RELOAD PORTAL
        </button>
      </div>
    </body>
    </html>
  `;
  
  // Continuously trigger a debugger to freeze console if inspect tools stay open
  setInterval(() => {
    debugger;
  }, 50);
};

// 1. Context Menu (Right Click) Blocker
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// 2. Keyboard Inspect Shortcut Blocker
window.addEventListener("keydown", (e) => {
  // F12 key
  if (e.keyCode === 123) {
    e.preventDefault();
    triggerNiceTry();
  }
  // Ctrl+Shift+I or Cmd+Opt+I (Inspect)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
    e.preventDefault();
    triggerNiceTry();
  }
  // Ctrl+Shift+C or Cmd+Opt+C (Element Selector)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
    e.preventDefault();
    triggerNiceTry();
  }
  // Ctrl+Shift+J or Cmd+Opt+J (Console)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
    e.preventDefault();
    triggerNiceTry();
  }
  // Ctrl+U or Cmd+Opt+U (View Source)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
    e.preventDefault();
    triggerNiceTry();
  }
});

// 3. Viewport Size Variance detection (Triggers when devtools are docked)
const threshold = 160;
const checkDevtoolsDocked = () => {
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    triggerNiceTry();
  }
};

window.addEventListener("resize", checkDevtoolsDocked);
// Execute initial check
checkDevtoolsDocked();

// 4. Console log getter evaluation trick (Triggers if devtools are opened in separate window)
const element = new Image();
Object.defineProperty(element, "id", {
  get: () => {
    triggerNiceTry();
  }
});

setInterval(() => {
  // Direct printing triggers the getter if devtools is open
  console.log(element);
  console.clear();
}, 800);
