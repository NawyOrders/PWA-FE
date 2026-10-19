try {
  if (sessionStorage.getItem("splash-seen") === "1") {
    document.documentElement.setAttribute("data-splash", "seen");
  }
} catch (error) {
  /* Storage can be unavailable in private mode; the splash will still run. */
}
