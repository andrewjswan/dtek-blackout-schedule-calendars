import fs from 'fs'
import path from 'path'
import createCalendar from './create-daily-calendar.mjs'

const regionsDir = fs.readdirSync('./update').filter(file => path.extname(file) === '.json');

for (const regionFile of regionsDir) {
  const regionName = path.basename(regionFile, '.json')
  const raw = await import(`./update/${regionFile}`, {with: {type: "json"}})
  
  const calendars = createCalendar(raw.default, regionName)
  try {
    fs.mkdirSync(`./public/daily/${regionName}`, {recursive: true})
  } catch (err) {
    // ignore
  }
  for (const [group, cal] of Object.entries(calendars)) {
    fs.writeFileSync(`./public/daily/${regionName}/${group}.ical`, cal.toString());
  }
}
