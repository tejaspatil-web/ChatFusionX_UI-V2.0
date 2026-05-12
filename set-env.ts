import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const filePath = './src/app/environment.prod.ts';

let fileContent = fs.readFileSync(filePath, 'utf8');

fileContent = fileContent
  .replace(
    "'API_URL'",
    process.env['API_URL'] || ''
  )
  .replace(
    "'HEALTH_CHECK_URLS'",
    JSON.stringify(
      process.env['HEALTH_CHECK_URLS']?.split(',') || []
    )
  )
  .replace(
    "'SOCKET_URL'",
    process.env['SOCKET_URL'] || ''
  )
  .replace(
    "'PDF_TO_PNG_CONVERSION_URL '",
    process.env['PDF_TO_PNG_CONVERSION_URL'] || ''
  )
  .replace(
    "'TEXT_EXTRACTION_URL'",
    process.env['TEXT_EXTRACTION_URL'] || ''
  );

fs.writeFileSync(filePath, fileContent);