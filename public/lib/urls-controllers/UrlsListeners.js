/*global chrome*/

export default class UrlsListeners {

  constructor(){
    this.currentTabId = undefined;
  }

  onWindowFocusChangedListener = (action) => {
    chrome.windows.onFocusChanged.addListener(number => {
      if(number === -1){
        action(-1, "")
        return
      }

      if(!this.currentTabId)
        return

      this.getTabUrl(this.currentTabId, action)
    })
  }

  onTabActivatedListener = (action) => {
    chrome.tabs.onActivated.addListener(({tabId}) => {
      this.setTabId(tabId)      
      this.getTabUrl(tabId, action)
    });
  }

  onTabUpdatedListener = (action) => {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if(tabId !== this.currentTabId)
        return
  
      if(changeInfo.url)
        action(tabId, changeInfo.url)
    })
  }

  onTabFocusChangeListener = (action) => {
    this.onWindowFocusChangedListener(action)
    this.onTabActivatedListener(action)
    this.onTabUpdatedListener(action)
  }


  /**
   * @private 
   */
  setTabId = (tabId) => {this.currentTabId = tabId}

  /**
   * @private 
   */
  getTabUrl = (tabId, action) => {
    chrome.tabs.get(tabId, (tab) => action(tabId, tab.url))
  }
}