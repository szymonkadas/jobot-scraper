// Get current date to uniquely identify data records, and help to indicate when the data was scraped.
export default function getCurrentDateAsUUID() {
  const currentDate = new Date();
  const date = [];
  date.push(currentDate.getFullYear());
  date.push(currentDate.getMonth() + 1);
  date.push(currentDate.getDate());
  const clock = [];
  clock.push(currentDate.getHours());
  clock.push(currentDate.getMinutes());
  clock.push(currentDate.getSeconds());
  const formattedDate = `${date.join("-")}--${clock.join("-")}`;
  return formattedDate;
}
