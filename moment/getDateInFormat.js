import moment from 'moment';

// Returns date in string format UTC -> regular format given in properties
export function getDateInFormat(date, format) {
    var dateFormat = new moment(date);
    var local = dateFormat.utc(dateFormat).local();
    return local.format(format);
}