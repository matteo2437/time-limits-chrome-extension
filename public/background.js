/*global chrome*/

class UrlsController {
  
  constructor(){
    this.urls = [];
    this.currentTabId;
    this.previusTabId;
    this.previusUrl = "";
    this.previusTime = this.getTime();
  }

  getTime = () => {
    const date = new Date();
    return date.getTime();
  }

  getUrls = () => {
    chrome.storage.local.get(['urls'], result => this.urls = result.urls)
  }

  setUrls = () => {
    chrome.storage.local.set({urls: this.urls});
  }

  resetUrls = () => {
    chrome.storage.local.set({urls: []});
  }

  printUrls = () => {
    chrome.storage.local.get(['urls'], console.log)
  }
  
  isUrlChanged = (newUrl, tabId) => {
    return !(newUrl === this.previusUrl && tabId === this.previusTabId)
  }

  findUrl = (urlToFind) => {
    return this.urls.findIndex(url => url.url === urlToFind)
  }

  getUrlListener = (action) => {
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.previusTabId = this.currentTabId;
      const tabId = activeInfo.tabId;
      this.currentTabId = tabId;
      chrome.tabs.get(tabId, (tab) => action(tabId, tab.url))
    });
  
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if(tabId !== this.currentTabId)
        return
  
      if(changeInfo.url)
        action(tabId, changeInfo.url)
    })
  }

  updatePreviusUrl = () => {
    const previusIndex = this.findUrl(this.previusUrl)
    if(previusIndex === -1)
      return

    const previusUrlObj = this.urls[previusIndex]
    
    const sessionTime = this.getTime() - this.previusTime
    this.previusTime = this.getTime()
    
    const totalTime = sessionTime + previusUrlObj.totalTime
    const sessions = previusUrlObj.sessions + 1
    
    this.urls[previusIndex] = {
      ...previusUrlObj,
      sessions: sessions,
      lastSessionTime:  sessionTime,
      totalTime:        totalTime,
      averageTime:      totalTime / sessions
    }
  }

  setPreviusUrl = (url) => {
    this.previusUrl = url
  }

  updateUrls = (newUrl) => {
    const urlIndex = this.findUrl(newUrl)
    if(urlIndex !== -1)
      return

    const newUrlObj = {
      url: newUrl,
      sessions: 0,
      lastSessionTime: 0,
      totalTime: 0,
      averageTime: 0,
    };

    this.urls.push(newUrlObj)
  }

  prepareUrl = (url) => {
    const httpEndIndex = url.indexOf("://")
    const isNotAWebsite = httpEndIndex > 5 || httpEndIndex === - 1
    if(isNotAWebsite)
      return
  
    const newUrl = url.slice(httpEndIndex + 3)
  
    const firstSlashIndex = newUrl.indexOf('/')
    return newUrl.slice(0, firstSlashIndex)
  }

}

const c = new UrlsController();

c.resetUrls()
c.getUrls()
c.printUrls()

c.getUrlListener((tabId, url) => {
  const newUrl = c.prepareUrl(url)
  if(!c.isUrlChanged(newUrl, tabId))
    return

  c.updatePreviusUrl()
  c.setPreviusUrl(newUrl)

  if(!newUrl)
    return

  c.updateUrls(newUrl)
  c.setUrls()
  c.printUrls()
})