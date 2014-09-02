part of pin;

abstract class Serializable {

  Map toJson() {
    return PinUtility.serialize(this);
  }

}