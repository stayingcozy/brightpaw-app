export default function getMonthDayYear() {
    // helper function to get todays date month/date/year
    const date = Date.now();
    const currDate = new Date(date);
    const todaysDate = `${currDate.getMonth()+1}${currDate.getDate()}${currDate.getFullYear()}`
  
    return todaysDate;
}