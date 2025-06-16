const path = require('path');

exports.showDocs = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/docs.html'));
};