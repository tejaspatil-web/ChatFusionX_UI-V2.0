export class Helper {
  static getTimeInIndia() {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const timeInIST = new Intl.DateTimeFormat('en-IN', options).format(date);
    return timeInIST;
  }
}
