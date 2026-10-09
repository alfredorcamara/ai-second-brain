/**
 * AI SECOND BRAIN — Groq Client Adapter (Retrocompatibility Wrapper)
 * Re-exports the Universal AI Gateway for full backward compatibility
 */
const aiGateway = require('./ai-gateway');

module.exports = {
    ...aiGateway
};
