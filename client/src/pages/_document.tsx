import NextDocument, { Html, Head, Main, NextScript } from "next/document";
import { ColorModeScript } from "@chakra-ui/react";

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head />
        <body>
          {/* Initial splash screen shown while app loads */}
          <div id="initial-splash">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  #initial-splash {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: #f0f0f0;
                    z-index: 9999;
                    transition: opacity 0.3s ease-out;
                  }
                  @media (prefers-color-scheme: dark) {
                    #initial-splash {
                      background-color: #080808;
                    }
                  }
                  #initial-splash .splash-logo {
                    width: 64px;
                    height: 64px;
                    color: #805AD5;
                    margin-bottom: 16px;
                    animation: pulse 2s ease-in-out infinite;
                  }
                  #initial-splash .splash-title {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1A202C;
                    margin-bottom: 8px;
                  }
                  @media (prefers-color-scheme: dark) {
                    #initial-splash .splash-title {
                      color: #EDEDEE;
                    }
                  }
                  #initial-splash .splash-bar-track {
                    width: 200px;
                    height: 4px;
                    background: rgba(128, 90, 213, 0.2);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 20px;
                  }
                  #initial-splash .splash-bar {
                    width: 40%;
                    height: 100%;
                    background: #805AD5;
                    border-radius: 2px;
                    animation: loading 1.4s ease-in-out infinite;
                  }
                  #initial-splash .message {
                    margin-top: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    color: #718096;
                  }
                  @media (prefers-color-scheme: dark) {
                    #initial-splash .message {
                      color: #A0AEC0;
                    }
                  }
                  @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(350%); }
                  }
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                  }
                  #initial-splash.hidden {
                    opacity: 0;
                    pointer-events: none;
                  }
                `,
              }}
            />
            <svg
              className="splash-logo"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm4 0h-2v-2h2v2zm2.71-5.71l-.71.71C16.11 11.89 15.5 13 15.5 14h-2c0-1.5.89-2.89 1.79-3.79l.71-.71c.55-.55.79-1.28.5-2-.29-.72-1.07-1-1.79-1-.97 0-1.71.78-1.71 1.75h-2C11 6.34 12.34 5 14 5c1.3 0 2.4.84 2.82 2 .42 1.16.05 2.42-.82 3.29l-.29.29z"
                opacity="0.3"
              />
              <path d="M21 12c0 1.66-.44 3.21-1.22 4.56l-1.53-1.22c.49-.99.75-2.13.75-3.34 0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8c1.21 0 2.35-.26 3.34-.75l1.22 1.53C14.21 21.56 13.16 22 12 22 6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10z" />
              <circle cx="7.5" cy="10.5" r="1.5" />
              <circle cx="16.5" cy="10.5" r="1.5" />
              <path d="M12 17c-1.1 0-2-.45-2.71-1.17l-1.42 1.42C8.84 18.22 10.32 19 12 19s3.16-.78 4.13-1.75l-1.42-1.42C13.99 16.55 13.1 17 12 17z" />
            </svg>
            <div className="splash-title">Redditish</div>
            <div className="splash-bar-track">
              <div className="splash-bar"></div>
            </div>
            <p className="message">
              Waking up the server — this may take a moment...
            </p>
          </div>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
