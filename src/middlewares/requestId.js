const { makeRequestId } = require('../utils/requestId');

function requestIdMiddleware(req, res, next) {
  const incoming = req.headers['x-request-id'];
  const requestId = typeof incoming === 'string' && incoming.trim() ? incoming : makeRequestId();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

module.exports = { requestIdMiddleware };
