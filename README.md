
[![Build Status](https://travis-ci.org/akosel/megalinks-scraper.svg?branch=master)](https://travis-ci.org/akosel/megalinks-scraper)

# megalinks-scraper
Node scraper that checks for links in /r/megalinks on reddit and creates a json file with a direct reference to any mega.co.nz links posted in comments or elsewhere.

# Install
1. Clone the git repository
2. Run `npm install`
3. Install [Megatools](https://github.com/megous/megatools)

# To use
Run `scraper.js` at a bare minimum. This will scrape the latest links from reddit.
After this, run `downloader.js` to see the available links. Entering the number will attempt to download a given link.
