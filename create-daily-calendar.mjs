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
        for (const [step, time] of Object.entries(scedule))
        {
          const time_start = time["start"];
          const time_end = time["end"];
          const time_type = time["type"];
          const start = day.plus({hours: Number(time_start) - 1})
          const end = day.plus({hours: Number(time_end) - 1})
          cal.createEvent({
            start,
            end,
            timezone: TIMEZONE,
            summary: states[time_type],
          });
        }
        groups[schedgroup] = cal
      }
    }
  }

  return groups
}
