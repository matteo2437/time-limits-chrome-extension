import { getTime } from "../utilities/GetTime";
import { UrlsUtilities } from "./UrlsUtilities";

export class UrlsController extends UrlsUtilities{
  
  constructor(){
    super({debugMode: true})

    this.previusTime = getTime();
    
    this.newUrl = undefined;
    this.newTabId = undefined;
  }

  setNewUrl = (newUrl) => {this.newUrl = this.prepareUrl(newUrl)}
  setNewTabId = (newTabId) => {this.newTabId = newTabId}

  isNewUrlLegit = () => {return !this.newUrl}

  getSessionTime = () => {
    const currentTime = getTime();
    const sessionTime = currentTime - this.previusTime
    this.previusTime = currentTime

    return sessionTime
  }

  tryUpdatePreviusUrl = () => {
    const isUrlNotChanged = !this.isUrlChanged(this.newUrl, this.newTabId)
    if(isUrlNotChanged)
      return;

    const previusIndex = this.findUrlIndex(super.previusUrl)
    if(previusIndex === -1){
      this.previusTime = getTime()
      return
    }

    const previusUrlObj = this.getUrl(previusIndex)
    
    const sessionTime = this.getSessionTime()    
    const totalTime = sessionTime + previusUrlObj.totalTime
    const sessions = previusUrlObj.sessions + 1

    const newUrlObj = {
      ...previusUrlObj,
      sessions: sessions,
      lastSessionTime:  sessionTime,
      totalTime:        totalTime,
      averageTime:      totalTime / sessions
    }

    this.setUrl(previusIndex, newUrlObj)
  }

  updateUrls = () => {
    this.setPreviusUrl(this.newUrl)
    this.setPreviusTabId(this.newTabId)

    const urlIndex = this.findUrlIndex(this.newUrl)
    const isUrlNotNew = urlIndex !== -1

    if(this.isNewUrlLegit() || isUrlNotNew){
      this.storeUrls()
      return
    }

    const newUrlObj = {
      url: this.newUrl,
      sessions: 0,
      lastSessionTime: 0,
      totalTime: 0,
      averageTime: 0,
    };

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