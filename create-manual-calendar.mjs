import ICalCalendar from "ical-generator";
import {getVtimezoneComponent} from "@touch4it/ical-timezones";
import { DateTime } from "luxon";

const TIMEZONE = "Europe/Kiev"
export default function createCalendar(raw, name) 
{
  const now = DateTime.local({zone: TIMEZONE })
  const startOfWeek = now.startOf("week")
  const groups = {};
  const states = {
    "maybe": "Можливо відключення", 
    "no": "Планове відключення", 
    "yes": "Світло є"
  };

  for (const [group, groupSchedule] of Object.entries(raw.data))
  {
    const cal = new ICalCalendar();
    cal.timezone({
      name: `blackouts.${name}.${group}`,
      generator: getVtimezoneComponent
    });
  
    for (const [dayOfWeek, dayScedule] of Object.entries(groupSchedule))
    {
      const day = startOfWeek.plus({day: Number(dayOfWeek) - 1})

      const hours = Object.keys(dayScedule)

      for (let i = 0; i < hours.length;)
      {
        const hour = hours[i]

        const status = dayScedule[hour]
        if (status == "yes")
        {
          i++;
          continue;
        }

        const start = day.plus({hours: Number(hour) - 1})
        while (dayScedule[hours[i]] === status)
        {
          i++
        }
        const end = day.plus({hours: Number(hours[i] ? hours[i] : 25) - 1})

        cal.createEvent({
          start,
          end,
          timezone: TIMEZONE,
          summary: states[status],
          repeating: {
            freq: "WEEKLY"
          }
        });
      }
    }
    groups[group] = cal
  }

  return groups
}
