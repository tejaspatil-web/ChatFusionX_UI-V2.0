const fs = require('fs');
const path = require('path');
require('dotenv').config();

const filePath = path.join(__dirname, 'src', 'app', 'environment', 'environment.prod.ts');

let fileContent = fs.readFileSync(filePath, 'utf8');

fileContent = fileContent
  .replace(
    "'API_URL'",
    JSON.stringify(
      process.env.API_URL || ''
    )
  )
  .replace(
    "'HEALTH_CHECK_URLS'",
    JSON.stringify(
      process.env.HEALTH_CHECK_URLS?.split(',') || []
    )
  )
  .replace(
    "'SOCKET_URL'",
    JSON.stringify(
      process.env.SOCKET_URL || ''
    )
  )
  .replace(
    "'PDF_TO_PNG_CONVERSION_URL'",
    JSON.stringify(
      process.env.PDF_TO_PNG_CONVERSION_URL || ''
    )
  )
  .replace(
    "'TEXT_EXTRACTION_URL'",
    JSON.stringify(
      process.env.TEXT_EXTRACTION_URL || ''
    )
  );

fs.writeFileSync(filePath, fileContent);

console.log('Environment variables injected');