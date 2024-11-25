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
    "POSSIBLE_OUTAGE": "Можливо відключення", 
    "DEFINITE_OUTAGE": "Планове відключення", 
    "NO_OUTAGE": "Світло є"
  };

  for (const [days, group] of Object.entries(raw))
  {
    if (group.hasOwnProperty("groups"))
    {
      var pattern = /(.+?)(\d{2})\.(\d{2})\.(\d{4})(.+)?/;
      var day = DateTime.fromISO(group["title"].replace(pattern,'$4-$3-$2'));
      for (const [schedgroup, scedule] of Object.entries(group["groups"]))
      {
        const cal = new ICalCalendar();
        cal.timezone({
          name: `blackouts.${name}.${schedgroup}`,
          generator: getVtimezoneComponent
        });

        const hours = Object.values(scedule)
        for (let i = 0; i < hours.length;)
        {
          const status = hours[i].type
          if (status == "NO_OUTAGE")
          {
            i++;
            continue;
          }

          const start = day.plus({hours: Number(hours[i].start)})
          do
          {
            var mid = hours[i].end
            i++
          } while (i < hours.length && hours[i].type === status && hours[i].start === mid)
          const end = day.plus({hours: Number(hours[i - 1].end)})
          cal.createEvent({
            start,
            end,
            timezone: TIMEZONE,
            summary: states[status],
          });
        }
        groups[schedgroup] = cal
      }
    }
  }

  return groups
}
