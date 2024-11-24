import fs from 'fs'
import path from 'path'
import createCalendar from './create-manual-calendar.mjs'

const regionsDir = fs.readdirSync('./data').filter(file => path.extname(file) === '.json');

for (const regionFile of regionsDir) {
  const regionName = path.basename(regionFile, '.json')
  const raw = await import(`./data/${regionFile}`, {assert: {type: "json"}})
  
  const calendars = createCalendar(raw.default, regionName)
  try {
    fs.mkdirSync(`./public/manual/${regionName}`, {recursive: true})
  } catch (err) {
    // ignore
  }
  for (const [group, cal] of Object.entries(calendars)) {
    fs.writeFileSync(`./public/manual/${regionName}/${group}.ical`, cal.toString());
  }
}
