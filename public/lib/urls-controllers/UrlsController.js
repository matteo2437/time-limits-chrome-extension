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
    const dayActivities = urlObj.dayActivities

    const sessionTime = this.getSessionTime();
    const totalTime = sessionTime + dayActivities[0].times.totalTime.ms
    const sessions = dayActivities[0].sessions + 1

    const oldLongestSessionTime = dayActivities[0].times.longestSessionTime.ms
    const longestSessionTime = sessionTime > oldLongestSessionTime 
      ? sessionTime 
      :  oldLongestSessionTime

    const thereWasNotASession = sessionTime <= 10
    if(thereWasNotASession)
      return urlObj

    dayActivities[0] = {
      sessions: sessions,
      times: {
        longestSessionTime: TimeUtilities.getTimeObj(longestSessionTime),
        lastSessionTime:    TimeUtilities.getTimeObj(sessionTime),
        totalTime:          TimeUtilities.getTimeObj(totalTime),
        averageTime:        TimeUtilities.getTimeObj(totalTime / sessions),
      }
    }

    return {
      ...urlObj,
      lastSeen: TimeUtilities.getTime(),
      dayActivities: dayActivities
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

  createAndAddNewUrl = () => {
    const emptyTimeObj = TimeUtilities.getTimeObj(0)
    const newUrlObj = {
      url:      this.newUrl,
      lastSeen: TimeUtilities.getTime(),
      dayActivities: [{
        sessions: 0,
        times: {
          longestSessionTime: emptyTimeObj,
          lastSessionTime:    emptyTimeObj,
          totalTime:          emptyTimeObj,
          averageTime:        emptyTimeObj,
        }
      }]
    };

    if(this.getUrls().length >= this.maxUrls)
      this.removeTheOldestSeen()

    this.addUrl(newUrlObj)
  }

  updateUrls = () => {
    this.tryUpdatePreviusUrl()

    if(this.isUrlNotChanged(this.newUrl, this.newTabId))
      return

    this.setPreviusUrl(this.newUrl)
    this.setPreviusTabId(this.newTabId)

    const urlIndex = this.findUrlIndex(this.newUrl)
    const isUrlNotNew = urlIndex !== -1

    if(this.isNewUrlNotLegit() || isUrlNotNew)      
      return this.storeUrls()

    this.createAndAddNewUrl()
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