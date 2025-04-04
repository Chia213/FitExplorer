import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  resolver: {
    extraNodeModules: {
      shared: path.resolve(__dirname, '../shared'),
    },
  },
  watchFolders: [
    path.resolve(__dirname, '../shared'),
  ],
}; 