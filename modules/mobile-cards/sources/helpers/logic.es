import { getMessage } from '../../core/i18n';

const AGO_CEILINGS =
[
  [0, '', 1],
  [120, 'ago1Minute', 1],
  [3600, 'agoXMinutes', 60],
  [7200, 'ago1Hour', 1],
  [86400, 'agoXHours', 3600],
  [172800, 'agoYesterday', 1],
  [604800, 'agoXDays', 86400],
  [4838400, 'ago1Month', 1],
  [29030400, 'agoXMonths', 2419200],
  [58060800, 'ago1year', 1],
  [2903040000, 'agoXYears', 29030400],
];

export function agoLine(ts) {
  if (!ts) {
    return '';
  }

  const now = (Date.now() / 1000);
  const seconds = parseInt(now - ts, 10);

  const ago = AGO_CEILINGS.find(([time]) => seconds < time);

  if (ago) {
    const roundedTime = parseInt(seconds / ago[2], 10);
    const translation = getMessage(ago[1], roundedTime);
    return translation;
  }

  return '';
}

export function agoDuration(duration, options) {
  if(!duration) return '';
  var seconds = parseInt(duration),
      i=0, slot;

  while (slot = AGO_CEILINGS[i++])
      if (seconds < slot[0])
          return getMessage(slot[1], parseInt(seconds / slot[2]))
  return '';
}