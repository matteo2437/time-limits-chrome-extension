import TimeUtilities from "../TimeUtilities.js";
import UrlsUtilities from "./UrlsUtilities.js";

export default class UrlsController extends UrlsUtilities{
  
  constructor({maxUrls} = {maxUrls: 25}){
    super({debugMode: true})

    this.previusTime = TimeUtilities.getTime()
    
    this.newUrl = undefined;
    this.newTabId = undefined;

    this.maxUrls = maxUrls
  }

  setNewUrl = (newUrl) => {this.newUrl = this.prepareUrl(newUrl)}
  setNewTabId = (newTabId) => {this.newTabId = newTabId}

  isNewUrlNotLegit = () => {return !this.newUrl}

  getSessionTime = () => {
    const currentTime = TimeUtilities.getTime()
    const sessionTime = currentTime - this.previusTime
    this.previusTime = currentTime

    return sessionTime
  }

  getUpdatedUrlObj = (urlIndex) => {
    const urlObj = this.getUrl(urlIndex)

    const sessionTime = this.getSessionTime();
    const totalTime = sessionTime + urlObj.times.totalTime.ms
    const sessions = urlObj.sessions + 1

    return {
      ...urlObj,
      sessions: sessions,
      lastSeen: TimeUtilities.getTime(),
      times: {
        lastSessionTime:  TimeUtilities.getTimeObj(sessionTime),
        totalTime:        TimeUtilities.getTimeObj(totalTime),
        averageTime:      TimeUtilities.getTimeObj(totalTime / sessions),
      }
    }
  }

  tryUpdatePreviusUrl = () => {
    if(this.isUrlNotChanged(this.newUrl, this.newTabId))
      return;

    const previusUrlIndex = this.findUrlIndex(this.getPreviusUrl())
    if(previusUrlIndex === -1){
      this.previusTime = TimeUtilities.getTime()
      return
    }

    this.setUrl(previusUrlIndex, this.getUpdatedUrlObj(previusUrlIndex))
  }

  updateUrls = () => {
    if(this.isUrlNotChanged(this.newUrl, this.newTabId))
      return

    this.setPreviusUrl(this.newUrl)
    this.setPreviusTabId(this.newTabId)

    const urlIndex = this.findUrlIndex(this.newUrl)
    const isUrlNotNew = urlIndex !== -1

    if(this.isNewUrlNotLegit() || isUrlNotNew){
      this.storeUrls()
      return
    }

    const emptyTimeObj = TimeUtilities.getTimeObj(0)
    const newUrlObj = {
      url:      this.newUrl,
      sessions: 0,
      lastSeen: TimeUtilities.getTime(),
      times: {
        lastSessionTime:  emptyTimeObj,
        totalTime:        emptyTimeObj,
        averageTime:      emptyTimeObj,
      }
    };

    if(this.getUrls().length >= this.maxUrls)
      this.removeTheOldestSeen()

    this.addUrl(newUrlObj)
    this.storeUrls()
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