import fs from 'fs'
import path from 'path'
import createCalendar from './create-calendar.mjs'

const regionsDir = fs.readdirSync('./data')

for (const regionFile of regionsDir) {
  const regionName = path.basename(regionFile, '.json')
  const raw = await import(`./data/${regionFile}`, {assert: {type: "json"}})
  
  const calendars = createCalendar(raw.default, regionName)
  try {
    fs.mkdirSync(`./public/${regionName}`, {recursive: true})
  } catch (err) {
    // ignore
  }
  for (const [group, cal] of Object.entries(calendars)) {
    cal.saveSync(`./public/${regionName}/${group}.ical`);
  }
}