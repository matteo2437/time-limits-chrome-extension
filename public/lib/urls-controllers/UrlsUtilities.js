/*global chrome*/
import TimeUtilities from "../TimeUtilities.js";
import UrlsListeners from "./UrlsListeners.js";

export default class UrlsUtilities extends UrlsListeners{
  constructor({debugMode}){
    super()
    this.debugMode = debugMode

    this.urls = []
    this.lastUpdate = undefined

    this.previusTabId = undefined;
    this.previusUrl =  "";
  }

  loadUrlsFromStorage = () => {
    chrome.storage.local.get(['urls'], result => {
      this.urls = result.urls.urls
      this.lastUpdate = result.urls.lastUpdate
    })
  }

  getUrls = () => {return this.urls}
  getUrl = (index) => {return this.urls[index]}
  getPreviusUrl = () => {return this.previusUrl}

  storeUrls = () => {
    chrome.storage.local.set({urls: {
      urls: this.getUrls(),
      lastUpdate: TimeUtilities.getTime()
    }});

    if(this.debugMode)
      this.printUrls()
  }

  setUrl = (index, urlObj) => {this.urls[index] = urlObj}
  setPreviusUrl = (url) => {this.previusUrl = url}
  setPreviusTabId = (tabId) => {this.previusTabId = tabId}

  addUrl = (newUrlObj) => {this.urls.push(newUrlObj)}

  printUrls = () => {chrome.storage.local.get(['urls'], console.log)}
  resetUrls = () => {chrome.storage.local.set({urls: {
    urls: [],
    lastUpdate: TimeUtilities.getTime()
  }})}

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