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
                  #initial-splash .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(128, 90, 213, 0.3);
                    border-top-color: #805AD5;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
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
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                  #initial-splash.hidden {
                    opacity: 0;
                    pointer-events: none;
                  }
                `,
              }}
            />
            <div className="spinner"></div>
            <p className="message">This could take a moment...</p>
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
