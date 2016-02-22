
[![Build Status](https://travis-ci.org/akosel/megalinks-scraper.svg?branch=master)](https://travis-ci.org/akosel/megalinks-scraper)

# Megalinks Scraper
Node scraper that checks for links in /r/megalinks on reddit and creates a json file with a direct reference to any mega.co.nz links posted in comments or elsewhere.

# Install
1. Clone the git repository
2. Run `npm install`
3. (Optional. Only needed if you want to download using CLI.) Install [Megatools](https://github.com/megous/megatools)

# Usage
Scrapes r/megalinks landing page for links
```
./scraper.js -t reddit
```

Scrapes tumovie.net landing page for links
```
./scraper.js -t tumovie
```

To search for a given TV show (first two pages of results)
```
./scraper.js -s <tv_series_name> -t yourserie --start 1 --end 2
```

To search for a movie (first two pages of results)
```
./scraper.js -s <movie_name> -t tumovie --start 1 --end 2
```

To search reddit
```
./scraper.js -s <movie_name> -t reddit
```

To see what's available for download from Mega (with links printed out)
```
./downloader.js --show-links
```
You can enter the number corresponding to what you want to download (if you have megatools in your path) or just paste the link into your browser.
