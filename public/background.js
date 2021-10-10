import UrlsController from "./lib/urls-controllers/UrlsController.js";

const c = new UrlsController();

c.resetUrls()
c.getUrlsFromStorage()
c.printUrls()

c.getUrlListener((tabId, url) => {
  c.setNewUrl(url)
  c.setNewTabId(tabId)
  c.tryUpdatePreviusUrl()
  c.updateUrls()
})