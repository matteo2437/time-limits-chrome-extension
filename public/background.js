import UrlsController from "./lib/urls-controllers/UrlsController.js";

const c = new UrlsController({maxUrls: 25});

c.resetUrls()
c.loadUrlsFromStorage()
c.printUrls()

c.onTabFocusChangeListener((tabId, url) => {
  c.setNewUrl(url)
  c.setNewTabId(tabId)
  c.tryUpdatePreviusUrl()
  c.updateUrls()
})