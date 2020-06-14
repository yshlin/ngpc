# NGPC Website
Official website for Nangang Garden Presbyterian Church in Taiwan.

## Prerequisite

1. [git](https://git-scm.com/) installed
2. [Node.js](https://nodejs.org/) installed
3. Clone [this repo](https://github.com/yshlin/ngpc) to your computer
   ```
   git clone https://github.com/yshlin/ngpc
   ```
## Development
1. Enter the folder and install dependencies by 
   ```
   cd ngpc
   npm install
   ```
2. Copy models/config.json.sample and fill-in values
   ```
   cd models
   cp config.json.sample config.json
   vim config.json
   ```
3. Generate static website by running
   ```
   npm run prepare
   ```
4. Check the generated static website by opening ```site/index.html``` in the browser
## Publish
* When development done, simply run ```npm run upload``` to publish to github.
