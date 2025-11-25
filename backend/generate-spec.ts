import fs from 'fs';
import path from 'path';
import { specs } from './swagger';

const outputPath = path.join(__dirname, '../frontend/src/types', 'openapi.json');

fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));