/*global chrome*/

export default class UrlsUtilities {
  constructor({debugMode}){
    this.debugMode = debugMode

    this.urls = []

    this.currentTabId = undefined;

    this.previusTabId = undefined;
    this.previusUrl =  "";
  }

  getUrlListener = (action) => {
    chrome.tabs.onActivated.addListener(({tabId}) => {
      this.setTabId(tabId)      
      chrome.tabs.get(tabId, (tab) => action(tabId, tab.url))
    });
  
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if(tabId !== this.currentTabId)
        return
  
      if(changeInfo.url)
        action(tabId, changeInfo.url)
    })
  }

  loadUrlsFromStorage = () => {
    chrome.storage.local.get(['urls'], result => this.urls = result.urls)
  }

  getUrls = () => {return this.urls}
  getUrl = (index) => {return this.urls[index]}
  getPreviusUrl = () => {return this.previusUrl}

  storeUrls = () => {
    chrome.storage.local.set({urls: this.getUrls()});

    if(this.debugMode)
      this.printUrls()
  }

  setUrl = (index, urlObj) => {this.urls[index] = urlObj}
  setTabId = (tabId) => {this.currentTabId = tabId}
  setPreviusUrl = (url) => {this.previusUrl = url}
  setPreviusTabId = (tabId) => {this.previusTabId = tabId}

  addUrl = (newUrlObj) => {this.urls.push(newUrlObj)}

  resetUrls = () => {chrome.storage.local.set({urls: []})}
  printUrls = () => {chrome.storage.local.get(['urls'], console.log)}

  isUrlNotChanged = (newUrl, newTabId) => {
    return newUrl === this.previusUrl && newTabId === this.previusTabId
  }

  findUrlIndex = (urlToFind) => {
    return this.urls.findIndex(url => url.url === urlToFind)
  }

  removeTheOldestSeen = () => {
    let min = Number.MAX_VALUE
    let urlIndex;
    this.urls.forEach((url, index) => {
      if(url.lastSeen <= min){
        min = url.lastSeen;
        urlIndex = index
      }
    })

    this.urls.splice(urlIndex, 1)
  }

}