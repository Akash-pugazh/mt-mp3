function stripQueryAndHash(input) {
  return input.split('?')[0].split('#')[0];
}

function toAbsolute(baseUrl, href) {
  return new URL(href, baseUrl).toString();
}

module.exports = { stripQueryAndHash, toAbsolute };
