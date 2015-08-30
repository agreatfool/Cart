part of pin;

abstract class PinSerializable {

  Map toJson() {
    return PinUtility.serialize(this);
  }

}