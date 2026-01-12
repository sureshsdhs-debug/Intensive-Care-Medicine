module.exports = (userAgent = "") => {
  userAgent = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipad/.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
};
