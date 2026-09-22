export function isMigrationFile(name) { return /^\d+.*\.sql$/i.test(name); }
export function sortMigrationFiles(files) { return files.filter(isMigrationFile).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})); }
