part of pin;

class PinTime {

  static const int TIMESTAMP_MAX = 2147483647;

  static int getTime() {
    return (new DateTime.now()).millisecondsSinceEpoch ~/ 1000; // to seconds
  }

  static String formatRFC2616(DateTime date) {
    return HttpDate.format(date);
  }

}