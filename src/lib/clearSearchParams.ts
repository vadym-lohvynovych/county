export const clearSearchParams = () => {
  const currentUrl = new URL(window.location.href);
  currentUrl.search = "";
  history.replaceState(null, "", currentUrl.href);
};
