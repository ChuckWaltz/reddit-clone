export const formatPostedDate = (dateString: string) => {
  const now = new Date().getTime() / 1000; //seconds since epoch
  const date = new Date(dateString).getTime() / 1000; //seconds since epoch
  const diff = now - date;
  const mins = diff / 60;
  const hours = mins / 60;
  const days = hours / 24;

  if (diff <= 60) return "less than a minute";

  let val: string;
  if (days > 1) {
    const d = Math.floor(days);
    val = d.toString() + " day";
    if (d > 1) val += "s";
  } else if (hours > 1) {
    const h = Math.floor(hours);
    val = h.toString() + " hour";
    if (h > 1) val += "s";
  } else if (mins > 1) {
    const m = Math.floor(mins);
    val = m.toString() + " minute";
    if (m > 1) val += "s";
  } else {
    const s = Math.floor(diff);
    val = s.toString() + " second";
    if (s > 1) val += "s";
  }
  return val;
};
