// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// Ensure CHROME_BIN is respected in CI, with fallback for macOS
if (!process.env.CHROME_BIN) {
  // Try common Chrome locations
  const fs = require('fs');
  const macOSChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  
  if (fs.existsSync(macOSChromePath)) {
    process.env.CHROME_BIN = macOSChromePath;
  }
}
process.env.CHROME_BIN = process.env.CHROME_BIN || process.env.CHROME_PATH || process.env.CHROME;

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      captureConsole: true // show browser console output in logs
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: process.env.CI ? ['ChromeHeadlessCI'] : ['Chrome'],
    restartOnFileChange: true,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 20000,
    browserDisconnectTolerance: 2,
    captureTimeout: 210000,
    // For CI: use headless Chrome
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--remote-debugging-port=9222'
        ]
      }
    }
  });
};

