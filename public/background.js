/*global chrome*/

let currentTabId;
let previusTabId;
let previusUrl;

const getUrlListener = (action) => {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    previusTabId = currentTabId;
    const tabId = activeInfo.tabId;
    currentTabId = tabId;
    chrome.tabs.get(tabId, (tab) => action(tabId, tab.url))
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if(tabId !== currentTabId)
      return

    if(changeInfo.url)
      action(tabId, changeInfo.url)
  })
}

const printUrls = () => {
  chrome.storage.local.get(['urls'], console.log)
}

const resetUrls = () => {
  chrome.storage.local.set({urls: []});
}


const prepareUrl = (url, action) => {
  let httpEndIndex = url.indexOf("://")
  if(httpEndIndex > 5 || httpEndIndex === - 1)
    return action("");

  const newUrl = url.slice(httpEndIndex + 3)

  const firstSlashIndex = newUrl.indexOf('/')
  const finalUrl = newUrl.slice(0, firstSlashIndex)
  
  action(finalUrl)
}

const findUrl = (urls, urlToFind) => {
  return new Promise((resolve, reject) => {
    index = urls.findIndex(url => url.url === urlToFind)
    if(index == -1)
      reject();

    resolve(index)
  })
}

const getTime = () => {
  const date = new Date();
  return date.getTime();
}
let previusTime = getTime();



const updateUrls = (newUrls) => {
  chrome.storage.local.set({urls: newUrls});
}


const getUrls = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['urls'], (result) => {
      if(Array.isArray(result.urls))
        resolve(result.urls)
      else
        reject([])
    })
  })
}




const updatePreviusUrl = (urls, previusUrl) => {
  findUrl(urls, previusUrl)
    .then(index => {
      const sessionTime = getTime() - previusTime

      const previusUrlObj = urls[index]
      urls[index] = {
        ...previusUrlObj,
        lastSessionTime:  sessionTime,
        totalTime:        sessionTime + previusUrlObj.totalTime,
        averageTime:      previusUrlObj.totalTime / previusUrlObj.sessions
      }
    })
    .catch(_ => {})
}

const isUrlNotChanged = (newUrl, tabId) => {
  return newUrl === previusUrl && tabId === previusTabId
}

const isUrlEmpty = (url) => {
  return url === ""
}

const addUrl = (urls, newUrl) => {
  findUrl(urls, newUrl)
    .then(index => urls[index].sessions++)
    .catch(_ => {
      urls.push({
        url: newUrl,
        sessions: 1,
        lastSessionTime: 0,
        totalTime: 0,
        averageTime: 0,
      })
    })
}

resetUrls()
getUrlListener((tabId, url) => {
  let urls = [];

  //getUrls()
    //.then(urls => prepareUrl(urls, url))

  chrome.storage.local.get(['urls'], (result) => {
    if(Array.isArray(result.urls)){
      urls = result.urls
      prepareUrl(url, newUrl => {

        if(isUrlNotChanged(newUrl, tabId))
          return

        updatePreviusUrl(urls, previusUrl)

        previusTime = getTime()
        previusUrl = newUrl;

        if(isUrlEmpty(newUrl))
          return

        addUrl(urls, newUrl)
      })
    }

    updateUrls(urls)
    printUrls()
  })
})













class UrlsController {
  printUrls = () => {
    chrome.storage.local.get(['urls'], console.log)
  }
  
  resetUrls = () => {
    chrome.storage.local.set({urls: []});
  }
  
}

class UrlController {
  constructor(){
    this.currentTabId = -1;
    this.previusTabId = -1;
    this.previusUrl = "";
    this.previusTime = getTime();
  }

  getWebsiteDomain = (url, action) => {
    let httpEndIndex = url.indexOf("://")
    if(httpEndIndex > 5 || httpEndIndex === - 1)
      return action("");
  
    const newUrl = url.slice(httpEndIndex + 3)
  
    const firstSlashIndex = newUrl.indexOf('/')
    const websiteDomain = newUrl.slice(0, firstSlashIndex)
    
    action(websiteDomain)
  }

  findUrl = (urls, urlToFind) => {
    return urls.findIndex(url => url.url === urlToFind)
  }

  urlChangeListener = (action) => {
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
}