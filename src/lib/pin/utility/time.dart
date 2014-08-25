part of pin;

class PinTime {

  static int getTime() {
    return (new DateTime.now()).millisecondsSinceEpoch;
  }

}